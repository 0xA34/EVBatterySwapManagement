export default function Policies() {
  return (
    <main style={{ minHeight: '80vh', padding: '4rem 1rem', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>Chính sách và Thông báo</h1>
        
        <div style={{ color: '#475569', lineHeight: 1.8 }}>
          <p>Khu vực cập nhật các thông báo mới nhất và các chính sách vận hành thay đổi của ChargeX.</p>
          
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>CẬP NHẬT: 15/05/2026</span>
              <h3 style={{ margin: '0.5rem 0', color: '#1e293b' }}>Chính sách bảo hành pin phiên bản 2.0</h3>
              <p style={{ margin: 0 }}>ChargeX chính thức áp dụng tiêu chuẩn bảo hành mới, miễn phí đổi trả nếu pin gặp lỗi phần mềm do bản cập nhật firmware gần nhất.</p>
            </div>

            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #0ea5e9' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>THÔNG BÁO: 02/04/2026</span>
              <h3 style={{ margin: '0.5rem 0', color: '#1e293b' }}>Điều chỉnh phí thuê pin định kỳ</h3>
              <p style={{ margin: 0 }}>Bắt đầu từ quý tới, biểu phí các gói thuê pin (Package) sẽ được cập nhật do điều chỉnh chi phí điện năng quốc gia. Chi tiết biểu phí sẽ được gửi qua Email.</p>
            </div>

            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>CẬP NHẬT: 10/01/2026</span>
              <h3 style={{ margin: '0.5rem 0', color: '#1e293b' }}>Ra mắt tính năng Tích điểm Thưởng</h3>
              <p style={{ margin: 0 }}>Chương trình ChargeX Rewards chính thức ra mắt, cho phép người dùng đổi điểm tích lũy thành voucher thanh toán hoặc thẻ cào.</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
