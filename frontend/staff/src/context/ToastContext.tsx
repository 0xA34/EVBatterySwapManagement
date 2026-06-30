import React, { createContext, useContext, useState, useCallback } from 'react';

// Định nghĩa các loại thông báo Toast
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Định nghĩa cấu trúc dữ liệu của một thông báo Toast
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Định nghĩa kiểu dữ liệu cho Context
interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

// Khởi tạo Context cho Toast
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook tiện ích để sử dụng Toast ở các component con
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return context;
};

// Provider quản lý danh sách Toast và giao diện hiển thị popup
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Hàm kích hoạt hiển thị Toast mới
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Tự động tắt thông báo sau 3 giây
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  // Hàm chủ động tắt một Toast khi nhấn nút close (X)
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Lấy các lớp CSS CSS Tailwind và Icon SVG tương ứng với từng trạng thái Toast
  const getTypeStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/80',
          border: 'border-emerald-200 dark:border-emerald-900',
          text: 'text-emerald-800 dark:text-emerald-200',
          icon: (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'error':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/80',
          border: 'border-rose-200 dark:border-rose-900',
          text: 'text-rose-800 dark:text-rose-200',
          icon: (
            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/80',
          border: 'border-amber-200 dark:border-amber-900',
          text: 'text-amber-800 dark:text-amber-200',
          icon: (
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/80',
          border: 'border-blue-200 dark:border-blue-900',
          text: 'text-blue-800 dark:text-blue-200',
          icon: (
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Vùng chứa các thông báo popup nổi lên màn hình */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const styles = getTypeStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in pointer-events-auto ${styles.bg} ${styles.border} ${styles.text}`}
              role="alert"
            >
              <div className="flex-shrink-0">{styles.icon}</div>
              <div className="flex-1 text-sm font-medium">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors pointer-events-auto"
                aria-label="Đóng"
              >
                <svg className="w-4 h-4 opacity-60 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
