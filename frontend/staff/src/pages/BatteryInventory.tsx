import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { useToast } from '../context/ToastContext';

interface Station {
  id: number;
  name: string;
  address: string;
  status: string;
}

interface Battery {
  id: number;
  serialNumber: string;
  model: string;
  capacityKwh: number;
  currentChargePercentage: number;
  healthPercentage: number;
  chargeCycles: number;
  status: string;
  currentStationName: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: 'Sẵn sàng', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  CHARGING:  { label: 'Đang sạc', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  MAINTENANCE: { label: 'Bảo dưỡng', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
};

const BatteryInventory: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [stats, setStats] = useState({ available: 0, charging: 0, maintenance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('staff_auth_token');
        
        // 1. Tải danh sách trạm được phân công
        const stationsRes = await fetch('http://localhost:8080/api/staff/stations', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
        });
        
        if (stationsRes.status === 401 || stationsRes.status === 403) {
          setError('Phiên đăng nhập đã hết hạn.');
          showToast('Phiên đăng nhập hết hạn!', 'error');
          return;
        }
        if (!stationsRes.ok) throw new Error('Không thể tải danh sách trạm.');
        
        const stationsData: Station[] = await stationsRes.json();

        let allBatteries: Battery[] = [];
        let totalAvailable = 0;
        let totalCharging = 0;
        let totalMaintenance = 0;

        // 2. Tải pin và thống kê cho từng trạm
        for (const st of stationsData) {
          // Tải danh sách pin
          const battRes = await fetch(`http://localhost:8080/api/staff/batteries/page?stationId=${st.id}&page=0&size=100`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
          });
          if (battRes.ok) {
            const battPage = await battRes.json();
            if (battPage && battPage.content) {
              allBatteries = [...allBatteries, ...battPage.content];
            }
          }

          // Tải thống kê trạng thái của trạm
          const countRes = await fetch(`http://localhost:8080/api/staff/batteries/countStatus?stationId=${st.id}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
          });
          if (countRes.ok) {
            const countData: { status: string; count: number }[] = await countRes.json();
            countData.forEach(item => {
              if (item.status === 'AVAILABLE') totalAvailable += item.count;
              else if (item.status === 'CHARGING') totalCharging += item.count;
              else if (item.status === 'MAINTENANCE') totalMaintenance += item.count;
            });
          }
        }

        setBatteries(allBatteries);
        setStats({
          available: totalAvailable,
          charging: totalCharging,
          maintenance: totalMaintenance
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        showToast('Lỗi tải dữ liệu tồn kho pin', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [showToast]);

  const filteredBatteries = batteries.filter(b => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý tồn kho pin</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Theo dõi số lượng pin đầy, đang sạc, bảo dưỡng theo thời gian thực.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="mt-4 md:mt-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Đăng xuất
        </button>
      </div>
      
      {/* Thống kê Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Pin đầy (Sẵn sàng)</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {loading ? '...' : stats.available}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Đang sạc</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {loading ? '...' : stats.charging}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Bảo dưỡng</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {loading ? '...' : stats.maintenance}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách Pin chi tiết */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Chi tiết từng viên pin</h3>
          <div className="flex gap-2">
             <select 
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl p-2.5 outline-none"
             >
                <option value="ALL">Tất cả tình trạng</option>
                <option value="AVAILABLE">Sẵn sàng</option>
                <option value="CHARGING">Đang sạc</option>
                <option value="MAINTENANCE">Bảo dưỡng</option>
             </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="animate-spin w-8 h-8 mx-auto mb-3 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Đang tải danh sách tồn kho pin...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 font-medium">{error}</div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b dark:border-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Mã Pin (ID)</th>
                  <th scope="col" className="px-6 py-3.5">Số Serial</th>
                  <th scope="col" className="px-6 py-3.5">Model tương thích</th>
                  <th scope="col" className="px-6 py-3.5">Dung lượng</th>
                  <th scope="col" className="px-6 py-3.5">Mức Sạc</th>
                  <th scope="col" className="px-6 py-3.5">Sức khỏe (SoH)</th>
                  <th scope="col" className="px-6 py-3.5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredBatteries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                      Không tìm thấy viên pin nào trong tồn kho.
                    </td>
                  </tr>
                ) : (
                  filteredBatteries.map(battery => {
                    const statusCfg = STATUS_CONFIG[battery.status] || { label: battery.status, className: 'bg-gray-100 text-gray-800' };
                    return (
                      <tr key={battery.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{battery.id}</td>
                        <td className="px-6 py-4 font-mono">{battery.serialNumber}</td>
                        <td className="px-6 py-4 font-medium">{battery.model}</td>
                        <td className="px-6 py-4 font-mono">{battery.capacityKwh} kWh</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${battery.currentChargePercentage >= 50 ? 'bg-green-500' : battery.currentChargePercentage >= 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${battery.currentChargePercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-semibold">{battery.currentChargePercentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold font-mono ${battery.healthPercentage >= 90 ? 'text-green-500' : battery.healthPercentage >= 75 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {battery.healthPercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusCfg.className}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatteryInventory;
