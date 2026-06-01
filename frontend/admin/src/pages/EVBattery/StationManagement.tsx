import { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { useAuth } from "../../context/AuthContext";

type StationStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

type Station = {
  id: number;
  name: string;
  address: string;
  quanId?: number;
  quanName?: string;
  provinceId?: number;
  provinceName?: string;
  phuongxaId?: number;
  phuongxaName?: string;
  status: StationStatus;
  createdAt?: string;
  updatedAt?: string;
};

type Province = { id: number; tinhthanhcol: string; bienso: string; count_station?: number };
type District = { id: number; tenquanhuyen: string; count_station?: number };
type Ward = { id: number; tenphuongxa: string; count_station?: number };

interface DropdownOption {
  value: number;
  label: string;
}

interface CustomSelectProps {
  value: number;
  onChange: (val: number) => void;
  options: DropdownOption[];
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
  className = ""
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center rounded-lg border border-gray-300 ${
          className.includes("w-full") ? "px-4" : "px-3"
        } py-2 text-sm text-left bg-white focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-50 select-none cursor-pointer`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <select
        required={required}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        tabIndex={-1}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 top-full mt-1 min-w-full w-max max-w-[320px] bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-700 max-h-60 overflow-y-auto">
          <ul className="py-1">
            <li
              onClick={() => {
                onChange(0);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${value === 0 ? "bg-gray-50 dark:bg-gray-800 font-semibold" : ""}`}
            >
              {placeholder}
            </li>
            {options.map(option => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${value === option.value ? "bg-gray-50 dark:bg-gray-800 font-semibold text-brand-600 dark:text-brand-400" : ""}`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function StationManagement() {
  const { token } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [searchIdInput, setSearchIdInput] = useState("");
  const [currentSearchId, setCurrentSearchId] = useState("");

  const [searchProvince, setSearchProvince] = useState<number>(0);
  const [searchDistrict, setSearchDistrict] = useState<number>(0);
  const [searchWard, setSearchWard] = useState<number>(0);
  const [currentSearchProvince, setCurrentSearchProvince] = useState<number>(0);
  const [currentSearchDistrict, setCurrentSearchDistrict] = useState<number>(0);
  const [currentSearchWard, setCurrentSearchWard] = useState<number>(0);
  const [searchStatus, setSearchStatus] = useState<string>("");
  const [currentSearchStatus, setCurrentSearchStatus] = useState<string>("");
  const [searchDistricts, setSearchDistricts] = useState<District[]>([]);
  const [statusCounts, setStatusCounts] = useState<{status: string, count: number}[]>([]);
  const [searchWards, setSearchWards] = useState<Ward[]>([]);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    quan: 0,
    province: 0,
    phuongxa: 0,
    status: "ACTIVE" as StationStatus
  });

  // Column Visibility States
  type ColumnKey = "id" | "name" | "address" | "location" | "status" | "actions";

  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    id: true,
    name: true,
    address: true,
    location: true,
    status: true,
    actions: true,
  });

  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const columnDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target as Node)) {
        setIsColumnDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const columnsList: { key: ColumnKey; label: string }[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Tên Trạm" },
    { key: "address", label: "Địa Điểm" },
    { key: "location", label: "Khu Vực" },
    { key: "status", label: "Tình Trạng" },
    { key: "actions", label: "Hành Động" },
  ];

  const activeColumnsCount = Object.values(visibleColumns).filter(Boolean).length;

  const fetchStations = async (
    page: number = 0, 
    keyword: string = "", 
    searchId: string = "",
    province: number = 0,
    district: number = 0,
    ward: number = 0,
    status: string = ""
  ) => {
    setIsLoading(true);
    setError("");
    try {
      if (searchId.trim()) {
        const response = await fetch(`/api/admin/stations/${searchId.trim()}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Không tìm thấy trạm với ID này");
          }
          throw new Error("Lỗi khi tìm kiếm trạm");
        }
        const data = await response.json();
        setStations([data]);
        setTotalPages(1);
        setCurrentPage(0);
      } else {
        let url = `/api/admin/stations?page=${page}&size=${pageSize}`;
        if (keyword.trim()) url += `&keyword=${encodeURIComponent(keyword.trim())}`;
        if (province > 0) url += `&province=${province}`;
        if (district > 0) url += `&quan=${district}`;
        if (ward > 0) url += `&phuongxa=${ward}`;
        if (status) url += `&status=${status}`;
          
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Lỗi khi tải danh sách trạm");
        }
        const data = await response.json();
        setStations(data.content || []);
        setTotalPages(data.page ? data.page.totalPages : (data.totalPages || 1));
      }

      try {
        const countRes = await fetch(`/api/admin/stations/statusCount`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (countRes.ok) {
          const countData = await countRes.json();
          setStatusCounts(countData);
        }
      } catch (e) {
        console.error("Lỗi khi tải thống kê trạng thái:", e);
      }
    } catch (err: any) {
      setError(err.message);
      setStations([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStations(currentPage, currentKeyword, currentSearchId, currentSearchProvince, currentSearchDistrict, currentSearchWard, currentSearchStatus);
    }
  }, [token, currentPage, currentKeyword, currentSearchId, currentSearchProvince, currentSearchDistrict, currentSearchWard, currentSearchStatus, pageSize]);

  useEffect(() => {
    if (searchProvince && token) {
      fetch(`/api/donvihanhchinh/quanHuyenCount?idTinhThanh=${searchProvince}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
          setSearchDistricts(arr);
        })
        .catch(err => console.error(err));
    } else {
      setSearchDistricts([]);
    }
  }, [searchProvince, token]);

  useEffect(() => {
    if (searchDistrict && token) {
      fetch(`/api/donvihanhchinh/phuongXaCount?idQuanHuyen=${searchDistrict}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
          setSearchWards(arr);
        })
        .catch(err => console.error(err));
    } else {
      setSearchWards([]);
    }
  }, [searchDistrict, token]);

  useEffect(() => {
    if (token) {
      fetch('/api/donvihanhchinh/tinhThanhCount', {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
          setProvinces(arr);
        })
        .catch(err => console.error(err));
    }
  }, [token]);

  useEffect(() => {
    if (formData.province && token) {
      fetch(`/api/donvihanhchinh/quanHuyenCount?idTinhThanh=${formData.province}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
          setDistricts(arr);
        })
        .catch(err => console.error(err));
    } else {
      setDistricts([]);
    }
  }, [formData.province, token]);

  useEffect(() => {
    if (formData.quan && token) {
      fetch(`/api/donvihanhchinh/phuongXaCount?idQuanHuyen=${formData.quan}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
          setWards(arr);
        })
        .catch(err => console.error(err));
    } else {
      setWards([]);
    }
  }, [formData.quan, token]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-200 text-green-700 font-semibold dark:bg-green-500/30 dark:text-green-400";
      case "INACTIVE":
        return "bg-yellow-200 text-yellow-700 font-semibold dark:bg-yellow-500/30 dark:text-yellow-400";
      case "MAINTENANCE":
        return "bg-red-200 text-red-700 font-semibold dark:bg-red-500/30 dark:text-red-400";
      case "DEPLOYING":
        return "bg-blue-200 text-blue-700 font-semibold dark:bg-blue-500/30 dark:text-blue-400";
      default:
        return "bg-gray-200 text-gray-700 font-semibold dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Hoạt động";
      case "INACTIVE": return "Ngừng hoạt động";
      case "MAINTENANCE": return "Bảo trì";
      case "DEPLOYING": return "Đang triển khai";
      default: return status;
    }
  };

  const handleOpenModal = async (station?: Station) => {
    if (station) {
      try {
        const response = await fetch(`/api/admin/stations/${station.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const detailData = await response.json();
          setEditingStation(detailData);
          setFormData({
            name: detailData.name,
            address: detailData.address || "",
            quan: detailData.quanId || 0,
            province: detailData.provinceId || 0,
            phuongxa: detailData.phuongxaId || 0,
            status: detailData.status
          });
        } else {
          throw new Error("Cannot fetch station detail");
        }
      } catch (err) {
        setEditingStation(station);
        setFormData({
          name: station.name,
          address: station.address || "",
          quan: station.quanId || 0,
          province: station.provinceId || 0,
          phuongxa: station.phuongxaId || 0,
          status: station.status
        });
      }
    } else {
      setEditingStation(null);
      setFormData({
        name: "",
        address: "",
        quan: 0,
        province: 0,
        phuongxa: 0,
        status: "ACTIVE"
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingStation 
      ? `/api/admin/stations/${editingStation.id}`
      : `/api/admin/stations`;
    
    const method = editingStation ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error("Lỗi khi lưu trạm");
      }
      
      handleCloseModal();
      fetchStations(currentPage, currentKeyword, currentSearchId, currentSearchProvince, currentSearchDistrict, currentSearchWard, currentSearchStatus);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa trạm này không?")) {
      try {
        const response = await fetch(`/api/admin/stations/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error("Lỗi khi xóa trạm");
        }
        
        fetchStations(currentPage, currentKeyword, currentSearchId, currentSearchProvince, currentSearchDistrict, currentSearchWard, currentSearchStatus);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentSearchId(searchIdInput);
    setCurrentKeyword(searchInput);
    setCurrentSearchProvince(searchProvince);
    setCurrentSearchDistrict(searchDistrict);
    setCurrentSearchWard(searchWard);
    setCurrentSearchStatus(searchStatus);
    setCurrentPage(0); 
  };

  return (
    <>
      <PageMeta
        title="Quản Lý Trạm Đổi Pin | ChargeX"
        description="Quản lý các trạm đổi pin, điều phối pin và xử lý khiếu nại"
      />
      <PageBreadcrumb pageTitle="Quản Lý Trạm Đổi Pin" />

      <div className="space-y-6">
        {/* Summary Stats Grid - Standalone cards directly on page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Total Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tổng số trạm</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {statusCounts.reduce((sum, c) => sum + c.count, 0)}
            </h3>
          </div>
          
          {/* Active Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Hoạt động</p>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
              {statusCounts.find(c => c.status === 'ACTIVE')?.count || 0}
            </h3>
          </div>

          {/* Inactive Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ngừng hoạt động</p>
            <h3 className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
              {statusCounts.find(c => c.status === 'INACTIVE')?.count || 0}
            </h3>
          </div>

          {/* Maintenance Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bảo trì</p>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
              {statusCounts.find(c => c.status === 'MAINTENANCE')?.count || 0}
            </h3>
          </div>

          {/* Deploying Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Đang triển khai</p>
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {statusCounts.find(c => c.status === 'DEPLOYING')?.count || 0}
            </h3>
          </div>
        </div>

        {/* Filter and Search Panel - Separated premium card */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Danh sách các trạm {isLoading && <span className="text-sm font-normal text-gray-500">(Đang tải...)</span>}
              </h2>
              <button 
                type="button"
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer"
              >
                + Thêm trạm mới
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center justify-start w-full">
              <input
                type="number"
                placeholder="ID trạm..."
                value={searchIdInput}
                onChange={(e) => setSearchIdInput(e.target.value)}
                className="w-24 sm:w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Từ khóa..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-32 sm:w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <select
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                className="w-32 sm:w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ngừng hoạt động</option>
                <option value="MAINTENANCE">Bảo trì</option>
                <option value="DEPLOYING">Đang triển khai</option>
              </select>
              
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden lg:block"></div>
              
              <CustomSelect
                value={searchProvince}
                onChange={(val) => {
                  setSearchProvince(val);
                  setSearchDistrict(0);
                  setSearchWard(0);
                }}
                options={(provinces || []).map(p => ({
                  value: p.id,
                  label: `${p.tinhthanhcol}${p.count_station !== undefined ? ` (${p.count_station})` : ""}`
                }))}
                placeholder="Tỉnh/Thành"
                className="w-32 sm:w-40"
              />
              <CustomSelect
                value={searchDistrict}
                onChange={(val) => {
                  setSearchDistrict(val);
                  setSearchWard(0);
                }}
                disabled={!searchProvince}
                options={(searchDistricts || []).map(d => ({
                  value: d.id,
                  label: `${d.tenquanhuyen}${d.count_station !== undefined ? ` (${d.count_station})` : ""}`
                }))}
                placeholder="Quận/Huyện"
                className="w-32 sm:w-40"
              />
              <CustomSelect
                value={searchWard}
                onChange={(val) => setSearchWard(val)}
                disabled={!searchDistrict}
                options={(searchWards || []).map(w => ({
                  value: w.id,
                  label: `${w.tenphuongxa}${w.count_station !== undefined ? ` (${w.count_station})` : ""}`
                }))}
                placeholder="Phường/Xã"
                className="w-32 sm:w-40"
              />
              
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
                    setSearchStatus("");
                    setSearchProvince(0);
                    setSearchDistrict(0);
                    setSearchWard(0);
                    setCurrentSearchId("");
                    setCurrentKeyword("");
                    setCurrentSearchStatus("");
                    setCurrentSearchProvince(0);
                    setCurrentSearchDistrict(0);
                    setCurrentSearchWard(0);
                    setCurrentPage(0);
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                  title="Làm mới"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>

                {/* Column Selector Dropdown */}
                <div ref={columnDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:outline-none px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer font-semibold"
                  >
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    <span>Cột</span>
                    <svg className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isColumnDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isColumnDropdownOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 p-3 space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 mb-1 px-1">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          Hiển thị cột
                        </span>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={activeColumnsCount === columnsList.length}
                            ref={(input) => {
                              if (input) {
                                input.indeterminate = activeColumnsCount > 0 && activeColumnsCount < columnsList.length;
                              }
                            }}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setVisibleColumns({
                                id: checked,
                                name: checked,
                                address: checked,
                                location: checked,
                                status: checked,
                                actions: checked,
                              });
                            }}
                            className="rounded text-brand-500 focus:ring-brand-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Tất cả
                          </span>
                        </label>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-60 overflow-y-auto">
                        {columnsList.map((col) => (
                          <label
                            key={col.key}
                            className="flex items-center gap-3 py-2 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg select-none"
                          >
                            <input
                              type="checkbox"
                              checked={visibleColumns[col.key]}
                              onChange={() => setVisibleColumns(prev => ({
                                ...prev,
                                [col.key]: !prev[col.key]
                              }))}
                              className="rounded text-brand-500 focus:ring-brand-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                              {col.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <ComponentCard title="Danh sách các trạm">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {visibleColumns.id && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      ID
                    </th>
                  )}
                  {visibleColumns.name && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Tên Trạm
                    </th>
                  )}
                  {visibleColumns.address && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Địa Điểm
                    </th>
                  )}
                  {visibleColumns.location && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Khu Vực
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Tình Trạng
                    </th>
                  )}
                  {visibleColumns.actions && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Hành Động
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {stations.map((station) => (
                  <tr key={station.id}>
                    {visibleColumns.id && (
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">#{station.id}</td>
                    )}
                    {visibleColumns.name && (
                      <td className="px-5 py-4 text-sm text-gray-800 dark:text-white font-medium">{station.name}</td>
                    )}
                    {visibleColumns.address && (
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-normal break-words min-w-[250px]" title={station.address}>
                        {station.address}
                      </td>
                    )}
                    {visibleColumns.location && (
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {station.phuongxaName ? `${station.phuongxaName}, ` : ""}{station.quanName ? `${station.quanName}, ` : ""}{station.provinceName || ""}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-5 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeColor(station.status)}`}>
                          {getStatusText(station.status)}
                        </span>
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="px-5 py-4 text-sm">
                        <button 
                          onClick={() => handleOpenModal(station)}
                          className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 font-medium mr-3"
                        >
                          Chỉnh sửa
                        </button>
                        <button 
                          onClick={() => handleDelete(station.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        >
                          Xóa
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                
                {stations.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={activeColumnsCount} className="px-5 py-8 text-center text-gray-500">
                      Chưa có dữ liệu trạm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {(totalPages > 1 || stations.length > 0) && (
            <div className="flex justify-between items-center mt-6 px-5 border-t border-gray-100 dark:border-gray-800 pt-4">
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
              {editingStation ? "Chỉnh sửa Trạm" : "Thêm Trạm mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên trạm
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="VD: Trạm Q1 - Nguyễn Huệ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Địa điểm chi tiết
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="VD: 9 Tôn Đức Thắng"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tỉnh/Thành
                  </label>
                  <CustomSelect 
                    required
                    value={formData.province}
                    onChange={(val) => {
                      setFormData({
                        ...formData, 
                        province: val,
                        quan: 0,
                        phuongxa: 0
                      });
                    }}
                    options={(provinces || []).map(p => ({
                      value: p.id,
                      label: `${p.tinhthanhcol}${p.count_station !== undefined ? ` (${p.count_station})` : ""}`
                    }))}
                    placeholder="Chọn Tỉnh/Thành"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quận/Huyện
                  </label>
                  <CustomSelect 
                    required
                    value={formData.quan}
                    onChange={(val) => {
                      setFormData({
                        ...formData, 
                        quan: val,
                        phuongxa: 0
                      });
                    }}
                    disabled={!formData.province}
                    options={(districts || []).map(d => ({
                      value: d.id,
                      label: `${d.tenquanhuyen}${d.count_station !== undefined ? ` (${d.count_station})` : ""}`
                    }))}
                    placeholder="Chọn Quận/Huyện"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phường/Xã
                  </label>
                  <CustomSelect 
                    required
                    value={formData.phuongxa}
                    onChange={(val) => setFormData({...formData, phuongxa: val})}
                    disabled={!formData.quan}
                    options={(wards || []).map(w => ({
                      value: w.id,
                      label: `${w.tenphuongxa}${w.count_station !== undefined ? ` (${w.count_station})` : ""}`
                    }))}
                    placeholder="Chọn Phường/Xã"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tình trạng
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as StationStatus})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="DEPLOYING">Đang triển khai</option>
                </select>
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
                  {editingStation ? "Cập nhật" : "Lưu trạm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
