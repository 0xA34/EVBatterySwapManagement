import React, { useState } from 'react';

const BatteryInventory: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý tồn kho pin</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Theo dõi số lượng pin đầy, đang sạc, bảo dưỡng theo thời gian thực.</p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pin đầy (Sẵn sàng)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">45</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Đang sạc</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bảo dưỡng</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">3</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Battery List Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">Chi tiết từng viên pin</h3>
          <div className="flex gap-2">
             <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                <option value="all">Tất cả tình trạng</option>
                <option value="ready">Sẵn sàng</option>
                <option value="charging">Đang sạc</option>
                <option value="maintenance">Bảo dưỡng</option>
             </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Mã Pin (ID)</th>
                <th scope="col" className="px-6 py-3">Dung lượng</th>
                <th scope="col" className="px-6 py-3">Model tương thích</th>
                <th scope="col" className="px-6 py-3">Tình trạng (SoH)</th>
                <th scope="col" className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white border-b dark:border-gray-700">BAT-2023-001</td>
                <td className="px-6 py-4 border-b dark:border-gray-700">72V-20Ah</td>
                <td className="px-6 py-4 border-b dark:border-gray-700">VinFast Klara S</td>
                <td className="px-6 py-4 border-b dark:border-gray-700"><span className="text-green-500 font-medium">98% (Tốt)</span></td>
                <td className="px-6 py-4 border-b dark:border-gray-700"><span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Sẵn sàng</span></td>
              </tr>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white border-b dark:border-gray-700">BAT-2023-042</td>
                <td className="px-6 py-4 border-b dark:border-gray-700">60V-20Ah</td>
                <td className="px-6 py-4 border-b dark:border-gray-700">Dat Bike Weaver</td>
                <td className="px-6 py-4 border-b dark:border-gray-700"><span className="text-blue-500 font-medium">95% (Tốt)</span></td>
                <td className="px-6 py-4 border-b dark:border-gray-700"><span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Đang sạc (80%)</span></td>
              </tr>
              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white border-b dark:border-gray-700">BAT-2022-110</td>
                <td className="px-6 py-4 border-b dark:border-gray-700">72V-20Ah</td>
                <td className="px-6 py-4 border-b dark:border-gray-700">VinFast Feliz S</td>
                <td className="px-6 py-4 border-b dark:border-gray-700"><span className="text-orange-500 font-medium">75% (Cảnh báo)</span></td>
                <td className="px-6 py-4 border-b dark:border-gray-700"><span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-orange-900 dark:text-orange-300">Bảo dưỡng</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BatteryInventory;
