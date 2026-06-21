import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../assets/css/profile.css';

export default function Profile() {
  const [userInfo, setUserInfo] = useState<any>({
    username: '...',
    role: '...',
    id: '...',
    email: '...',
    phone: '...',
    fullName: '...'
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('user_token');
      if (!token) return;
      try {
        const response = await fetch('/api/info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo({
            username: data.username,
            role: data.role,
            id: data.id,
            email: data.email,
            phone: data.phoneNumber || data.phone || 'Chưa cập nhật',
            fullName: data.fullName || 'Người dùng'
          });
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
      }
    };
    fetchUserInfo();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    const token = localStorage.getItem('user_token');
    if (!token) {
      setMessage({ type: 'error', text: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/update-password?oldPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resText = await response.text();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setMessage(null);
        }, 2000);
      } else {
        let errorMsg = 'Có lỗi xảy ra khi cập nhật mật khẩu.';
        if (resText === "Password doesn't match") {
          errorMsg = 'Mật khẩu hiện tại không chính xác.';
        } else if (resText === "Password already exists") {
          errorMsg = 'Mật khẩu mới trùng với mật khẩu hiện tại.';
        } else {
          errorMsg = resText || errorMsg;
        }
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Không thể kết nối tới máy chủ.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="profile">
      {/* Hero Banner Area */}
      <div className="profile-hero">
        <div className="profile-hero-bg"></div>
      </div>

      <div className="profile-container">
        <div className="profile-main-card">
          {/* Overlapping Avatar */}
          <div className="profile-avatar-section">
            <div className="avatar-circle-large">
              <span className="avatar-text">
                {userInfo.fullName !== '...' ? userInfo.fullName.charAt(0) : 'U'}
              </span>
              <div className="avatar-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="badge-icon">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <div className="avatar-title-group">
              <h1 className="profile-name">{userInfo.fullName}</h1>
              <div className="profile-role-badge">
                <span className="role-dot"></span>
                {userInfo.role}
              </div>
            </div>
          </div>

          <div className="profile-content-grid">
            {/* Left Column: Account Info */}
            <div className="info-group">
              <div className="info-group-header">
                <div className="icon-wrapper blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <h2>Thông tin hệ thống</h2>
              </div>
              
              <div className="info-list">
                <div className="info-row">
                  <span className="info-row-label">Tên đăng nhập</span>
                  <span className="info-row-value highlight">{userInfo.username}</span>
                </div>
                <div className="info-row">
                  <span className="info-row-label">ID người dùng</span>
                  <span className="info-row-value font-mono">#{userInfo.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-row-label">Modun pin hiện tại</span>
                  <span className="info-row-value font-mono" style={{ color: userInfo.batteryModule ? '#16a34a' : '#94a3b8' }}>
                    {userInfo.batteryModule || 'Chưa có'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Info */}
            <div className="info-group">
              <div className="info-group-header">
                <div className="icon-wrapper green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <h2>Liên hệ & Bảo mật</h2>
              </div>

              <div className="info-list">
                <div className="info-row">
                  <span className="info-row-label">Email cá nhân</span>
                  <span className="info-row-value">{userInfo.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-row-label">Số điện thoại</span>
                  <span className={`info-row-value ${!userInfo.phone || userInfo.phone === 'Chưa cập nhật' ? 'text-muted' : ''}`}>
                    {!userInfo.phone || userInfo.phone === 'Chưa cập nhật' ? 'Chưa cập nhật' : userInfo.phone}
                  </span>
                </div>
              </div>

              <div className="security-action">
                <button className="btn-glow" onClick={() => setShowPasswordModal(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Đổi mật khẩu bảo mật
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button 
              onClick={() => { setShowPasswordModal(false); setMessage(null); }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                border: 'none',
                background: '#f1f5f9',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#64748b'
              }}
            >
              ✕
            </button>
            
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px', color: '#0f172a' }}>
              🔑 Đổi mật khẩu tài khoản
            </h2>

            {message && (
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '14px',
                fontWeight: 500,
                background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: message.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`
              }}>
                {message.type === 'success' ? '✅ ' : '⚠️ '}
                {message.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Mật khẩu hiện tại
                </label>
                <input 
                  type="password" 
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Mật khẩu mới
                </label>
                <input 
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '34px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Xác nhận mật khẩu mới
                </label>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '34px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowPasswordModal(false); setMessage(null); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#475569'
                  }}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {isLoading ? 'Đang cập nhật...' : 'Xác nhận đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
