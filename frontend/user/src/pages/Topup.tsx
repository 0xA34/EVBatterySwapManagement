import React, { useState } from 'react';
import '../assets/css/topup.css';

export default function Topup() {
  const [amount, setAmount] = useState<number | ''>('');
  const [showResult, setShowResult] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const walletBalance = "500,000 VNĐ"; // Mock data
  const predefinedAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  const handleAmountClick = (value: number) => {
    setAmount(value);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value === '' ? '' : Number(value));
  };

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 10000) {
      alert("Số tiền nạp tối thiểu là 10,000 VNĐ");
      return;
    }
    if (amount > 10000000) {
      alert("Số tiền nạp tối đa là 10,000,000 VNĐ");
      return;
    }
    
    // Giả lập lấy QR code từ API
    setQrCodeUrl("https://api.vietqr.io/image/970415-22749061-fS5qQoE.jpg?amount=" + amount + "&addInfo=Nap%20Tien%20VinFast");
    setShowResult(true);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Đã copy: ' + text);
    }).catch(() => {
      alert("Không thể copy. Vui lòng copy thủ công.");
    });
  };

  return (
    <main className="recharge-page">
      <div className="container recharge-wrapper">
        <div className="page-header">
          <h1 className="page-title">Nạp tiền vào tài khoản</h1>
          <p className="page-subtitle">Nạp tiền nhanh chóng để sử dụng dịch vụ thuê pin VinFast</p>
        </div>

        <div className="balance-card">
          <div className="balance-label">Số dư hiện tại</div>
          <div className="balance-amount">{walletBalance}</div>
        </div>

        <div className="recharge-card">
          <h3 className="card-title">Chọn số tiền nạp</h3>

          <form onSubmit={handleTopup}>
            <div className="amount-grid">
              {predefinedAmounts.map((val) => (
                <button 
                  key={val} 
                  type="button" 
                  className={`amount-btn ${amount === val ? 'active' : ''}`}
                  onClick={() => handleAmountClick(val)}
                >
                  {val.toLocaleString('vi-VN')} VNĐ
                </button>
              ))}
            </div>

            <div className="custom-amount">
              <input
                type="number"
                placeholder="Hoặc nhập số tiền tùy chỉnh (10,000 - 10,000,000 VNĐ)"
                min="10000"
                max="10000000"
                value={amount}
                onChange={handleCustomAmountChange}
              />
            </div>

            <button type="submit" className="submit-btn">
              <span>Tạo yêu cầu nạp tiền</span>
              <span>→</span>
            </button>
          </form>
        </div>

        <div className="recharge-card">
          <h3 className="card-title">Thông tin chuyển khoản</h3>

          <div className="bank-info">
            <div className="bank-name">ACB - Ngân hàng Á Châu</div>
            <div className="bank-detail">
              <span className="bank-detail-label">Số tài khoản:</span>
              <span className="bank-detail-value">22749061</span>
              <button type="button" className="copy-btn" onClick={() => copyText('22749061')}>Copy</button>
            </div>
            <div className="bank-detail">
              <span className="bank-detail-label">Chủ tài khoản:</span>
              <span className="bank-detail-value">HUYNH MAI NHAT MINH</span>
            </div>
          </div>

          <div className="instructions-box">
            <h4 className="instructions-title">Hướng dẫn nạp tiền</h4>
            <ol>
              <li>Chọn số tiền muốn nạp từ các mức có sẵn hoặc nhập số tiền tùy chỉnh</li>
              <li>Nhấn "Tạo yêu cầu nạp tiền" để sinh QR Code</li>
              <li>Quét QR Code hoặc chuyển khoản thủ công theo thông tin trên</li>
              <li>Đảm bảo nội dung chuyển khoản chính xác</li>
              <li>Liên hệ admin để xác nhận nạp tiền</li>
            </ol>
          </div>
        </div>

        {showResult && (
          <div className="result-section show">
            <div className="success-header">
              <div className="success-icon">✅</div>
              <h3 className="success-title">Yêu cầu nạp tiền đã được tạo!</h3>
              <p className="success-subtitle">Vui lòng chuyển khoản theo thông tin bên dưới</p>
            </div>

            <div className="recharge-card">
              <div className="bank-info">
                <div className="bank-detail">
                  <span className="bank-detail-label">Số tiền nạp:</span>
                  <span className="bank-detail-value" style={{ color: '#059669', fontSize: '20px' }}>
                    {amount !== '' ? amount.toLocaleString('vi-VN') : '0'} VNĐ
                  </span>
                </div>
              </div>

              <div className="bank-selection">
                <h4 className="card-title">Chọn ngân hàng để chuyển khoản</h4>
                <div className="bank-options">
                  <div className="bank-option selected">
                    <div className="bank-option-name">ACB - Ngân hàng Á Châu</div>
                    <div className="bank-option-number">22749061</div>
                  </div>
                </div>
              </div>

              <div className="qr-section">
                <h4 style={{ margin: '0 0 20px', color: '#0f172a' }}>Quét QR Code để chuyển khoản</h4>
                <div className="qr-container">
                  <img src={qrCodeUrl} alt="QR Code chuyển khoản" style={{ maxWidth: '250px' }} />
                </div>
              </div>

              <div className="instructions-box" style={{ marginTop: '28px' }}>
                <h4 className="instructions-title"><span>⚠️</span> Lưu ý quan trọng</h4>
                <ol>
                  <li>Kiểm tra kỹ thông tin tài khoản và số tiền trước khi chuyển</li>
                  <li>Không thay đổi nội dung chuyển khoản để tránh xử lý chậm</li>
                  <li>Chụp lại biên lai chuyển khoản để đối chiếu nếu cần</li>
                  <li>Tiền sẽ được cộng vào tài khoản sau khi admin xác nhận</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
