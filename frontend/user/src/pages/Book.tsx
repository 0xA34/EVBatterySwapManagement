import React, { useState, useEffect } from 'react';
import '../assets/css/book.css';

const PROVINCE_API = 'http://localhost:8080/api/donvihanhchinh/tinhThanh';
const DISTRICT_API = 'http://localhost:8080/api/donvihanhchinh/quanHuyen';
const WARD_API = 'http://localhost:8080/api/donvihanhchinh/phuongXa';

export default function Book() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [batteries, setBatteries] = useState<any[]>([]);
  const [selectedBattery, setSelectedBattery] = useState('');

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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

  const handleSearch = () => {
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      alert('Vui lòng chọn đầy đủ thông tin khu vực.');
      return;
    }
    // Mock fetching stations
    setStations([
      { id: '1', name: 'Trạm Đổi Pin VinFast Ocean Park', address: 'Khu đô thị Vinhomes Ocean Park' },
      { id: '2', name: 'Trạm Đổi Pin VinFast Times City', address: 'Vinhomes Times City' }
    ]);
    alert('Đã tải danh sách trạm.');
  };

  const handleResetSearch = () => {
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
    setDistricts([]);
    setWards([]);
    setStations([]);
    setSelectedStation('');
    setBatteries([]);
    setSelectedBattery('');
    setStartTime('');
    setEndTime('');
  };

  const handleStationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedStation(val);
    if (val) {
      // Mock fetching batteries
      setBatteries([
        { id: 'BAT-001', serialNumber: 'BAT-001', capacity: '960Wh' },
        { id: 'BAT-002', serialNumber: 'BAT-002', capacity: '960Wh' }
      ]);
    } else {
      setBatteries([]);
    }
    setSelectedBattery('');
  };

  const handleQuickTime = (minutes: number) => {
    let start = new Date();
    if (startTime) {
      start = new Date(startTime);
    } else {
      start.setMinutes(start.getMinutes() + 5);
    }

    // Convert to local time string for input datetime-local
    const tzOffset = start.getTimezoneOffset() * 60000;
    const localStart = new Date(start.getTime() - tzOffset);
    setStartTime(localStart.toISOString().slice(0, 16));

    const end = new Date(start.getTime() + minutes * 60 * 1000);
    const localEnd = new Date(end.getTime() - tzOffset);
    setEndTime(localEnd.toISOString().slice(0, 16));
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation || !selectedBattery || !startTime || !endTime) {
      alert('Vui lòng chọn đầy đủ thông tin (trạm, pin, thời gian bắt đầu, thời gian kết thúc).');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      alert('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
      return;
    }

    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffHours > 3) {
      alert('Kiểu đặt lịch không hợp lệ: Thời gian đặt lịch tối đa trong phạm vi 3 tiếng.');
      return;
    }

    alert('Đặt lịch thành công!');
    // Redirect or reset
    handleResetSearch();
  };

  const isRightFormDisabled = stations.length === 0;

  return (
    <main className="schedule">
      <div className="container">
        <div className="contact-form-wrapper" style={{ maxWidth: '1150px', margin: '0 auto' }}>
          <div className="schedule-two-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

            {/* Left Form: Search */}
            <div className="form-card">
              <div className="form-header">
                <h1 className="form-title" style={{ fontSize: '24px' }}>Tra cứu khu vực</h1>
                <p>Chọn tỉnh thành để tìm pin</p>
              </div>

              <form className="contact-form">
                <div style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                  Xin vui lòng nhập đầy đủ các thông tin cần thiết
                </div>

                <div className="search-grid" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  <div>
                    <div style={{ marginBottom: '4px' }}>
                      <label style={{ fontSize: '13px', color: '#555', margin: 0 }}>Tỉnh/TP <span style={{ color: 'red' }}>*</span></label>
                    </div>
                    <select id="tinhSelect" className="field-select" value={selectedProvince} onChange={handleProvinceChange} style={{ width: '100%', height: '34px', padding: '4px 8px', border: '1px solid #cbd5e1', fontSize: '13px', borderRadius: '4px', marginTop: 0 }}>
                      <option value="">-- Chọn tỉnh/TP --</option>
                      {provinces.map((p, i) => <option key={`p-${p.id || i}`} value={p.id}>{p.tinhthanhcol}</option>)}
                    </select>
                  </div>

                  <div>
                    <div style={{ marginBottom: '4px' }}>
                      <label style={{ fontSize: '13px', color: '#555', margin: 0 }}>Quận/Huyện <span style={{ color: 'red' }}>*</span></label>
                    </div>
                    <select id="huyenSelect" className="field-select" value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} style={{ width: '100%', height: '34px', padding: '4px 8px', border: '1px solid #cbd5e1', fontSize: '13px', borderRadius: '4px', marginTop: 0 }}>
                      <option value="">-- Chọn quận/huyện --</option>
                      {districts.map((d, i) => <option key={`d-${d.id || i}`} value={d.id}>{d.tenquanhuyen}</option>)}
                    </select>
                  </div>

                  <div>
                    <div style={{ marginBottom: '4px' }}>
                      <label style={{ fontSize: '13px', color: '#555', margin: 0 }}>Phường/Xã <span style={{ color: 'red' }}>*</span></label>
                    </div>
                    <select id="xaSelect" className="field-select" value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict} style={{ width: '100%', height: '34px', padding: '4px 8px', border: '1px solid #cbd5e1', fontSize: '13px', borderRadius: '4px', marginTop: 0 }}>
                      <option value="">-- Chọn phường/xã --</option>
                      {wards.map((w, i) => <option key={`w-${w.id || i}`} value={w.id}>{w.tenphuongxa}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button type="button" className="submit-button" onClick={handleSearch} style={{ flex: 1 }}>Tra cứu</button>
                  <button type="button" className="submit-button" onClick={handleResetSearch} style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>Nhập lại</button>
                </div>
              </form>
            </div>

            {/* Right Form: Schedule */}
            <div className="form-card" style={{ opacity: isRightFormDisabled ? 0.5 : 1, pointerEvents: isRightFormDisabled ? 'none' : 'auto', position: 'relative' }}>
              {isRightFormDisabled && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}>
                  <span style={{ background: '#334155', color: 'white', padding: '10px 20px', borderRadius: '30px', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 500 }}>
                    Vui lòng tra cứu khu vực trước
                  </span>
                </div>
              )}

              <div className="form-header">
                <h1 className="form-title" style={{ fontSize: '24px' }}>Thông tin đặt lịch</h1>
                <p>Chọn pin và thời gian thuê</p>
              </div>

              <form className="contact-form" onSubmit={handleBook} noValidate>
                <div className="field">
                  <label className="label">Chọn trạm</label>
                  <select className="field-select" required value={selectedStation} onChange={handleStationChange}>
                    <option value="">-- Chọn trạm --</option>
                    {stations.map(st => <option key={st.id} value={st.id}>{st.name} ({st.address})</option>)}
                  </select>
                </div>

                <div className="field">
                  <label className="label">Danh sách pin</label>
                  <select className="field-select" required value={selectedBattery} onChange={(e) => setSelectedBattery(e.target.value)} disabled={!selectedStation}>
                    <option value="">-- Chọn pin --</option>
                    {batteries.map(bat => <option key={bat.id} value={bat.id}>{bat.serialNumber} - {bat.capacity}</option>)}
                  </select>
                </div>

                <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <label className="field" style={{ flex: 1, marginBottom: 0 }}>
                    <span className="label">Thời gian bắt đầu</span>
                    <input type="datetime-local" required value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'inherit' }} />
                  </label>
                  <label className="field" style={{ flex: 1, marginBottom: 0 }}>
                    <span className="label">Thời gian kết thúc</span>
                    <input type="datetime-local" required value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'inherit' }} />
                  </label>
                </div>

                <div className="quick-time-selection" style={{ display: 'flex', gap: '8px', marginTop: 0, flexWrap: 'wrap' }}>
                  <button type="button" className="time-btn" onClick={() => handleQuickTime(20)}>+20 Phút</button>
                  <button type="button" className="time-btn" onClick={() => handleQuickTime(30)}>+30 Phút</button>
                  <button type="button" className="time-btn" onClick={() => handleQuickTime(40)}>+40 Phút</button>
                  <button type="button" className="time-btn" onClick={() => handleQuickTime(60)}>+1 Giờ</button>
                  <button type="button" className="time-btn" onClick={() => handleQuickTime(120)}>+2 Giờ</button>
                  <button type="button" className="time-btn" onClick={() => handleQuickTime(180)}>+3 Giờ</button>
                </div>

                <div className="field" style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>* Kiểu đặt lịch: Giới hạn trong phạm vi 3 tiếng.</span>
                </div>

                <button type="submit" className="submit-button" style={{ marginTop: '16px' }}>Đặt lịch</button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
