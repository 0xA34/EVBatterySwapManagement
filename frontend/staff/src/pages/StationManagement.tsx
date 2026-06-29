import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getApiUrl } from '../utils/api';

interface Station {
  id: number;
  name: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const StationManagement: React.FC = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('staff_auth_token');
        const response = await fetch(getApiUrl('/api/staff/stations'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        });
        
        if (response.status === 401 || response.status === 403) {
           setError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền. Vui lòng thử đăng xuất và đăng nhập lại bằng tài khoản hợp lệ.');
           setIsLoading(false);
           return;
        }

        if (!response.ok) {
          throw new Error('Lỗi khi tải dữ liệu trạm');
        }
        const data = await response.json();
        setStations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStations();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý trạm</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Danh sách các trạm đổi pin hiện có.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Danh sách trạm</h3>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  <th scope="col" className="px-6 py-3">Tên trạm</th>
                  <th scope="col" className="px-6 py-3">Địa chỉ</th>
                  <th scope="col" className="px-6 py-3">Ngày tạo</th>
                  <th scope="col" className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {stations.map(station => (
                  <tr 
                    key={station.id} 
                    onClick={() => navigate(`/stations/${station.id}`)}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{station.id}</td>
                    <td className="px-6 py-4">{station.name}</td>
                    <td className="px-6 py-4">{station.address}</td>
                    <td className="px-6 py-4">{formatDate(station.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${station.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                        {station.status === 'ACTIVE' ? 'Hoạt động' : station.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {stations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">Không có dữ liệu trạm</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationManagement;
