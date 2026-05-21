import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

type UserRole = "Khách hàng" | "Nhân viên trạm";

type User = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  stationId?: string; // Tên trạm trực thuộc nếu là nhân viên
};

const initialUsers: User[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    role: "Khách hàng"
  },
  {
    id: "2",
    name: "Trần Thị B",
    phone: "0987654321",
    role: "Nhân viên trạm",
    stationId: "Trạm Q1 - Nguyễn Huệ"
  }
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "Khách hàng" as UserRole,
    stationId: ""
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        phone: user.phone,
        role: user.role,
        stationId: user.stationId || ""
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        phone: "",
        role: "Khách hàng",
        stationId: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...editingUser, ...formData, stationId: formData.role === "Nhân viên trạm" ? formData.stationId : undefined }
          : u
      ));
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        stationId: formData.role === "Nhân viên trạm" ? formData.stationId : undefined
      };
      setUsers([...users, newUser]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <>
      <PageMeta
        title="Quản Lý Người Dùng | EV Battery Swap"
        description="Quản lý khách hàng và phân quyền nhân viên trạm"
      />
      <PageBreadcrumb pageTitle="Quản Lý Người Dùng" />

      <div className="space-y-6">
        <div className="flex justify-end">
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            + Thêm người dùng
          </button>
        </div>

        <ComponentCard title="Danh sách Khách hàng & Nhân viên">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Họ Tên
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Số Điện Thoại
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Vai Trò
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Trạm Trực Thuộc
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4 text-sm text-gray-800 dark:text-white font-medium">{user.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{user.phone}</td>
                    <td className="px-5 py-4 text-sm">
                      {user.role === "Khách hàng" ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                          Khách hàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 dark:bg-purple-500/20 dark:text-purple-300">
                          Nhân viên trạm
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.role === "Nhân viên trạm" ? user.stationId : "-"}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 font-medium mr-3"
                      >
                        Chỉnh sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-error hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                      Chưa có dữ liệu người dùng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {editingUser ? "Chỉnh sửa Người Dùng" : "Thêm Người Dùng"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Họ tên
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số điện thoại
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vai trò
                </label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="Khách hàng">Khách hàng</option>
                  <option value="Nhân viên trạm">Nhân viên trạm</option>
                </select>
              </div>

              {formData.role === "Nhân viên trạm" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạm trực thuộc
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.stationId}
                    onChange={(e) => setFormData({...formData, stationId: e.target.value})}
                    placeholder="VD: Trạm Q1"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
