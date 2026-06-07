export default function FAQ() {
  return (
    <main style={{ minHeight: '80vh', padding: '4rem 1rem', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>Câu hỏi thường gặp (FAQ)</h1>
        
        <div style={{ color: '#475569', lineHeight: 1.8 }}>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>1. Làm thế nào để tìm trạm đổi pin gần nhất?</h3>
            <p style={{ margin: 0 }}>Bạn có thể vào mục "Đổi pin" trên thanh menu, hoặc sử dụng tính năng "Tra cứu khu vực" tại trang chủ (Dashboard). Hệ thống sẽ liệt kê các trạm lân cận và hiển thị số lượng pin khả dụng.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>2. Tôi có thể đặt lịch đổi pin trước bao lâu?</h3>
            <p style={{ margin: 0 }}>Hệ thống cho phép bạn đặt lịch giữ pin trước tối đa 3 tiếng đồng hồ. Trong trường hợp bạn đăng ký hạng thành viên cao cấp, thời gian có thể kéo dài hơn.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>3. Chi phí đổi pin được tính như thế nào?</h3>
            <p style={{ margin: 0 }}>Chi phí được tính dựa vào chênh lệch dung lượng giữa pin cũ bạn trả và pin mới bạn nhận, nhân với đơn giá niêm yết tại từng thời điểm. Bạn có thể mua gói dịch vụ để tiết kiệm chi phí.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>4. Chuyện gì xảy ra nếu tôi không đến đúng hẹn đặt lịch?</h3>
            <p style={{ margin: 0 }}>Nếu quá thời gian đặt lịch 30 phút mà bạn chưa tiến hành đổi pin, hệ thống sẽ tự động hủy lịch và hoàn trả pin về trạng thái khả dụng cho người khác. Có thể có một khoản phí phạt nhỏ áp dụng tùy theo quy định.</p>
          </div>

        </div>
      </div>
    </main>
  );
}
