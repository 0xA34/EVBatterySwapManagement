import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/packages.css';

export default function Packages() {
  const navigate = useNavigate();

  const handleSubscribe = (e: React.MouseEvent, pkgName: string) => {
    e.preventDefault();
    if (localStorage.getItem('isLoggedIn') === 'true') {
      alert(`Bạn đã đăng ký thành công gói ${pkgName}!`);
    } else {
      alert('Vui lòng đăng nhập để đăng ký gói.');
      navigate('/login');
    }
  };
  return (
    <main className="packages-page">
      <div className="packages-wrapper">
        <div className="packages-hero">
          <h1>Chọn gói phù hợp với bạn</h1>
          <p className="subtitle">Nâng cấp trải nghiệm với các gói dịch vụ linh hoạt</p>
        </div>

        <div className="packages-grid">
          {/* Basic Package */}
          <div className="package-card basic">
            <div className="package-header">
              <h3 className="package-name">Cơ Bản</h3>
              <p className="package-description">Phù hợp cho người dùng mới</p>
            </div>

            <div className="package-price">
              <div className="price-amount">
                50K
                <span className="price-currency">VNĐ</span>
              </div>
              <div className="price-period">30 ngày sử dụng</div>
            </div>

            <ul className="package-features">
              <li>Đổi pin không giới hạn</li>
              <li>Hỗ trợ 24/7</li>
              <li>Thời hạn 30 ngày</li>
              <li>Quy trình tiêu chuẩn</li>
            </ul>

            <a href="#" onClick={(e) => handleSubscribe(e, 'Cơ Bản')} className="package-button">
              <span>Đăng ký ngay</span>
              <span>→</span>
            </a>
          </div>

          {/* Premium Package */}
          <div className="package-card premium">
            <div className="package-header">
              <h3 className="package-name">Premium</h3>
              <p className="package-description">Lựa chọn tốt nhất</p>
            </div>

            <div className="package-price">
              <div className="price-amount">
                150K
                <span className="price-currency">VNĐ</span>
              </div>
              <div className="price-period">30 ngày sử dụng</div>
            </div>

            <ul className="package-features">
              <li>Đổi pin không giới hạn</li>
              <li>Ưu tiên đặt lịch</li>
              <li>Hỗ trợ VIP 24/7</li>
              <li>Phản hồi nhanh chóng</li>
              <li>Tích điểm thưởng</li>
            </ul>

            <a href="#" onClick={(e) => handleSubscribe(e, 'Premium')} className="package-button">
              <span>Đăng ký ngay</span>
              <span>→</span>
            </a>
          </div>

          {/* VIP Package */}
          <div className="package-card vip">
            <div className="package-header">
              <h3 className="package-name">VIP</h3>
              <p className="package-description">Trải nghiệm cao cấp</p>
            </div>

            <div className="package-price">
              <div className="price-amount">
                300K
                <span className="price-currency">VNĐ</span>
              </div>
              <div className="price-period">30 ngày sử dụng</div>
            </div>

            <ul className="package-features">
              <li>Đổi pin không giới hạn</li>
              <li>Ưu tiên cao nhất</li>
              <li>Hỗ trợ VIP độc quyền</li>
              <li>Miễn phí vận chuyển</li>
              <li>Tích điểm x2</li>
              <li>Quà tặng đặc biệt</li>
            </ul>

            <a href="#" onClick={(e) => handleSubscribe(e, 'VIP')} className="package-button">
              <span>Đăng ký ngay</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
