import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ADDRESS_API_BASE = 'https://addresskit.cas.so/address-kit/';

export default function NearestStations() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  // Mock Stations
  const stations = [
    {
      id: 1,
      name: 'Trạm Đổi Pin ChargeX Ocean Park',
      address: 'Khu đô thị Vinhomes Ocean Park, Gia Lâm, Hà Nội',
      stats: { total: 100, available: 45, charging: 30, rented: 25 },
      distance: '1.2 km'
    },
    {
      id: 2,
      name: 'Trạm Đổi Pin ChargeX Times City',
      address: 'Vinhomes Times City, Hai Bà Trưng, Hà Nội',
      stats: { total: 80, available: 20, charging: 40, rented: 20 },
      distance: '3.5 km'
    }
  ];

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await fetch(`${ADDRESS_API_BASE}?endpoint=2025-07-01/provinces`);
      const data = await response.json();
      setProvinces(data.provinces || data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDistricts = async (provinceId: string) => {
    try {
      const response = await fetch(`${ADDRESS_API_BASE}?endpoint=2025-07-01/provinces/${provinceId}/districts`);
      const data = await response.json();
      setDistricts(data.districts || data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWards = async (districtId: string) => {
    try {
      const response = await fetch(`${ADDRESS_API_BASE}?endpoint=2025-07-01/districts/${districtId}/communes`);
      const data = await response.json();
      setWards(data.communes || data);
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
              <select value={selectedProvince} onChange={handleProvinceChange} style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #cbd5e1', fontSize: '15px', borderRadius: '12px', backgroundColor: '#f8fafc', color: '#1e293b' }}>
                <option value="">Tỉnh/Thành phố</option>
                {provinces.map(p => <option key={p.code || p.id} value={p.code || p.id}>{p.name}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #cbd5e1', fontSize: '15px', borderRadius: '12px', backgroundColor: '#f8fafc', color: '#1e293b' }}>
                <option value="">Quận/Huyện</option>
                {districts.map(d => <option key={d.code || d.id} value={d.code || d.id}>{d.name}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict} style={{ width: '100%', height: '48px', padding: '0 16px', border: '1px solid #cbd5e1', fontSize: '15px', borderRadius: '12px', backgroundColor: '#f8fafc', color: '#1e293b' }}>
                <option value="">Phường/Xã</option>
                {wards.map(w => <option key={w.code || w.id} value={w.code || w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', flex: 1, maxWidth: '200px' }}>Tìm kiếm</button>
            <button type="button" onClick={handleReset} style={{ padding: '10px 24px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Xóa bộ lọc</button>
          </div>
        </div>

        {/* Station Cards Grid */}
        <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '1rem' }}>Kết quả tìm kiếm ({stations.length})</h2>
        <div className="station-cards-grid">
          {stations.map(station => (
            <div key={station.id} className="station-card" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
                Cách {station.distance}
              </div>
              <div className="station-header">
                <div>
                  <div className="station-name">{station.name}</div>
                  <div className="station-location">{station.address}</div>
                </div>
              </div>

              <div className="station-stats">
                <div className="station-stat">
                  <div className="stat-number">{station.stats.total}</div>
                  <div className="stat-label">Tổng Số Pin</div>
                </div>
                <div className="station-stat">
                  <div className="stat-number">{station.stats.available}</div>
                  <div className="stat-label">Pin Đang Trống</div>
                </div>
                <div className="station-stat">
                  <div className="stat-number">{station.stats.charging}</div>
                  <div className="stat-label">Pin Đang Sạc</div>
                </div>
                <div className="station-stat">
                  <div className="stat-number">{station.stats.rented}</div>
                  <div className="stat-label">Pin Đang Thuê</div>
                </div>
              </div>

              <Link className="station-button" to={`/station?id=${station.id}`}>
                <span>Chỉ đường & Đổi pin</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
