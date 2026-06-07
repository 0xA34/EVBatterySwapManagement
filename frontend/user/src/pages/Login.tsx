import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    window.dispatchEvent(new Event('authChange'));
    // Giả lập login thành công
    alert('Đăng nhập thành công! Chào mừng bạn quay trở lại.');
    navigate('/my');
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
                  position: 'absolute', right: '12px', top: '38px', cursor: 'pointer', color: '#666', background: 'none', border: 'none'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </label>

            <button type="submit" className="button primary full">Đăng Nhập</button>

            <p className="terms">
              Chưa có tài khoản? <Link className="link" to="/register">Đăng ký</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
