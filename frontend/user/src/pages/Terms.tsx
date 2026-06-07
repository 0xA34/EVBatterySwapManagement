export default function Terms() {
  return (
    <main style={{ minHeight: '80vh', padding: '4rem 1rem', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>Quy định hoạt động</h1>
        
        <div style={{ color: '#475569', lineHeight: 1.8 }}>
          <p>Chào mừng bạn đến với Hệ thống Quản lý Trạm Đổi Pin ChargeX. Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý với các quy định hoạt động sau đây:</p>
          
          <h3 style={{ color: '#1e293b', marginTop: '2rem' }}>1. Sử dụng dịch vụ</h3>
          <p>Dịch vụ đổi pin chỉ được sử dụng cho mục đích cá nhân và không được dùng cho mục đích thương mại trái phép. Bạn có trách nhiệm bảo quản pin và thiết bị mượn từ trạm.</p>

          <h3 style={{ color: '#1e293b', marginTop: '2rem' }}>2. Quy định thanh toán</h3>
          <p>Bạn phải duy trì đủ số dư trong ví hoặc thanh toán đúng hạn các gói cước đã đăng ký. ChargeX có quyền tạm ngưng dịch vụ nếu phát hiện các hành vi gian lận thanh toán.</p>

          <h3 style={{ color: '#1e293b', marginTop: '2rem' }}>3. Trách nhiệm của khách hàng</h3>
          <ul>
            <li>Hoàn trả pin đúng hạn và đúng trạm quy định.</li>
            <li>Không tự ý tháo rời, can thiệp hoặc sửa chữa pin của ChargeX.</li>
            <li>Thông báo ngay cho trung tâm hỗ trợ nếu phát hiện sự cố, hỏng hóc.</li>
          </ul>

          <h3 style={{ color: '#1e293b', marginTop: '2rem' }}>4. Từ chối cung cấp dịch vụ</h3>
          <p>ChargeX có quyền từ chối hoặc chấm dứt cung cấp dịch vụ nếu bạn vi phạm các quy định trên hoặc có hành vi phá hoại tài sản của công ty.</p>
        </div>
      </div>
    </main>
  );
}
