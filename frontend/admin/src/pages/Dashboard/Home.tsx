import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

type AttentionStation = {
  id: string;
  name: string;
  batteryText: string;
  batteryColor: string;
  issue: string;
  issueColor: string;
  actionText: string;
};

const initialAttentionStations: AttentionStation[] = [
  {
    id: "s1",
    name: "Trạm Q2 - Thảo Điền",
    batteryText: "2/50",
    batteryColor: "text-error dark:text-red-400",
    issue: "Thiếu pin nghiêm trọng",
    issueColor: "bg-error/10 text-error dark:bg-red-500/20 dark:text-red-400",
    actionText: "Điều phối ngay"
  },
  {
    id: "s2",
    name: "Trạm Q7 - Lotte Mart",
    batteryText: "5/40",
    batteryColor: "text-warning dark:text-yellow-400",
    issue: "Sắp cạn pin",
    issueColor: "bg-warning/10 text-warning dark:bg-yellow-500/20 dark:text-yellow-400",
    actionText: "Xem chi tiết"
  },
  {
    id: "s3",
    name: "Trạm Q1 - Bitexco",
    batteryText: "48/50",
    batteryColor: "text-gray-500 dark:text-gray-300",
    issue: "Pin cạn quá tải (48 pin trống)",
    issueColor: "bg-warning/10 text-warning dark:bg-yellow-500/20 dark:text-yellow-400",
    actionText: "Điều phối đi"
  }
];

type RecentActivity = {
  id: string;
  type: "swap" | "warning" | "subscription";
  title: string;
  time: string;
};

const initialActivities: RecentActivity[] = [
  { id: "a1", type: "swap", title: "Khách hàng Nguyễn Văn A vừa đổi pin", time: "Trạm Q1 - Nguyễn Huệ • 2 phút trước" },
  { id: "a2", type: "warning", title: "Cảnh báo: Trạm Thảo Điền thiếu pin", time: "Hệ thống AI • 15 phút trước" },
  { id: "a3", type: "subscription", title: "Đăng ký gói Premium mới", time: "Trần Thị B • 1 giờ trước" },
  { id: "a4", type: "swap", title: "Khách hàng Lê Văn C vừa đổi pin", time: "Trạm Q7 - Lotte Mart • 2 giờ trước" },
  { id: "a5", type: "swap", title: "Khách hàng Phạm Thị D vừa đổi pin", time: "Trạm Bình Thạnh • 3 giờ trước" },
  { id: "a6", type: "warning", title: "Bảo trì định kỳ", time: "Trạm Q3 - Võ Văn Tần • 5 giờ trước" },
];

export default function Home() {
  const [attentionStations, setAttentionStations] = useState<AttentionStation[]>(initialAttentionStations);
  const [activities] = useState<RecentActivity[]>(initialActivities);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Header Buttons State
  const [dateRange, setDateRange] = useState("Hôm nay: " + new Date().toLocaleDateString('vi-VN'));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAction = (station: AttentionStation) => {
    // Xóa trạm khỏi danh sách cần lưu ý (Giả lập đã xử lý)
    setAttentionStations(attentionStations.filter(s => s.id !== station.id));
    
    // Hiện thông báo
    setToastMessage(`Đã xử lý tác vụ "${station.actionText}" cho ${station.name}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <PageMeta
        title="Tổng Quan | EV Battery Swap Admin"
        description="Bảng điều khiển trung tâm cho hệ thống quản lý trạm đổi pin xe điện"
      />
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-5 z-50 rounded-lg bg-green-500 px-4 py-3 text-white shadow-lg transition-opacity">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-gray-800 dark:text-white">
          Tổng Quan Hệ Thống
        </h2>
        
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dateRange}
            </button>
            
            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900 z-50">
                <button 
                  onClick={() => { setDateRange("Hôm nay: " + new Date().toLocaleDateString('vi-VN')); setShowDatePicker(false); }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Hôm nay
                </button>
                <button 
                  onClick={() => { setDateRange("7 ngày qua"); setShowDatePicker(false); }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  7 ngày qua
                </button>
                <button 
                  onClick={() => { setDateRange("Tháng này"); setShowDatePicker(false); }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Tháng này
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => {
              setToastMessage("Đang xuất dữ liệu báo cáo hệ thống (.xlsx)...");
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3000);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Tải báo cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Metrics Overview */}
        <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng Số Trạm</span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white">
                  24
                </h4>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-success dark:text-green-400">
                Hoạt động: 23
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng Người Dùng</span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white">
                  4,520
                </h4>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-success dark:text-green-400">
                +12% tuần này
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Gói Thuê Đang Active</span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white">
                  3,105
                </h4>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-error/20 bg-error/5 p-5 dark:border-error/20 dark:bg-red-500/10 md:p-6 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm font-medium text-error dark:text-red-400">Cảnh Báo (Thiếu Pin)</span>
                <h4 className="mt-2 text-title-sm font-bold text-error dark:text-red-400">
                  {attentionStations.length} Trạm
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* Stations Needing Attention */}
        <div className="col-span-12 xl:col-span-7">
          <ComponentCard title="Trạm Cần Lưu Ý">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Tên Trạm
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Lượng Pin Đầy
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Vấn Đề
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {attentionStations.map((station) => (
                    <tr key={station.id}>
                      <td className="px-5 py-4 text-sm text-gray-800 dark:text-white font-medium">{station.name}</td>
                      <td className={`px-5 py-4 text-sm font-bold ${station.batteryColor}`}>{station.batteryText}</td>
                      <td className="px-5 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${station.issueColor}`}>
                          {station.issue}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <button 
                          onClick={() => handleAction(station)}
                          className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
                        >
                          {station.actionText}
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {attentionStations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                        Tuyệt vời! Hiện tại không có trạm nào cần lưu ý.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ComponentCard>
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 xl:col-span-5">
          <ComponentCard title="Hoạt Động Gần Đây">
            <div className="p-5">
              <div className="space-y-6">
                {activities.slice(0, showAllActivities ? activities.length : 3).map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      activity.type === 'swap' ? 'bg-brand-500/10 text-brand-500 dark:bg-brand-500/20 dark:text-brand-400' :
                      activity.type === 'warning' ? 'bg-warning/10 text-warning dark:bg-yellow-500/20 dark:text-yellow-400' :
                      'bg-success/10 text-success dark:bg-green-500/20 dark:text-green-400'
                    }`}>
                      {activity.type === 'swap' && (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      {activity.type === 'warning' && (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {activity.type === 'subscription' && (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {activities.length > 3 && (
                <div className="mt-6 flex justify-center border-t border-gray-100 pt-4 dark:border-gray-800">
                  <button 
                    onClick={() => setShowAllActivities(!showAllActivities)}
                    className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  >
                    {showAllActivities ? "Thu gọn" : "Xem tất cả"}
                  </button>
                </div>
              )}
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
