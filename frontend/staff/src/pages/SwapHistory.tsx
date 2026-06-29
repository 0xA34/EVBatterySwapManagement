import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
import { useToast } from '../context/ToastContext';

const SwapHistory: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // States for search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Column Visibility States
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    driver: true,
    station: true,
    oldBattery: true,
    newBattery: true,
    createdAt: true,
    status: true,
  });
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const columnsList = [
    { key: 'id', label: 'ID Yêu cầu' },
    { key: 'driver', label: 'Lái xe' },
    { key: 'station', label: 'Trạm' },
    { key: 'oldBattery', label: 'Pin cũ' },
    { key: 'newBattery', label: 'Pin mới' },
    { key: 'createdAt', label: 'Ngày hoàn thành' },
    { key: 'status', label: 'Trạng thái' },
  ];

  const activeColumnsCount = Object.values(visibleColumns).filter(Boolean).length;
  const isAllSelected = activeColumnsCount === columnsList.length;
  const handleToggleAll = () => {
    const nextState = !isAllSelected;
    const newCols: Record<string, boolean> = {};
    columnsList.forEach(c => newCols[c.key] = nextState);
    setVisibleColumns(newCols);
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("staff_auth_token");
      // Load more to allow client-side filtering effectively
      const response = await fetch(getApiUrl("/api/staff/swap-orders/history?status=COMPLETED&page=0&size=100"), {
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.content || []);
      } else {
        showToast('Không thể tải lịch sử', 'error');
      }
    } catch (error) {
      console.error("Failed to fetch swap history", error);
      showToast('Đã xảy ra lỗi khi tải lịch sử', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    let match = true;
    
    if (activeSearchQuery) {
      const q = activeSearchQuery.toLowerCase();
      const driverName = (order.driverFullName || order.driverUsername || '').toLowerCase();
      const stationName = (order.stationName || '').toLowerCase();
      const orderIdStr = String(order.id);
      const oldPin = (order.oldBatterySerial || '').toLowerCase();
      const newPin = (order.newBatterySerial || '').toLowerCase();
      
      if (!driverName.includes(q) && !stationName.includes(q) && !orderIdStr.includes(q) && !oldPin.includes(q) && !newPin.includes(q)) {
        match = false;
      }
    }
    return match;
  });

  const totalElements = filteredOrders.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Lịch sử đổi pin</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Danh sách các giao dịch đổi pin đã hoàn thành thành công.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
        {/* Table Toolbar */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Danh sách lịch sử</h3>
            {!loading && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tổng cộng: <span className="font-semibold text-blue-600 dark:text-blue-400">{totalElements}</span> giao dịch
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="flex flex-1 sm:flex-initial relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Tìm ID, mã pin, tài xế..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveSearchQuery(searchQuery)}
                className="w-full sm:w-64 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-l-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2.5 outline-none transition-all placeholder:text-gray-400"
              />
              <button
                onClick={() => setActiveSearchQuery(searchQuery)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-xl text-sm transition-all border border-blue-600 flex items-center justify-center active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Column Selector Custom Dropdown */}
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                className="w-full sm:w-auto flex items-center justify-between gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl p-2.5 outline-none transition-all font-semibold hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <span className="text-blue-600 dark:text-blue-400">Cột hiển thị ({activeColumnsCount})</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpenDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpenDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center pb-2 mb-2 border-b border-gray-100 dark:border-gray-700">
                    <label className="flex items-center gap-3 px-2 py-1 cursor-pointer w-full transition-colors text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleToggleAll}
                        className="w-4 h-4 rounded text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                      />
                      <span>Chọn tất cả</span>
                    </label>
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
                    {columnsList.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors text-sm text-gray-700 dark:text-gray-300 font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[col.key]}
                          onChange={() => setVisibleColumns(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                          className="w-4 h-4 rounded text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <svg className="animate-spin w-8 h-8 mx-auto mb-3 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm font-medium">Đang tải lịch sử...</span>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            {activeColumnsCount > 0 && (
              <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 dark:bg-gray-700/50 dark:text-gray-400 border-b dark:border-gray-700">
                <tr>
                  {visibleColumns.id && <th className="px-6 py-3.5">ID Yêu cầu</th>}
                  {visibleColumns.driver && <th className="px-6 py-3.5">Lái xe</th>}
                  {visibleColumns.station && <th className="px-6 py-3.5">Trạm</th>}
                  {visibleColumns.oldBattery && <th className="px-6 py-3.5">Pin cũ</th>}
                  {visibleColumns.newBattery && <th className="px-6 py-3.5">Pin mới</th>}
                  {visibleColumns.createdAt && <th className="px-6 py-3.5">Ngày hoàn thành</th>}
                  {visibleColumns.status && <th className="px-6 py-3.5">Trạng thái</th>}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {activeColumnsCount === 0 ? (
                <tr>
                  <td colSpan={1} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 font-semibold">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl mb-4 animate-bounce">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h4 className="text-gray-800 dark:text-white font-bold text-base mb-1">Tất cả các cột đang bị ẩn</h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Vui lòng mở menu "Cột hiển thị" phía trên và tích chọn ít nhất 1 cột để xem dữ liệu.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={activeColumnsCount} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Không có lịch sử đổi pin nào.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="bg-white hover:bg-gray-50/50 dark:bg-gray-800 dark:hover:bg-gray-700/30 transition-colors">
                    {visibleColumns.id && (
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">#{order.id}</td>
                    )}
                    {visibleColumns.driver && (
                      <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                        {order.driverFullName || order.driverUsername}
                      </td>
                    )}
                    {visibleColumns.station && (
                      <td className="px-6 py-4">{order.stationName}</td>
                    )}
                    {visibleColumns.oldBattery && (
                      <td className="px-6 py-4 font-mono font-medium text-gray-600 dark:text-gray-300">
                        {order.oldBatterySerial}
                      </td>
                    )}
                    {visibleColumns.newBattery && (
                      <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {order.newBatterySerial}
                      </td>
                    )}
                    {visibleColumns.createdAt && (
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                          {order.status}
                        </span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && totalElements > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/20 dark:bg-gray-900/10">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Trang <span className="font-semibold text-gray-900 dark:text-white">{currentPage + 1}</span> / {totalPages || 1}
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-1.5 focus:ring-blue-500 outline-none shadow-sm"
              >
                <option value={5}>5 / trang</option>
                <option value={10}>10 / trang</option>
                <option value={15}>15 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                  ← Trước
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                  Tiếp →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapHistory;
