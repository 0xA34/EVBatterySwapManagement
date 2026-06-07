import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-col">
          <div className="brand row">
            <span className="brand-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
              <img src="/favicon.ico" alt="ChargeX" style={{ height: '28px', width: 'auto' }} />
              ChargeX System
            </span>
          </div>
          <ul className="list">
            <li>Công ty Cổ phần Công nghệ ChargeX</li>
            <li>Khu Công nghệ cao, TP. Hồ Chí Minh</li>
          </ul>
        </div>
        <div className="footer-col">
          <ul className="list">
            <li><Link to="/terms" className="link">Quy định hoạt động</Link></li>
            <li><Link to="/privacy" className="link">Chính sách bảo mật</Link></li>
            <li><Link to="/membership-benefits" className="link">Bảng quyền lợi thành viên</Link></li>
            <li><Link to="/faq" className="link">Câu hỏi thường gặp</Link></li>
            <li><Link to="/policies" className="link">Chính sách và Thông báo</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <ul className="list">
            <li>Hotline: 1900 23 23 89</li>
            <li><a href="mailto:support@chargex.local" className="link">support@chargex.local</a></li>
          </ul>
        </div>
      </div>
      <div className="copyright">
        <div className="container">
          © {new Date().getFullYear()} ChargeX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
