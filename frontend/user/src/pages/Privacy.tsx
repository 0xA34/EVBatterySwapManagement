export default function Privacy() {
  return (
    <main style={{ minHeight: '80vh', padding: '4rem 1rem', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>Chính sách bảo mật</h1>
        
        <div style={{ color: '#475569', lineHeight: 1.8 }}>
          <p>Sự riêng tư của bạn rất quan trọng đối với chúng tôi. Chính sách này giải thích cách ChargeX thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.</p>
          
          <h3 style={{ color: '#1e293b', marginTop: '2rem' }}>1. Thông tin chúng tôi thu thập</h3>
          <p>Chúng tôi chỉ thu thập thông tin khi bạn đăng ký tài khoản, bao gồm: Họ tên, số điện thoại, địa chỉ email, và thông tin phương tiện (nếu có).</p>

          <h3 style={{ color: '#1e293b', marginTop: '2rem' }}>2. Sử dụng thông tin</h3>
          <ul>
            <li>Cung cấp và tối ưu hóa dịch vụ đổi pin.</li>
            <li>Thông báo về các giao dịch, cảnh báo và cập nhật hệ thống.</li>
            <li>Hỗ trợ khách hàng nhanh chóng khi có sự cố.</li>
          </ul>

          <h3 style={{ color: '#1e293b', marginTop: '2rem' }}>3. Bảo vệ dữ liệu</h3>
          <p>Tất cả dữ liệu cá nhân của bạn đều được mã hóa theo tiêu chuẩn công nghiệp mới nhất. Chúng tôi không mua bán, trao đổi hoặc cung cấp dữ liệu cá nhân của bạn cho bên thứ 3 phục vụ mục đích quảng cáo.</p>

          <h3 style={{ color: '#1e293b', marginTop: '2rem' }}>4. Liên hệ</h3>
          <p>Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, xin vui lòng gửi email về <strong>support@chargex.local</strong>.</p>
        </div>
      </div>
    </main>
  );
}
