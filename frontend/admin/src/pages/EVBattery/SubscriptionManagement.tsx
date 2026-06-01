import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

type Subscription = {
  id: string;
  name: string;
  price: string;
  features: string[];
  isPremium?: boolean;
};

const initialSubscriptions: Subscription[] = [
  {
    id: "1",
    name: "Gói Cơ Bản (Standard)",
    price: "500.000đ",
    features: [
      "Tối đa 15 lần đổi pin/tháng",
      "Hỗ trợ cứu hộ 1 lần/tháng",
      "Phù hợp di chuyển quãng ngắn"
    ]
  },
  {
    id: "2",
    name: "Gói Cao Cấp (Premium)",
    price: "1.200.000đ",
    features: [
      "Không giới hạn số lần đổi pin",
      "Hỗ trợ cứu hộ không giới hạn",
      "Phù hợp di chuyển liên tục, tài xế công nghệ"
    ],
    isPremium: true
  }
];

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    features: "",
    isPremium: false
  });

  const handleOpenModal = (sub?: Subscription) => {
    if (sub) {
      setEditingSub(sub);
      setFormData({
        name: sub.name,
        price: sub.price,
        features: sub.features.join("\n"),
        isPremium: sub.isPremium || false
      });
    } else {
      setEditingSub(null);
      setFormData({ name: "", price: "", features: "", isPremium: false });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSub(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const featuresArray = formData.features.split("\n").filter(f => f.trim() !== "");
    
    if (editingSub) {
      setSubscriptions(subscriptions.map(s => 
        s.id === editingSub.id 
          ? { ...editingSub, name: formData.name, price: formData.price, features: featuresArray, isPremium: formData.isPremium }
          : s
      ));
    } else {
      const newSub: Subscription = {
        id: Date.now().toString(),
        name: formData.name,
        price: formData.price,
        features: featuresArray,
        isPremium: formData.isPremium
      };
      setSubscriptions([...subscriptions, newSub]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn ngừng áp dụng gói này không?")) {
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    }
  };

  return (
    <>
      <PageMeta
        title="Quản Lý Gói Thuê Pin | ChargeX"
        description="Tạo và quản lý các gói thuê pin cho khách hàng"
      />
      <PageBreadcrumb pageTitle="Quản Lý Gói Thuê Pin" />

      <div className="space-y-6">
        <div className="flex justify-end">
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            + Tạo gói thuê mới
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <ComponentCard key={sub.id} title={sub.name}>
              <div className="p-4 space-y-4">
                <div className={`text-3xl font-bold ${sub.isPremium ? 'text-brand-500' : 'text-gray-800 dark:text-white'}`}>
                  {sub.price}<span className="text-sm text-gray-500 font-normal"> / tháng</span>
                </div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 min-h-[120px]">
                  {sub.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
                <div className="pt-4 flex gap-3 border-t border-gray-100 dark:border-gray-800 mt-4">
                  <button 
                    onClick={() => handleOpenModal(sub)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Chỉnh sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(sub.id)}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-500 rounded hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors font-medium"
                  >
                    Ngừng áp dụng
                  </button>
                </div>
              </div>
            </ComponentCard>
          ))}

          {subscriptions.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-500">
              Chưa có gói thuê pin nào. Vui lòng tạo mới.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {editingSub ? "Chỉnh sửa gói thuê" : "Tạo gói thuê mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên gói
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="VD: Gói Sinh Viên"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Giá tiền
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="VD: 300.000đ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quyền lợi (Mỗi dòng 1 quyền lợi)
                </label>
                <textarea 
                  required
                  rows={4}
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="VD:&#10;Tối đa 10 lần đổi pin&#10;Hỗ trợ 24/7"
                />
              </div>

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({...formData, isPremium: e.target.checked})}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="isPremium" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đánh dấu là gói Cao cấp (Đổi màu hiển thị)
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
                >
                  {editingSub ? "Cập nhật" : "Lưu gói"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
