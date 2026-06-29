import React from 'react';

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

interface BatteryTableProps {
  filteredBatteries: Battery[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  setPageSize: (size: number) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterSoh: string;
  setFilterSoh: (soh: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setActiveSearchQuery: (query: string) => void;
  onAddClick: () => void;
  onEditClick: (id: number) => void;
  onDeleteClick: (battery: Battery) => void;
  statusConfig: Record<string, { label: string; className: string }>;
  sohColor: (soh: number) => string;
}

export const BatteryTable: React.FC<BatteryTableProps> = ({
  filteredBatteries,
  loading,
  error,
  totalElements,
  currentPage,
  totalPages,
  pageSize,
  setCurrentPage,
  setPageSize,
  filterStatus,
  setFilterStatus,
  filterSoh,
  setFilterSoh,
  searchQuery,
  setSearchQuery,
  setActiveSearchQuery,
  onAddClick,
  onEditClick,
  onDeleteClick,
  statusConfig,
  sohColor,
}) => {
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>({
    id: true,
    serialNumber: true,
    model: true,
    capacity: true,
    charge: true,
    health: true,
    cycles: true,
    status: true,
    actions: true,
  });
  const [isOpenDropdown, setIsOpenDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const columnsList = [
    { key: 'id', label: 'ID' },
    { key: 'serialNumber', label: 'Số serial' },
    { key: 'model', label: 'Model' },
    { key: 'capacity', label: 'Dung lượng' },
    { key: 'charge', label: 'Sạc hiện tại' },
    { key: 'health', label: 'Sức khỏe (SoH)' },
    { key: 'cycles', label: 'Số chu kỳ' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'actions', label: 'Hành động' },
  ];

  const activeColumnsCount = Object.values(visibleColumns).filter(Boolean).length;
  const isAllSelected = activeColumnsCount === columnsList.length;
  const handleToggleAll = () => {
    const nextState = !isAllSelected;
    setVisibleColumns({
      id: nextState,
      serialNumber: nextState,
      model: nextState,
      capacity: nextState,
      charge: nextState,
      health: nextState,
      cycles: nextState,
      status: nextState,
      actions: nextState,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-700 flex flex-wrap justify-between items-center gap-3 sm:gap-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Danh sách pin tại trạm</h3>
          {!loading && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tổng cộng: <span className="font-semibold text-blue-600 dark:text-blue-400">{totalElements}</span> viên pin
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onAddClick}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo pin mới
          </button>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <div className="flex flex-1 sm:flex-initial relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Tìm serial, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveSearchQuery(searchQuery)}
                className="w-full sm:w-48 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-l-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2.5 outline-none transition-all placeholder:text-gray-400"
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
            
            {/* SoC filter dropdown */}
            <select
              value={filterSoh}
              onChange={(e) => setFilterSoh(e.target.value)}
              className="w-full sm:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2.5 outline-none transition-all"
            >
              <option value="ALL">Tất cả mức sạc</option>
              <option value="10-20">Mức sạc 10% - 20%</option>
              <option value="20-50">Mức sạc 20% - 50%</option>
              <option value="50-80">Mức sạc 50% - 80%</option>
              <option value="80-100">Mức sạc 80% - 100%</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2.5 outline-none transition-all"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(statusConfig).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>

            {/* Column Selector Custom Dropdown */}
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                className="w-full sm:w-auto flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-xl p-2.5 outline-none transition-all font-semibold hover:bg-gray-100 dark:hover:bg-gray-650"
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
                          onChange={() => setVisibleColumns(prev => ({
                            ...prev,
                            [col.key]: !prev[col.key]
                          }))}
                          className="w-4 h-4 rounded text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
      </div>
 
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <svg className="animate-spin w-8 h-8 mx-auto mb-3 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm font-medium">Đang tải danh sách pin...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-medium">{error}</div>
        ) : (
          <table className={`w-full text-sm text-left text-gray-500 dark:text-gray-400 transition-all duration-300 ${activeColumnsCount > 3 ? 'min-w-[700px] lg:min-w-full' : 'min-w-full'}`}>
            {activeColumnsCount > 0 && (
              <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 dark:bg-gray-700/50 dark:text-gray-400 border-b dark:border-gray-700">
                <tr>
                  {visibleColumns.id && <th className="px-3 sm:px-6 py-3.5">ID</th>}
                  {visibleColumns.serialNumber && <th className="px-3 sm:px-6 py-3.5">Số serial</th>}
                  {visibleColumns.model && <th className="px-3 sm:px-6 py-3.5">Model</th>}
                  {visibleColumns.capacity && <th className="px-3 sm:px-6 py-3.5">Dung lượng</th>}
                  {visibleColumns.charge && <th className="px-3 sm:px-6 py-3.5">Sạc hiện tại</th>}
                  {visibleColumns.health && <th className="px-3 sm:px-6 py-3.5">Sức khỏe (SoH)</th>}
                  {visibleColumns.cycles && <th className="px-3 sm:px-6 py-3.5">Số chu kỳ</th>}
                  {visibleColumns.status && <th className="px-3 sm:px-6 py-3.5">Trạng thái</th>}
                  {visibleColumns.actions && <th className="px-3 sm:px-6 py-3.5 text-center">Hành động</th>}
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
                      <p className="text-xs text-gray-400 dark:text-gray-500">Vui lòng mở menu "Cột hiển thị" phía trên và tích chọn ít nhất 1 cột để xem dữ liệu tồn kho pin.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBatteries.length === 0 ? (
                <tr>
                  <td colSpan={activeColumnsCount} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                    <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Không có viên pin nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredBatteries.map((battery) => {
                  const statusCfg = statusConfig[battery.status] ?? { label: battery.status, className: 'bg-gray-100 text-gray-800' };
                  return (
                    <tr
                      key={battery.id}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      {visibleColumns.id && <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{battery.id}</td>}
                      {visibleColumns.serialNumber && <td className="px-6 py-4 font-mono font-semibold text-gray-800 dark:text-gray-200">{battery.serialNumber}</td>}
                      {visibleColumns.model && <td className="px-6 py-4 font-medium">{battery.model}</td>}
                      {visibleColumns.capacity && <td className="px-6 py-4 font-mono">{battery.capacityKwh} kWh</td>}
                      {visibleColumns.charge && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  battery.currentChargePercentage >= 50
                                    ? 'bg-emerald-500'
                                    : battery.currentChargePercentage >= 20
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${battery.currentChargePercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">{battery.currentChargePercentage}%</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.health && (
                        <td className="px-6 py-4">
                          <span className={`font-bold font-mono ${sohColor(battery.healthPercentage)}`}>
                            {battery.healthPercentage.toFixed(1)}%
                          </span>
                        </td>
                      )}
                      {visibleColumns.cycles && <td className="px-6 py-4 font-mono">{battery.chargeCycles}</td>}
                      {visibleColumns.status && (
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusCfg.className}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onEditClick(battery.id)}
                              title="Chỉnh sửa"
                              className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors active:scale-95"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDeleteClick(battery)}
                              title="Xóa"
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors active:scale-95"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalElements > 0 && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 bg-gray-50/20 dark:bg-gray-900/10">
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
              className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-1.5 focus:ring-blue-500 outline-none"
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
  );
};
export default BatteryTable;
