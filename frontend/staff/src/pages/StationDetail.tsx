import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useToast } from '../context/ToastContext';
import StationInfoCard from '../components/station/StationInfoCard';
import BatteryStatusStats from '../components/station/BatteryStatusStats';
import BatteryTable from '../components/station/BatteryTable';
import BatteryFormModal from '../components/station/BatteryFormModal';
import ConfirmDeleteModal from '../components/station/ConfirmDeleteModal';
import { DollarLineIcon, PieChartIcon, BoxIcon, BoxCubeIcon } from '../icons';
import { getApiUrl } from '../utils/api';

interface Station {
  id: number;
  name: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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
  amount: number;
  currentStationId: number;
  currentStationName: string;
  userId: number | null;
  userUsername: string | null;
  manufactureDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BatteryPage {
  content: Battery[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: 'Sẵn sàng', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  CHARGING:  { label: 'Đang sạc', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  RESERVED:  { label: 'Đã đặt', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  IN_USE:    { label: 'Đang dùng', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  MAINTENANCE: { label: 'Bảo dưỡng', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  EMPTY:     { label: 'Trống', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300' },
  FAULTY:    { label: 'Lỗi', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const SOH_COLOR = (soh: number) => {
  if (soh >= 90) return 'text-green-600 dark:text-green-400';
  if (soh >= 75) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const StationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [station, setStation] = useState<Station | null>(null);
  const [stationLoading, setStationLoading] = useState(true);
  const [stationError, setStationError] = useState<string | null>(null);

  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [batteryLoading, setBatteryLoading] = useState(true);
  const [batteryError, setBatteryError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalElements, setTotalElements] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSoh, setFilterSoh] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [statusCounts, setStatusCounts] = useState<{ status: string; count: number }[]>([]);
  const [statusCountsLoading, setStatusCountsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Battery | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // States for Create & Edit unified modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month'>('day');

  // Dynamic revenue data for this station
  const stationKpiData = {
    day: {
      revenue: "320,000 đ",
      revenueTrend: "+4.8% so với hôm qua",
      revenueTrendPositive: true,
      orders: "4",
      ordersStatus: "0 Đang xử lý",
      swaps: "4",
      swapsStatus: "Tất cả thành công",
      activeBatteries: "12",
      activeBatteriesStatus: "Đang hoạt động",
    },
    week: {
      revenue: "2,450,000 đ",
      revenueTrend: "+10.2% so với tuần trước",
      revenueTrendPositive: true,
      orders: "28",
      ordersStatus: "1 Đang xử lý",
      swaps: "27",
      swapsStatus: "26 thành công, 1 lỗi",
      activeBatteries: "12",
      activeBatteriesStatus: "Đang hoạt động",
    },
    month: {
      revenue: "8,920,000 đ",
      revenueTrend: "-1.5% so với tháng trước",
      revenueTrendPositive: false,
      orders: "102",
      ordersStatus: "2 Đang xử lý",
      swaps: "100",
      swapsStatus: "98 thành công, 2 lỗi",
      activeBatteries: "12",
      activeBatteriesStatus: "Đang hoạt động",
    },
  };

  const currentRevenueKPI = stationKpiData[revenuePeriod];

  // Fetch station info
  useEffect(() => {
    const fetchStation = async () => {
      try {
        setStationLoading(true);
        const token = localStorage.getItem('staff_auth_token');
        const response = await fetch(getApiUrl('/api/staff/stations'), {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
        });
        if (response.status === 401 || response.status === 403) {
          setStationError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền.');
          showToast('Phiên đăng nhập hết hạn!', 'error');
          return;
        }
        if (!response.ok) throw new Error('Lỗi khi tải dữ liệu trạm');
        const data: Station[] = await response.json();
        const found = data.find(s => s.id === Number(id));
        if (found) setStation(found);
        else setStationError('Không tìm thấy thông tin trạm này!');
      } catch (err) {
        setStationError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        showToast('Không tải được thông tin trạm', 'error');
      } finally {
        setStationLoading(false);
      }
    };
    fetchStation();
  }, [id, showToast]);

  // Fetch batteries for this station
  const fetchBatteries = async () => {
    try {
      setBatteryLoading(true);
      setBatteryError(null);
      const token = localStorage.getItem('staff_auth_token');
      
      let endpoint = `/api/staff/batteries/page?stationId=${id}&page=${currentPage}&size=${pageSize}`;
      if (filterSoh !== 'ALL') {
        endpoint += `&chargeRange=${filterSoh}`;
      }
      
      const url = getApiUrl(endpoint);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      });
      if (response.status === 401 || response.status === 403) {
        setBatteryError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền.');
        return;
      }
      if (!response.ok) throw new Error('Lỗi khi tải danh sách pin');
      const data: BatteryPage = await response.json();
      setBatteries(data.content);
      setTotalPages(data.page.totalPages);
      setTotalElements(data.page.totalElements);
    } catch (err) {
      setBatteryError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      showToast('Lỗi tải danh sách pin', 'error');
    } finally {
      setBatteryLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBatteries();
  }, [id, currentPage, pageSize, filterSoh]);

  // Fetch battery status counts
  const fetchStatusCounts = async () => {
    try {
      setStatusCountsLoading(true);
      const token = localStorage.getItem('staff_auth_token');
      const url = getApiUrl(`/api/staff/batteries/countStatus?stationId=${id}`);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      });
      if (response.ok) {
        const data = await response.json();
        setStatusCounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch status counts', err);
    } finally {
      setStatusCountsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchStatusCounts();
  }, [id]);

  const handleDeleteBattery = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const token = localStorage.getItem('staff_auth_token');
      const response = await fetch(getApiUrl(`/api/staff/batteries/${deleteTarget.id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      });
      if (response.status === 401 || response.status === 403) {
        setDeleteError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền.');
        showToast('Không có quyền thực hiện xóa!', 'error');
        return;
      }
      if (!response.ok) throw new Error('Xóa pin thất bại');
      
      setBatteries(prev => prev.filter(b => b.id !== deleteTarget.id));
      setTotalElements(prev => prev - 1);
      setDeleteTarget(null);
      showToast('Đã xóa pin thành công!', 'success');
      fetchStatusCounts();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa');
      showToast('Lỗi khi xóa pin', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartCreate = () => {
    setFormData({
      serialNumber: '',
      model: '',
      capacityKwh: 0,
      currentChargePercentage: 100,
      healthPercentage: 100,
      chargeCycles: 0,
      status: 'AVAILABLE',
      amount: 0,
      currentStationId: Number(id),
      userId: null,
      manufactureDate: new Date().toISOString().split('T')[0]
    });
    setModalError(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleStartEdit = async (batteryId: number) => {
    try {
      setEditTargetId(batteryId);
      setIsEditMode(true);
      setModalError(null);
      
      const token = localStorage.getItem('staff_auth_token');
      const response = await fetch(getApiUrl(`/api/staff/batteries/${batteryId}`), {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
      });
      if (response.status === 401 || response.status === 403) {
        showToast('Phiên đăng nhập hết hạn!', 'error');
        return;
      }
      if (!response.ok) throw new Error('Không thể tải chi tiết pin');
      const data: Battery = await response.json();
      
      let formattedDate = '';
      if (data.manufactureDate) {
        formattedDate = data.manufactureDate.substring(0, 10);
      }

      setFormData({
        serialNumber: data.serialNumber || '',
        model: data.model || '',
        capacityKwh: data.capacityKwh || 0,
        currentChargePercentage: data.currentChargePercentage || 0,
        healthPercentage: data.healthPercentage || 0,
        chargeCycles: data.chargeCycles || 0,
        status: data.status || 'AVAILABLE',
        amount: data.amount || 0,
        currentStationId: data.currentStationId || 0,
        userId: data.userId || null,
        manufactureDate: formattedDate || ''
      });
      setIsModalOpen(true);
    } catch (err) {
      showToast('Không lấy được dữ liệu chi tiết pin', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    try {
      setIsSubmitting(true);
      setModalError(null);

      const payload = {
        serialNumber: formData.serialNumber.trim(),
        model: formData.model.trim(),
        capacityKwh: Number(formData.capacityKwh),
        currentChargePercentage: Number(formData.currentChargePercentage),
        healthPercentage: Number(formData.healthPercentage),
        chargeCycles: formData.chargeCycles === '' || formData.chargeCycles === null ? 0 : Number(formData.chargeCycles),
        status: formData.status,
        amount: formData.amount === '' || formData.amount === null ? 0 : Number(formData.amount),
        currentStationId: formData.currentStationId === '' || formData.currentStationId === null ? 0 : Number(formData.currentStationId),
        userId: formData.userId === null || formData.userId === '' ? null : Number(formData.userId),
        manufactureDate: formData.manufactureDate || null
      };

      const token = localStorage.getItem('staff_auth_token');
      const url = isEditMode 
        ? getApiUrl(`/api/staff/batteries/${editTargetId}`)
        : getApiUrl('/api/staff/batteries');
      
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.status === 401 || response.status === 403) {
        setModalError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền.');
        return;
      }
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Thao tác thất bại');
      }

      if (isEditMode) {
        setBatteries(prev => prev.map(b => b.id === editTargetId ? responseData : b));
        showToast('Cập nhật thông tin pin thành công!', 'success');
      } else {
        setBatteries(prev => [responseData, ...prev]);
        setTotalElements(prev => prev + 1);
        showToast('Tạo pin mới thành công!', 'success');
      }
      
      setIsModalOpen(false);
      setFormData(null);
      fetchStatusCounts();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      showToast(isEditMode ? 'Cập nhật pin thất bại' : 'Tạo pin thất bại', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBatteries = batteries.filter(b => {
    const statusMatch = filterStatus === 'ALL' || b.status === filterStatus;
    const searchMatch = !activeSearchQuery || 
      (b.serialNumber && b.serialNumber.toLowerCase().includes(activeSearchQuery.toLowerCase())) || 
      (b.model && b.model.toLowerCase().includes(activeSearchQuery.toLowerCase()));
    return statusMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {stationLoading ? 'Đang tải...' : station?.name || `Trạm #${id}`}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chi tiết thông tin trạm và danh sách pin hiện có.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/stations')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-all font-semibold text-sm dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
        </div>
      </div>

      {/* Station Info Card */}
      <StationInfoCard station={station} loading={stationLoading} error={stationError} />

      {/* Station Revenue Dashboard Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-bold text-lg text-gray-850 dark:text-white">Doanh số Trạm</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hiệu suất kinh doanh và hoạt động đổi pin.</p>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1.5 rounded-xl border border-gray-200/50 dark:border-gray-700/50 w-fit">
            <button
              onClick={() => setRevenuePeriod("day")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                revenuePeriod === "day"
                  ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => setRevenuePeriod("week")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                revenuePeriod === "week"
                  ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setRevenuePeriod("month")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                revenuePeriod === "month"
                  ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Tháng
            </button>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Doanh thu */}
          <div className="bg-gray-50/50 dark:bg-gray-900/10 p-5 rounded-2xl border border-gray-100/50 dark:border-gray-800/30">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Doanh thu trạm</p>
                <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">{currentRevenueKPI.revenue}</h4>
                <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full ${currentRevenueKPI.revenueTrendPositive ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"}`}>
                  {currentRevenueKPI.revenueTrend}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                <DollarLineIcon className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 2: Đơn hàng */}
          <div className="bg-gray-50/50 dark:bg-gray-900/10 p-5 rounded-2xl border border-gray-100/50 dark:border-gray-800/30">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tổng đơn hàng</p>
                <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">{currentRevenueKPI.orders}</h4>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{currentRevenueKPI.ordersStatus}</span>
              </div>
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                <BoxIcon className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 3: Lượt đổi pin */}
          <div className="bg-gray-50/50 dark:bg-gray-900/10 p-5 rounded-2xl border border-gray-100/50 dark:border-gray-800/30">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Lượt đổi pin</p>
                <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">{currentRevenueKPI.swaps}</h4>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{currentRevenueKPI.swapsStatus}</span>
              </div>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                <PieChartIcon className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 4: Pin đang hoạt động */}
          <div className="bg-gray-50/50 dark:bg-gray-900/10 p-5 rounded-2xl border border-gray-100/50 dark:border-gray-800/30">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pin hoạt động</p>
                <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">{currentRevenueKPI.activeBatteries}</h4>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{currentRevenueKPI.activeBatteriesStatus}</span>
              </div>
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                <BoxCubeIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battery Status Counts Card */}
      <BatteryStatusStats statusCounts={statusCounts} loading={statusCountsLoading} statusConfig={STATUS_CONFIG} />

      {/* Battery List & Table */}
      <BatteryTable
        filteredBatteries={filteredBatteries}
        loading={batteryLoading}
        error={batteryError}
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
        onAddClick={handleStartCreate}
        onEditClick={handleStartEdit}
        onDeleteClick={setDeleteTarget}
        statusConfig={STATUS_CONFIG}
        sohColor={SOH_COLOR}
      />

      {/* Unified Create / Edit Modal */}
      <BatteryFormModal
        isOpen={isModalOpen}
        isEdit={isEditMode}
        formData={formData}
        setFormData={setFormData}
        isLoading={isSubmitting}
        error={modalError}
        onSubmit={handleFormSubmit}
        onClose={() => setIsModalOpen(false)}
        statusConfig={STATUS_CONFIG}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        deleteTarget={deleteTarget}
        isDeleting={isDeleting}
        deleteError={deleteError}
        onConfirm={handleDeleteBattery}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default StationDetail;
