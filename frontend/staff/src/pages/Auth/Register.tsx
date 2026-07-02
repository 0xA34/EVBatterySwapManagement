import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { getApiUrl } from '../../utils/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; email?: string }>({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isPasswordStrong = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password);

  const navigate = useNavigate();

  const validateForm = (): boolean => {
    setFieldErrors({});
    setError('');

    if (username.trim().length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return false;
    }

    if (fullName.trim().length < 2) {
      setError('Họ và tên phải có ít nhất 2 ký tự.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ.');
      return false;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Mật khẩu phải chứa ít nhất 1 chữ hoa.');
      return false;
    }

    if (!/[a-z]/.test(password)) {
      setError('Mật khẩu phải chứa ít nhất 1 chữ thường.');
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setError('Mật khẩu phải chứa ít nhất 1 chữ số.');
      return false;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
          username: username.trim(),
          fullName: fullName.trim(),
          email: email.trim(),
          phoneNumber: '',
          password: password,
          role: 'STAFF',
          status: 'ACTIVE',
        }),
      });

      if (response.ok) {
        setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } else {
        // Xử lý lỗi trùng username/email từ server
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch {
          // response không phải JSON
        }

        // message có thể là string hoặc object (validation errors từ Spring)
        const rawMessage = errorData?.message || errorData?.error || '';
        let errorMessage = '';

        if (typeof rawMessage === 'object') {
          // Validation errors: { "password": "...", "username": "..." }
          const messages = Object.values(rawMessage).filter(Boolean);
          errorMessage = messages.join(' ');
          
          // Hiển thị field-specific errors
          const newFieldErrors: { username?: string; email?: string } = {};
          if (rawMessage.username) newFieldErrors.username = rawMessage.username as string;
          if (rawMessage.email) newFieldErrors.email = rawMessage.email as string;
          
          if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
          }
          
          // Hiển thị lỗi chung (trừ các field đã hiển thị riêng)
          const generalErrors = Object.entries(rawMessage)
            .filter(([key]) => key !== 'username' && key !== 'email')
            .map(([, val]) => val)
            .filter(Boolean);
          if (generalErrors.length > 0) {
            setError(generalErrors.join(' '));
          }
          return;
        } else {
          errorMessage = rawMessage;
        }

        const errorMessageLower = errorMessage.toLowerCase();

        const newFieldErrors: { username?: string; email?: string } = {};

        if (errorMessageLower.includes('username') && (errorMessageLower.includes('exist') || errorMessageLower.includes('taken') || errorMessageLower.includes('already') || errorMessageLower.includes('duplicate') || errorMessageLower.includes('tồn tại'))) {
          newFieldErrors.username = 'Tên đăng nhập đã tồn tại.';
        }

        if (errorMessageLower.includes('email') && (errorMessageLower.includes('exist') || errorMessageLower.includes('taken') || errorMessageLower.includes('already') || errorMessageLower.includes('duplicate') || errorMessageLower.includes('tồn tại'))) {
          newFieldErrors.email = 'Email đã được sử dụng.';
        }

        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
        } else if (errorMessage) {
          setError(errorMessage);
        } else if (response.status === 409) {
          setError('Tên đăng nhập hoặc email đã tồn tại.');
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

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 dark:bg-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đăng ký tài khoản</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tạo tài khoản nhân viên mới</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 text-green-600 text-sm p-3 rounded-lg dark:bg-green-500/10 dark:text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => { setUsername(e.target.value); setFieldErrors((prev) => ({ ...prev, username: undefined })); }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-gray-700 dark:text-white ${
                fieldErrors.username
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Nhập tên đăng nhập"
            />
            {fieldErrors.username && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{fieldErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Nhập họ và tên"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: undefined })); }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-gray-700 dark:text-white ${
                fieldErrors.email
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="example@email.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Mật khẩu phải dài ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
            </p>
            {password && (
              <div className="mt-2 space-y-1 text-xs">
                <p className={password.length >= 8 ? 'text-green-500' : 'text-red-400 dark:text-red-400'}>
                  {password.length >= 8 ? '✓' : '✗'} Ít nhất 8 ký tự
                </p>
                <p className={/[A-Z]/.test(password) ? 'text-green-500' : 'text-red-400 dark:text-red-400'}>
                  {/[A-Z]/.test(password) ? '✓' : '✗'} Có chữ hoa (A-Z)
                </p>
                <p className={/[a-z]/.test(password) ? 'text-green-500' : 'text-red-400 dark:text-red-400'}>
                  {/[a-z]/.test(password) ? '✓' : '✗'} Có chữ thường (a-z)
                </p>
                <p className={/[0-9]/.test(password) ? 'text-green-500' : 'text-red-400 dark:text-red-400'}>
                  {/[0-9]/.test(password) ? '✓' : '✗'} Có chữ số (0-9)
                </p>
                <p className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-500' : 'text-red-400 dark:text-red-400'}>
                  {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password) ? '✓' : '✗'} Có ký tự đặc biệt (!@#$...)
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-gray-700 dark:text-white ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">Mật khẩu nhập lại không khớp.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordStrong || password !== confirmPassword}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
