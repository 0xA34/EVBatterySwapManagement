import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

type User = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  walletBalance: number;
  role: string;
  status: string;
};

export default function UserManagement() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchIdInput, setSearchIdInput] = useState("");
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [currentSearchId, setCurrentSearchId] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "DRIVER",
    status: "ACTIVE",
    password: ""
  });

  const fetchUsers = async (page: number = 0, keyword: string = "", searchId: string = "") => {
    setIsLoading(true);
    setError("");
    try {
      if (searchId.trim()) {
        const response = await fetch(`/api/admin/users/${searchId.trim()}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          if (response.status === 404) {
            setUsers([]);
            setTotalPages(1);
            setCurrentPage(0);
            return;
          }
          throw new Error("Không thể tải người dùng với ID này");
        }
        const data = await response.json();
        setUsers([data]);
        setTotalPages(1);
        setCurrentPage(0);
      } else {
        const url = keyword.trim() 
          ? `/api/admin/users/search?username=${encodeURIComponent(keyword)}&page=${page}&size=15`
          : `/api/admin/users?page=${page}&size=15&search=`;
          
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Không thể tải danh sách người dùng");
        }
        const data = await response.json();
        setUsers(data.content || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.number || 0);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers(currentPage, currentKeyword, currentSearchId);
    }
  }, [token, currentPage, currentKeyword, currentSearchId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentSearchId(searchIdInput);
    setCurrentKeyword(searchInput);
    setCurrentPage(0);
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "DRIVER",
        status: user.status || "ACTIVE",
        password: ""
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        role: "DRIVER",
        status: "ACTIVE",
        password: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingUser 
      ? `/api/admin/users/${editingUser.id}`
      : `/api/admin/users`;
    
    const method = editingUser ? "PUT" : "POST";

    const payload = { ...formData };
    if (editingUser) {
      delete (payload as any).username;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Lỗi khi lưu người dùng");
      }
      
      handleCloseModal();
      fetchUsers(currentPage, currentKeyword, currentSearchId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const response = await fetch(`/api/admin/users/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error("Lỗi khi xóa người dùng");
        }
        
        fetchUsers(currentPage, currentKeyword, currentSearchId);
      } catch (err: any) {
        alert(err.message);
      }
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Danh sách người dùng {isLoading && <span className="text-sm font-normal text-gray-500">(Đang tải...)</span>}
          </h2>
          <div className="flex flex-wrap gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                type="number" 
                placeholder="ID..."
                value={searchIdInput}
                onChange={(e) => setSearchIdInput(e.target.value)}
                className="w-24 sm:w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <input 
                type="text" 
                placeholder="Từ khóa..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-32 sm:w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <button 
                type="submit" 
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Tìm
              </button>
            </form>
            <button 
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium whitespace-nowrap"
            >
              + Thêm người dùng
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <ComponentCard title="Danh sách Khách hàng & Nhân viên">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Họ Tên
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Email
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Số Điện Thoại
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Vai Trò
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4 text-sm text-gray-800 dark:text-white font-medium">{user.fullName || user.username}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email || "-"}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{user.phoneNumber || "-"}</td>
                    <td className="px-5 py-4 text-sm">
                      {user.role === "DRIVER" ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                          Khách hàng (Driver)
                        </span>
                      ) : user.role === "ADMIN" ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 dark:bg-red-500/20 dark:text-red-300">
                          Quản trị viên
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 dark:bg-purple-500/20 dark:text-purple-300">
                          Nhân viên trạm
                        </span>
                      )}
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

                {users.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                      Chưa có dữ liệu người dùng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 px-5 border-t border-gray-100 dark:border-gray-800 pt-4 pb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1 rounded border border-gray-200 text-sm font-medium disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1 rounded border border-gray-200 text-sm font-medium disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên đăng nhập
                  </label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mật khẩu {editingUser && <span className="text-xs text-gray-400 font-normal">(Bỏ trống để giữ nguyên)</span>}
                  </label>
                  <input 
                    type="password" 
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Họ tên
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số điện thoại
                </label>
                <input 
                  type="text" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vai trò
                  </label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="DRIVER">Khách hàng</option>
                    <option value="STAFF">Nhân viên trạm</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái
                  </label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Vô hiệu hóa</option>
                  </select>
                </div>
              </div>


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
