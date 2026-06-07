export default function MembershipBenefits() {
  return (
    <main style={{ minHeight: '80vh', padding: '4rem 1rem', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>Bảng quyền lợi thành viên</h1>
        
        <div style={{ color: '#475569', lineHeight: 1.8 }}>
          <p>Chương trình thành viên ChargeX được thiết kế nhằm mang lại trải nghiệm tiện ích nhất cùng những ưu đãi đặc biệt cho người dùng trung thành.</p>
          
          <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
            <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🌱</span> Hạng Tiêu chuẩn
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>Truy cập hệ thống trạm đổi pin trên toàn quốc</li>
                <li>Hỗ trợ khách hàng trong giờ hành chính</li>
                <li>Tích điểm 1% giá trị giao dịch</li>
              </ul>
            </div>

            <div style={{ padding: '1.5rem', border: '2px solid #3b82f6', borderRadius: '12px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-12px', right: '20px', background: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>PHỔ BIẾN</span>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>⚡</span> Hạng Vàng
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>Tất cả quyền lợi của hạng Tiêu chuẩn</li>
                <li>Được ưu tiên đặt lịch trước 24h</li>
                <li>Hỗ trợ kỹ thuật cứu hộ 24/7</li>
                <li>Tích điểm 3% giá trị giao dịch</li>
              </ul>
            </div>

            <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'linear-gradient(to right, #1e293b, #0f172a)', color: 'white' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>💎</span> Hạng Kim Cương
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>Tất cả quyền lợi của hạng Vàng</li>
                <li>Miễn phí 2 lượt đổi pin/tháng</li>
                <li>Tích điểm 5% giá trị giao dịch</li>
                <li>Tham gia các sự kiện VIP của ChargeX</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
