import { getApiUrl } from '../utils/api';
import React, { useState } from 'react';
import { Wallet, CreditCard, CheckCircle2, Info, Copy } from 'lucide-react';
import '../assets/css/topup.css';

export default function Topup() {
  const [amount, setAmount] = useState<number | ''>('');
  const [showResult, setShowResult] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const [userInfo, setUserInfo] = useState<{ walletBalance?: number | null } | null>(null);

  React.useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('user_token');
      if (!token) return;
      try {
        const response = await fetch(getApiUrl('/api/info'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin user:', err);
      }
    };
    fetchUserInfo();
  }, []);

  const walletBalanceStr = userInfo?.walletBalance != null 
    ? userInfo.walletBalance.toLocaleString('vi-VN') + ' đ'
    : "0 đ";

  const predefinedAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  const handleAmountClick = (value: number) => {
    setAmount(value);
    setShowResult(false);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value === '' ? '' : Number(value));
    setShowResult(false);
  };

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 10000) {
      alert("Số tiền nạp tối thiểu là 10.000 VNĐ");
      return;
    }
    if (amount > 10000000) {
      alert("Số tiền nạp tối đa là 10.000.000 VNĐ");
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
    <main className="topup-page">
      <div className="topup-container">
        
        {/* Left Column: Form */}
        <div className="topup-main-panel">
          <div className="topup-header">
            <div className="header-icon"><Wallet size={28} /></div>
            <div>
              <h1 className="topup-title">Nạp tiền tài khoản</h1>
              <p className="topup-subtitle">Giao dịch nhanh chóng và an toàn</p>
            </div>
          </div>

          <div className="balance-badge">
            <span className="balance-label">Số dư hiện tại</span>
            <span className="balance-value">{walletBalanceStr}</span>
          </div>

          <form className="topup-form" onSubmit={handleTopup}>
            <h3 className="section-title">Chọn số tiền nạp</h3>
            
            <div className="amount-grid">
              {predefinedAmounts.map((val) => (
                <button 
                  key={val} 
                  type="button" 
                  className={`amount-btn ${amount === val ? 'active' : ''}`}
                  onClick={() => handleAmountClick(val)}
                >
                  {val.toLocaleString('vi-VN')} đ
                </button>
              ))}
            </div>

            <div className="custom-input-wrapper">
              <input
                type="number"
                className="custom-amount-input"
                placeholder="Nhập số tiền khác (Tối thiểu 10.000 đ)"
                min="10000"
                max="10000000"
                value={amount}
                onChange={handleCustomAmountChange}
              />
              <span className="currency-suffix">VNĐ</span>
            </div>

            <button type="submit" className="btn-submit" disabled={!amount || amount < 10000}>
              <CreditCard size={18} /> Xác nhận nạp tiền
            </button>
          </form>

          <div className="info-box">
            <Info size={18} className="info-icon" />
            <p>Tiền sẽ được cộng vào tài khoản ChargeX sau khi giao dịch chuyển khoản thành công. Nếu quá 15 phút chưa nhận được tiền, vui lòng liên hệ CSKH.</p>
          </div>
        </div>

        {/* Right Column: Result / QR Code */}
        {showResult && (
          <div className="topup-result-panel slide-in">
            <div className="result-header">
              <CheckCircle2 size={32} className="success-icon" />
              <h2>Yêu cầu đã tạo</h2>
              <p>Quét mã QR qua ứng dụng ngân hàng</p>
            </div>

            <div className="qr-box">
              <img src={qrCodeUrl} alt="Mã QR thanh toán" className="qr-image" />
              <div className="qr-amount-display">
                Số tiền: <strong>{amount !== '' ? amount.toLocaleString('vi-VN') : 0} VNĐ</strong>
              </div>
            </div>

            <div className="transfer-details">
              <div className="detail-row">
                <span className="detail-label">Ngân hàng</span>
                <span className="detail-value">ACB (Á Châu)</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Chủ tài khoản</span>
                <span className="detail-value font-bold">HUYNH MAI NHAT MINH</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Số tài khoản</span>
                <div className="detail-value-copy">
                  <span className="font-mono">22749061</span>
                  <button onClick={() => copyText('22749061')} className="btn-copy" title="Copy STK"><Copy size={14} /></button>
                </div>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nội dung</span>
                <div className="detail-value-copy">
                  <span className="font-mono">Nap Tien VinFast</span>
                  <button onClick={() => copyText('Nap Tien VinFast')} className="btn-copy" title="Copy Nội dung"><Copy size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
