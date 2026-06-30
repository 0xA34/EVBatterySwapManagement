import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../utils/api';

const PROVINCE_API = getApiUrl('/api/donvihanhchinh/tinhThanh');
const DISTRICT_API = getApiUrl('/api/donvihanhchinh/quanHuyen');
const WARD_API = getApiUrl('/api/donvihanhchinh/phuongXa');

export default function NearestStations() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.warn("User denied or failed to fetch geolocation", error);
        }
      );
    }
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  const [searchFilter, setSearchFilter] = useState({ province: '', district: '', ward: '' });

  const [stations, setStations] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(3);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchStations();
  }, [page, size, searchFilter]);

  const fetchStations = async () => {
    try {
      let url = getApiUrl(`/api/station/page?page=${page}&size=${size}`);
      if (searchFilter.province) url += `&province=${searchFilter.province}`;
      if (searchFilter.district) url += `&quan=${searchFilter.district}`;
      if (searchFilter.ward) url += `&phuongxa=${searchFilter.ward}`;
      const response = await fetch(url);
      const data = await response.json();
      setStations(data.content || []);
      setTotalPages(data.page?.totalPages || 1);
      setTotalElements(data.page?.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch stations', err);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await fetch(PROVINCE_API);
      const data = await response.json();
      setProvinces(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDistricts = async (provinceId: string) => {
    try {
      const response = await fetch(`${DISTRICT_API}?idTinhThanh=${provinceId}`);
      const data = await response.json();
      setDistricts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWards = async (districtId: string) => {
    try {
      const response = await fetch(`${WARD_API}?idQuanHuyen=${districtId}`);
      const data = await response.json();
      setWards(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProvince(val);
    setSelectedDistrict('');
    setSelectedWard('');
    if (val) fetchDistricts(val);
    else setDistricts([]);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDistrict(val);
    setSelectedWard('');
    if (val) fetchWards(val);
    else setWards([]);
  };

  const handleReset = () => {
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
    setDistricts([]);
    setWards([]);
    setSearchFilter({ province: '', district: '', ward: '' });
    setPage(0);
  };

  const handleSearch = () => {
    setSearchFilter({ province: selectedProvince, district: selectedDistrict, ward: selectedWard });
    setPage(0);
  };

  return (
    <main className="dashboard-container" style={{ padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
          <h1 className="dashboard-title" style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Tìm kiếm trạm gần nhất</h1>
          <p className="dashboard-subtitle" style={{ color: '#64748b', fontSize: '1.1rem' }}>Xác định vị trí các trạm đổi pin xung quanh khu vực của bạn</p>
        </div>

        {/* Location Filter Form */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Bộ lọc vị trí
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#2563eb', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 600, cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
              Sử dụng vị trí hiện tại
            </button>
          </div>

          <div className="search-grid" style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                <select value={selectedProvince} onChange={handleProvinceChange} style={{ width: '100%', height: '48px', padding: '0 16px 0 36px', border: '1px solid #cbd5e1', fontSize: '15px', borderRadius: '12px', backgroundColor: '#f8fafc', color: '#1e293b' }}>
                  <option value="">Tỉnh/Thành phố</option>
                  {provinces.map((p, i) => <option key={`p-${p.id || i}`} value={p.id}>{p.tinhthanhcol}</option>)}
                </select>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} style={{ width: '100%', height: '48px', padding: '0 16px 0 36px', border: '1px solid #cbd5e1', fontSize: '15px', borderRadius: '12px', backgroundColor: '#f8fafc', color: '#1e293b' }}>
                  <option value="">Quận/Huyện</option>
                  {districts.map((d, i) => <option key={`d-${d.id || i}`} value={d.id}>{d.tenquanhuyen}</option>)}
                </select>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict} style={{ width: '100%', height: '48px', padding: '0 16px 0 36px', border: '1px solid #cbd5e1', fontSize: '15px', borderRadius: '12px', backgroundColor: '#f8fafc', color: '#1e293b' }}>
                  <option value="">Phường/Xã</option>
                  {wards.map((w, i) => <option key={`w-${w.id || i}`} value={w.id}>{w.tenphuongxa}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={handleSearch} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', flex: 1, maxWidth: '200px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Tìm kiếm
            </button>
            <button type="button" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 24px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Station Cards Grid */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#1e293b', margin: 0 }}>Kết quả tìm kiếm ({totalElements} trạm)</h2>
          <div>
            <label style={{ marginRight: '8px', color: '#64748b', fontWeight: 600 }}>Hiển thị:</label>
            <select
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', backgroundColor: '#f8fafc', fontWeight: 600, color: '#1e293b' }}
            >
              <option value={3}>3 trạm</option>
              <option value={6}>6 trạm</option>
              <option value={9}>9 trạm</option>
              <option value={12}>12 trạm</option>
            </select>
          </div>
        </div>
        <div className="station-cards-grid">
          {stations.map(item => {
            const st = item.station;
            if (!st) return null;
            
            const counts = item.batteryStatusCounts || [];
            const availableCount = counts.find((c: any) => c.status === 'AVAILABLE')?.count || 0;
            const chargingCount = counts.find((c: any) => c.status === 'CHARGING')?.count || 0;
            const emptyCount = counts.find((c: any) => c.status === 'EMPTY')?.count || 0;
            const reservedCount = counts.find((c: any) => c.status === 'RESERVED')?.count || 0;
            
            return (
            <div key={st.id} className="station-card" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20px', right: '20px', background: st.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: st.status === 'ACTIVE' ? '#166534' : '#991b1b', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
                {st.status === 'ACTIVE' ? 'Hoạt động' : 'Bảo trì'}
              </div>
              <div className="station-header">
                <div className="station-header-icon">
                  <div className="css-station-icon">
                    <div className="lightning-bolt"></div>
                  </div>
                </div>
                <div>
                  <div className="station-name">{st.name}</div>
                  <div className="station-location">{st.address}</div>
                </div>
              </div>

              <div style={{ padding: '15px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', margin: '15px 0' }}>
                {userLocation && st.latitude && st.longitude && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: '#64748b' }}>Khoảng cách:</span>
                    <span style={{ fontWeight: 600, color: '#3b82f6' }}>
                      {calculateDistance(userLocation.lat, userLocation.lng, st.latitude, st.longitude)?.toFixed(1)} km
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: '#64748b' }}>Ngày tạo:</span>
                  <span style={{ fontWeight: 600 }}>{new Date(st.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: '#64748b' }}>Khu vực:</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>
                    {st.phuongxa?.tenphuongxa ? `${st.phuongxa.tenphuongxa}, ` : ''}
                    {st.quan?.tenquanhuyen || ''}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #f1f5f9', marginTop: '10px', marginBottom: '15px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>{availableCount}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sẵn sàng</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#eab308' }}>{chargingCount}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Đang sạc</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8' }}>{emptyCount}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pin rỗng</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>{reservedCount}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Đã đặt</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button 
                  onClick={(e) => { e.preventDefault(); window.open(`/map.html?lat=${st.latitude}&lng=${st.longitude}&name=${encodeURIComponent(st.name)}`, '_blank'); }} 
                  className="station-button"
                  style={{ 
                    marginTop: 0,
                    padding: '0.85rem',
                    flex: '0 0 auto',
                    background: '#f8fafc', 
                    color: '#3b82f6', 
                    border: '1px solid #cbd5e1', 
                  }}
                  title="Xem trên bản đồ"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </button>
                <Link className="station-button" to={`/station?id=${st.id}`} style={{ flex: 1, marginTop: 0 }}>
                  <span>Chỉ đường & Đổi pin</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )})}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '2.5rem', flexWrap: 'wrap' }}>
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
      </div>
    </main>
  );
}
