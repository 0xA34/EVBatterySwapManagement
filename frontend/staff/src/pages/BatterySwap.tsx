import React, { useState } from 'react';

const BatterySwap: React.FC = () => {
  const [returnStatus, setReturnStatus] = useState('normal');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Giao dịch đổi pin</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Kiểm tra pin trả về, bàn giao pin mới và thanh toán phí đổi pin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Input/Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 border-b pb-2">1. Thông tin Khách hàng & Pin trả về</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mã Khách hàng / Biển số xe</label>
                <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="VD: KH00123 hoặc 29A1-123.45" />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mã số pin trả về (Quét mã vạch/QR)</label>
                <div className="flex gap-2">
                    <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="ID Pin cũ" />
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Quét
                    </button>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tình trạng ngoại quan (Pin trả về)</label>
                <select 
                    value={returnStatus}
                    onChange={(e) => setReturnStatus(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                >
                    <option value="normal">Bình thường (Không vỡ, móp méo)</option>
                    <option value="minor_damage">Trầy xước/Móp méo nhẹ</option>
                    <option value="major_damage">Hư hỏng vật lý nặng (Phải lập biên bản)</option>
                </select>
              </div>
              
              <div>
                  <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Đã đồng bộ đọc dữ liệu BMS (SoH)</span>
                  </label>
              </div>
            </div>

            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 border-b pb-2">2. Cấp phát Pin mới</h3>
            <div className="space-y-4 mb-6">
               <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mã Pin cấp mới</label>
                <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="VD: BAT-2023-001" defaultValue="BAT-2023-001" />
                <p className="mt-1 text-xs text-green-600 font-medium">Pin phù hợp (72V-20Ah, SoH 98%, Đang đầy 100%)</p>
              </div>
            </div>
            
        </div>

        {/* Right Column - Summary & Payment */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
           <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 border-b pb-2">3. Thanh toán & Xác nhận</h3>
           
           <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 grow">
               <div className="flex justify-between items-center mb-2">
                   <span className="text-gray-600 dark:text-gray-400">Phí đổi pin (Cơ bản):</span>
                   <span className="font-medium text-gray-900 dark:text-white">25,000 ₫</span>
               </div>
               <div className="flex justify-between items-center mb-2">
                   <span className="text-gray-600 dark:text-gray-400">Phụ phí (Hư hỏng ngoài):</span>
                   <span className="font-medium text-gray-900 dark:text-white">{returnStatus === 'normal' ? '0 ₫' : 'Cần đánh giá'}</span>
               </div>
               <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
               <div className="flex justify-between items-center">
                   <span className="text-lg font-bold text-gray-800 dark:text-white">Tổng cộng:</span>
                   <span className="text-2xl font-bold text-brand-500">25,000 ₫</span>
               </div>
           </div>

           <div className="space-y-4">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phương thức thanh toán</label>
              <div className="grid grid-cols-2 gap-3">
                  <button className="py-2.5 px-4 border border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg font-medium">Tiền mặt</button>
                  <button className="py-2.5 px-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Chuyển khoản (QR)</button>
              </div>
              <button className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors shadow-sm mt-4">
                  Xác nhận & Hoàn tất đổi pin
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default BatterySwap;
