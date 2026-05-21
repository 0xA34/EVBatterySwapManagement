import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

type StationStatus = "Hoạt động tốt" | "Thiếu pin" | "Đầy pin" | "Bảo trì";

type Station = {
  id: string;
  name: string;
  location: string;
  currentBatteries: number;
  maxBatteries: number;
  status: StationStatus;
};

const initialStations: Station[] = [
  {
    id: "1",
    name: "Trạm Q1 - Nguyễn Huệ",
    location: "Quận 1, TP.HCM",
    currentBatteries: 45,
    maxBatteries: 50,
    status: "Hoạt động tốt"
  },
  {
    id: "2",
    name: "Trạm Q2 - Thảo Điền",
    location: "Quận 2, TP.HCM",
    currentBatteries: 10,
    maxBatteries: 50,
    status: "Thiếu pin"
  }
];

export default function StationManagement() {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    currentBatteries: 0,
    maxBatteries: 50,
    status: "Hoạt động tốt" as StationStatus
  });

  const getStatusBadgeColor = (status: StationStatus) => {
    switch (status) {
      case "Hoạt động tốt":
        return "bg-success/10 text-success dark:bg-green-500/20 dark:text-green-400";
      case "Thiếu pin":
        return "bg-warning/10 text-warning dark:bg-yellow-500/20 dark:text-yellow-400";
      case "Đầy pin":
        return "bg-info/10 text-info dark:bg-blue-500/20 dark:text-blue-400";
      case "Bảo trì":
        return "bg-error/10 text-error dark:bg-red-500/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const handleOpenModal = (station?: Station) => {
    if (station) {
      setEditingStation(station);
      setFormData({
        name: station.name,
        location: station.location,
        currentBatteries: station.currentBatteries,
        maxBatteries: station.maxBatteries,
        status: station.status
      });
    } else {
      setEditingStation(null);
      setFormData({
        name: "",
        location: "",
        currentBatteries: 0,
        maxBatteries: 50,
        status: "Hoạt động tốt"
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStation(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStation) {
      // Update
      setStations(stations.map(s => 
        s.id === editingStation.id 
          ? { ...editingStation, ...formData }
          : s
      ));
    } else {
      // Create
      const newStation: Station = {
        id: Date.now().toString(),
        ...formData
      };
      setStations([...stations, newStation]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa trạm này không?")) {
      setStations(stations.filter(s => s.id !== id));
    }
  };

  return (
    <>
      <PageMeta
        title="Quản Lý Trạm Đổi Pin | EV Battery Swap"
        description="Quản lý các trạm đổi pin, điều phối pin và xử lý khiếu nại"
      />
      <PageBreadcrumb pageTitle="Quản Lý Trạm Đổi Pin" />

      <div className="space-y-6">
        <div className="flex justify-end">
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            + Thêm trạm mới
          </button>
        </div>

        <ComponentCard title="Danh sách các trạm">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Tên Trạm
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Địa Điểm
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Số Lượng Pin
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
                    <td className="px-5 py-4 text-sm text-gray-800 dark:text-white font-medium">{station.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{station.location}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`font-semibold ${station.currentBatteries < station.maxBatteries * 0.2 ? 'text-error dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                        {station.currentBatteries}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">/{station.maxBatteries}</span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeColor(station.status)}`}>
                        {station.status}
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
                        className="text-error hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                
                {stations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                      Chưa có dữ liệu trạm.
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
                  Địa điểm
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="VD: Quận 1, TP.HCM"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Số pin hiện tại
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    max={formData.maxBatteries}
                    required
                    value={formData.currentBatteries}
                    onChange={(e) => setFormData({...formData, currentBatteries: Number(e.target.value)})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sức chứa (Max)
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={formData.maxBatteries}
                    onChange={(e) => setFormData({...formData, maxBatteries: Number(e.target.value)})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                  <option value="Hoạt động tốt">Hoạt động tốt</option>
                  <option value="Thiếu pin">Thiếu pin</option>
                  <option value="Đầy pin">Đầy pin</option>
                  <option value="Bảo trì">Bảo trì</option>
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
