import { getApiUrl, API_BASE_URL } from '../../utils/api';
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({ title: '', content: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = React.useRef<HTMLDivElement>(null);
  const avatarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.title.trim() || !supportForm.content.trim()) return;

    const token = localStorage.getItem('user_token');
    if (!token) {
      alert('Vui lòng đăng nhập lại để gửi yêu cầu hỗ trợ.');
      return;
    }

    try {
      const response = await fetch(getApiUrl('/api/driver/support-tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: supportForm.title.trim(),
          message: supportForm.content.trim()
        })
      });

      if (response.ok) {
        setIsSuccessModalOpen(true);
        setIsSupportModalOpen(false);
        setSupportForm({ title: '', content: '' });
      } else {
        alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu hỗ trợ:', error);
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  React.useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<{ username?: string; fullName?: string; walletBalance?: number | null } | null>(null);

  const walletBalance = userInfo?.walletBalance != null
    ? userInfo.walletBalance.toLocaleString('vi-VN') + ' đ'
    : "0 đ";
  const username = userInfo?.fullName || userInfo?.username || "Tài khoản";

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

  const isTokenExpired = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      // Decode base64 payload
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      return Date.now() >= (payload.exp * 1000);
    } catch (e) {
      return true;
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('user_token');
    if (!token || isTokenExpired(token)) {
      console.warn('Token đã hết hạn hoặc không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }
    try {
      const response = await fetch(getApiUrl('/api/driver/notifications?page=0&size=15'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotificationsList(data.content || []);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách thông báo:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('user_token');
    if (!token || isTokenExpired(token)) return;
    try {
      const response = await fetch(getApiUrl('/api/driver/notifications/read-all'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setUnreadCount(0);
        setNotificationsList(prev => prev.map(item => ({ ...item, isRead: true })));
      }
    } catch (err) {
      console.error('Lỗi khi đánh dấu đọc tất cả:', err);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    const token = localStorage.getItem('user_token');
    if (!token || isTokenExpired(token)) return;
    try {
      const response = await fetch(getApiUrl(`/api/driver/notifications/${id}/read`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setNotificationsList(prev => prev.map(item => item.id === id ? { ...item, isRead: true } : item));
        // Update count
        const countResp = await fetch(getApiUrl('/api/driver/notifications/unread-count'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (countResp.ok) {
          const countData = await countResp.json();
          setUnreadCount(Number(countData.unreadCount || 0));
        }
      }
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã đọc:', err);
    }
  };

  React.useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('user_token');
      if (!token || isTokenExpired(token)) return;
      try {
        const response = await fetch(getApiUrl('/api/info'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin user:', err);
      }
    };

    if (isLoggedIn) {
      fetchUserInfo();
    } else {
      setUserInfo(null);
    }
  }, [isLoggedIn]);

  React.useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const fetchUnreadCount = async () => {
      const token = localStorage.getItem('user_token');
      if (!token || isTokenExpired(token)) return;
      try {
        const response = await fetch(getApiUrl('/api/driver/notifications/unread-count'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(Number(data.unreadCount || 0));
        }
      } catch (err) {
        console.error('Lỗi khi lấy số thông báo chưa đọc:', err);
      }
    };

    const connectWS = () => {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      if (isTokenExpired(token)) {
        console.warn('WebSocket: Token đã hết hạn. Dừng kết nối.');
        return;
      }

      // Generate SockJS routing info
      const serverId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let sessionId = '';
      for (let i = 0; i < 8; i++) {
        sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Use API_BASE_URL to determine the correct backend host and protocol for WebSocket
      let wsUrl = '';
      if (API_BASE_URL.startsWith('http://')) {
        const host = API_BASE_URL.replace('http://', '');
        wsUrl = `ws://${host}/ws/${serverId}/${sessionId}/websocket?token=${token}`;
      } else if (API_BASE_URL.startsWith('https://')) {
        const host = API_BASE_URL.replace('https://', '');
        wsUrl = `wss://${host}/ws/${serverId}/${sessionId}/websocket?token=${token}`;
      } else {
        // Fallback for relative paths
        const isHttps = window.location.protocol === 'https:';
        const wsProtocol = isHttps ? 'wss' : 'ws';
        const backendHost = window.location.hostname === 'localhost' ? 'localhost:8080' : window.location.host;
        wsUrl = `${wsProtocol}://${backendHost}/ws/${serverId}/${sessionId}/websocket?token=${token}`;
      }

      console.log('Connecting to WebSocket:', wsUrl);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected. Sending CONNECT frame...');
        const connectFrame = `CONNECT\naccept-version:1.1,1.2\nheart-beat:10000,10000\nAuthorization:Bearer ${token}\n\n\u0000`;
        ws?.send(JSON.stringify([connectFrame]));
      };

      ws.onmessage = (event) => {
        const data = event.data;

        // Ignore SockJS heartbeat ('h') and open ('o') frames to prevent console spam
        if (data === 'o' || data === 'h') {
          return;
        }

        console.log('WebSocket received:', data);

        let messageBody = data;
        if (data.startsWith('a[')) {
          try {
            const parsed = JSON.parse(data.substring(1));
            if (Array.isArray(parsed) && parsed.length > 0) {
              messageBody = parsed[0];
            }
          } catch (e) {
            console.error('Failed to parse SockJS frame wrapper:', e);
          }
        }

        const isNotification = data.includes('destination:/user/queue/notifications') ||
          messageBody.includes('destination:/user/queue/notifications');

        if (messageBody.includes('CONNECTED')) {
          console.log('STOMP connected. Subscribing to notifications...');
          const subscribeFrame = 'SUBSCRIBE\nid:sub-0\ndestination:/user/queue/notifications\n\n\u0000';
          ws?.send(JSON.stringify([subscribeFrame]));
        } else if (isNotification) {
          console.log('Received notification via WebSocket!');
          setUnreadCount(prev => prev + 1);
          try {
            // Find the JSON payload dynamically by locating outer braces
            const firstBrace = messageBody.indexOf('{');
            const lastBrace = messageBody.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
              const bodyStr = messageBody.substring(firstBrace, lastBrace + 1);
              const notification = JSON.parse(bodyStr);
              setNotificationsList(prev => [
                {
                  id: notification.id || Date.now(),
                  title: notification.title,
                  message: notification.message || notification.description || '',
                  type: notification.type || 'INFO',
                  isRead: notification.isRead !== undefined ? notification.isRead : false,
                  createdAt: notification.createdAt || new Date().toISOString()
                },
                ...prev
              ]);
            }
          } catch (err) {
            console.error('Lỗi khi phân tích nội dung thông báo WebSocket:', err);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected. Retrying in 5s...');
        reconnectTimeout = setTimeout(connectWS, 5000);
      };
    };

    if (isLoggedIn) {
      fetchUnreadCount();
      connectWS();
    } else {
      setUnreadCount(0);
    }

    return () => {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isLoggedIn]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Call backend logout API (fire and forget)
    const token = localStorage.getItem('user_token');
    if (token) {
      try {
        await fetch(getApiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Lỗi khi gọi API đăng xuất:', err);
      }
    }

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_role');
    window.dispatchEvent(new Event('authChange'));
    setIsAvatarOpen(false);
    navigate('/');
  };

  const handleDropdownClick = () => {
    const nextOpen = !isNotifOpen;
    setIsNotifOpen(nextOpen);
    if (nextOpen) {
      fetchNotifications();
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="site-header site-header-user">
      <div className="container header-inner">
        <Link to={isLoggedIn ? "/my" : "/"} className="brand" aria-label="ChargeX" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <img src="/favicon.ico" alt="ChargeX" className="brand-logo" style={{ height: '32px', width: 'auto' }} />
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginTop: '2px' }}>ChargeX</span>
        </Link>
        
        <button 
          className="nav-toggle" 
          id="navToggle" 
          aria-label="Menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>

        <nav className="main-nav">
          <ul id="menu" className={`menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <li>
              <Link to={isLoggedIn ? "/my" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Trang chủ
              </Link>
            </li>
            <li>
              <Link to={isLoggedIn ? "/dashboard" : "/login"} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                Đổi pin
              </Link>
            </li>
            <li>
              <Link to="/contact-links" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                Liên kết
              </Link>
            </li>
            <li>
              <Link to="/packages" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                Đăng ký gói dịch vụ
              </Link>
            </li>
          </ul>
        </nav>

        {isLoggedIn ? (
          <div className="header-actions">
            <div className="notification-container" ref={notifRef}>
              <button
                id="notifBtn"
                className="notification-bell"
                aria-label="Thông báo"
                aria-expanded={isNotifOpen}
                onClick={handleDropdownClick}
              >
                <svg className="bell-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {isNotifOpen && (
                <div className="notification-dropdown show" role="menu" aria-label="Thông báo">
                  <div className="notification-header">
                    <h3>Thông báo</h3>
                    <button className="mark-all-read" onClick={handleMarkAllRead}>Đánh dấu đã đọc</button>
                  </div>

                  <div className="notification-list">
                    {notificationsList.map((item) => (
                      <div
                        key={item.id}
                        className={`notification-item ${!item.isRead ? 'unread' : ''}`}
                        onClick={() => handleMarkAsRead(item.id)}
                      >
                        <div className="notification-item-content">
                          <div className="notification-title" style={{ fontWeight: !item.isRead ? 'bold' : 'normal' }}>
                            {item.title}
                          </div>
                          <div className="notification-message">{item.message}</div>
                          <div className="notification-meta">
                            <span className="notification-time">{formatTime(item.createdAt)}</span>
                            <span className={`notification-type ${(item.type || 'info').toLowerCase()}`}>
                              {item.type || 'info'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notificationsList.length === 0 && (
                      <div className="notification-empty" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                        Không có thông báo nào.
                      </div>
                    )}
                  </div>

                  <div className="notification-footer">
                    <Link to="#" className="view-all-notifications">Xem tất cả</Link>
                  </div>
                </div>
              )}
            </div>

            <div className="user-info">
              <div className="money-display">
                <svg className="money-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" />
                  <path d="M6 10h.01M18 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5" />
                </svg>
                <span className="money-amount">{walletBalance}</span>
              </div>

              <div className="has-sub" ref={avatarRef}>
                <div
                  aria-label="Tài khoản"
                  onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 12px', backgroundColor: '#f1f5f9', borderRadius: '999px', border: '1px solid #e2e8f0' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" style={{ flexShrink: 0, color: '#475569' }}>
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 20c0-4 3.8-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', whiteSpace: 'nowrap' }}>{username}</span>
                </div>

                {isAvatarOpen && (
                  <ul className="submenu show" aria-label="Tài khoản" style={{ opacity: 1, visibility: 'visible', transform: 'translateY(0)', minWidth: '220px' }}>
                    <li className="user-name-item">
                      <span className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        {username}
                      </span>
                    </li>
                    <li>
                      <Link to="/topup" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        Nạp tiền
                      </Link>
                    </li>
                    <li>
                      <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/history" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        Lịch sử giao dịch
                      </Link>
                    </li>
                    <li>
                      <Link to="/swap-history" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                        Lịch sử đổi pin
                      </Link>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); setIsSupportModalOpen(true); setIsAvatarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Gửi yêu cầu hỗ trợ
                      </a>
                    </li>
                    <li className="logout-item">
                      <a href="#" onClick={handleLogout} className="logout-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Đăng xuất
                      </a>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="header-actions" style={{ alignItems: 'center' }}>
            <Link to="/register" className="link" style={{ marginRight: '16px', fontWeight: 600 }}>Đăng ký</Link>
            <Link to="/login" className="button" style={{ borderRadius: '20px', padding: '8px 20px' }}>Đăng nhập</Link>
          </div>
        )}
      </div>

      {isSupportModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', width: '450px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Gửi yêu cầu hỗ trợ
            </h3>
            <form onSubmit={handleSupportSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>Tiêu đề</label>
                <input 
                  type="text" 
                  required
                  value={supportForm.title}
                  onChange={(e) => setSupportForm({...supportForm, title: e.target.value})}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '15px' }}
                  placeholder="Nhập tiêu đề hỗ trợ"
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>Nội dung</label>
                <textarea 
                  required
                  value={supportForm.content}
                  onChange={(e) => setSupportForm({...supportForm, content: e.target.value})}
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', minHeight: '120px', resize: 'vertical', fontSize: '15px', fontFamily: 'inherit' }}
                  placeholder="Mô tả chi tiết vấn đề của bạn..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsSupportModalOpen(false)} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Hủy</button>
                <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '380px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.25rem', color: '#1f2937' }}>Gửi thành công!</h3>
            <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '15px', lineHeight: '1.5' }}>Yêu cầu hỗ trợ của bạn đã được tiếp nhận. Chúng tôi sẽ xử lý và phản hồi lại sớm nhất.</p>
            <button onClick={() => setIsSuccessModalOpen(false)} style={{ padding: '12px 24px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', width: '100%', transition: 'background-color 0.2s' }}>Đóng</button>
          </div>
        </div>
      )}

      {/* Sub Header Navigation for Mobile */}
      <nav className="sub-header-nav">
        <Link to={isLoggedIn ? "/my" : "/"} className={`sub-nav-item ${(location.pathname === '/' || location.pathname === '/my') ? 'active' : ''}`}>
          <span>Trang chủ</span>
        </Link>
        <Link to={isLoggedIn ? "/dashboard" : "/login"} className={`sub-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <span>Đổi pin</span>
        </Link>
        <Link to="/contact-links" className={`sub-nav-item ${location.pathname === '/contact-links' ? 'active' : ''}`}>
          <span>Liên kết</span>
        </Link>
        <Link to="/packages" className={`sub-nav-item ${location.pathname === '/packages' ? 'active' : ''}`}>
          <span>Đăng ký gói</span>
        </Link>
      </nav>
    </header>
  );
}
