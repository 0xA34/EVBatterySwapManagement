import { useState, useEffect, useRef } from "react";
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

interface SearchableMultiSelectProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  options: { id: number; name: string }[];
  placeholder: string;
}

function SearchableMultiSelect({
  selectedIds,
  onChange,
  options,
  placeholder
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(item => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemove = (id: number) => {
    onChange(selectedIds.filter(item => item !== id));
  };

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] w-full flex flex-wrap gap-2 items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 focus-within:border-brand-500 focus-within:outline-none dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
      >
        {selectedIds.length > 0 ? (
          selectedIds.map(id => {
            const opt = options.find(o => o.id === id);
            if (!opt) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
              >
                {opt.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(id);
                  }}
                  className="hover:text-brand-800 dark:hover:text-brand-300 font-bold focus:outline-none"
                >
                  &times;
                </button>
              </span>
            );
          })
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500 select-none">
            {placeholder}
          </span>
        )}
        
        <div className="ml-auto flex items-center pr-1 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-700 max-h-44 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
            <input
              type="text"
              placeholder="Gõ để tìm kiếm trạm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <ul className="flex-1 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <li
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex justify-between items-center ${isSelected ? "bg-brand-50 dark:bg-brand-500/10 font-semibold text-brand-600 dark:text-brand-400" : ""}`}
                  >
                    <span>{option.name}</span>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-brand-600 dark:text-brand-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 text-center select-none">
                Không tìm thấy trạm nào.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

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
  const [activeStations, setActiveStations] = useState<{ id: number; name: string }[]>([]);
  const [staffStationsMap, setStaffStationsMap] = useState<Record<number, string[]>>({});

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "DRIVER",
    status: "ACTIVE",
    password: "",
    stationIds: [] as number[]
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
          fetch("/api/admin/users/count?type=status", {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch("/api/admin/users/count?type=role", {
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

      const fetchStations = async () => {
        try {
          const countRes = await fetch("/api/admin/stations/statusCount", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          let activeSize = 21;
          if (countRes.ok) {
            const counts = await countRes.json();
            const activeObj = counts.find((c: any) => c.status === "ACTIVE");
            if (activeObj) {
              activeSize = activeObj.count;
            }
          }

          const stationsRes = await fetch(`/api/admin/stations?page=0&size=${activeSize}&status=ACTIVE`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (stationsRes.ok) {
            const data = await stationsRes.json();
            const list = data.content || data.data || [];
            const mapped = list.map((item: any) => ({
              id: item.id,
              name: item.name
            }));
            setActiveStations(mapped);
          }
        } catch (err) {
          console.error("Lỗi khi tải danh sách trạm hoạt động:", err);
        }
      };
      fetchStations();
    }
  }, [token]);

  useEffect(() => {
    const fetchStaffStations = async () => {
      const staffUsers = users.filter(u => u.role === "STAFF");
      if (staffUsers.length === 0) return;

      const newMap = { ...staffStationsMap };
      let updated = false;

      await Promise.all(
        staffUsers.map(async (user) => {
          if (newMap[user.id] !== undefined) return;
          try {
            const res = await fetch(`/api/admin/staffs/staffs/${user.id}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              newMap[user.id] = (data.stations || []).map((s: any) => s.name);
              updated = true;
            }
          } catch (err) {
            console.error("Lỗi khi tải trạm của staff:", err);
          }
        })
      );

      if (updated) {
        setStaffStationsMap(newMap);
      }
    };

    if (token && users.length > 0) {
      fetchStaffStations();
    }
  }, [users, token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentSearchId(searchIdInput);
    setCurrentKeyword(searchInput);
    setCurrentSearchRole(searchRole);
    setCurrentSearchStatus(searchStatus);
    setCurrentPage(0);
  };

  const handleOpenModal = async (user?: User) => {
    if (user) {
      let initialStationIds: number[] = [];
      if (user.role === "STAFF") {
        try {
          const detailRes = await fetch(`/api/admin/staffs/staffs/${user.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (detailRes.ok) {
            const staffDetail = await detailRes.json();
            initialStationIds = (staffDetail.stations || []).map((s: any) => s.id);
          }
        } catch (err) {
          console.error("Lỗi khi tải chi tiết nhân viên:", err);
        }
      }

      setEditingUser(user);
      setFormData({
        username: user.username,
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "DRIVER",
        status: user.status || "ACTIVE",
        password: "",
        stationIds: initialStationIds
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
        password: "",
        stationIds: []
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
    
    if (editingUser) {
      // UPDATE USER
      const userUrl = `/api/admin/users/${editingUser.id}`;
      const payload = { 
        fullName: formData.fullName,
        email: formData.email?.trim() ? formData.email.trim() : null,
        phoneNumber: formData.phoneNumber?.trim() ? formData.phoneNumber.trim() : null,
        role: formData.role,
        status: formData.status,
        password: formData.password || undefined
      };

      try {
        const response = await fetch(userUrl, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error || "Lỗi khi cập nhật người dùng");
        }

        // If the role is STAFF, we also update stations
        if (formData.role === "STAFF") {
          const stationRes = await fetch(`/api/admin/staffs/staffs/${editingUser.id}/stations`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ stationIds: formData.stationIds })
          });
          if (!stationRes.ok) {
            const errData = await stationRes.json().catch(() => null);
            throw new Error(errData?.error || "Lỗi khi cập nhật danh sách trạm quản lý");
          }
          
          // Update local staffStationsMap immediately
          const stationNames = activeStations
            .filter(s => formData.stationIds.includes(s.id))
            .map(s => s.name);
          setStaffStationsMap(prev => ({
            ...prev,
            [editingUser.id]: stationNames
          }));
        } else {
          // If the role was STAFF but changed to something else, clear their stations
          if (editingUser.role === "STAFF") {
            await fetch(`/api/admin/staffs/staffs/${editingUser.id}/stations`, {
              method: "PUT",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ stationIds: [] })
            });
          }
        }

        handleCloseModal();
        fetchUsers(currentPage, currentKeyword, currentSearchId, currentSearchRole, currentSearchStatus);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      // CREATE USER
      try {
        let response;
        if (formData.role === "STAFF") {
          response = await fetch("/api/admin/staffs/staffs", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username: formData.username,
              fullName: formData.fullName,
              email: formData.email?.trim() ? formData.email.trim() : null,
              phoneNumber: formData.phoneNumber?.trim() ? formData.phoneNumber.trim() : null,
              password: formData.password,
              status: formData.status,
              stationIds: formData.stationIds
            })
          });
        } else {
          response = await fetch("/api/admin/users", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username: formData.username,
              fullName: formData.fullName,
              email: formData.email?.trim() ? formData.email.trim() : null,
              phoneNumber: formData.phoneNumber?.trim() ? formData.phoneNumber.trim() : null,
              password: formData.password,
              role: formData.role,
              status: formData.status
            })
          });
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error || "Lỗi khi lưu người dùng");
        }

        handleCloseModal();
        fetchUsers(currentPage, currentKeyword, currentSearchId, currentSearchRole, currentSearchStatus);
      } catch (err: any) {
        alert(err.message);
      }
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
        {/* Summary Stats Grid - Standalone cards directly on page */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {/* Admin Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Quản trị viên</p>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.role_ADMIN || 0}</h3>
          </div>
          
          {/* Staff Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nhân viên trạm</p>
            <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.role_STAFF || 0}</h3>
          </div>

          {/* Driver Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Khách hàng</p>
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.role_DRIVER || 0}</h3>
          </div>

          {/* Active Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Hoạt động</p>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.status_ACTIVE || 0}</h3>
          </div>

          {/* Banned Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Vô hiệu hóa</p>
            <h3 className="text-2xl font-bold text-gray-500 dark:text-gray-400">{stats.status_BANNED || 0}</h3>
          </div>

          {/* Checkpoint Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Chờ phê duyệt</p>
            <h3 className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">{stats.status_CHECKPOINT || 0}</h3>
          </div>
        </div>

        {/* Filter and Search Panel - Separated premium card */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Danh sách người dùng {isLoading && <span className="text-sm font-normal text-gray-400">(Đang tải...)</span>}
              </h2>
              <button 
                type="button"
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer"
              >
                + Thêm người dùng
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center justify-start w-full">
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
              
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden lg:block"></div>
              
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
              
              <div className="flex gap-2 lg:ml-auto">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-semibold cursor-pointer"
                >
                  Tìm Kiếm
                </button>
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
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                  title="Làm mới"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
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
                    Trạm Quản Lý
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
                      {user.role === "STAFF" ? (
                        staffStationsMap[user.id] && staffStationsMap[user.id].length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px] whitespace-normal">
                            {staffStationsMap[user.id].map((name, idx) => (
                              <span key={idx} className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                                {name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs italic">Chưa gán trạm</span>
                        )
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">-</span>
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

              {formData.role === "STAFF" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Trạm đổi pin quản lý
                  </label>
                  <SearchableMultiSelect
                    selectedIds={formData.stationIds}
                    onChange={(ids) => setFormData({ ...formData, stationIds: ids })}
                    options={activeStations}
                    placeholder="Tìm kiếm và chọn trạm..."
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
