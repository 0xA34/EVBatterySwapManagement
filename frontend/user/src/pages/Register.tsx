import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../utils/api';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; email?: string }>({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const password = formData.password;
  const isPasswordStrong =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /^[A-Za-z\d@$!%*?&#]{8,}$/.test(password) &&
    /[@$!%*?&#]/.test(password);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'username') setFieldErrors(prev => ({ ...prev, username: undefined }));
    if (name === 'email') setFieldErrors(prev => ({ ...prev, email: undefined }));
  };

  const validateForm = (): boolean => {
    setError('');
    setFieldErrors({});

    if (formData.fullName.trim().length < 2) {
      setError('Họ và tên phải có ít nhất 2 ký tự.');
      return false;
    }
    if (formData.username.trim().length < 3) {
      setError('Tên tài khoản phải có ít nhất 3 ký tự.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ.');
      return false;
    }
    if (!isPasswordStrong) {
      setError('Mật khẩu chưa đủ mạnh hoặc chứa ký tự không hợp lệ.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setSuccess('');
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: 'DRIVER',
          status: 'ACTIVE',
        }),
      });

      if (response.ok) {
        setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        let errorData: any = null;
        try {
          errorData = await response.json();
          console.error("Lỗi từ backend (errorData):", errorData);
        } catch {
          // not JSON
          console.error("Lỗi từ backend (không phải JSON)");
        }

        const rawMessage = errorData?.message || errorData?.error || 'Đã xảy ra lỗi không xác định.';

        if (typeof rawMessage === 'object') {
          const newFieldErrors: { username?: string; email?: string } = {};
          if (rawMessage.username) newFieldErrors.username = rawMessage.username as string;
          if (rawMessage.email) newFieldErrors.email = rawMessage.email as string;
          if (Object.keys(newFieldErrors).length > 0) setFieldErrors(newFieldErrors);

          const generalErrors = Object.entries(rawMessage)
            .filter(([key]) => key !== 'username' && key !== 'email')
            .map(([, val]) => val)
            .filter(Boolean);
          if (generalErrors.length > 0) setError(generalErrors.join(' '));
          return;
        }

        const errorMessage = rawMessage as string;
        const lower = errorMessage.toLowerCase();
        const newFieldErrors: { username?: string; email?: string } = {};

        if (lower.includes('username') && (lower.includes('exist') || lower.includes('taken') || lower.includes('already') || lower.includes('duplicate') || lower.includes('tồn tại'))) {
          newFieldErrors.username = 'Tên tài khoản đã tồn tại.';
        }
        if (lower.includes('email') && (lower.includes('exist') || lower.includes('taken') || lower.includes('already') || lower.includes('duplicate') || lower.includes('tồn tại'))) {
          newFieldErrors.email = 'Email đã được sử dụng.';
        }

        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
        } else if (errorMessage) {
          setError(errorMessage);
        } else if (response.status === 409) {
          setError('Tên tài khoản hoặc email đã tồn tại.');
        } else {
          setError('Đăng ký thất bại. Vui lòng thử lại.');
        }
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  return (
    <main className="auth">
      <div className="container auth-inner">
        <section className="auth-card" aria-labelledby="register-title">
          <h1 id="register-title" className="auth-title">Đăng Ký</h1>
          <p className="auth-subtitle">Tạo tài khoản của bạn</p>

          {error && (
            <div className="alert error">{error}</div>
          )}

          {success && (
            <div className="alert success">{success}</div>
          )}

          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <label className="field">
              <span className="label">Họ và Tên</span>
              <input type="text" name="fullName" placeholder="Nguyễn Văn A" required onChange={handleInputChange} value={formData.fullName} />
            </label>

            <label className="field">
              <span className="label">Tên Tài Khoản</span>
              <input
                type="text"
                name="username"
                placeholder="username"
                required
                onChange={handleInputChange}
                value={formData.username}
                style={fieldErrors.username ? { borderColor: '#dc2626' } : {}}
              />
              {fieldErrors.username && (
                <span className="field-error">{fieldErrors.username}</span>
              )}
            </label>

            <label className="field">
              <span className="label">Địa Chỉ Email</span>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                required
                onChange={handleInputChange}
                value={formData.email}
                style={fieldErrors.email ? { borderColor: '#dc2626' } : {}}
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </label>

            <div className="field">
              <span className="label">Mật Khẩu</span>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  required
                  onChange={handleInputChange}
                  value={formData.password}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              <span className="password-hint">
                Mật khẩu phải dài ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
              </span>
              {password && (
                <div className="password-checklist">
                  <span className={password.length >= 8 ? 'pass' : 'fail'}>
                    {password.length >= 8 ? '✓' : '✗'} Ít nhất 8 ký tự
                  </span>
                  <span className={/[A-Z]/.test(password) ? 'pass' : 'fail'}>
                    {/[A-Z]/.test(password) ? '✓' : '✗'} Có chữ hoa (A-Z)
                  </span>
                  <span className={/[a-z]/.test(password) ? 'pass' : 'fail'}>
                    {/[a-z]/.test(password) ? '✓' : '✗'} Có chữ thường (a-z)
                  </span>
                  <span className={/[0-9]/.test(password) ? 'pass' : 'fail'}>
                    {/[0-9]/.test(password) ? '✓' : '✗'} Có chữ số (0-9)
                  </span>
                  <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'pass' : 'fail'}>
                    {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '✓' : '✗'} Có ký tự đặc biệt (!@#$...)
                  </span>
                </div>
              )}
            </div>

            <div className="field">
              <span className="label">Nhập Lại Mật Khẩu</span>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  onChange={handleInputChange}
                  value={formData.confirmPassword}
                  style={formData.confirmPassword && formData.password !== formData.confirmPassword ? { borderColor: '#dc2626' } : {}}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <span className="field-error">Mật khẩu nhập lại không khớp.</span>
              )}
            </div>

            <button
              type="submit"
              className="button primary full"
              disabled={loading || !isPasswordStrong || (!!formData.confirmPassword && formData.password !== formData.confirmPassword)}
              style={loading || !isPasswordStrong || (!!formData.confirmPassword && formData.password !== formData.confirmPassword) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
            </button>

            <p className="terms">
              Đã có tài khoản? <Link className="link" to="/login">Đăng nhập</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
