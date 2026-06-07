import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../assets/css/station.css';

export default function Station() {
  const [searchParams] = useSearchParams();
  const stationId = searchParams.get('id') || '1';

  // Mock data
  const stationData = {
    name: 'Trạm Đổi Pin VinFast Ocean Park',
    address: 'Khu đô thị Vinhomes Ocean Park, Gia Lâm, Hà Nội',
    stats: {
      total: 100,
      available: 45,
      charging: 30,
      rented: 25,
      maintenance: 5
    }
  };

  const batteries = [
    { id: 'BAT-001', model: 'Brand 48V 20Ah', capacity: 960, status: 'AVAILABLE', health: 95, price: 50000 },
    { id: 'BAT-002', model: 'Brand 48V 20Ah', capacity: 960, status: 'CHARGING', health: 85, price: 50000 },
    { id: 'BAT-003', model: 'Brand 48V 20Ah', capacity: 960, status: 'RENTED', health: 90, price: 50000 },
    { id: 'BAT-004', model: 'Brand 48V 20Ah', capacity: 960, status: 'MAINTENANCE', health: 60, price: 50000 },
    { id: 'BAT-005', model: 'Brand 48V 20Ah', capacity: 960, status: 'AVAILABLE', health: 100, price: 50000 },
  ];

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
            <h1>{stationData.name}</h1>
            <p>{stationData.address}</p>
          </div>
        </div>
        <div className="station-stats-grid">
          <div className="station-stat-card">
            <h3>{stationData.stats.total}</h3>
            <span>Tổng số pin</span>
          </div>
          <div className="station-stat-card">
            <h3>{stationData.stats.available}</h3>
            <span>Pin sẵn sàng</span>
          </div>
          <div className="station-stat-card">
            <h3>{stationData.stats.charging}</h3>
            <span>Đang sạc</span>
          </div>
          <div className="station-stat-card">
            <h3>{stationData.stats.rented}</h3>
            <span>Đang thuê</span>
          </div>
          <div className="station-stat-card">
            <h3>{stationData.stats.maintenance}</h3>
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
              🔋 ID <span>{battery.id}</span>
            </span>

            <div className="pin-id">{battery.model}</div>

            <div className="pin-meta">
              <span>Dung Lượng:</span>
              <strong>{battery.capacity} Wh</strong>
            </div>

            <div className="pin-meta">
              <span>Tình Trạng:</span>
              {battery.status === 'AVAILABLE' && <span className="pin-status-chip pin-status-full">Sẵn Sàng</span>}
              {battery.status === 'RENTED' && <span className="pin-status-chip pin-status-rented">Đang Thuê</span>}
              {battery.status === 'MAINTENANCE' && <span className="pin-status-chip pin-status-maintenance">Bảo Trì</span>}
              {battery.status === 'CHARGING' && <span className="pin-status-chip pin-status-charging">Đang Sạc</span>}
            </div>

            <div className="battery-meter">
              <div className="battery-bar">
                <div 
                  className={`battery-fill ${battery.health >= 80 ? 'high' : battery.health >= 40 ? 'medium' : 'low'}`}
                  style={{ width: `${battery.health}%` }}
                ></div>
              </div>
              <span style={{ fontWeight: 600, color: '#1f2937' }}>{battery.health}%</span>
            </div>

            <div className="pin-meta">
              <svg className="money-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10h.01M18 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5"/>
              </svg>
              <span>Giá thuê:</span>
              <strong style={{ color: '#22c55e' }}>{battery.price.toLocaleString('vi-VN')} VNĐ</strong>
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
                <p>Pin #{selectedBattery.id}</p>
              </div>
              <button className="schedule-modal-close-btn" onClick={closeScheduleModal}>✕</button>
            </div>

            <div className="schedule-battery-info">
              <h3>Thông tin pin</h3>
              <div className="schedule-info-grid">
                <div className="schedule-info-item">
                  <span className="schedule-info-label">Dung lượng</span>
                  <span className="schedule-info-value">{selectedBattery.capacity} Wh</span>
                </div>
                <div className="schedule-info-item">
                  <span className="schedule-info-label">Giá thuê</span>
                  <span className="schedule-info-value">{selectedBattery.price.toLocaleString('vi-VN')} VNĐ</span>
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
