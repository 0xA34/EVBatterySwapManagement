import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

type Ticket = {
  id: string;
  customerName: string;
  phoneNumber: string;
  subject: string;
  message: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  responseNote?: string;
};

const initialTickets: Ticket[] = [
  {
    id: "TK-001",
    customerName: "Nguyễn Văn A",
    phoneNumber: "0912345678",
    subject: "Lỗi kẹt pin tại trạm TR-001",
    message: "Tôi không lấy được pin mới ra dù đã thanh toán thành công và cho pin cũ vào trạm.",
    priority: "HIGH",
    status: "PENDING",
    createdAt: "2026-05-27 08:30:00"
  },
  {
    id: "TK-002",
    customerName: "Trần Thị B",
    phoneNumber: "0987654321",
    subject: "Hỏi về gói cước Premium",
    message: "Gói cước Premium có giới hạn số lần đổi pin một ngày không? Tôi đổi lần thứ 4 thì trạm báo hết lượt.",
    priority: "LOW",
    status: "RESOLVED",
    createdAt: "2026-05-26 14:15:00",
    responseNote: "Gói cước Premium không giới hạn số lần đổi nhưng mỗi lần đổi phải cách nhau tối thiểu 30 phút để tránh gian lận thương mại."
  },
  {
    id: "TK-003",
    customerName: "Lê Văn C",
    phoneNumber: "0905556667",
    subject: "Trạm sạc TR-005 bị mất điện",
    message: "Màn hình trạm sạc tắt ngúm, không thể thao tác quét QR hay đổi pin.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    createdAt: "2026-05-27 09:45:00",
    responseNote: "Đang cử kỹ thuật viên khu vực Quận 1 đến trạm TR-005 để kiểm tra nguồn điện đầu vào."
  },
  {
    id: "TK-004",
    customerName: "Hoàng Văn Nam",
    phoneNumber: "0945678123",
    subject: "Hoàn tiền giao dịch thất bại",
    message: "Tài khoản của tôi bị trừ 50,000đ nhưng giao dịch đổi pin báo lỗi hệ thống tại trạm TR-008.",
    priority: "MEDIUM",
    status: "PENDING",
    createdAt: "2026-05-27 11:20:00"
  }
];

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Modal Editing States
  const [editStatus, setEditStatus] = useState<"PENDING" | "IN_PROGRESS" | "RESOLVED">("PENDING");
  const [editResponse, setEditResponse] = useState<string>("");

  const handleOpenModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditResponse(ticket.responseNote || "");
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setTickets(prev =>
      prev.map(t =>
        t.id === selectedTicket.id
          ? { ...t, status: editStatus, responseNote: editResponse }
          : t
      )
    );
    handleCloseModal();
  };

  // Filter logic
  const filteredTickets = tickets.filter(t => {
    const matchStatus = filterStatus === "ALL" || t.status === filterStatus;
    const matchPriority = filterPriority === "ALL" || t.priority === filterPriority;
    const matchSearch =
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  // Calculate quick stats
  const totalCount = tickets.length;
  const pendingCount = tickets.filter(t => t.status === "PENDING").length;
  const inProgressCount = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED").length;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-red-500/20 dark:text-red-300">
            Khẩn cấp
          </span>
        );
      case "MEDIUM":
        return (
          <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-orange-500/20 dark:text-orange-300">
            Trung bình
          </span>
        );
      case "LOW":
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
            Thấp
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300">
            Chờ xử lý
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
            Đang xử lý
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-500/20 dark:text-green-300">
            Đã giải quyết
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <PageMeta
        title="Quản Lý Khiếu Nại | EV Battery Admin"
        description="Quản lý yêu cầu hỗ trợ và khiếu nại từ khách hàng"
      />
      <PageBreadcrumb pageTitle="Quản Lý Yêu Cầu Hỗ Trợ" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tổng số yêu cầu</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Chờ xử lý</p>
              <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Đang xử lý</p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Đã giải quyết</p>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{resolvedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Danh sách khiếu nại & yêu cầu hỗ trợ">
          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm nhanh..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:border-brand-500 focus:outline-none p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ xử lý</option>
                <option value="IN_PROGRESS">Đang xử lý</option>
                <option value="RESOLVED">Đã giải quyết</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:border-brand-500 focus:outline-none p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="ALL">Tất cả mức độ</option>
                <option value="HIGH">Khẩn cấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="LOW">Thấp</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto w-full">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Mã Ticket
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Khách Hàng
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Số điện thoại
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Chủ Đề
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Mức độ
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Trạng Thái
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Thời Gian
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-4 text-sm font-medium text-brand-500">
                      {ticket.id}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-800 dark:text-white">
                      {ticket.customerName}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {ticket.phoneNumber}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                      {ticket.subject}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {ticket.createdAt}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <button
                        onClick={() => handleOpenModal(ticket)}
                        className="text-brand-500 hover:text-brand-600 font-semibold cursor-pointer text-sm"
                      >
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-gray-500">
                      Chưa có yêu cầu hỗ trợ nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>

      {/* Ticket Details & Action Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Xử Lý Yêu Cầu Hỗ Trợ
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveChanges} className="space-y-4">
              {/* Ticket details display */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Mã Ticket:</span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold">{selectedTicket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Khách hàng:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{selectedTicket.customerName} ({selectedTicket.phoneNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Thời gian tạo:</span>
                  <span className="text-gray-600 dark:text-gray-300">{selectedTicket.createdAt}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                  <span className="font-semibold text-gray-600 dark:text-gray-400 block mb-1">Chủ đề:</span>
                  <p className="text-gray-900 dark:text-white font-semibold">{selectedTicket.subject}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400 block mb-1">Nội dung yêu cầu:</span>
                  <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    {selectedTicket.message}
                  </p>
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Cập nhật trạng thái
                </label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="IN_PROGRESS">Đang xử lý</option>
                  <option value="RESOLVED">Đã giải quyết</option>
                </select>
              </div>

              {/* Response Note Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Ghi chú phản hồi / Hướng xử lý
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ghi chú phương án khắc phục sự cố kỹ thuật hoặc phản hồi cho khách hàng..."
                  value={editResponse}
                  onChange={e => setEditResponse(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors text-sm font-medium cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors text-sm font-medium cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
