import { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { DollarLineIcon, PieChartIcon, BoxIcon, BoxCubeIcon } from "../icons";

type TimePeriod = "day" | "week" | "month";

export default function Revenue() {
  const [period, setPeriod] = useState<TimePeriod>("day");

  // Dynamic data based on selected period
  const kpiData = {
    day: {
      revenue: "540,000 đ",
      revenueTrend: "+5.2% so với hôm qua",
      revenueTrendPositive: true,
      orders: "6",
      ordersStatus: "0 Đang xử lý",
      swaps: "6",
      swapsStatus: "Tất cả thành công",
      activeBatteries: "48",
      activeBatteriesStatus: "Đang hoạt động",
    },
    week: {
      revenue: "3,820,000 đ",
      revenueTrend: "+12.4% so với tuần trước",
      revenueTrendPositive: true,
      orders: "42",
      ordersStatus: "1 Đang xử lý",
      swaps: "41",
      swapsStatus: "40 thành công, 1 lỗi",
      activeBatteries: "48",
      activeBatteriesStatus: "Đang hoạt động",
    },
    month: {
      revenue: "16,450,000 đ",
      revenueTrend: "-2.1% so với tháng trước",
      revenueTrendPositive: false,
      orders: "186",
      ordersStatus: "3 Đang xử lý",
      swaps: "183",
      swapsStatus: "180 thành công, 3 lỗi",
      activeBatteries: "48",
      activeBatteriesStatus: "Đang hoạt động",
    },
  };

  const chartData = {
    day: {
      categories: Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")),
      series: [
        {
          name: "Doanh thu (đ)",
          data: [
            120000, 180000, 150000, 220000, 310000, 280000, 340000, 410000, 390000,
            420000, 480000, 520000, 500000, 540000, 580000, 620000, 600000, 640000,
            690000, 670000, 710000, 780000, 750000, 810000, 890000, 850000, 920000,
            980000, 950000, 1020000, 990000
          ],
        },
      ],
    },
    week: {
      categories: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
      series: [
        {
          name: "Doanh thu (đ)",
          data: [420000, 510000, 480000, 590000, 680000, 820000, 790000],
        },
      ],
    },
    month: {
      categories: [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
      ],
      series: [
        {
          name: "Doanh thu (đ)",
          data: [
            12000000, 13500000, 15000000, 14200000, 16800000, 17500000,
            16200000, 15800000, 18200000, 19500000, 18900000, 21000000
          ],
        },
      ],
    },
  };

  const currentKPI = kpiData[period];
  const currentChart = chartData[period];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: {
        show: false,
      },
      fontFamily: "Inter, sans-serif",
      background: "transparent",
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#3b82f6"],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: "#3b82f6",
            opacity: 0.4,
          },
          {
            offset: 100,
            color: "#3b82f6",
            opacity: 0.01,
          },
        ],
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "rgba(148, 163, 184, 0.1)",
      strokeDashArray: 4,
      padding: {
        left: 20,
        right: 20,
      },
    },
    xaxis: {
      categories: currentChart.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + "M đ";
          }
          return value.toLocaleString("vi-VN") + "đ";
        },
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    tooltip: {
      theme: "dark",
      x: {
        show: true,
      },
      y: {
        formatter: (value) => value.toLocaleString("vi-VN") + " đ",
      },
    },
    theme: {
      mode: "dark",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tổng quan hiệu suất</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Theo dõi tình hình kinh doanh, số lượng lượt đổi pin và doanh thu trạm.
          </p>
        </div>

        {/* Time period tabs switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-fit border border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={() => setPeriod("day")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              period === "day"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Ngày
          </button>
          <button
            onClick={() => setPeriod("week")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              period === "week"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              period === "month"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Tháng
          </button>
        </div>
      </div>

      {/* KPI 4 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Card 1: Doanh thu */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Tổng doanh thu
              </p>
              <h3 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {currentKPI.revenue}
              </h3>
              <span
                className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  currentKPI.revenueTrendPositive
                    ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                }`}
              >
                {currentKPI.revenueTrend}
              </span>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
              <DollarLineIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Đơn hàng */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Tổng đơn hàng
              </p>
              <h3 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {currentKPI.orders}
              </h3>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {currentKPI.ordersStatus}
              </span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <BoxIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Đã đổi */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Lượt đổi pin
              </p>
              <h3 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {currentKPI.swaps}
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {currentKPI.swapsStatus}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <PieChartIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 4: Pin đang bán */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xs relative overflow-hidden transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Pin sẵn sàng
              </p>
              <h3 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {currentKPI.activeBatteries}
              </h3>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                {currentKPI.activeBatteriesStatus}
              </span>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 dark:text-amber-400">
              <BoxCubeIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart Card */}
      <div className="bg-white dark:bg-gray-850 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg text-gray-850 dark:text-white flex items-center gap-2">
              Xu hướng doanh thu ({period === "day" ? "Ngày" : period === "week" ? "Tuần" : "Tháng"})
              <span className="text-blue-500 text-xs font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                Live
              </span>
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 hidden sm:block">
              Biểu đồ trực quan biểu thị biến động doanh thu phát sinh từ hoạt động dịch vụ đổi pin.
            </p>
          </div>
        </div>

        {/* Apex Chart Component */}
        <div className="w-full min-h-[220px] sm:min-h-[300px] md:min-h-[350px]">
          <ReactApexChart
            options={chartOptions}
            series={currentChart.series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
}
}
