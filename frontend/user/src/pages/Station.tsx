import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../assets/css/station.css';

export default function Station() {
  const [searchParams] = useSearchParams();
  const stationId = searchParams.get('id') || '1';

  const [batteries, setBatteries] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBatteries();
  }, [stationId, page, size]);

  const fetchBatteries = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/battery/page?page=${page}&size=${size}&stationId=${stationId}`, {
        headers: {
          'accept': '*/*'
        }
      });
      const data = await response.json();
      setBatteries(data.content || []);
      setTotalPages(data.page?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch batteries', error);
    }
  };

  const [stationInfo, setStationInfo] = useState<any>(null);

  useEffect(() => {
    const fetchStationInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/station/page?page=0&size=1000`, {
          headers: { 'accept': '*/*' }
        });
        if (response.ok) {
          const data = await response.json();
          const stationItem = data.content?.find((item: any) => item.station?.id === Number(stationId));
          if (stationItem) {
            setStationInfo(stationItem);
          }
        }
      } catch (error) {
        console.error('Failed to fetch station info', error);
      }
    };
    fetchStationInfo();
  }, [stationId]);

  const getCount = (status: string) => {
    if (!stationInfo || !stationInfo.batteryStatusCounts) return 0;
    const item = stationInfo.batteryStatusCounts.find((c: any) => c.status === status);
    return item ? item.count : 0;
  };

  const st = stationInfo?.station || stationInfo || {};
  let stAddress = st.address || '';
  if (st.phuongxa?.tenphuongxa) stAddress += `, ${st.phuongxa.tenphuongxa}`;
  if (st.quan?.tenquanhuyen) stAddress += `, ${st.quan.tenquanhuyen}`;

  const displayName = st.name || 'Đang tải thông tin trạm...';
  const displayAddress = stAddress || 'Đang tải địa chỉ...';
  
  const stats = {
    total: stationInfo?.batteryStatusCounts?.reduce((sum: number, c: any) => sum + c.count, 0) || 0,
    available: getCount('AVAILABLE'),
    charging: getCount('CHARGING'),
    rented: getCount('RESERVED') + getCount('RENTED'),
    maintenance: getCount('MAINTENANCE') + getCount('EMPTY')
  };

  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState<any>(null);
  const [scheduleTime, setScheduleTime] = useState('');

  const openScheduleModal = (battery: any) => {
    setSelectedBattery(battery);
    setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
    setSelectedBattery(null);
    setScheduleTime('');
  };

  const handleConfirmSchedule = () => {
    alert(`Đã đặt lịch lấy pin ${selectedBattery?.id} vào lúc ${scheduleTime}`);
    closeScheduleModal();
  };

  return (
    <main className="station-wrapper">
      <section className="station-header-card">
        <div className="station-header-top">
          <div className="station-header-icon">
            <div className="css-station-icon">
              <div className="lightning-bolt"></div>
            </div>
          </div>
          <div className="station-header-info">
            <h1>{displayName}</h1>
            <p>{displayAddress}</p>
          </div>
        </div>
        <div className="station-stats-grid">
          <div className="station-stat-card">
            <h3>{stats.total}</h3>
            <span>Tổng số pin</span>
          </div>
          <div className="station-stat-card">
            <h3>{stats.available}</h3>
            <span>Pin sẵn sàng</span>
          </div>
          <div className="station-stat-card">
            <h3>{stats.charging}</h3>
            <span>Đang sạc</span>
          </div>
          <div className="station-stat-card">
            <h3>{stats.rented}</h3>
            <span>Đang thuê</span>
          </div>
          <div className="station-stat-card">
            <h3>{stats.maintenance}</h3>
            <span>Bảo trì</span>
          </div>
          <div className="station-stat-card">
            <h3>100</h3>
            <span>Số lần đổi tại trạm</span>
          </div>
        </div>
      </section>

      <section className="pin-cards-grid">
        {batteries.map((battery) => (
          <div key={battery.id} className="pin-card">
            <span className="pin-chip">
              <div className="css-battery-icon"><div className="lightning-bolt-small"></div></div>
              ID <span>{battery.serialNumber || battery.id}</span>
            </span>

            <div className="pin-id">{battery.model || 'Unknown Model'}</div>

            <div className="pin-meta">
              <span>Dung Lượng:</span>
              <strong>{battery.capacityKwh != null ? `${battery.capacityKwh} kWh` : '960 Wh'}</strong>
            </div>

            <div className="pin-meta">
              <span>Tình Trạng:</span>
              {battery.status === 'AVAILABLE' && <span className="pin-status-chip pin-status-full">Sẵn Sàng</span>}
              {battery.status === 'RENTED' && <span className="pin-status-chip pin-status-rented">Đang Thuê</span>}
              {battery.status === 'MAINTENANCE' && <span className="pin-status-chip pin-status-maintenance">Bảo Trì</span>}
              {battery.status === 'CHARGING' && <span className="pin-status-chip pin-status-charging">Đang Sạc</span>}
              {battery.status === 'EMPTY' && <span className="pin-status-chip pin-status-maintenance">Pin Rỗng</span>}
              {battery.status === 'RESERVED' && <span className="pin-status-chip pin-status-rented">Đã Đặt</span>}
            </div>

            <div className="battery-meter">
              <div className="battery-bar">
                <div
                  className={`battery-fill ${(battery.healthPercentage ?? 100) >= 80 ? 'high' : (battery.healthPercentage ?? 100) >= 40 ? 'medium' : 'low'}`}
                  style={{ width: `${battery.healthPercentage ?? 100}%` }}
                ></div>
              </div>
              <span style={{ fontWeight: 600, color: '#1f2937' }}>{battery.healthPercentage ?? 100}%</span>
            </div>

            <div className="pin-meta">
              <svg className="money-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 10h.01M18 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5" />
              </svg>
              <span>Giá thuê:</span>
              <strong style={{ color: '#22c55e' }}>{(battery.amount ?? 50000).toLocaleString('vi-VN')} VNĐ</strong>
            </div>

            <div className="pin-actions">
              {battery.status === 'AVAILABLE' ? (
                <button
                  onClick={() => openScheduleModal(battery)}
                  className="rent-button"
                >
                  Đặt Lịch Lấy Pin
                </button>
              ) : (
                <button className="rent-button disabled" disabled>
                  Đặt Lịch Lấy Pin
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: page === i ? 'none' : '1px solid #cbd5e1',
                background: page === i ? '#2563eb' : 'white',
                color: page === i ? 'white' : '#334155',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '40px'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="back-actions">
        <Link to="/dashboard" className="button secondary">← Quay lại danh sách trạm</Link>
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && selectedBattery && (
        <div className="schedule-modal-overlay active">
          <div className="schedule-modal-card">
            <div className="schedule-modal-header">
              <div className="schedule-modal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="schedule-modal-title">
                <h2>Đặt Lịch Lấy Pin</h2>
                <p>Pin #{selectedBattery.serialNumber || selectedBattery.id}</p>
              </div>
              <button className="schedule-modal-close-btn" onClick={closeScheduleModal}>✕</button>
            </div>

            <div className="schedule-battery-info">
              <h3>Thông tin pin</h3>
              <div className="schedule-info-grid">
                <div className="schedule-info-item">
                  <span className="schedule-info-label">Dung lượng</span>
                  <span className="schedule-info-value">{selectedBattery.capacityKwh != null ? `${selectedBattery.capacityKwh} kWh` : '960 Wh'}</span>
                </div>
                <div className="schedule-info-item">
                  <span className="schedule-info-label">Giá thuê</span>
                  <span className="schedule-info-value">{(selectedBattery.amount ?? 50000).toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>
            </div>

            <div className="schedule-time-section">
              <div className="time-input-group">
                <label>Thời gian lấy pin dự kiến</label>
                <div className="time-input-wrapper">
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="schedule-modal-actions">
              <button className="schedule-modal-btn secondary" onClick={closeScheduleModal}>Hủy</button>
              <button className="schedule-modal-btn primary" onClick={handleConfirmSchedule} disabled={!scheduleTime}>
                Xác Nhận Đặt Lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
