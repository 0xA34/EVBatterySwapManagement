import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

type Ticket = {
  id: number;
  userId: number;
  username: string;
  subject: string;
  message: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: string;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function Support() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Stats count state
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    close: 0
  });

  // Filter States
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  // Selected Ticket & Modal Editing States
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editPriority, setEditPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("LOW");
  const [editResponse, setEditResponse] = useState<string>("");

  // Column Visibility States
  type ColumnKey = "id" | "username" | "userId" | "subject" | "priority" | "status" | "createdAt" | "actions";

  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    id: true,
    username: true,
    userId: true,
    subject: true,
    priority: true,
    status: true,
    createdAt: true,
    actions: true,
  });

  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const columnDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target as Node)) {
        setIsColumnDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const columnsList: { key: ColumnKey; label: string }[] = [
    { key: "id", label: "Mã Ticket" },
    { key: "username", label: "Tài khoản" },
    { key: "userId", label: "Mã KH" },
    { key: "subject", label: "Chủ Đề" },
    { key: "priority", label: "Mức độ" },
    { key: "status", label: "Trạng Thái" },
    { key: "createdAt", label: "Thời Gian" },
    { key: "actions", label: "Hành Động" },
  ];

  const activeColumnsCount = Object.values(visibleColumns).filter(Boolean).length;

  // Fetch Tickets List
  const fetchTickets = async (
    page: number = 0,
    statusFilter: string = "ALL",
    priorityFilter: string = "ALL"
  ) => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      let url = `/api/admin/support-tickets/page?page=${page}&size=${pageSize}`;
      if (statusFilter !== "ALL") {
        let apiStatus = statusFilter;
        if (statusFilter === "OPEN_MAIL") apiStatus = "OPEN";
        else if (statusFilter === "CLOSE_MAIL") apiStatus = "CLOSE";
        url += `&status=${encodeURIComponent(apiStatus)}`;
      }
      if (priorityFilter !== "ALL") {
        url += `&priority=${encodeURIComponent(priorityFilter)}`;
      }

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Không thể tải danh sách khiếu nại & yêu cầu hỗ trợ");
      }

      const data = await response.json();
      setTickets(data.content || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.number || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Stats Counts
  const fetchStats = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/admin/support-tickets/countStatus", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        let openCount = 0;
        let closeCount = 0;
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (item.status === "OPEN") openCount = item.count;
            else if (item.status === "CLOSE") closeCount = item.count;
          });
        } else if (data && typeof data === "object") {
          if (data.OPEN !== undefined) openCount = data.OPEN;
          if (data.CLOSE !== undefined) closeCount = data.CLOSE;
        }

        setStats({
          total: openCount + closeCount,
          open: openCount,
          close: closeCount
        });
      }
    } catch (err) {
      console.error("Lỗi khi tải thống kê khiếu nại:", err);
    }
  };

  // Load statuses on initial render
  useEffect(() => {
    if (!token) return;
    const fetchStatuses = async () => {
      try {
        const response = await fetch("/api/admin/support-tickets/status", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStatuses(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách trạng thái:", err);
      }
    };
    fetchStatuses();
  }, [token]);

  // Log active statuses for diagnostics to satisfy TS unused compiler warning
  useEffect(() => {
    if (Object.keys(statuses).length > 0) {
      console.log("Loaded support tickets status map:", statuses);
    }
  }, [statuses]);

  // Effect to load tickets and stats
  useEffect(() => {
    if (token) {
      fetchTickets(currentPage, filterStatus, filterPriority);
    }
  }, [token, currentPage, filterStatus, filterPriority, pageSize]);

  // Effect to load stats on initial render and when status changes
  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const handleOpenModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditPriority(ticket.priority);
    setEditResponse(ticket.adminResponse || "");
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !token) return;

    // Tự động chuyển sang Đã giải quyết (CLOSE) nếu có câu trả lời phản hồi
    // Ngược lại, nếu câu trả lời để trống, giữ nguyên trạng thái hiện tại
    const finalStatus = editResponse.trim() ? "CLOSE" : selectedTicket.status;

    try {
      const response = await fetch(`/api/admin/support-tickets/${selectedTicket.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: finalStatus,
          priority: editPriority,
          adminResponse: editResponse
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Lỗi khi cập nhật yêu cầu hỗ trợ");
      }

      handleCloseModal();
      // Reload tickets and stats
      fetchTickets(currentPage, filterStatus, filterPriority);
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Client-side quick filter on current page search term
  const filteredTickets = tickets.filter(t => {
    const matchSearch =
      t.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toString().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

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
      case "OPEN":
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300">
            Chờ xử lý
          </span>
        );
      case "CLOSE":
      case "RESOLVED":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-500/20 dark:text-green-300">
            Đã giải quyết
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 dark:bg-gray-500/20 dark:text-gray-300">
            {status}
          </span>
        );
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tổng số yêu cầu</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</h3>
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
              <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.open}</h3>
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
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.close}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Hộp Thư Mở</p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.open}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Hộp Thư Đóng</p>
              <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.close}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 shadow-xs">
            {error}
          </div>
        )}

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
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={e => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(0);
                }}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:border-brand-500 focus:outline-none p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="OPEN">Chờ xử lý</option>
                <option value="CLOSE">Đã giải quyết</option>
                <option value="OPEN_MAIL">Hộp Thư Mở</option>
                <option value="CLOSE_MAIL">Hộp Thư Đóng</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={e => {
                  setFilterPriority(e.target.value);
                  setCurrentPage(0);
                }}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:border-brand-500 focus:outline-none p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="ALL">Tất cả mức độ</option>
                <option value="HIGH">Khẩn cấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="LOW">Thấp</option>
              </select>

              {/* Column Selector Dropdown */}
              <div ref={columnDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-xl focus:outline-none px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer font-medium"
                >
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span>Hiển thị cột</span>
                  <svg className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isColumnDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isColumnDropdownOpen && (
                  <div className="absolute left-0 z-50 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 p-3 space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 mb-1 px-1">
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Cấu hình cột
                      </span>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeColumnsCount === columnsList.length}
                          ref={(input) => {
                            if (input) {
                              input.indeterminate = activeColumnsCount > 0 && activeColumnsCount < columnsList.length;
                            }
                          }}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setVisibleColumns({
                              id: checked,
                              username: checked,
                              userId: checked,
                              subject: checked,
                              priority: checked,
                              status: checked,
                              createdAt: checked,
                              actions: checked,
                            });
                          }}
                          className="rounded text-brand-500 focus:ring-brand-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Tất cả
                        </span>
                      </label>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-60 overflow-y-auto">
                      {columnsList.map((col) => (
                        <label
                          key={col.key}
                          className="flex items-center gap-3 py-2 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg select-none"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key]}
                            onChange={() => setVisibleColumns(prev => ({
                              ...prev,
                              [col.key]: !prev[col.key]
                            }))}
                            className="rounded text-brand-500 focus:ring-brand-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {col.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="animate-spin h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Đang tải dữ liệu...</span>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto w-full">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {visibleColumns.id && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Mã Ticket
                    </th>
                  )}
                  {visibleColumns.username && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Tài khoản
                    </th>
                  )}
                  {visibleColumns.userId && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Mã KH
                    </th>
                  )}
                  {visibleColumns.subject && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Chủ Đề
                    </th>
                  )}
                  {visibleColumns.priority && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Mức độ
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Trạng Thái
                    </th>
                  )}
                  {visibleColumns.createdAt && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Thời Gian
                    </th>
                  )}
                  {visibleColumns.actions && (
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-white">
                      Hành Động
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {visibleColumns.id && (
                      <td className="px-5 py-4 text-sm font-bold text-brand-500">
                        #{ticket.id}
                      </td>
                    )}
                    {visibleColumns.username && (
                      <td className="px-5 py-4 text-sm text-gray-800 dark:text-white">
                        {ticket.username}
                      </td>
                    )}
                    {visibleColumns.userId && (
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        #{ticket.userId}
                      </td>
                    )}
                    {visibleColumns.subject && (
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white">
                        {ticket.subject}
                      </td>
                    )}
                    {visibleColumns.priority && (
                      <td className="px-5 py-4 text-sm">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-5 py-4 text-sm">
                        {getStatusBadge(ticket.status)}
                      </td>
                    )}
                    {visibleColumns.createdAt && (
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(ticket.createdAt).toLocaleString("vi-VN")}
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="px-5 py-4 text-sm">
                        <button
                          onClick={() => handleOpenModal(ticket)}
                          className="text-brand-500 hover:text-brand-600 font-semibold cursor-pointer text-sm"
                        >
                          Cập nhật
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                
                {filteredTickets.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={activeColumnsCount} className="px-5 py-8 text-center text-gray-500">
                      Chưa có yêu cầu hỗ trợ nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Premium Pagination Bar */}
          {(totalPages > 1 || tickets.length > 0) && (
            <div className="flex justify-between items-center mt-6 px-5 border-t border-gray-100 dark:border-gray-800 pt-4 pb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white bg-white"
                >
                  <option value="10">10 / trang</option>
                  <option value="15">15 / trang</option>
                  <option value="20">20 / trang</option>
                  <option value="50">50 / trang</option>
                  <option value="100">100 / trang</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1 rounded border border-gray-200 text-sm font-medium disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer bg-white dark:bg-gray-800"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1 rounded border border-gray-200 text-sm font-medium disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer bg-white dark:bg-gray-800"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
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
                  <span className="text-brand-600 dark:text-brand-400 font-bold">#{selectedTicket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Khách hàng:</span>
                  <span className="text-gray-900 dark:text-white font-medium">{selectedTicket.username} (Mã KH: #{selectedTicket.userId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Thời gian tạo:</span>
                  <span className="text-gray-600 dark:text-gray-300">{new Date(selectedTicket.createdAt).toLocaleString("vi-VN")}</span>
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

              {/* Dropdown for Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Cập nhật độ ưu tiên
                </label>
                <select
                  value={editPriority}
                  onChange={e => setEditPriority(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="HIGH">Khẩn cấp</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="LOW">Thấp</option>
                </select>
              </div>

              {/* Response Note Textarea */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Ghi chú phản hồi / Hướng xử lý
                </label>
                <textarea
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
