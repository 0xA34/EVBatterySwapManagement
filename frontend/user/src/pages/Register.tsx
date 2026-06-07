import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    // Giả lập đăng ký thành công
    alert('Đăng ký thành công! Mời bạn đăng nhập để tiếp tục.');
    navigate('/login');
  };

  return (
    <main className="auth">
      <div className="container auth-inner">
        <section className="auth-card" aria-labelledby="register-title">
          <h1 id="register-title" className="auth-title">Đăng Ký</h1>
          <p className="auth-subtitle">Tạo tài khoản của bạn</p>

          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <label className="field">
              <span className="label">Họ và Tên</span>
              <input type="text" name="fullName" placeholder="Nguyễn Văn A" required onChange={handleInputChange} value={formData.fullName} />
            </label>

            <label className="field">
              <span className="label">Tên Tài Khoản</span>
              <input type="text" name="username" placeholder="username" required onChange={handleInputChange} value={formData.username} />
            </label>

            <label className="field">
              <span className="label">Địa Chỉ Email</span>
              <input type="email" name="email" placeholder="email@example.com" required onChange={handleInputChange} value={formData.email} />
            </label>

            <label className="field">
              <span className="label">Mật Khẩu</span>
              <input type="password" name="password" placeholder="••••••••" required onChange={handleInputChange} value={formData.password} />
            </label>
            <label className="field">
              <span className="label">Nhập Lại Mật Khẩu</span>
              <input type="password" name="confirmPassword" placeholder="••••••••" required onChange={handleInputChange} value={formData.confirmPassword} />
            </label>

            <button type="submit" className="button primary full">Đăng Ký</button>

            <p className="terms">
              Đã có tài khoản? <Link className="link" to="/login">Đăng nhập</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
