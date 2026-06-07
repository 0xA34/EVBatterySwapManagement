import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const navigate = useNavigate();

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

  // Mock data replacing Thymeleaf variables
  const walletBalance = "500,000";
  const username = "User";

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Call backend logout API (fire and forget)
    const token = localStorage.getItem('user_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
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

  return (
    <header className="site-header site-header-user">
      <div className="container header-inner">
        <Link to={isLoggedIn ? "/my" : "/"} className="brand" aria-label="ChargeX" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <img src="/favicon.ico" alt="ChargeX" className="brand-logo" style={{ height: '32px', width: 'auto' }} />
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginTop: '2px' }}>ChargeX</span>
        </Link>

        <nav className="main-nav">
          <ul id="menu" className="menu">
            <li><Link to={isLoggedIn ? "/my" : "/"}>Trang chủ</Link></li>
            <li><Link to="/dashboard">Đổi pin</Link></li>
            <li><Link to="/contact-links">Liên kết</Link></li>
            <li><Link to="/packages">Đăng ký gói dịch vụ</Link></li>
            <li className="has-sub">
              <Link to="/book">Đặt lịch</Link>
              <ul className="submenu" style={{ top: '100%', left: 0, right: 'auto', minWidth: '220px', padding: '10px 0' }}>
                <li><Link to="/nearest-stations" style={{ padding: '8px 20px', display: 'block', color: '#1f2937' }}>Tìm kiếm trạm gần nhất</Link></li>
                <li><Link to="/book" style={{ padding: '8px 20px', display: 'block', color: '#1f2937' }}>Đặt lịch đổi pin</Link></li>
              </ul>
            </li>
          </ul>
        </nav>

        {isLoggedIn ? (
          <div className="header-actions">
            <div className="notification-container">
              <button 
                id="notifBtn" 
                className="notification-bell"
                aria-label="Thông báo" 
                aria-expanded={isNotifOpen}
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <svg className="bell-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="notification-badge">3</span>
              </button>

              {isNotifOpen && (
                <div className="notification-dropdown show" role="menu" aria-label="Thông báo">
                  <div className="notification-header">
                    <h3>Thông báo</h3>
                    <button className="mark-all-read">Đánh dấu đã đọc</button>
                  </div>

                  <div className="notification-list">
                    <div className="notification-item unread">
                      <div className="notification-item-content">
                        <div className="notification-message">Pin #VF-1023 đã sẵn sàng.</div>
                        <div className="notification-time">1 phút trước</div>
                      </div>
                    </div>
                    <div className="notification-item">
                      <div className="notification-item-content">
                        <div className="notification-message">Bạn có lịch đổi pin lúc 15:30.</div>
                        <div className="notification-time">10 phút trước</div>
                      </div>
                    </div>
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
                  <path d="M6 10h.01M18 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5"/>
                </svg>
                <span className="money-amount">{walletBalance}</span>
              </div>

              <div className="has-sub">
                <div 
                  className="user-icon" 
                  aria-label="Tài khoản"
                  onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                >
                  <svg className="user-avatar" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 20c0-4 3.8-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {isAvatarOpen && (
                  <ul className="submenu show" aria-label="Tài khoản" style={{ opacity: 1, visibility: 'visible', transform: 'translateY(0)' }}>
                    <li className="user-name-item">
                      <span className="user-name">{username}</span>
                    </li>
                    <li><Link to="/topup">Nạp tiền</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><Link to="/history">Lịch sử giao dịch</Link></li>
                    <li className="logout-item">
                      <a href="#" onClick={handleLogout} className="logout-link">Đăng xuất</a>
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
    </header>
  );
}
