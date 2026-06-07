
import { Link } from 'react-router-dom';

export default function My() {
  return (
    <main className="landing">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">ChargeX</h1>
            <p className="hero-subtitle">Phần mềm quản lý trạm đổi pin xe điện</p>
            <p className="hero-desc">Giám sát trạng thái trạm, quản lý tồn kho pin, điều phối đổi pin theo thời gian thực, báo cáo hiệu suất và cảnh báo sự cố.</p>
            <div className="hero-actions">
              <Link to="/nearest-stations" className="button primary">Tìm kiếm trạm gần nhất</Link>
              <Link to="/book" className="button">Đặt lịch đổi pin</Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-card">
              <div className="hero-metric">
                <span className="metric-label">Trạm hoạt động</span>
                <span className="metric-value">24</span>
              </div>
              <div className="hero-metric">
                <span className="metric-label">Lượt đổi hôm nay</span>
                <span className="metric-value">1.268</span>
              </div>
              <div className="hero-metric">
                <span className="metric-label">Tồn kho pin</span>
                <span className="metric-value">542</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container features-grid">
          <article className="feature">
            <h3>Quản lý trạm</h3>
            <p>Theo dõi trạng thái online/offline, công suất, lịch bảo trì và nhật ký hoạt động.</p>
          </article>
          <article className="feature">
            <h3>Quản lý pin</h3>
            <p>Quản lý vòng đời pin, phân loại, chất lượng, tồn kho theo trạm và lịch sử đổi.</p>
          </article>
          <article className="feature">
            <h3>Điều phối thời gian thực</h3>
            <p>Phân luồng khách, dự báo nhu cầu, cân bằng tải giữa các trạm lân cận.</p>
          </article>
          <article className="feature">
            <h3>Báo cáo & Cảnh báo</h3>
            <p>Bảng điều khiển KPI, cảnh báo sự cố, cảnh báo tồn kho thấp và báo cáo định kỳ.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
