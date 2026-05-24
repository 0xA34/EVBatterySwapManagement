import { useState, useEffect } from "react";
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

type Province = { id: number; tinhthanhcol: string; bienso: string };
type District = { id: number; tenquanhuyen: string };
type Ward = { id: number; tenphuongxa: string };

export default function StationManagement() {
  const { token } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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
        let url = `/api/admin/stations?page=${page}&size=15`;
        if (keyword.trim()) {
          url = `/api/admin/stations/search?keyword=${encodeURIComponent(keyword.trim())}&page=${page}&size=15`;
        } else {
          if (province > 0) url += `&province=${province}`;
          if (district > 0) url += `&quan=${district}`;
          if (ward > 0) url += `&phuongxa=${ward}`;
        }
        if (status) url += `&status=${status}`;
          
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Không thể tải danh sách trạm");
        }
        const data = await response.json();
        setStations(data.content || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.number || 0);
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
  }, [token, currentPage, currentKeyword, currentSearchId, currentSearchProvince, currentSearchDistrict, currentSearchWard, currentSearchStatus]);

  useEffect(() => {
    if (searchProvince && token) {
      fetch(`/api/donvihanhchinh/quanHuyen?idTinhThanh=${searchProvince}`, {
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
      fetch(`/api/donvihanhchinh/phuongXa?idQuanHuyen=${searchDistrict}`, {
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
      fetch('/api/donvihanhchinh/tinhThanh', {
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
      fetch(`/api/donvihanhchinh/quanHuyen?idTinhThanh=${formData.province}`, {
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
      fetch(`/api/donvihanhchinh/phuongXa?idQuanHuyen=${formData.quan}`, {
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

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData, 
      province: Number(e.target.value),
      quan: 0,
      phuongxa: 0
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData, 
      quan: Number(e.target.value),
      phuongxa: 0
    });
  };

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
        title="Quản Lý Trạm Đổi Pin | EV Battery Swap"
        description="Quản lý các trạm đổi pin, điều phối pin và xử lý khiếu nại"
      />
      <PageBreadcrumb pageTitle="Quản Lý Trạm Đổi Pin" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Danh sách các trạm {isLoading && <span className="text-sm font-normal text-gray-500">(Đang tải...)</span>}
            </h2>
            <button 
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium whitespace-nowrap"
            >
              + Thêm trạm mới
            </button>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 dark:bg-gray-800/50 dark:border-gray-800">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 w-fit ml-auto">
              <div className="flex flex-wrap gap-3 items-center justify-start">
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
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                >
                  Lọc
                </button>
              </div>
              <div className="flex flex-wrap gap-3 items-center justify-start">
                <select
                  value={searchProvince || ""}
                  onChange={(e) => {
                    setSearchProvince(Number(e.target.value));
                    setSearchDistrict(0);
                    setSearchWard(0);
                  }}
                  className="w-32 sm:w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Tỉnh/Thành</option>
                  {Array.isArray(provinces) && provinces.map(p => (
                    <option key={p.id} value={p.id}>{p.tinhthanhcol}</option>
                  ))}
                </select>
                <select
                  value={searchDistrict || ""}
                  onChange={(e) => {
                    setSearchDistrict(Number(e.target.value));
                    setSearchWard(0);
                  }}
                  disabled={!searchProvince}
                  className="w-32 sm:w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">Quận/Huyện</option>
                  {Array.isArray(searchDistricts) && searchDistricts.map(d => (
                    <option key={d.id} value={d.id}>{d.tenquanhuyen}</option>
                  ))}
                </select>
                <select
                  value={searchWard || ""}
                  onChange={(e) => setSearchWard(Number(e.target.value))}
                  disabled={!searchDistrict}
                  className="w-32 sm:w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">Phường/Xã</option>
                  {Array.isArray(searchWards) && searchWards.map(w => (
                    <option key={w.id} value={w.id}>{w.tenphuongxa}</option>
                  ))}
                </select>
              </div>
            </form>
          </div>
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
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    ID
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Tên Trạm
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Địa Điểm
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Khu Vực
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Tình Trạng
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {stations.map((station) => (
                  <tr key={station.id}>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">#{station.id}</td>
                    <td className="px-5 py-4 text-sm text-gray-800 dark:text-white font-medium">{station.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-normal break-words min-w-[250px]" title={station.address}>
                      {station.address}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {station.phuongxaName ? `${station.phuongxaName}, ` : ""}{station.quanName || ""}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeColor(station.status)}`}>
                        {getStatusText(station.status)}
                      </span>
                    </td>
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
                  </tr>
                ))}
                
                {stations.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                      Chưa có dữ liệu trạm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 px-5 border-t border-gray-100 dark:border-gray-800 pt-4">
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
                  <select 
                    required
                    value={formData.province || ""}
                    onChange={handleProvinceChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Chọn Tỉnh/Thành</option>
                    {Array.isArray(provinces) && provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.tinhthanhcol}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quận/Huyện
                  </label>
                  <select 
                    required
                    value={formData.quan || ""}
                    onChange={handleDistrictChange}
                    disabled={!formData.province}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {Array.isArray(districts) && districts.map(d => (
                      <option key={d.id} value={d.id}>{d.tenquanhuyen}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phường/Xã
                  </label>
                  <select 
                    required
                    value={formData.phuongxa || ""}
                    onChange={(e) => setFormData({...formData, phuongxa: Number(e.target.value)})}
                    disabled={!formData.quan}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {Array.isArray(wards) && wards.map(w => (
                      <option key={w.id} value={w.id}>{w.tenphuongxa}</option>
                    ))}
                  </select>
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
