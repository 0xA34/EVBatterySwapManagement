export default function Schedule() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Đặt lịch đổi pin thành công!');
  };

  return (
    <main style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ color: '#1f2937', marginBottom: '2rem', textAlign: 'center' }}>Đặt Lịch Đổi Pin</h1>
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Trạm Đổi Pin</label>
            <select required style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
              <option value="">Chọn trạm gần nhất</option>
              <option value="station1">Trạm VinFast Vincom Thảo Điền</option>
              <option value="station2">Trạm VinFast Landmark 81</option>
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Ngày Đổi</label>
            <input type="date" required style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '12px' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Giờ Đổi</label>
            <input type="time" required style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #e5e7eb', borderRadius: '12px' }} />
          </div>
          <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>
            Xác nhận đặt lịch
          </button>
        </form>
      </div>
    </main>
  );
}
