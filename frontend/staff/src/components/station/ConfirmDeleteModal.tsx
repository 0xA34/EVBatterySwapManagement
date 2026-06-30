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

interface ConfirmDeleteModalProps {
  deleteTarget: Battery | null;
  isDeleting: boolean;
  deleteError: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  deleteTarget,
  isDeleting,
  deleteError,
  onConfirm,
  onCancel,
}) => {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 animate-fade-in border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-full">
            <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Xác nhận xóa pin</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Bạn có chắc chắn muốn xóa viên pin này không? Hành động này không thể hoàn tác.
        </p>
        <p className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-200 mb-4 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-lg border dark:border-gray-700">
          ID: {deleteTarget.id} <br />
          Serial: {deleteTarget.serialNumber}
        </p>
        {deleteError && (
          <p className="text-sm text-red-500 mb-3 font-medium">{deleteError}</p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {isDeleting && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isDeleting ? 'Đang xóa...' : 'Xóa pin'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmDeleteModal;
