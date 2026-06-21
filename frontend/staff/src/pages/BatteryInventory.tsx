import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { getApiUrl } from '../utils/api';
import { BatteryTable } from '../components/station/BatteryTable';

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
  const { showToast } = useToast();

  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [stats, setStats] = useState({ available: 0, charging: 0, maintenance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSoh, setFilterSoh] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('staff_auth_token');
        
        // 1. Tải danh sách trạm được phân công
        const stationsRes = await fetch(getApiUrl('/api/staff/stations'), {
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
          const battRes = await fetch(getApiUrl(`/api/staff/batteries/page?stationId=${st.id}&page=0&size=100`), {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
          });
          if (battRes.ok) {
            const battPage = await battRes.json();
            if (battPage && battPage.content) {
              allBatteries = [...allBatteries, ...battPage.content];
            }
          }
 
          // Tải thống kê trạng thái của trạm
          const countRes = await fetch(getApiUrl(`/api/staff/batteries/countStatus?stationId=${st.id}`), {
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
    let match = true;
    if (filterStatus !== 'ALL' && b.status !== filterStatus) match = false;
    
    if (activeSearchQuery) {
      const q = activeSearchQuery.toLowerCase();
      if (!b.serialNumber.toLowerCase().includes(q) && !b.model.toLowerCase().includes(q)) {
        match = false;
      }
    }

    if (filterSoh !== 'ALL') {
      const soh = b.healthPercentage;
      if (filterSoh === '10-20' && (soh < 10 || soh >= 20)) match = false;
      if (filterSoh === '20-50' && (soh < 20 || soh >= 50)) match = false;
      if (filterSoh === '50-80' && (soh < 50 || soh >= 80)) match = false;
      if (filterSoh === '80-100' && (soh < 80 || soh > 100)) match = false;
    }

    return match;
  });

  const totalElements = filteredBatteries.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;
  const paginatedBatteries = filteredBatteries.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý tồn kho pin</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Theo dõi số lượng pin đầy, đang sạc, bảo dưỡng theo thời gian thực.</p>
        </div>
      </div>
      
      {/* Thống kê Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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

      <BatteryTable
        filteredBatteries={paginatedBatteries}
        loading={loading}
        error={error}
        totalElements={totalElements}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
        setPageSize={setPageSize}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterSoh={filterSoh}
        setFilterSoh={setFilterSoh}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setActiveSearchQuery={setActiveSearchQuery}
        onAddClick={() => showToast('Chức năng thêm pin đang được phát triển', 'info')}
        onEditClick={(id) => showToast(`Chức năng sửa pin đang được phát triển`, 'info')}
        onDeleteClick={(battery) => showToast(`Chức năng xóa pin đang được phát triển`, 'info')}
        statusConfig={STATUS_CONFIG}
        sohColor={(soh) => soh >= 90 ? 'text-green-500' : soh >= 75 ? 'text-yellow-500' : 'text-red-500'}
      />
    </div>
  );
};

export default BatteryInventory;
