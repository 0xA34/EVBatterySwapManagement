import { Link } from 'react-router-dom';
import '../assets/css/history.css';

export default function SwapHistory() {
  const swaps = [
    { id: '1', swapId: 'SWP-98765432', createdAt: '2026-06-20 14:30:00', station: 'Trạm Đổi Pin Quận 1', oldBattery: 'BAT-1029', newBattery: 'BAT-3948', status: 'Hoàn thành' },
    { id: '2', swapId: 'SWP-98765433', createdAt: '2026-06-18 09:15:00', station: 'Trạm Đổi Pin Quận 3', oldBattery: 'BAT-3948', newBattery: 'BAT-5021', status: 'Hoàn thành' },
    { id: '3', swapId: 'SWP-98765434', createdAt: '2026-06-15 18:45:00', station: 'Trạm Đổi Pin Quận 7', oldBattery: 'BAT-5021', newBattery: 'BAT-1029', status: 'Hoàn thành' },
  ];

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'Hoàn thành': return 'badge-success';
      case 'Đang chờ': return 'badge-pending';
      case 'Đã hủy': return 'badge-error';
      default: return '';
    }
  };

  return (
    <main className="transaction-history-container">
      <div className="transaction-history-header">
        <h1 className="transaction-history-title">Lịch sử đổi pin</h1>
        <p className="transaction-history-subtitle">Xem tất cả các lần đổi pin của bạn</p>
      </div>

      <div className="table-container">
        <table id="datatable" className="display" width="100%">
          <thead>
            <tr>
              <th>#</th>
              <th>Mã giao dịch</th>
              <th>Ngày đổi</th>
              <th>Trạm</th>
              <th>Pin cũ</th>
              <th>Pin mới</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {swaps.map((swap, idx) => (
              <tr key={swap.id}>
                <td>{idx + 1}</td>
                <td><strong>{swap.swapId}</strong></td>
                <td>{swap.createdAt}</td>
                <td>{swap.station}</td>
                <td>{swap.oldBattery}</td>
                <td>{swap.newBattery}</td>
                <td>
                  <span className={`badge ${getBadgeClass(swap.status)}`}>{swap.status}</span>
                </td>
              </tr>
            ))}
            {swaps.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-state">
                    <div className="empty-icon">🔋</div>
                    <p>Chưa có lịch sử đổi pin nào.</p>
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
