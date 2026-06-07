import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ADDRESS_API_BASE = 'https://addresskit.cas.so/address-kit/';

export default function Dashboard() {
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
      name: 'Trạm Đổi Pin VinFast Ocean Park',
      address: 'Khu đô thị Vinhomes Ocean Park, Gia Lâm, Hà Nội',
      stats: { total: 100, available: 45, charging: 30, rented: 25 }
    },
    {
      id: 2,
      name: 'Trạm Đổi Pin VinFast Times City',
      address: 'Vinhomes Times City, Hai Bà Trưng, Hà Nội',
      stats: { total: 80, available: 20, charging: 40, rented: 20 }
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
    <main className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Xin chào, User</h1>
        <p className="dashboard-subtitle">Quản lý hệ thống trạm pin trên toàn quốc</p>
      </div>

      {/* Location Filter Form */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>
          Tra cứu trạm pin theo khu vực
        </div>

        <div className="search-grid" style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Tỉnh/TP</label></div>
            <select value={selectedProvince} onChange={handleProvinceChange} style={{ width: '100%', height: '42px', padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '14px', borderRadius: '8px', backgroundColor: '#f9fafb', color: '#1f2937' }}>
              <option value="">-- Chọn tỉnh/TP --</option>
              {provinces.map(p => <option key={p.code || p.id} value={p.code || p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Quận/Huyện</label></div>
            <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} style={{ width: '100%', height: '42px', padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '14px', borderRadius: '8px', backgroundColor: '#f9fafb', color: '#1f2937' }}>
              <option value="">-- Chọn quận/huyện --</option>
              {districts.map(d => <option key={d.code || d.id} value={d.code || d.id}>{d.name}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Phường/Xã</label></div>
            <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict} style={{ width: '100%', height: '42px', padding: '8px 12px', border: '1px solid #d1d5db', fontSize: '14px', borderRadius: '8px', backgroundColor: '#f9fafb', color: '#1f2937' }}>
              <option value="">-- Chọn phường/xã --</option>
              {wards.map(w => <option key={w.code || w.id} value={w.code || w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" style={{ padding: '7px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Tra cứu</button>
          <button type="button" onClick={handleReset} style={{ padding: '7px 18px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Nhập lại</button>
        </div>
      </div>

      {/* Station Cards Grid */}
      <div className="station-cards-grid">
        {stations.map(station => (
          <div key={station.id} className="station-card">
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
              <span>Xem danh sách pin</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
