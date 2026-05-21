import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  // Đổi tên state từ email thành username cho sát với API, hoặc bạn có thể giữ nguyên
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth(); // Vẫn giữ lại nếu bạn cần cập nhật state vào Context sau khi fetch thành công
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // --- XỬ LÝ TOKEN Ở ĐÂY ---
        // Ví dụ API trả về: { "token": "eyJhbG..." }
        // localStorage.setItem('accessToken', data.token);
        
        // Nếu AuthContext của bạn cần cập nhật state, bạn có thể gọi:
        // login(data.token); 

        navigate('/inventory', { replace: true });
      } else {
        // Có thể lấy message lỗi từ API nếu server có trả về
        // const errorData = await response.json();
        setError('Tài khoản hoặc mật khẩu không chính xác.');
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Đăng nhập tài khoản</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Dành cho nhân viên quản lý</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Cập nhật lại thông tin test theo API curl */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">Tài khoản Test:</p>
          <p>Tên đăng nhập: <span className="font-mono">staff</span></p>
          <p>Mật khẩu: <span className="font-mono">123456</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="staff"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}