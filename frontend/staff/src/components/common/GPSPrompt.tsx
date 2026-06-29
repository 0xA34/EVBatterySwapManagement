import React from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';

const GPSPrompt: React.FC = () => {
  const { error, isLoading, location } = useGeolocation();

  // Chỉ hiển thị yêu cầu nếu có lỗi từ chối quyền hoặc thiếu vị trí
  if (!isLoading && error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-md p-6 mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 text-center pointer-events-auto">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full dark:bg-red-900/30">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Yêu cầu bật GPS
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            {error} Để tiếp tục sử dụng hệ thống nhân viên, bạn cần cung cấp vị trí. Nếu bạn đã
            từ chối, hãy làm mới hoặc bấm vào biểu tượng khoá trên trình duyệt để cấp quyền.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Tôi đã bật GPS / Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị tọa độ ở góc dưới bên phải nếu thành công
  if (!isLoading && location) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="relative flex w-3 h-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 font-mono">
          {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </div>
      </div>
    );
  }

  // Trong trường hợp đang load
  return null;
};

export default GPSPrompt;
