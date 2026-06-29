import React from 'react';

interface BatteryStatusStatsProps {
  statusCounts: { status: string; count: number }[];
  loading: boolean;
  statusConfig: Record<string, { label: string; className: string }>;
}

export const BatteryStatusStats: React.FC<BatteryStatusStatsProps> = ({ statusCounts, loading, statusConfig }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Thống kê trạng thái pin</h3>
      {loading ? (
        <div className="text-gray-500 text-sm flex items-center gap-3">
          <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Đang tải thống kê...</span>
        </div>
      ) : statusCounts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {statusCounts.map((item) => {
            const cfg = statusConfig[item.status] || { label: item.status, className: 'bg-gray-100 text-gray-800' };
            return (
              <div key={item.status} className="flex flex-col items-center justify-center p-4 border rounded-xl dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 transition-all hover:shadow-sm">
                <span className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{item.count}</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full text-center ${cfg.className}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-gray-500 text-sm">Chưa có dữ liệu thống kê.</div>
      )}
    </div>
  );
};
export default BatteryStatusStats;
