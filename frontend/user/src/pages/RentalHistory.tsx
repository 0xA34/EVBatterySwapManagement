import { Link } from 'react-router-dom';
import '../assets/css/history.css';

export default function RentalHistory() {
  const transactions = [
    { id: '1', transactionId: 'TRX-10293847', createdAt: '2026-06-07 10:30:00', method: 'Nạp tiền', amount: 500000, note: 'Nạp tiền qua ngân hàng ACB' },
    { id: '2', transactionId: 'TRX-10293848', createdAt: '2026-06-06 15:45:00', method: 'Thuê gói', amount: 150000, note: 'Đăng ký gói Premium' },
    { id: '3', transactionId: 'TRX-10293849', createdAt: '2026-06-05 09:20:00', method: 'Đã duyệt', amount: 50000, note: 'Thuê pin BAT-001' },
    { id: '4', transactionId: 'TRX-10293850', createdAt: '2026-06-04 14:10:00', method: 'Chờ duyệt', amount: 100000, note: 'Yêu cầu nạp tiền' },
  ];

  const getBadgeClass = (method: string) => {
    switch (method) {
      case 'Nạp tiền': return 'badge-topup';
      case 'Thuê gói': return 'badge-service';
      case 'Đã duyệt': return 'badge-success';
      case 'Chờ duyệt': return 'badge-pending';
      default: return '';
    }
  };

  return (
    <main className="transaction-history-container">
      <div className="transaction-history-header">
        <h1 className="transaction-history-title">Lịch sử giao dịch</h1>
        <p className="transaction-history-subtitle">Xem tất cả các giao dịch của bạn</p>
      </div>

      <div className="table-container">
        <table id="datatable" className="display" width="100%">
          <thead>
            <tr>
              <th>#</th>
              <th>Mã đơn</th>
              <th>Ngày tạo</th>
              <th>Trạng thái / Loại</th>
              <th>Số tiền</th>
              <th>Diễn tả</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={tx.id}>
                <td>{idx + 1}</td>
                <td><strong>{tx.transactionId}</strong></td>
                <td>{tx.createdAt}</td>
                <td>
                  <span className={`badge ${getBadgeClass(tx.method)}`}>{tx.method}</span>
                </td>
                <td>{tx.amount.toLocaleString('vi-VN')} VNĐ</td>
                <td>{tx.note}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <p>Chưa có giao dịch nào.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/dashboard" className="button primary">Về Dashboard</Link>
      </div>
    </main>
  );
}
