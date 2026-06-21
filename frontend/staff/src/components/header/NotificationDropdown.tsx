import { useState, useEffect, useRef } from "react";
import { getApiUrl, API_BASE_URL } from "../../utils/api";
import { Client } from "@stomp/stompjs";

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
  type: string;
  isRead: boolean;
}

const getNotificationType = (type: string) => {
  if (!type) return "info";
  const t = type.toLowerCase();
  if (t.includes("warning")) return "warning";
  if (t.includes("success")) return "success";
  if (t.includes("error")) return "error";
  if (t.includes("status") || t.includes("change")) return "info";
  return "info";
};

const getIconBg = (type: string) => {
  const t = getNotificationType(type);
  switch (t) {
    case "warning": return "bg-yellow-100 dark:bg-yellow-500/20";
    case "success": return "bg-green-100 dark:bg-green-500/20";
    case "error": return "bg-red-100 dark:bg-red-500/20";
    default: return "bg-blue-100 dark:bg-blue-500/20";
  }
};

const getIconColor = (type: string) => {
  const t = getNotificationType(type);
  switch (t) {
    case "warning": return "text-yellow-600 dark:text-yellow-400";
    case "success": return "text-green-600 dark:text-green-400";
    case "error": return "text-red-600 dark:text-red-400";
    default: return "text-blue-600 dark:text-blue-400";
  }
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return "Vừa xong";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);

    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Vừa xong";
  }
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const stompClientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const token = localStorage.getItem("staff_auth_token");

  // Fetch notifications and count
  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const response = await fetch(getApiUrl("/api/staff/notifications/unread-count"), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "*/*",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(Number(data.unreadCount || 0));
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await fetch(getApiUrl("/api/staff/notifications?page=0&size=15"), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "*/*",
        },
      });
      if (response.ok) {
        const data = await response.json();
        const list = data.content || [];
        setNotificationsList(
          list.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.message || item.description,
            time: formatTime(item.createdAt),
            type: getNotificationType(item.type),
            isRead: item.isRead,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Setup WebSocket connection using native WebSocket and STOMP
  const connectWebSocket = () => {
    if (!token || stompClientRef.current?.connected) return;

    console.log("Connecting staff WebSocket using native WebSocket & STOMP...");
    try {
      // Build ws:// or wss:// URL for native WebSocket
      // Spring SockJS endpoint exposes raw WebSocket at /ws/websocket
      const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const wsHost = API_BASE_URL.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}://${wsHost}/ws/websocket?token=${token}`;

      console.log("WebSocket URL:", wsUrl);

      const client = new Client({
        brokerURL: wsUrl,
        connectHeaders: {
          Authorization: 'Bearer ' + token,
        },
        debug: (str) => {
          console.log('STOMP:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          console.log("WebSocket CONNECTED!", frame);

          client.subscribe("/user/queue/notifications", (message) => {
            try {
              const notification = JSON.parse(message.body);
              console.log("Nhận thông báo:", notification);

              // Increment unread count
              setUnreadCount((prev) => prev + 1);

              // Append notification to top of list
              setNotificationsList((prev) => [
                {
                  id: notification.id || Date.now(),
                  title: notification.title,
                  description: notification.message || notification.description,
                  time: "Vừa xong",
                  type: getNotificationType(notification.type),
                  isRead: false,
                },
                ...prev,
              ]);
            } catch (e) {
              console.error("Failed to parse message body:", e);
            }
          });
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame.headers['message'], frame.body);
        },
        onWebSocketError: (event) => {
          console.error("WebSocket error:", event);
        },
        onDisconnect: () => {
          console.log("WebSocket disconnected");
        },
      });

      stompClientRef.current = client;
      client.activate();
    } catch (err) {
      console.error("Exception initializing WebSocket:", err);
    }
  };

  const handleDropdownClick = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Re-fetch when opening
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const handleMarkAllRead = async () => {
    if (!token || unreadCount === 0) return;
    try {
      const response = await fetch(getApiUrl("/api/staff/notifications/read-all"), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "*/*",
        },
      });
      if (response.ok) {
        setUnreadCount(0);
        setNotificationsList((prev) =>
          prev.map((item) => ({ ...item, isRead: true }))
        );
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const handleNotificationItemClick = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(getApiUrl(`/api/staff/notifications/${id}/read`), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "*/*",
        },
      });
      if (response.ok) {
        setNotificationsList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
        );
        fetchUnreadCount();
      }
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
    connectWebSocket();

    return () => {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate().then(() => {
          console.log("Disconnected STOMP client for staff");
        });
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [token]);

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "success":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleDropdownClick}
      >
        <span
          className={`absolute -right-0.5 -top-0.5 z-10 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-[3px] text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900 ${
            unreadCount === 0 ? "hidden" : "flex"
          }`}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute -right-60 mt-4 flex h-[480px] w-87.5 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-90.25 lg:right-0 z-99999">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-255">Thông báo</h5>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
            {notificationsList.slice(0, showAll ? notificationsList.length : 5).map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationItemClick(item.id)}
                className={`flex gap-3 items-start p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${
                  !item.isRead ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getIconBg(item.type)} ${getIconColor(item.type)}`}>
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm text-gray-800 dark:text-white truncate ${!item.isRead ? "font-bold" : "font-medium"}`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                  <span className="text-[10px] text-gray-400 dark:text-gray-550 mt-1 block font-mono">
                    {item.time}
                  </span>
                </div>
                {!item.isRead && (
                  <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0 self-center" />
                )}
              </div>
            ))}
            {notificationsList.length === 0 && (
              <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                Không có thông báo nào.
              </div>
            )}
          </div>

          {notificationsList.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="block w-full text-xs font-semibold text-center text-blue-600 dark:text-blue-400 pt-3 border-t border-gray-100 dark:border-gray-700 mt-2"
            >
              {showAll ? "Thu gọn" : "Xem tất cả"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}