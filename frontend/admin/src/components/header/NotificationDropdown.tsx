import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAuth } from "../../context/AuthContext";
import SockJS from "sockjs-client";
import { Stomp, CompatClient } from "@stomp/stompjs";

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
    default: return "bg-brand-100 dark:bg-brand-500/20";
  }
};

const getIconColor = (type: string) => {
  const t = getNotificationType(type);
  switch (t) {
    case "warning": return "text-yellow-600 dark:text-yellow-400";
    case "success": return "text-green-600 dark:text-green-400";
    case "error": return "text-red-600 dark:text-red-400";
    default: return "text-brand-600 dark:text-brand-400";
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

// Global state for WebSocket singleton to persist session across mounts/navigating
let stompClient: CompatClient | null = null;
let globalReconnectTimeout: any = null;
let isConnecting = false;
let currentToken: string | null = null;

// Registry of active listeners from mounted instances
const listeners = new Set<(notification: any) => void>();
const unreadListeners = new Set<(updater: number | ((prev: number) => number)) => void>();

const broadcastNotification = (notification: any) => {
  listeners.forEach((listener) => listener(notification));
};

const broadcastUnreadIncrement = () => {
  unreadListeners.forEach((listener) => listener((prev) => prev + 1));
};

const connectGlobalWebSocket = (token: string) => {
  if (stompClient?.connected || isConnecting) return;
  isConnecting = true;
  currentToken = token;

  console.log("Initializing persistent WebSocket session via SockJS...");
  
  const API_BASE = "http://localhost:8080";
  const socket = new SockJS(`${API_BASE}/ws?token=${token}`);
  stompClient = Stomp.over(socket);
  
  // Disable debug logs
  stompClient.debug = () => {};

  stompClient.connect(
    { Authorization: 'Bearer ' + token },
    () => {
      isConnecting = false;
      console.log('WebSocket CONNECTED!', 'success');

      stompClient?.subscribe('/user/queue/notifications', (message: any) => {
        try {
          const notification = JSON.parse(message.body);
          broadcastUnreadIncrement();
          broadcastNotification(notification);
        } catch (e) {
          console.error("Failed to parse global WS message body:", e);
        }
      });
    },
    (error: any) => {
      console.error("Persistent WebSocket encountered an error:", error);
      isConnecting = false;
      stompClient = null;
      console.log("Persistent WebSocket closed. Reconnecting in 5s...");
      if (currentToken) {
        if (globalReconnectTimeout) clearTimeout(globalReconnectTimeout);
        globalReconnectTimeout = setTimeout(() => {
          if (currentToken) connectGlobalWebSocket(currentToken);
        }, 5000);
      }
    }
  );

  socket.onclose = () => {
    if (!isConnecting && currentToken && !stompClient?.connected) {
       isConnecting = false;
       stompClient = null;
       console.log("Persistent WebSocket closed. Reconnecting in 5s...");
       if (globalReconnectTimeout) clearTimeout(globalReconnectTimeout);
       globalReconnectTimeout = setTimeout(() => {
         if (currentToken) connectGlobalWebSocket(currentToken);
       }, 5000);
    }
  };
};

const disconnectGlobalWebSocket = () => {
  currentToken = null;
  if (globalReconnectTimeout) {
    clearTimeout(globalReconnectTimeout);
    globalReconnectTimeout = null;
  }
  if (stompClient) {
    stompClient.disconnect(() => {
      console.log("Disconnected STOMP client");
    });
    stompClient = null;
  }
  isConnecting = false;
};

export default function NotificationDropdown() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = async () => {
    toggleDropdown();
    if (unreadCount > 0 && token) {
      try {
        const response = await fetch("/api/admin/notifications/read-all", {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          }
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
    }
  };

  useEffect(() => {
    if (!token) {
      setNotificationsList([]);
      setUnreadCount(0);
      disconnectGlobalWebSocket();
      return;
    }

    // 1. Fetch unread count
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/admin/notifications/unread-count", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(Number(data.unreadCount || 0));
        }
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };

    // 2. Fetch notifications list
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/admin/notifications?page=0&size=15", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const list = data.content || [];
          setNotificationsList(list.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.message || item.description,
            time: formatTime(item.createdAt),
            type: getNotificationType(item.type),
            iconBg: getIconBg(item.type),
            iconColor: getIconColor(item.type),
            isRead: item.isRead,
          })));
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchUnreadCount();
    fetchNotifications();

    // 3. Connect to the global WebSocket session singleton
    connectGlobalWebSocket(token);

    // 4. Register listeners for this mounted instance
    const handleIncomingNotification = (notification: any) => {
      const type = getNotificationType(notification.type);
      setNotificationsList((prev) => [
        {
          id: notification.id || Date.now(),
          title: notification.title,
          description: notification.message || notification.description,
          time: "Vừa xong",
          type: type,
          iconBg: getIconBg(type),
          iconColor: getIconColor(type),
          isRead: false,
        },
        ...prev
      ]);
    };

    const handleUnreadCountChange = (updater: any) => {
      setUnreadCount(updater);
    };

    listeners.add(handleIncomingNotification);
    unreadListeners.add(handleUnreadCountChange);

    return () => {
      // Cleanup listeners when component unmounts (leaving WebSocket open in background)
      listeners.delete(handleIncomingNotification);
      unreadListeners.delete(handleUnreadCountChange);
    };
  }, [token]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
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
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute -right-0.5 -top-0.5 z-10 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-[3px] text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900 ${
            unreadCount === 0 ? "hidden" : "flex"
          }`}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-auto max-h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0 z-99999"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-white">
            Thông Báo
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notificationsList.slice(0, showAll ? notificationsList.length : 4).map((item) => (
            <li key={item.id}>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex gap-4 rounded-lg border-b border-gray-100 p-3 px-2 py-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
              >
                <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.iconBg} ${item.iconColor}`}>
                  {getIcon(item.type)}
                </div>

                <span className="block w-full text-left">
                  <span className="mb-1.5 block text-theme-sm space-x-1">
                    <span className={`text-gray-800 dark:text-white ${!item.isRead ? "font-bold text-gray-900" : "font-semibold"}`}>
                      {item.title}
                    </span>
                    <span className={`block mt-0.5 ${!item.isRead ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>
                      {item.description}
                    </span>
                  </span>

                  <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{item.time}</span>
                  </span>
                </span>
                {!item.isRead && (
                  <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0 self-center" />
                )}
              </DropdownItem>
            </li>
          ))}
          {notificationsList.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Không có thông báo nào.
            </div>
          )}
        </ul>
        {notificationsList.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="block w-full px-4 py-2 mt-3 text-sm font-medium text-center text-brand-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-brand-400 dark:hover:bg-gray-800 transition-colors"
          >
            {showAll ? "Thu gọn thông báo" : "Xem tất cả thông báo"}
          </button>
        )}
      </Dropdown>
    </div>
  );
}
