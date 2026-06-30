import React from 'react';

interface BatteryFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  formData: any;
  setFormData: (data: any) => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  statusConfig: Record<string, { label: string; className: string }>;
}

export const BatteryFormModal: React.FC<BatteryFormModalProps> = ({
  isOpen,
  isEdit,
  formData,
  setFormData,
  isLoading,
  error,
  onSubmit,
  onClose,
  statusConfig,
}) => {
  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-2xl mx-4 my-auto animate-scale-up border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isEdit ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
              {isEdit ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Chỉnh sửa thông tin pin' : 'Tạo pin mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Serial Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Số Serial <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Dung lượng (kWh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                value={formData.capacityKwh}
                onChange={(e) => setFormData({ ...formData, capacityKwh: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
              />
            </div>

            {/* Charge Cycles */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Số chu kỳ sạc
              </label>
              <input
                type="number"
                min="0"
                value={formData.chargeCycles}
                onChange={(e) => setFormData({ ...formData, chargeCycles: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
              />
            </div>

            {/* Current Charge Percentage */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Mức sạc hiện tại (%) ({formData.currentChargePercentage}%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.currentChargePercentage}
                  onChange={(e) => setFormData({ ...formData, currentChargePercentage: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.currentChargePercentage}
                  onChange={(e) => setFormData({ ...formData, currentChargePercentage: Math.max(0, Math.min(100, Number(e.target.value))) })}
                  className="w-16 px-2 py-1 text-center border rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Health Percentage */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Sức khỏe SoH (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.healthPercentage}
                onChange={(e) => setFormData({ ...formData, healthPercentage: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
              >
                {Object.entries(statusConfig).map(([key, val]) => (
                  <option key={key} value={key}>{val.label} ({key})</option>
                ))}
              </select>
            </div>

            {/* Current Station ID */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Mã trạm hiện tại (currentStationId)
              </label>
              <input
                type="number"
                value={formData.currentStationId}
                onChange={(e) => setFormData({ ...formData, currentStationId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Giá tiền thuê/bán
              </label>
              <input
                type="number"
                value={formData.amount === null ? '' : formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
              />
            </div>

            {/* User ID */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Mã người dùng (userId - để trống nếu không gán)
              </label>
              <input
                type="number"
                value={formData.userId === null ? '' : formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value === '' ? null : Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
              />
            </div>

            {/* Manufacture Date */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Ngày sản xuất
              </label>
              <input
                type="date"
                value={formData.manufactureDate || ''}
                onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition-all focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-semibold rounded-xl text-white transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm ${isEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {isLoading && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isLoading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo pin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default BatteryFormModal;
