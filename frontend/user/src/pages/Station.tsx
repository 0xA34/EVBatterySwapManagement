import { getApiUrl } from '../utils/api';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../assets/css/station.css';

export default function Station() {
  const [searchParams] = useSearchParams();
  const stationId = searchParams.get('id') || '1';

  const [batteries, setBatteries] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBatteries();
  }, [stationId, page, size]);

  const fetchBatteries = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/battery/page?page=${page}&size=${size}&stationId=${stationId}`), {
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
        const response = await fetch(getApiUrl(`/api/station/page?page=0&size=1000`), {
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
  const [isScheduling, setIsScheduling] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherMessage, setVoucherMessage] = useState('');

  useEffect(() => {
    if (feedbackModal) {
      const timer = setTimeout(() => setFeedbackModal(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedbackModal]);

  const openScheduleModal = (battery: any) => {
    setSelectedBattery(battery);
    setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
    setSelectedBattery(null);
    setScheduleTime('');
    setIsScheduling(false);
    setVoucherInput('');
    setAppliedVoucher(null);
    setVoucherMessage('');
  };

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) {
      setVoucherMessage('Vui lòng nhập mã giảm giá.');
      setAppliedVoucher(null);
      return;
    }
    try {
      const token = localStorage.getItem('user_token');
      const response = await fetch(getApiUrl(`/api/vouchers/check?code=${voucherInput.trim()}`), {
        headers: { 
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAppliedVoucher(null);
          setVoucherMessage('Bạn cần đăng nhập để sử dụng mã giảm giá.');
          return;
        }
        let errorMsg = 'Mã giảm giá không hợp lệ.';
        try {
          const errData = await response.json();
          if (errData && errData.error) errorMsg = errData.error;
        } catch(e) {
          // Ignore JSON parse error, keep fallback message
        }
        setAppliedVoucher(null);
        setVoucherMessage(errorMsg);
        return;
      }

      const data = await response.json();
      
      if (data.status === 'EXPIRED') {
        setAppliedVoucher(null);
        setVoucherMessage('Mã giảm giá đã hết hạn.');
        return;
      }
      if (data.status === 'INACTIVE') {
        setAppliedVoucher(null);
        setVoucherMessage('Mã không hợp lệ, chưa kích hoạt hoặc đã hết lượt dùng.');
        return;
      }
      
      const basePrice = selectedBattery?.amount ?? 50000;
      if (data.minOrderValue && basePrice < data.minOrderValue) {
        setAppliedVoucher(null);
        setVoucherMessage(`Mã giảm giá áp dụng cho đơn từ ${data.minOrderValue.toLocaleString('vi-VN')} VNĐ.`);
        return;
      }

      setAppliedVoucher(data);
      setVoucherMessage('Áp dụng mã giảm giá thành công!');
    } catch (error) {
      console.error('Failed to check voucher', error);
      setAppliedVoucher(null);
      setVoucherMessage('Lỗi kết nối khi kiểm tra mã giảm giá.');
    }
  };

  const calculateDiscount = (basePrice: number) => {
    if (!appliedVoucher) return 0;
    let discount = 0;
    if (appliedVoucher.discountType === 'PERCENTAGE') {
      discount = (basePrice * appliedVoucher.discountValue) / 100;
    } else if (appliedVoucher.discountType === 'FIXED_AMOUNT') {
      discount = appliedVoucher.discountValue;
    }
    return Math.min(discount, basePrice);
  };

  const calculateFinalPrice = (basePrice: number) => {
    return Math.max(0, basePrice - calculateDiscount(basePrice));
  };

  const handleConfirmSwap = async (isBooking: boolean = false) => {
    try {
      let scheduledAtIso = undefined;
      if (isBooking) {
        if (!scheduleTime) {
          setFeedbackModal({type: 'error', message: 'Vui lòng chọn thời gian dự kiến.'});
          return;
        }
        const date = new Date(scheduleTime);
        scheduledAtIso = date.toISOString();
      }

      const token = localStorage.getItem('user_token');
      const endpoint = isBooking ? '/api/driver/swap-orders/booking' : '/api/driver/swap-orders/direct-swap';
      
      const payload: any = {
        stationId: Number(stationId),
        batteryId: selectedBattery?.id || 0,
        minChargePercent: 100
      };
      if (isBooking) {
        payload.scheduledAt = scheduledAtIso;
      }
      if (appliedVoucher && appliedVoucher.code) {
        payload.voucherCode = appliedVoucher.code;
      }

      const response = await fetch(getApiUrl(`${endpoint}`), {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFeedbackModal({type: 'success', message: isBooking ? 'Đặt lịch thành công!' : 'Yêu cầu đổi pin của bạn đã được tạo thành công!'});
        fetchBatteries();
      } else {
        let errorMessage = 'Lỗi không xác định';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            if (typeof errorData.message === 'object') {
              errorMessage = Object.values(errorData.message).join(', ');
            } else {
              errorMessage = errorData.message;
            }
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = JSON.stringify(errorData);
          }
        } catch(e) {
          errorMessage = await response.text();
        }
        setFeedbackModal({type: 'error', message: `Thất bại: ${errorMessage}`});
      }
    } catch (error) {
      console.error('Lỗi khi gọi API đổi pin:', error);
      setFeedbackModal({type: 'error', message: 'Đã xảy ra lỗi kết nối với máy chủ.'});
    } finally {
      closeScheduleModal();
    }
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
                  className={`battery-fill ${(battery.currentChargePercentage ?? 100) >= 80 ? 'high' : (battery.currentChargePercentage ?? 100) >= 40 ? 'medium' : 'low'}`}
                  style={{ width: `${battery.currentChargePercentage ?? 100}%` }}
                ></div>
              </div>
              <span style={{ fontWeight: 600, color: '#1f2937' }}>{battery.currentChargePercentage ?? 100}%</span>
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
                  Đổi Pin
                </button>
              ) : (
                <button className="rent-button disabled" disabled>
                  Đổi Pin
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
                <h2>Bạn có muốn đổi pin?</h2>
                <p>Pin #{selectedBattery.serialNumber || selectedBattery.id}</p>
              </div>
              <button className="schedule-modal-close-btn" onClick={closeScheduleModal}>✕</button>
            </div>

            <div className="schedule-battery-info">
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

            {/* Voucher Section */}
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Mã giảm giá</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  placeholder="Nhập mã giảm giá"
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '14px' }} 
                />
                <button 
                  onClick={handleApplyVoucher}
                  style={{ padding: '0 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  Áp dụng
                </button>
              </div>
              {voucherMessage && (
                <p style={{ marginTop: '8px', fontSize: '13px', color: appliedVoucher ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                  {voucherMessage}
                </p>
              )}
            </div>

            {/* Total Price Section if voucher applied */}
            {appliedVoucher && (
              <div style={{ marginTop: '15px', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#4b5563', fontSize: '14px' }}>Tạm tính:</span>
                  <span style={{ color: '#4b5563', fontSize: '14px' }}>{(selectedBattery.amount ?? 50000).toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#4b5563', fontSize: '14px' }}>Giảm giá:</span>
                  <span style={{ color: '#16a34a', fontSize: '14px' }}>
                    - {calculateDiscount(selectedBattery.amount ?? 50000).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #d1d5db', paddingTop: '8px' }}>
                  <span style={{ color: '#1f2937', fontSize: '15px' }}>Tổng cộng:</span>
                  <span style={{ color: '#2563eb', fontSize: '16px' }}>
                    {calculateFinalPrice(selectedBattery.amount ?? 50000).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Hình thức đổi pin</label>
              <div style={{ display: 'flex', borderRadius: '8px', border: '2px solid #e5e7eb', overflow: 'hidden', marginBottom: isScheduling ? '15px' : '0' }}>
                <div 
                  onClick={() => setIsScheduling(false)}
                  style={{ flex: 1, padding: '10px', textAlign: 'center', cursor: 'pointer', fontWeight: 600, backgroundColor: !isScheduling ? '#2563eb' : 'transparent', color: !isScheduling ? 'white' : '#6b7280', transition: 'all 0.2s' }}
                >
                  Trực tiếp
                </div>
                <div 
                  onClick={() => setIsScheduling(true)}
                  style={{ flex: 1, padding: '10px', textAlign: 'center', cursor: 'pointer', fontWeight: 600, backgroundColor: isScheduling ? '#2563eb' : 'transparent', color: isScheduling ? 'white' : '#6b7280', transition: 'all 0.2s' }}
                >
                  Đặt lịch
                </div>
              </div>
            </div>

            {isScheduling && (
              <div style={{ textAlign: 'left', marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>Chọn thời gian dự kiến đến đổi pin</label>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {[
                    { label: '30p', minutes: 30 },
                    { label: '1h', minutes: 60 },
                    { label: '1.5h', minutes: 90 },
                    { label: '2h', minutes: 120 }
                  ].map((preset) => (
                    <button 
                      key={preset.minutes}
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setMinutes(d.getMinutes() + preset.minutes);
                        const tzOffset = d.getTimezoneOffset() * 60000;
                        const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
                        setScheduleTime(localISOTime);
                      }}
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '16px', 
                        border: '1px solid #d1d5db', 
                        background: '#f3f4f6', 
                        fontSize: '13px', 
                        cursor: 'pointer',
                        color: '#4b5563',
                        fontWeight: 500
                      }}
                    >
                      +{preset.label}
                    </button>
                  ))}
                </div>

                <input 
                  type="datetime-local" 
                  value={scheduleTime} 
                  onChange={(e) => setScheduleTime(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '15px' }} 
                />
              </div>
            )}

            <div className="schedule-modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button className="schedule-modal-btn secondary" style={{ flex: 1 }} onClick={closeScheduleModal}>Hủy</button>
              <button className="schedule-modal-btn primary" style={{ flex: 1 }} onClick={() => handleConfirmSwap(isScheduling)}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 10000, animation: 'fadeInDown 0.3s ease-out' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'flex-start', gap: '16px', minWidth: '300px', borderLeft: feedbackModal.type === 'success' ? '4px solid #16a34a' : '4px solid #dc2626' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: feedbackModal.type === 'success' ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {feedbackModal.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                {feedbackModal.type === 'success' ? 'Thành công' : 'Thất bại'}
              </h3>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '13px' }}>
                {feedbackModal.message}
              </p>
            </div>
            <button 
              onClick={() => setFeedbackModal(null)} 
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
