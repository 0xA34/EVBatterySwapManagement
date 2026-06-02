import React, { useState, useEffect } from "react";
import { MegaphoneIcon } from "../../icons";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function GeneralNotifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("ALL_USERS");
  const [specificUserIds, setSpecificUserIds] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchNotifications = async () => {
    try {
      // Fetching past notifications
      const response = await fetch("/api/admin/notifications?page=0&size=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.content && Array.isArray(data.content)) {
          setNotifications(data.content);
        } else if (Array.isArray(data)) {
          setNotifications(data);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSendLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload: any = {
        title,
        message,
        targetAudience,
      };

      if (targetAudience === "SPECIFIC_USERS") {
        const ids = specificUserIds
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));
        payload.specificUserIds = ids;
      }

      const response = await fetch("/api/admin/notifications/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccessMsg("Gửi thông báo thành công!");
        setTitle("");
        setMessage("");
        fetchNotifications();
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error("Lỗi từ server:", errData);
        setErrorMsg(`Gửi thông báo thất bại (${response.status}): ${errData.message || errData.error || 'Lỗi không xác định'}`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Lỗi kết nối: ${err.message}`);
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Thông báo chung | EV Battery Admin"
        description="Quản lý và gửi thông báo chung cho người dùng"
      />
      <PageBreadcrumb pageTitle="Thông báo chung" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
              <MegaphoneIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Gửi thông báo mới
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gửi thông báo tùy chỉnh đến tất cả người dùng trong hệ thống
              </p>
            </div>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-4 max-w-3xl">
            {successMsg && (
              <div className="p-4 rounded-lg bg-success-50 text-success-600 border border-success-200 dark:bg-success-500/10 dark:border-success-500/20 dark:text-success-500">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-4 rounded-lg bg-error-50 text-error-600 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20 dark:text-error-500">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Đối tượng nhận thông báo <span className="text-error-500">*</span>
              </label>
              <select
                value={targetAudience}
                onChange={(e) => {
                  setTargetAudience(e.target.value);
                  if (e.target.value === "SPECIFIC_USERS") {
                    setShowUserModal(true);
                  }
                }}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="ALL_USERS">Tất cả người dùng</option>
                <option value="ALL_ADMINS">Tất cả Quản trị viên</option>
                <option value="ALL_STAFF">Tất cả Nhân viên trạm</option>
                <option value="ALL_DRIVERS">Tất cả Tài xế</option>
                <option value="SPECIFIC_USERS">Người dùng cụ thể</option>
              </select>
              {targetAudience === "SPECIFIC_USERS" && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Đã nhập ID: {specificUserIds || "(Chưa nhập)"}{" "}
                  <button
                    type="button"
                    onClick={() => setShowUserModal(true)}
                    className="text-brand-500 hover:underline font-medium ml-2"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Tiêu đề thông báo <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề thông báo..."
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Nội dung thông báo <span className="text-error-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Nhập nội dung chi tiết..."
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
                required
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sendLoading}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition"
              >
                {sendLoading ? "Đang gửi..." : "Phát thông báo"}
                {!sendLoading && <MegaphoneIcon className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>

        {/* Lịch sử thông báo (nếu có) */}
        {notifications.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Lịch sử thông báo
            </h3>
            <div className="space-y-3">
              {notifications.map((notif, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{notif.title || 'Không có tiêu đề'}</h4>
                    {notif.createdAt && (
                      <span className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleString()}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Popup nhập ID người dùng cụ thể */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Nhập ID người dùng
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Nhập ID của người dùng mà bạn muốn gửi thông báo (có thể nhập nhiều ID, cách nhau bởi dấu phẩy).
              </p>
              <input
                type="text"
                value={specificUserIds}
                onChange={(e) => setSpecificUserIds(e.target.value)}
                placeholder="Ví dụ: 1, 2, 5"
                className="mb-6 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
