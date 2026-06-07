import { useState } from 'react';

export default function Recharge() {
  const [amount, setAmount] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);
  const balance = 1500000;

  const handleAmountClick = (val: number) => {
    setAmount(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 10000) {
      alert('Số tiền nạp tối thiểu là 10,000 VNĐ');
      return;
    }
    setShowResult(true);
  };

  return (
    <main>
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>💰 Nạp tiền vào tài khoản</h1>
          <p>Nạp tiền để sử dụng dịch vụ thuê pin VinFast</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #22c55e', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1rem', color: '#374151', marginBottom: '0.5rem' }}>Số dư hiện tại</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#059669', fontFamily: 'Courier New, monospace' }}>
            {balance.toLocaleString('vi-VN')} VNĐ
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Thông tin nạp tiền</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Số tiền nạp (VNĐ) *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                {[50000, 100000, 200000, 500000, 1000000, 2000000].map(val => (
                  <button 
                    key={val} 
                    type="button" 
                    onClick={() => handleAmountClick(val)}
                    style={{ padding: '0.75rem', border: `2px solid ${amount === val ? '#3b82f6' : '#e5e7eb'}`, background: amount === val ? '#eff6ff' : 'white', color: amount === val ? '#1d4ed8' : '#0f172a', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {val.toLocaleString('vi-VN')}
                  </button>
                ))}
              </div>
              <input 
                type="number" 
                value={amount || ''}
                onChange={e => setAmount(Number(e.target.value))}
                placeholder="Nhập số tiền..." 
                required 
                min="10000" 
                max="10000000"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Nội dung chuyển khoản *</label>
              <input 
                type="text" 
                value={amount ? `NAP_TIEN_USER_${amount}` : ''}
                readOnly
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', background: '#f8fafc' }}
              />
            </div>
            
            <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>
              Tạo yêu cầu nạp tiền
            </button>
          </form>
        </div>

        {showResult && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginTop: '2rem', textAlign: 'center' }}>
             <h2 style={{ color: '#059669', marginBottom: '0.5rem' }}>✅ Yêu cầu nạp tiền đã được tạo!</h2>
             <p>Vui lòng quét mã QR hoặc chuyển khoản vào tài khoản bên dưới.</p>
             <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #e5e7eb', borderRadius: '12px', display: 'inline-block' }}>
               <img src={`https://img.vietqr.io/image/VCB-123456789-compact1.jpg?addInfo=NAP_TIEN_USER_${amount}&amount=${amount}`} alt="QR Code" style={{ maxWidth: '200px' }} />
             </div>
          </div>
        )}
      </div>
    </main>
  );
}
