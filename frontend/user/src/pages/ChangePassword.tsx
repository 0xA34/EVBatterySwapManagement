import { getApiUrl } from '../utils/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    
    const token = localStorage.getItem('user_token');
    if (!token) {
      setMessage({ type: 'error', text: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' });
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/update-password?oldPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resText = await response.text();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setMessage(null), 3000);
      } else {
        let errorMsg = 'Có lỗi xảy ra khi cập nhật mật khẩu.';
        if (resText === "Password doesn't match") {
          errorMsg = 'Mật khẩu hiện tại không chính xác.';
        } else if (resText === "Password already exists") {
          errorMsg = 'Mật khẩu mới trùng với mật khẩu hiện tại.';
        } else {
          errorMsg = resText || errorMsg;
        }
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Không thể kết nối tới máy chủ.' });
    }
  };

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = checkPasswordStrength(newPassword);
  let strengthText = '';
  if (newPassword.length > 0) {
    if (strength <= 2) { strengthText = 'Mật khẩu yếu'; }
    else if (strength === 3) { strengthText = 'Mật khẩu trung bình'; }
    else if (strength === 4) { strengthText = 'Mật khẩu tốt'; }
    else { strengthText = 'Mật khẩu mạnh'; }
  }

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 200px)', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 40px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '28px', margin: '0 0 8px', fontWeight: 700, background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Đổi mật khẩu</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>Thay đổi mật khẩu để bảo mật tài khoản</p>
          </div>
          
          {message && (
            <div style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid', marginBottom: '16px', background: message.type === 'success' ? '#ecfdf5' : '#fef2f2', borderColor: message.type === 'success' ? '#a7f3d0' : '#fecaca', color: message.type === 'success' ? '#065f46' : '#991b1b', display: 'flex', gap: '8px' }}>
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="field" style={{ marginBottom: '16px' }}>
              <label className="label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#0f172a' }}>Mật khẩu hiện tại</label>
              <input 
                type="password" 
                placeholder="Nhập mật khẩu hiện tại" 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc' }}
                required 
              />
            </div>
            
            <div className="field" style={{ marginBottom: '16px' }}>
              <label className="label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#0f172a' }}>Mật khẩu mới</label>
              <input 
                type="password" 
                placeholder="Nhập mật khẩu mới" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc' }}
                required 
              />
              {newPassword && (
                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                  <div style={{ height: '4px', background: '#e9ecef', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', transition: 'all 0.3s ease', borderRadius: '2px', ...getStrengthStyle(strength) }}></div>
                  </div>
                  <small style={{ color: strength > 2 ? '#28a745' : '#dc3545' }}>{strengthText}</small>
                </div>
              )}
            </div>
            
            <div className="field" style={{ marginBottom: '16px' }}>
              <label className="label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#0f172a' }}>Xác nhận mật khẩu mới</label>
              <input 
                type="password" 
                placeholder="Nhập lại mật khẩu mới" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc' }}
                required 
              />
              {confirmPassword && (
                <div style={{ marginTop: '8px' }}>
                  {newPassword === confirmPassword ? (
                    <small style={{ color: '#28a745' }}>✅ Mật khẩu khớp</small>
                  ) : (
                    <small style={{ color: '#dc3545' }}>❌ Mật khẩu không khớp</small>
                  )}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
              <Link to="/profile" className="button">← Quay lại</Link>
              <button type="submit" className="button primary">💾 Đổi mật khẩu</button>
            </div>
          </form>
          
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
            <h6 style={{ color: '#333', fontWeight: 600, marginBottom: '15px' }}>🛡️ Mẹo bảo mật mật khẩu</h6>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li style={{ color: '#666', marginBottom: '8px' }}>Sử dụng ít nhất 8 ký tự</li>
              <li style={{ color: '#666', marginBottom: '8px' }}>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
              <li style={{ color: '#666', marginBottom: '8px' }}>Không sử dụng thông tin cá nhân dễ đoán</li>
              <li style={{ color: '#666', marginBottom: '8px' }}>Không sử dụng lại mật khẩu cũ</li>
              <li style={{ color: '#666', marginBottom: '8px' }}>Thay đổi mật khẩu định kỳ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStrengthStyle(strength: number) {
  if (strength <= 2) return { background: '#dc3545', width: '25%' };
  if (strength === 3) return { background: '#ffc107', width: '50%' };
  if (strength === 4) return { background: '#17a2b8', width: '75%' };
  return { background: '#28a745', width: '100%' };
}
