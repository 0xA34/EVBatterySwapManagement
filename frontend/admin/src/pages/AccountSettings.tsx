import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import { useState } from "react";

export default function AccountSettings() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    // Clear error when typing
    if (error) setError("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("Vui lòng điền đầy đủ các trường mật khẩu!");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không trùng khớp!");
      return;
    }

    console.log("Saving password", passwordData);
    alert("Thay đổi mật khẩu thành công!");
    setError("");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  return (
    <>
      <PageMeta
        title="Account Settings | EV Battery Admin"
        description="Account settings page"
      />
      <PageBreadcrumb pageTitle="Cài Đặt Tài Khoản" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-7.5">
        <ComponentCard title="Bảo mật & Mật khẩu">
          <form onSubmit={handleSave} className="flex flex-col gap-5 p-5">
            <div>
              <Label>Mật khẩu hiện tại</Label>
              <Input 
                type="password" 
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu hiện tại" 
              />
            </div>
            <div>
              <Label>Mật khẩu mới</Label>
              <Input 
                type="password" 
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới" 
              />
            </div>
            <div>
              <Label>Xác nhận mật khẩu mới</Label>
              <Input 
                type="password" 
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới" 
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-red-500 dark:text-red-400 mt-1">
                {error}
              </p>
            )}
            <div className="flex justify-end mt-4">
              <Button>Lưu Thay Đổi</Button>
            </div>
          </form>
        </ComponentCard>
        
        <ComponentCard title="Tùy chọn thông báo">
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-800 dark:text-white">Email thông báo hệ thống</h5>
                <p className="text-sm text-gray-500">Nhận email khi có lỗi từ trạm sạc</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <h5 className="font-medium text-gray-800 dark:text-white">Cảnh báo SMS</h5>
                <p className="text-sm text-gray-500">Nhận tin nhắn SMS khẩn cấp</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
              </label>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
