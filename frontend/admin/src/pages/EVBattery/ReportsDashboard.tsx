import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function ReportsDashboard() {
  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      fontFamily: "inherit",
      toolbar: { show: false },
    },
    colors: ["#3b82f6", "#10b981"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: "Lượt đổi pin" },
    },
    legend: { position: "top", horizontalAlign: "right" },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
  };

  const chartSeries = [
    {
      name: "Tuần này",
      data: [120, 180, 150, 210, 240, 310, 280],
    },
    {
      name: "Tuần trước",
      data: [100, 150, 140, 190, 220, 270, 250],
    },
  ];

  return (
    <>
      <PageMeta
        title="Báo Cáo & Thống Kê | EV Battery Swap"
        description="Xem báo cáo doanh thu, tần suất đổi pin, AI dự báo nhu cầu"
      />
      <PageBreadcrumb pageTitle="Báo Cáo & Thống Kê" />

      <div className="space-y-6">
        {/* We can place some metric cards here if EcommerceMetrics is available, or create dummy ones */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng Doanh Thu</span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white">
                  125.4M đ
                </h4>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-green-500 dark:text-green-400">
                +4.5%
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng Lượt Đổi Pin</span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white">
                  1,425
                </h4>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-green-500 dark:text-green-400">
                +12.1%
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Giờ Cao Điểm Mới</span>
                <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white">
                  17:00 - 19:00
                </h4>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Dự báo nhu cầu tuần tới (AI)</span>
                <h4 className="mt-2 text-title-sm font-bold text-orange-500 dark:text-orange-400">
                  Tăng 15%
                </h4>
              </div>
            </div>
          </div>
        </div>

        <ComponentCard title="Tần Suất Đổi Pin & Doanh Thu">
          <div className="h-[320px] w-full">
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height="100%"
              width="100%"
            />
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
