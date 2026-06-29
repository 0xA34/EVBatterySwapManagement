import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getApiUrl } from "../utils/api";

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  // Tab 1: Profile Info state
  const [profileData, setProfileData] = useState({
    username: "staff",
    fullName: "Nguyễn Văn A",
    email: "staff.a@evcharge.com",
    phone: "0987654321",
    station: "Trạm Trung Tâm Q1",
  });

  // Tab 2: Change Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Tab 3: Support state
  const [supportForm, setSupportForm] = useState({
    subject: "Gặp sự cố với tủ sạc",
    message: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("staff_auth_token");
        const response = await fetch(getApiUrl('/api/info'), {
          headers: {
            "Authorization": `Bearer ${token}`,
            "accept": "*/*"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfileData(prev => ({
            ...prev,
            username: data.username || prev.username,
            fullName: data.fullName || prev.fullName,
            email: data.email || prev.email,
            phone: data.phoneNumber || prev.phone,
          }));
        } else {
          // Fallback to local storage if API fails
          const savedProfile = localStorage.getItem("staff_profile_data");
          if (savedProfile) {
            setProfileData(JSON.parse(savedProfile));
          }
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
        const savedProfile = localStorage.getItem("staff_profile_data");
        if (savedProfile) {
          setProfileData(JSON.parse(savedProfile));
        }
      }
    };
    
    fetchProfile();
  }, []);

  const handleTabChange = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("staff_profile_data", JSON.stringify(profileData));
    showToast("Cập nhật thông tin cá nhân thành công!", "success");
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Vui lòng điền đầy đủ tất cả các trường!");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      const token = localStorage.getItem("staff_auth_token");
      const url = getApiUrl(`/api/update-password?oldPassword=${encodeURIComponent(passwordData.currentPassword)}&newPassword=${encodeURIComponent(passwordData.newPassword)}`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setPasswordError("");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        showToast("Thay đổi mật khẩu tài khoản thành công!", "success");
      } else {
        const text = await response.text();
        setPasswordError(text || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("Lỗi hệ thống khi đổi mật khẩu.");
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.message.trim()) {
      showToast("Vui lòng nhập nội dung yêu cầu hỗ trợ!", "error");
      return;
    }
    showToast("Đã gửi yêu cầu hỗ trợ! Chúng tôi sẽ phản hồi sớm nhất.", "success");
    setSupportForm({ ...supportForm, message: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cài đặt nhân viên</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Quản lý thông tin cá nhân, bảo mật tài khoản và gửi yêu cầu hỗ trợ kỹ thuật.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-1/4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 h-fit">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            <button
              onClick={() => handleTabChange("profile")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl w-full whitespace-nowrap transition-all ${activeTab === "profile"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Thông tin cá nhân
            </button>
            <button
              onClick={() => handleTabChange("settings")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl w-full whitespace-nowrap transition-all ${activeTab === "settings"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Cài đặt tài khoản
            </button>
            <button
              onClick={() => handleTabChange("support")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl w-full whitespace-nowrap transition-all ${activeTab === "support"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Hỗ trợ kỹ thuật
            </button>
          </nav>
        </div>

        {/* Content Pane */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 lg:p-8">
          {/* TAB 1: EDIT PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Thông tin cá nhân</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Xem và cập nhật thông tin liên hệ của bạn.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tên tài khoản</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl p-3 text-sm text-gray-400 outline-none"
                      value={user?.username || "staff"}
                      disabled
                    />
                    <span className="text-xs text-gray-400 mt-1 block">Tên tài khoản hệ thống không thể thay đổi.</span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Vai trò</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl p-3 text-sm text-gray-400 outline-none capitalize"
                      value={user?.role || "Staff"}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Họ và Tên</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-sm text-gray-850 dark:text-white outline-none focus:border-blue-500"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Số điện thoại</label>
                    <input
                      type="tel"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-sm text-gray-850 dark:text-white outline-none focus:border-blue-500"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email liên hệ</label>
                    <input
                      type="email"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-sm text-gray-850 dark:text-white outline-none focus:border-blue-500"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Trạm phân công chính</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-250 dark:border-gray-650 rounded-xl p-3 text-sm text-gray-400 outline-none"
                      value={profileData.station}
                      disabled
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                  >
                    Lưu thông tin
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ACCOUNT SETTINGS (PASSWORD CHANGE & NOTIFICATIONS) */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Cài đặt tài khoản & Bảo mật</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Thay đổi mật khẩu tài khoản và quản lý cấu hình thông báo.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form đổi mật khẩu */}
                <form onSubmit={handlePasswordSave} className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 border-b pb-2 dark:border-gray-700">Đổi mật khẩu</h4>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-sm text-gray-850 dark:text-white outline-none focus:border-blue-500"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-sm text-gray-850 dark:text-white outline-none focus:border-blue-500"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-sm text-gray-850 dark:text-white outline-none focus:border-blue-500"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {passwordError && (
                    <p className="text-xs font-semibold text-red-500 mt-1">{passwordError}</p>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                    >
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </form>

                {/* Cấu hình thông báo */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 border-b pb-2 dark:border-gray-700">Tùy chọn thông báo</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-sm text-gray-850 dark:text-white">Email thông báo đổi pin</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Nhận email khi có giao dịch đổi pin được tạo tại trạm</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-250 dark:bg-gray-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-sm text-gray-850 dark:text-white">Cảnh báo lỗi trạm / pin</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Nhận thông báo khi phát hiện pin bị hỏng hoặc lỗi tủ sạc</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-250 dark:bg-gray-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-sm text-gray-850 dark:text-white">Báo cáo doanh thu hàng ngày</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Nhận tổng hợp kết quả giao dịch và doanh thu cuối ngày</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-250 dark:bg-gray-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUPPORT */}
          {activeTab === "support" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Hỗ trợ kỹ thuật & Hướng dẫn</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gửi yêu cầu hỗ trợ sự cố trạm sạc hoặc xem thông tin liên hệ khẩn cấp.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form gửi yêu cầu hỗ trợ */}
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 border-b pb-2 dark:border-gray-700">Gửi yêu cầu sự cố</h4>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Chủ đề cần hỗ trợ</label>
                    <select
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-sm text-gray-850 dark:text-white outline-none focus:border-blue-500"
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                    >
                      <option value="Gặp sự cố với tủ sạc">Gặp sự cố với tủ sạc</option>
                      <option value="Pin lỗi không nhận sạc">Pin lỗi không nhận sạc</option>
                      <option value="Lỗi ứng dụng / Phần mềm">Lỗi ứng dụng / Phần mềm</option>
                      <option value="Yêu cầu nhập thêm pin mới">Yêu cầu nhập thêm pin mới</option>
                      <option value="Khác">Yêu cầu khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Nội dung chi tiết</label>
                    <textarea
                      rows={4}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-sm text-gray-850 dark:text-white outline-none focus:border-blue-500"
                      value={supportForm.message}
                      onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                      placeholder="Mô tả chi tiết tình huống lỗi, mã lỗi tủ sạc hoặc mã số pin nếu có..."
                      required
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                    >
                      Gửi yêu cầu
                    </button>
                  </div>
                </form>

                {/* Thông tin hỗ trợ nhanh */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 border-b pb-2 dark:border-gray-700">Liên hệ khẩn cấp</h4>
                  <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-150 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Đường dây nóng kỹ thuật 24/7</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">1900 6868 (Bấm phím 2)</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Đội phản ứng nhanh cứu hộ pin</p>
                      <p className="text-sm font-bold text-gray-850 dark:text-white">0909.123.456 (Mr. Bình)</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email kỹ thuật viên</p>
                      <p className="text-sm font-semibold text-gray-750 dark:text-gray-300">tech-support@evcharge.com</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h5 className="font-bold text-xs text-gray-650 dark:text-gray-350 uppercase tracking-wider mb-2">Quy trình xử lý khẩn cấp</h5>
                    <ul className="text-xs text-gray-500 dark:text-gray-400 list-disc pl-4 space-y-1">
                      <li>Nếu pin phát nhiệt hoặc bốc khói, ngay lập tức nhấn nút dừng khẩn cấp tại trạm sạc và sơ tán.</li>
                      <li>Với tủ sạc mất kết nối, kiểm tra lại nguồn điện đầu vào trước khi báo lỗi cho trung tâm.</li>
                      <li>Khách hàng không thể trả pin: hỗ trợ thực hiện đổi pin thủ công qua app.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
