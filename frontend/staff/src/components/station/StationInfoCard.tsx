import React from 'react';

interface Station {
  id: number;
  name: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface StationInfoCardProps {
  station: Station | null;
  loading: boolean;
  error: string | null;
}

export const StationInfoCard: React.FC<StationInfoCardProps> = ({ station, loading, error }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6 transition-all">
      {loading ? (
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Đang tải thông tin trạm...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 font-medium">{error}</div>
      ) : station ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">Mã trạm:</span> {station.id}
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">Tên trạm:</span> {station.name}
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">Trạng thái: </span>
            <span className={station.status === 'ACTIVE' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
              {station.status === 'ACTIVE' ? 'Hoạt động' : station.status}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold text-gray-900 dark:text-white">Địa chỉ:</span> {station.address}
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">Ngày tạo:</span> {new Date(station.createdAt).toLocaleString('vi-VN')}
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default StationInfoCard;
