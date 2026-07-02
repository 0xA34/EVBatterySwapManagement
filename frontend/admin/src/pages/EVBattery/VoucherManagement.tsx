import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

type Voucher = {
  id: number;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  limitUsage: number;
  useCount: number;
  minOrderValue: number | null;
  startDate: string | null; // ISO string
  endDate: string | null; // ISO string
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
};

export default function VoucherManagement() {
  const { token } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Filter/Search states
  const [searchCode, setSearchCode] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Column Visibility States
  type ColumnKey = "code" | "description" | "discountValue" | "limitUsage" | "minOrderValue" | "dates" | "status" | "actions";

  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    code: true,
    description: true,
    discountValue: true,
    limitUsage: true,
    minOrderValue: true,
    dates: true,
    status: true,
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
    { key: "code", label: "Mã Voucher" },
    { key: "description", label: "Mô tả" },
    { key: "discountValue", label: "Mức giảm giá" },
    { key: "limitUsage", label: "Lượt sử dụng" },
    { key: "minOrderValue", label: "Đơn hàng tối thiểu" },
    { key: "dates", label: "Thời gian áp dụng" },
    { key: "status", label: "Trạng thái" },
    { key: "actions", label: "Hành động" },
  ];

  const activeColumnsCount = Object.values(visibleColumns).filter(Boolean).length;

  // Modal CRUD states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: "",
    limitUsage: "",
    minOrderValue: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "EXPIRED",
  });

  // Load stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
  });

  const getActualStatus = (v: Voucher): "ACTIVE" | "INACTIVE" | "EXPIRED" => {
    if (v.endDate) {
      const end = new Date(v.endDate);
      if (end < new Date()) {
        return "EXPIRED";
      }
    }
    return v.status;
  };

  const fetchVouchers = async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      // Backend expects: GET /api/admin/vouchers?page=0&size=15
      const response = await fetch(`/api/admin/vouchers?page=${currentPage}&size=${pageSize}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải danh sách mã giảm giá");
      }

      const data = await response.json();
      // Backend returns a Spring Page object
      const content = data.content || [];
      setVouchers(content);
      setTotalPages(data.totalPages || 1);

      // Compute simple stats locally based on overall records if possible,
      // or from current page if pagination limits details. We will compute
      // page-level stats or mock them elegantly for beautiful premium cards.
      const activeCount = content.filter((v: Voucher) => getActualStatus(v) === "ACTIVE").length;
      const inactiveCount = content.filter((v: Voucher) => getActualStatus(v) === "INACTIVE").length;
      const expiredCount = content.filter((v: Voucher) => getActualStatus(v) === "EXPIRED").length;
      
      setStats({
        total: data.totalElements || content.length,
        active: activeCount, // approximate active
        inactive: inactiveCount,
        expired: expiredCount,
      });

    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi không mong muốn");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [token, currentPage, pageSize]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchVouchers();
  };

  const handleOpenModal = (voucher?: Voucher) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        description: voucher.description || "",
        discountType: (voucher.discountType === "PERCENTAGE" || voucher.discountType === "FIXED_AMOUNT")
          ? voucher.discountType
          : "PERCENTAGE",
        discountValue: voucher.discountValue.toString(),
        limitUsage: voucher.limitUsage.toString(),
        minOrderValue: voucher.minOrderValue ? voucher.minOrderValue.toString() : "",
        startDate: voucher.startDate ? voucher.startDate.substring(0, 16) : "",
        endDate: voucher.endDate ? voucher.endDate.substring(0, 16) : "",
        status: getActualStatus(voucher),
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        limitUsage: "",
        minOrderValue: "",
        startDate: "",
        endDate: "",
        status: "ACTIVE",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVoucher(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.code.trim()) {
      setAlertMessage("Mã voucher không được để trống");
      return;
    }

    const val = Number(formData.discountValue);
    if (isNaN(val) || val <= 0) {
      setAlertMessage("Giá trị giảm giá phải lớn hơn 0");
      return;
    }

    if (formData.discountType === "PERCENTAGE" && val > 100) {
      setAlertMessage("Phần trăm giảm giá không được vượt quá 100%");
      return;
    }

    if (formData.discountType === "FIXED_AMOUNT") {
      const minOrder = formData.minOrderValue ? Number(formData.minOrderValue) : 0;
      if (minOrder <= val) {
        setAlertMessage("Giá trị đơn hàng tối thiểu phải lớn hơn số tiền giảm giá");
        return;
      }
    }

    const limit = Number(formData.limitUsage);
    if (isNaN(limit) || limit < 1) {
      setAlertMessage("Giới hạn sử dụng phải ít nhất là 1");
      return;
    }

    // Date validations
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        setAlertMessage("Ngày bắt đầu không được lớn hơn ngày kết thúc");
        return;
      }
    }

    if (formData.endDate) {
      const end = new Date(formData.endDate);
      const now = new Date();
      if (end < now) {
        setAlertMessage("Ngày kết thúc không được nhỏ hơn thời gian hiện tại");
        return;
      }
    }

    const payload: any = {
      code: formData.code.toUpperCase().replace(/\s+/g, ""),
      description: formData.description || null,
      discountType: formData.discountType,
      discountValue: val,
      limitUsage: limit,
      minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      status: formData.status,
    };

    try {
      let response;
      if (editingVoucher) {
        response = await fetch(`/api/admin/vouchers/${editingVoucher.id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/admin/vouchers", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Lỗi khi lưu mã giảm giá");
      }

      handleCloseModal();
      fetchVouchers();
    } catch (err: any) {
      setAlertMessage(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này không?")) return;
    try {
      const response = await fetch(`/api/admin/vouchers/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Lỗi khi xóa mã giảm giá");
      }

      fetchVouchers();
    } catch (err: any) {
      setAlertMessage(err.message || "Lỗi khi xóa mã giảm giá");
    }
  };

  // Helper formats
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "Không giới hạn";
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtered vouchers list locally to make filters snappy
  const filteredVouchers = vouchers.filter((v) => {
    const matchesCode = v.code.toLowerCase().includes(searchCode.toLowerCase());
    const matchesType = filterType ? v.discountType === filterType : true;
    const matchesStatus = filterStatus ? v.status === filterStatus : true;
    return matchesCode && matchesType && matchesStatus;
  });

  return (
    <>
      <PageMeta
        title="Quản Lý Voucher | ChargeX"
        description="Tạo và quản lý các mã giảm giá cho khách hàng sử dụng dịch vụ"
      />
      <PageBreadcrumb pageTitle="Quản Lý Voucher" />

      <div className="space-y-6">
        {error && (
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-transform duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Tổng số Voucher
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </h3>
              </div>
              <div className="p-3 bg-brand-50 rounded-xl dark:bg-brand-500/10 text-brand-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 14.25l6-6m4.5-3.75L3 18.75m18 0l-6-6m6 6H3"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-transform duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Đang hoạt động
                </p>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </h3>
              </div>
              <div className="p-3 bg-green-50 rounded-xl dark:bg-green-500/10 text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-transform duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Tạm ngưng
                </p>
                <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.inactive}
                </h3>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl dark:bg-yellow-500/10 text-yellow-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-transform duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Đã hết hạn
                </p>
                <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.expired}
                </h3>
              </div>
              <div className="p-3 bg-red-50 rounded-xl dark:bg-red-500/10 text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Panel */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Danh sách Voucher
                {isLoading && (
                  <span className="text-sm font-normal text-gray-400 ml-2 animate-pulse">
                    (Đang tải...)
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer shadow-sm shadow-brand-500/20"
              >
                + Thêm Voucher Mới
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
              <input
                type="text"
                placeholder="Nhập mã voucher..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Tạm ngưng</option>
                <option value="EXPIRED">Đã hết hạn</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Tất cả loại giảm</option>
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-semibold cursor-pointer shadow-sm shadow-brand-500/20"
                >
                  Tìm Kiếm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchCode("");
                    setFilterType("");
                    setFilterStatus("");
                    setCurrentPage(0);
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                  title="Làm mới"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>

                {/* Column Selection Dropdown */}
                <div className="relative" ref={columnDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:outline-none px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer font-semibold"
                  >
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    <span>Cột</span>
                    <svg className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isColumnDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isColumnDropdownOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-3 space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 mb-1 px-1">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          Hiển thị cột
                        </span>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
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
                                code: checked,
                                description: checked,
                                discountValue: checked,
                                limitUsage: checked,
                                minOrderValue: checked,
                                dates: checked,
                                status: checked,
                                actions: checked,
                              });
                            }}
                            className="rounded text-brand-500 focus:ring-brand-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Tất cả
                          </span>
                        </label>
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-0.5">
                        {columnsList.map((col) => (
                          <label
                            key={col.key}
                            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
                          >
                            <input
                              type="checkbox"
                              checked={visibleColumns[col.key]}
                              onChange={() =>
                                setVisibleColumns({
                                  ...visibleColumns,
                                  [col.key]: !visibleColumns[col.key],
                                })
                              }
                              className="rounded text-brand-500 focus:ring-brand-500 h-4 w-4 dark:bg-gray-800 dark:border-gray-700"
                            />
                            <span>{col.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Vouchers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  {visibleColumns.code && (
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Mã Voucher
                    </th>
                  )}
                  {visibleColumns.description && (
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                  )}
                  {visibleColumns.discountValue && (
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Mức giảm giá
                    </th>
                  )}
                  {visibleColumns.limitUsage && (
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Giới hạn lượt dùng
                    </th>
                  )}
                  {visibleColumns.minOrderValue && (
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Đơn hàng tối thiểu
                    </th>
                  )}
                  {visibleColumns.dates && (
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Thời gian áp dụng
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  )}
                  {visibleColumns.actions && (
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                      Hành động
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {visibleColumns.code && (
                      <td className="p-4">
                        <span className="font-mono font-bold text-sm bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg text-brand-600 dark:text-brand-400">
                          {voucher.code}
                        </span>
                      </td>
                    )}
                    {visibleColumns.description && (
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                        {voucher.description || "-"}
                      </td>
                    )}
                    {visibleColumns.discountValue && (
                      <td className="p-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {voucher.discountType === "PERCENTAGE"
                          ? `${voucher.discountValue}%`
                          : formatCurrency(voucher.discountValue)}
                      </td>
                    )}
                    {visibleColumns.limitUsage && (
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex flex-col gap-0.5">
                          <span>
                            {voucher.useCount} / {voucher.limitUsage}
                          </span>
                          <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="bg-brand-500 h-full rounded-full"
                              style={{
                                width: `${Math.min(
                                  (voucher.useCount / voucher.limitUsage) * 100,
                                  100
                               )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.minOrderValue && (
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {voucher.minOrderValue
                          ? formatCurrency(voucher.minOrderValue)
                          : "Không yêu cầu"}
                      </td>
                    )}
                    {visibleColumns.dates && (
                      <td className="p-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>
                          <span className="text-gray-400">Bắt đầu:</span>{" "}
                          {formatDate(voucher.startDate)}
                        </div>
                        <div>
                          <span className="text-gray-400">Kết thúc:</span>{" "}
                          {formatDate(voucher.endDate)}
                        </div>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="p-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            getActualStatus(voucher) === "ACTIVE"
                              ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                              : getActualStatus(voucher) === "INACTIVE"
                              ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                              : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                          }`}
                        >
                          {getActualStatus(voucher) === "ACTIVE"
                            ? "Hoạt động"
                            : getActualStatus(voucher) === "INACTIVE"
                            ? "Tạm ngưng"
                            : "Hết hạn"}
                        </span>
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="p-4 text-sm text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(voucher)}
                          className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors inline-flex items-center"
                          title="Chỉnh sửa"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.82a4.5 4.5 0 0 1-2.052 1.23l-3.293.715.714-3.293a4.5 4.5 0 0 1 1.23-2.052l12.56-12.56Z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(voucher.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg dark:hover:bg-red-500/10 dark:text-red-400 transition-colors inline-flex items-center"
                          title="Xóa"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}

                {filteredVouchers.length === 0 && (
                  <tr>
                    <td colSpan={activeColumnsCount} className="p-8 text-center text-gray-500">
                      Chưa có mã giảm giá nào khớp với tiêu chí tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {(totalPages > 1 || vouchers.length > 0) && (
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
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                  className="px-3 py-1 rounded border border-gray-200 text-sm font-medium disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 cursor-pointer"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1 rounded border border-gray-200 text-sm font-medium disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 cursor-pointer"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingVoucher ? "Chỉnh sửa Voucher" : "Tạo Voucher Mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Mã Voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono uppercase"
                    placeholder="VD: MAGIAMGIA10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Tạm ngưng</option>
                    <option value="EXPIRED">Đã hết hạn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Mô tả công dụng của mã giảm giá..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Loại giảm giá <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as any,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Giá trị giảm <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={
                        formData.discountType === "FIXED_AMOUNT"
                          ? formData.discountValue
                            ? Number(formData.discountValue).toLocaleString("vi-VN")
                            : ""
                          : formData.discountValue
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, discountValue: rawValue });
                      }}
                      className="w-full rounded-lg border border-gray-300 pl-4 pr-10 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder={
                        formData.discountType === "PERCENTAGE" ? "VD: 15" : "VD: 50.000"
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold text-sm select-none">
                      {formData.discountType === "PERCENTAGE" ? "%" : "đ"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Lượt sử dụng tối đa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.limitUsage}
                    onChange={(e) =>
                      setFormData({ ...formData, limitUsage: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="VD: 100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Đơn hàng tối thiểu
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        formData.minOrderValue
                          ? Number(formData.minOrderValue).toLocaleString("vi-VN")
                          : ""
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, minOrderValue: rawValue });
                      }}
                      className="w-full rounded-lg border border-gray-300 pl-4 pr-10 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="VD: 100.000"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold text-sm select-none">
                      đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 text-sm font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-semibold cursor-pointer shadow-sm shadow-brand-500/20"
                >
                  {editingVoucher ? "Cập nhật" : "Tạo Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert Popup Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center transform transition-all animate-scale-up">
            {/* Warning Circle Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-500/10 mb-4">
              <svg
                className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              Thông Báo
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {alertMessage}
            </p>
            
            <button
              onClick={() => setAlertMessage(null)}
              className="mt-5 w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors text-sm font-semibold shadow-md shadow-brand-500/10 focus:outline-none cursor-pointer"
            >
              Đồng ý
            </button>
          </div>
        </div>
      )}
    </>
  );
}
