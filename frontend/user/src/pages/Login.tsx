import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }

      const data = await response.json();

      // Normalize role and check for allowed roles
      const role = data.role ? data.role.toUpperCase().replace(/^ROLE_/, '') : '';
      if (role !== 'DRIVER') {
        if (role === 'ADMIN') {
          throw new Error('Tài khoản của bạn là tài khoản Quản trị. Vui lòng sử dụng trang Admin để đăng nhập.');
        }
        if (role === 'STAFF') {
          throw new Error('Tài khoản của bạn là tài khoản Quản trị. Vui lòng sử dụng trang Staff để đăng nhập.');
        }
        throw new Error('Tài khoản này không có quyền truy cập ứng dụng người dùng.');
      }

      const token = data.accessToken || data.token;
      if (token) {
        localStorage.setItem('user_token', token);
      }
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user_role', 'DRIVER');
      window.dispatchEvent(new Event('authChange'));

      navigate('/my');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth">
      <div className="container auth-inner">
        <section className="auth-card" aria-labelledby="login-title">
          <h1 id="login-title" className="auth-title">Đăng Nhập</h1>
          <p className="auth-subtitle">Vui lòng đăng nhập để tiếp tục</p>
          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <label className="field">
              <span className="label">Tài Khoản</span>
              <input
                type="text"
                name="username"
                placeholder="Nhập tài khoản"
                required
                value={formData.username}
                onChange={handleInputChange}
              />
            </label>
            <label className="field" style={{ position: 'relative' }}>
              <span className="label">Mật Khẩu</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu"
                required
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '38px', cursor: 'pointer', color: '#666', background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </button>
            </label>

            {error && (
              <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px', fontWeight: 500, padding: '10px', background: '#fef2f2', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            <button type="submit" className="button primary full" disabled={isLoading}>
              {isLoading ? 'Đang kết nối...' : 'Đăng Nhập'}
            </button>

            <p className="terms">
              Chưa có tài khoản? <Link className="link" to="/register">Đăng ký</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
