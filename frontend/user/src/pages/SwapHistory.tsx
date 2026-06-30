import { getApiUrl } from '../utils/api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/history.css';

interface SwapRecord {
  id: number;
  orderId: string;
  stationName: string;
  oldBatterySerial: string;
  newBatterySerial: string;
  status: string;
  createdAt: string;
}

export default function SwapHistory() {
  const [swapRecords, setSwapRecords] = useState<SwapRecord[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const size = 10;

  useEffect(() => {
    fetchSwapHistory();
  }, [page]);

  const fetchSwapHistory = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('user_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/driver/swap-orders?page=${page}&size=${size}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSwapRecords(data.content || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Lỗi khi lấy lịch sử đổi pin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'badge-success';
      case 'PENDING': return 'badge-pending';
      case 'APPROVED': return 'badge-topup';
      case 'CANCELLED': return 'badge-service';
      default: return '';
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'PENDING': return 'Chờ duyệt';
      case 'APPROVED': return 'Đã duyệt';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };
  return (
    <main className="transaction-history-container">
      <div className="transaction-history-header">
        <h1 className="transaction-history-title">Lịch sử đổi pin</h1>
        <p className="transaction-history-subtitle">Xem tất cả các lần đổi pin của bạn</p>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <table id="datatable" className="display" width="100%">
            <thead>
              <tr>
                <th>#</th>
                <th>Mã đơn</th>
                <th>Trạm</th>
                <th>Pin cũ</th>
                <th>Pin mới</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {swapRecords.map((record, idx) => (
                <tr key={record.id}>
                  <td>{page * size + idx + 1}</td>
                  <td><strong>{record.orderId || `SW-${record.id}`}</strong></td>
                  <td>{record.stationName || '—'}</td>
                  <td>{record.oldBatterySerial || '—'}</td>
                  <td>{record.newBatterySerial || '—'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(record.status)}`}>
                      {getStatusLabel(record.status)}
                    </span>
                  </td>
                  <td>{record.createdAt ? new Date(record.createdAt).toLocaleString('vi-VN') : '—'}</td>
                </tr>
              ))}
              {swapRecords.length === 0 && (
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
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
          <button
            className="button"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            style={{ padding: '8px 16px', borderRadius: '8px' }}
          >
            ← Trước
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px', color: '#475569', fontWeight: 600 }}>
            Trang {page + 1} / {totalPages}
          </span>
          <button
            className="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            style={{ padding: '8px 16px', borderRadius: '8px' }}
          >
            Sau →
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/dashboard" className="button primary">Về Dashboard</Link>
      </div>
    </main>
  );
}
