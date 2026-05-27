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
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchIdInput, setSearchIdInput] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [currentSearchId, setCurrentSearchId] = useState("");
  const [currentSearchRole, setCurrentSearchRole] = useState("");
  const [currentSearchStatus, setCurrentSearchStatus] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<Record<string, number>>({});

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "DRIVER",
    status: "ACTIVE",
    password: ""
  });

  const fetchUsers = async (
    page: number = 0,
    keyword: string = "",
    searchId: string = "",
    roleFilter: string = "",
    statusFilter: string = ""
  ) => {
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
        let url = `/api/admin/users/getListUsers?page=${page}&size=${pageSize}`;
        if (keyword.trim()) {
          url += `&keyword=${encodeURIComponent(keyword.trim())}`;
        }
        if (roleFilter) {
          url += `&role=${encodeURIComponent(roleFilter)}`;
        }
        if (statusFilter) {
          url += `&status=${encodeURIComponent(statusFilter)}`;
        }
          
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
        setTotalPages(data.page ? data.page.totalPages : (data.totalPages || 1));
        setCurrentPage(data.page ? data.page.number : (data.number || 0));
      }

      // Tải thống kê số lượng người dùng theo Trạng thái & Vai trò
      try {
        const [statusRes, roleRes] = await Promise.all([
          fetch("/api/admin/users/countUserByStatus", {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("/api/admin/users/countUserByRole", {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        const newStats: Record<string, number> = {};

        if (statusRes.ok) {
          const statusData: { status: string; count: number }[] = await statusRes.json();
          statusData.forEach(item => {
            newStats[`status_${item.status}`] = item.count;
          });
        }

        if (roleRes.ok) {
          const roleData: { role: string; count: number }[] = await roleRes.json();
          roleData.forEach(item => {
            newStats[`role_${item.role}`] = item.count;
          });
        }

        setStats(newStats);
      } catch (err) {
        console.error("Lỗi khi tải thống kê:", err);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers(currentPage, currentKeyword, currentSearchId, currentSearchRole, currentSearchStatus);
    }
  }, [token, currentPage, currentKeyword, currentSearchId, currentSearchRole, currentSearchStatus, pageSize]);

  useEffect(() => {
    if (token) {
      fetch("/api/admin/users/role", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setRoles(data))
      .catch(err => console.error("Lỗi khi tải danh sách vai trò:", err));

      fetch("/api/admin/users/status", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setStatuses(data))
      .catch(err => console.error("Lỗi khi tải danh sách trạng thái:", err));
    }
  }, [token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentSearchId(searchIdInput);
    setCurrentKeyword(searchInput);
    setCurrentSearchRole(searchRole);
    setCurrentSearchStatus(searchStatus);
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
      fetchUsers(currentPage, currentKeyword, currentSearchId, currentSearchRole, currentSearchStatus);
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
        
        fetchUsers(currentPage, currentKeyword, currentSearchId, currentSearchRole, currentSearchStatus);
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Danh sách người dùng {isLoading && <span className="text-sm font-normal text-gray-500">(Đang tải...)</span>}
            </h2>
            <button 
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium whitespace-nowrap"
            >
              + Thêm người dùng
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div className="flex flex-col gap-3 w-full xl:flex-1 xl:max-w-3xl">
              {/* Row 1: Vai trò */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="px-4 py-2.5 rounded-lg text-sm font-medium flex justify-between gap-4 items-center bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/10">
                  <span className="whitespace-nowrap">Quản trị viên</span>
                  <span className="font-bold text-base">{stats.role_ADMIN || 0}</span>
                </div>
                <div className="px-4 py-2.5 rounded-lg text-sm font-medium flex justify-between gap-4 items-center bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/10">
                  <span className="whitespace-nowrap">Nhân viên trạm</span>
                  <span className="font-bold text-base">{stats.role_STAFF || 0}</span>
                </div>
                <div className="px-4 py-2.5 rounded-lg text-sm font-medium flex justify-between gap-4 items-center bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/10">
                  <span className="whitespace-nowrap">Khách hàng</span>
                  <span className="font-bold text-base">{stats.role_DRIVER || 0}</span>
                </div>
              </div>
              {/* Row 2: Trạng thái */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="px-4 py-2.5 rounded-lg text-sm font-medium flex justify-between gap-4 items-center bg-green-50 text-green-700 border border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/10">
                  <span className="whitespace-nowrap">Hoạt động</span>
                  <span className="font-bold text-base">{stats.status_ACTIVE || 0}</span>
                </div>
                <div className="px-4 py-2.5 rounded-lg text-sm font-medium flex justify-between gap-4 items-center bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/10">
                  <span className="whitespace-nowrap">Vô hiệu hóa</span>
                  <span className="font-bold text-base">{stats.status_BANNED || 0}</span>
                </div>
                <div className="px-4 py-2.5 rounded-lg text-sm font-medium flex justify-between gap-4 items-center bg-yellow-50 text-yellow-700 border border-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/10">
                  <span className="whitespace-nowrap">Chờ phê duyệt</span>
                  <span className="font-bold text-base">{stats.status_CHECKPOINT || 0}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-3 w-full xl:w-fit xl:ml-auto ml-auto">
              <div className="flex flex-wrap gap-3 items-center justify-start xl:justify-end">
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
                  className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                >
                  Tìm
                </button>
              </div>
              <div className="flex flex-wrap gap-3 items-center justify-start">
                <select
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  className="w-32 sm:w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Tất cả vai trò</option>
                  {Object.entries(roles).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="w-32 sm:w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Tất cả trạng thái</option>
                  {Object.entries(statuses).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setSearchIdInput("");
                    setSearchInput("");
                    setSearchRole("");
                    setSearchStatus("");
                    setCurrentSearchId("");
                    setCurrentKeyword("");
                    setCurrentSearchRole("");
                    setCurrentSearchStatus("");
                    setCurrentPage(0);
                  }}
                  className="px-4 py-2 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  title="Làm mới"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              </div>
            </form>
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
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white w-20">
                    ID
                  </th>
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
                    Trạng Thái
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium text-left">
                      #{user.id}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-800 dark:text-white font-medium">{user.fullName || user.username}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email || "-"}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{user.phoneNumber || "-"}</td>
                    <td className="px-5 py-4 text-sm">
                      {user.role === "DRIVER" ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                          Khách hàng 
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
                      {user.status === "ACTIVE" ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-500/20 dark:text-green-300">
                          {statuses[user.status] || "Đang Hoạt Động"}
                        </span>
                      ) : (user.status === "BANNED" || user.status === "INACTIVE") ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 dark:bg-red-500/20 dark:text-red-300">
                          {statuses[user.status] || "Vô Hiệu Hóa"}
                        </span>
                      ) : (user.status === "CHECKPOINT" || user.status === "PENDING") ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300">
                          {statuses[user.status] || "Chờ Phê Duyệt"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 dark:bg-gray-500/20 dark:text-gray-300">
                          {statuses[user.status] || user.status}
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
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                      Chưa có dữ liệu người dùng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {(totalPages > 1 || users.length > 0) && (
            <div className="flex justify-between items-center mt-6 px-5 border-t border-gray-100 dark:border-gray-800 pt-4 pb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="10">10 / trang</option>
                  <option value="20">20 / trang</option>
                  <option value="50">50 / trang</option>
                  <option value="100">100 / trang</option>
                </select>
              </div>
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
                    {Object.entries(roles).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
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
                    {Object.entries(statuses).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
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
