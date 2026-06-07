
import '../assets/css/profile.css';

export default function Profile() {
  const userInfo = {
    username: 'nguyenvana',
    role: 'USER',
    id: '123456',
    createdAt: '01/06/2026 10:00:00',
    email: 'nguyenvana@example.com',
    phone: '0987654321',
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM'
  };

  return (
    <main className="profile">
      <div className="profile-container">
        <div className="profile-header">
          <h1>👤 Hồ sơ cá nhân</h1>
          <p>Thông tin tài khoản và liên hệ của bạn</p>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <h2 className="card-title">Thông tin cá nhân</h2>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">Tên đăng nhập</div>
                <div className="info-value">{userInfo.username}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Vai trò</div>
                <div className="info-value">{userInfo.role}</div>
              </div>
              <div className="info-item">
                <div className="info-label">ID người dùng</div>
                <div className="info-value">{userInfo.id}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Ngày tham gia</div>
                <div className="info-value">{userInfo.createdAt}</div>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h2 className="card-title">Thông tin liên hệ</h2>
            <div className="contact-grid">
              <div className="contact-item">
                <div className="contact-label">Email</div>
                <div className="contact-value">{userInfo.email}</div>
              </div>
              <div className="contact-item">
                <div className="contact-label">Số điện thoại</div>
                <div className="contact-value">{userInfo.phone}</div>
              </div>
              <div className="contact-item">
                <div className="contact-label">Địa chỉ</div>
                <div className="contact-value">{userInfo.address}</div>
              </div>
            </div>
            
            <div className="action-buttons">
              <button className="profile-button button-secondary">
                🔗 Cập nhật thông tin liên hệ hệ thống
              </button>
              <button className="profile-button button-primary">
                🔑 Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
