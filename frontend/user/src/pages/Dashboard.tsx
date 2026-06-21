import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PROVINCE_API = 'http://localhost:8080/api/donvihanhchinh/tinhThanh';
const DISTRICT_API = 'http://localhost:8080/api/donvihanhchinh/quanHuyen';
const WARD_API = 'http://localhost:8080/api/donvihanhchinh/phuongXa';

export default function Dashboard() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isNearest, setIsNearest] = useState(false);

  const [searchFilter, setSearchFilter] = useState({ province: '', district: '', ward: '', keyword: '' });

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
      let url = `http://localhost:8080/api/station/page?page=${page}&size=${size}`;
      if (searchFilter.province) url += `&province=${searchFilter.province}`;
      if (searchFilter.district) url += `&quan=${searchFilter.district}`;
      if (searchFilter.ward) url += `&phuongxa=${searchFilter.ward}`;
      if (searchFilter.keyword) url += `&keyword=${encodeURIComponent(searchFilter.keyword)}`;
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
    setKeyword('');
    setDistricts([]);
    setWards([]);
    setSearchFilter({ province: '', district: '', ward: '', keyword: '' });
    setPage(0);
  };

  const handleSearch = () => {
    setSearchFilter({ province: selectedProvince, district: selectedDistrict, ward: selectedWard, keyword: keyword });
    setPage(0);
  };

  return (
    <main className="dashboard-container">
      {/* Location Filter Form */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>
          Tra cứu trạm pin theo khu vực
        </div>

        <div className="search-grid" style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Tỉnh/TP</label></div>
            <div style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
              <select value={selectedProvince} onChange={handleProvinceChange} style={{ width: '100%', height: '42px', padding: '8px 12px 8px 36px', border: '1px solid #d1d5db', fontSize: '14px', borderRadius: '8px', backgroundColor: '#f9fafb', color: '#1f2937' }}>
                <option value="">-- Chọn tỉnh/TP --</option>
                {provinces.map((p, i) => <option key={`p-${p.id || i}`} value={p.id}>{p.tinhthanhcol}</option>)}
              </select>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Quận/Huyện</label></div>
            <div style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
              <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} style={{ width: '100%', height: '42px', padding: '8px 12px 8px 36px', border: '1px solid #d1d5db', fontSize: '14px', borderRadius: '8px', backgroundColor: '#f9fafb', color: '#1f2937' }}>
                <option value="">-- Chọn quận/huyện --</option>
                {districts.map((d, i) => <option key={`d-${d.id || i}`} value={d.id}>{d.tenquanhuyen}</option>)}
              </select>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Phường/Xã</label></div>
            <div style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict} style={{ width: '100%', height: '42px', padding: '8px 12px 8px 36px', border: '1px solid #d1d5db', fontSize: '14px', borderRadius: '8px', backgroundColor: '#f9fafb', color: '#1f2937' }}>
                <option value="">-- Chọn phường/xã --</option>
                {wards.map((w, i) => <option key={`w-${w.id || i}`} value={w.id}>{w.tenphuongxa}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Nhập tên trạm hoặc địa chỉ..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              height: '34px',
              padding: '0 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              width: '250px',
              outline: 'none',
              backgroundColor: '#f9fafb',
              color: '#1f2937'
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button type="button" onClick={handleSearch} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', height: '34px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Tra cứu
          </button>
          <button type="button" onClick={() => {
            const nextState = !isNearest;
            setIsNearest(nextState);
            if (nextState && "geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                () => { 
                  // success
                },
                () => { 
                  setIsNearest(false);
                }
              );
            }
          }} style={{ padding: '7px 18px', backgroundColor: isNearest ? '#10b981' : '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'background-color 0.3s' }}>
            {isNearest ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
            )}
            {isNearest ? 'Đang bật gần đây' : 'Gần đây'}
          </button>
          <button type="button" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px 18px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', height: '34px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
            Nhập lại
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
          if (!st) return null; // Safe guard
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
                <div className="station-location" style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{st.address}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '15px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', margin: '15px 0' }}>
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
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>{item.batteryStatusCounts?.find((c: any) => c.status === 'AVAILABLE')?.count || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sẵn sàng</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#eab308' }}>{item.batteryStatusCounts?.find((c: any) => c.status === 'CHARGING')?.count || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Đang sạc</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8' }}>{item.batteryStatusCounts?.find((c: any) => c.status === 'EMPTY')?.count || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pin rỗng</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>{item.batteryStatusCounts?.find((c: any) => c.status === 'RESERVED')?.count || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Đã đặt</div>
              </div>
            </div>

            <Link className="station-button" to={`/station?id=${st.id}`}>
              <span>Xem danh sách pin</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
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
    </main>
  );
}
