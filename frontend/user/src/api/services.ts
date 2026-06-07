// Mô phỏng các API còn thiếu: get_notifications, mark_all_notifications_read, mark_notification_read, notification_helper, process_rent, logout

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  is_important: boolean;
  action_url: string;
  action_text: string;
  created_at: string;
}

// 1. get_notifications & notification_helper
export const getNotifications = async (): Promise<{ success: boolean; notifications: Notification[]; unread_count: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        unread_count: 2,
        notifications: [
          {
            id: 1,
            title: "Pin sắp hết",
            message: "Pin PIN001 của bạn chỉ còn 15%. Vui lòng đến trạm đổi pin.",
            type: "warning",
            is_read: false,
            is_important: true,
            action_url: "/stations",
            action_text: "Tìm trạm gần nhất",
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Thuê pin thành công",
            message: "Bạn đã thuê pin PIN001 thành công.",
            type: "success",
            is_read: true,
            is_important: false,
            action_url: "/history",
            action_text: "Xem lịch sử",
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      });
    }, 500);
  });
};

// 2. mark_notification_read
export const markNotificationRead = async (notificationId: number): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Đã đánh dấu thông báo ${notificationId} là đã đọc`);
      resolve({ success: true });
    }, 300);
  });
};

// 3. mark_all_notifications_read
export const markAllNotificationsRead = async (): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Đã đánh dấu tất cả thông báo là đã đọc');
      resolve({ success: true });
    }, 500);
  });
};

// 4. process_rent (API Backend Logic cho việc thuê pin)
export const processRent = async (rentData: any): Promise<{ success: boolean; message: string; data?: any }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Giả lập kiểm tra logic như trong PHP
      if (!rentData.battery_id || !rentData.rental_days) {
        reject({ success: false, message: 'Dữ liệu không hợp lệ' });
      } else {
        resolve({
          success: true,
          message: 'Thuê pin thành công!',
          data: {
            rental_id: Math.floor(Math.random() * 10000),
            pin_id: rentData.battery_serial,
            rental_date: new Date().toISOString()
          }
        });
      }
    }, 1000);
  });
};

// 5. logout
export const logoutUser = async (): Promise<{ success: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Clear localStorage or cookies
      localStorage.removeItem('user_token');
      console.log('Đã đăng xuất');
      resolve({ success: true });
    }, 300);
  });
};
