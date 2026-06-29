import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiUrl } from '../utils/api';

const PROVINCE_API = getApiUrl('/api/donvihanhchinh/tinhThanh');
const DISTRICT_API = getApiUrl('/api/donvihanhchinh/quanHuyen');
const WARD_API = getApiUrl('/api/donvihanhchinh/phuongXa');

export default function RentPin() {
  const [searchParams] = useSearchParams();
  const pinId = searchParams.get('pin_id') || 'PIN001';
  const navigate = useNavigate();

  // Mock pin data based on rent_pin_form.php logic
  const pin = {
    id: 1,
    battery_serial: pinId,
    battery_model: 'LFP 72V-20Ah',
    health_percentage: 100,
    daily_price: 50000,
    location: 'VinFast Thảo Điền'
  };

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    commune: '',
    address_detail: '',
    start_date: '',
    rental_days: '',
    notes: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.querySelector('input[name="start_date"]') as HTMLInputElement;
    if (dateInput) dateInput.min = today;

    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await fetch(PROVINCE_API);
      const data = await response.json();
      setProvinces(data || []);
    } catch (err) {
      setError('Không thể tải danh sách tỉnh thành. Vui lòng thử lại.');
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceId: string) => {
    if (!provinceId) {
      setDistricts([]);
      setCommunes([]);
      return;
    }
    try {
      setLoadingDistricts(true);
      const response = await fetch(`${DISTRICT_API}?idTinhThanh=${provinceId}`);
      const data = await response.json();
      setDistricts(data || []);
    } catch (err) {
      setError('Không thể tải danh sách quận huyện. Vui lòng thử lại.');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchCommunes = async (districtId: string) => {
    if (!districtId) {
      setCommunes([]);
      return;
    }
    try {
      setLoadingCommunes(true);
      const response = await fetch(`${WARD_API}?idQuanHuyen=${districtId}`);
      const data = await response.json();
      setCommunes(data || []);
    } catch (err) {
      setError('Không thể tải danh sách xã phường. Vui lòng thử lại.');
    } finally {
      setLoadingCommunes(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'province') {
      fetchDistricts(value);
      setFormData(prev => ({ ...prev, district: '', commune: '' }));
    } else if (name === 'district') {
      fetchCommunes(value);
      setFormData(prev => ({ ...prev, commune: '' }));
    }
  };

  const calculateTotal = () => {
    const days = parseInt(formData.rental_days) || 0;
    return days * pin.daily_price;
  };

  const validateForm = () => {
    const required = ['full_name', 'phone', 'province', 'district', 'commune', 'address_detail', 'start_date', 'rental_days'];
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc (*)');
        return false;
      }
    }

    if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }

    const startDate = new Date(formData.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setError('Ngày bắt đầu thuê không được là ngày trong quá khứ');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Mock calling process_rent.php logic equivalent
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess('Thuê pin thành công! Bạn sẽ được chuyển về dashboard.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError('Có lỗi xảy ra khi thuê pin. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem' }}>Thuê Pin</h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Điền thông tin để thuê pin</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', borderRadius: '20px', padding: '2rem', color: 'white', marginBottom: '2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{pin.battery_serial}</h3>
        <p style={{ opacity: 0.9, marginBottom: '1rem' }}>{pin.battery_model}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>Sức khỏe pin</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{pin.health_percentage}%</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>Giá thuê</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{pin.daily_price.toLocaleString()} VNĐ/ngày</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>Vị trí hiện tại</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{pin.location}</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Họ và tên *</label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px' }} required />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Số điện thoại *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px' }} required />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Địa chỉ sử dụng *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tỉnh/Thành phố *</label>
                <select name="province" value={formData.province} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px' }} required>
                  <option value="">Chọn tỉnh/thành phố</option>
                  {provinces.map((p, i) => <option key={`p-${p.id || i}`} value={p.id}>{p.tinhthanhcol}</option>)}
                </select>
                {loadingProvinces && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Đang tải...</span>}
              </div>
              <div>
                <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Quận/Huyện *</label>
                <select name="district" value={formData.district} onChange={handleInputChange} disabled={!formData.province} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px' }} required>
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((d, i) => <option key={`d-${d.id || i}`} value={d.id}>{d.tenquanhuyen}</option>)}
                </select>
                {loadingDistricts && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Đang tải...</span>}
              </div>
              <div>
                <label style={{ display: 'block', color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Xã/Phường *</label>
                <select name="commune" value={formData.commune} onChange={handleInputChange} disabled={!formData.district} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px' }} required>
                  <option value="">Chọn xã/phường</option>
                  {communes.map((c, i) => <option key={`c-${c.id || i}`} value={c.id}>{c.tenphuongxa}</option>)}
                </select>
                {loadingCommunes && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Đang tải...</span>}
              </div>
            </div>
            <textarea name="address_detail" value={formData.address_detail} onChange={handleInputChange} rows={3} placeholder="Số nhà, tên đường, khu vực..." style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px' }} required></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Ngày bắt đầu *</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Số ngày thuê *</label>
              <select name="rental_days" value={formData.rental_days} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '12px' }} required>
                <option value="">Chọn số ngày</option>
                <option value="1">1 ngày</option>
                <option value="3">3 ngày</option>
                <option value="7">7 ngày</option>
                <option value="15">15 ngày</option>
                <option value="30">30 ngày</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#374151', marginBottom: '1rem', fontWeight: 600 }}>Tóm tắt đơn thuê</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Giá thuê/ngày:</span>
              <span>{pin.daily_price.toLocaleString()} VNĐ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Số ngày thuê:</span>
              <span>{formData.rental_days || 0} ngày</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '2px solid #e5e7eb', fontWeight: 700, fontSize: '1.2rem', color: '#1f2937' }}>
              <span>Tổng cộng:</span>
              <span>{calculateTotal().toLocaleString()} VNĐ</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={submitting} style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 600, fontSize: '1.1rem', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Đang xử lý...' : 'Xác nhận thuê pin'}
            </button>
            <button type="button" onClick={() => navigate('/recharge')} style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', border: 'none', padding: '1rem 1.5rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
              💰 Nạp tiền
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
