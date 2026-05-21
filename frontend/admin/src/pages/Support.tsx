import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal";
import { useState } from "react";

export default function Support() {
  const [supportData, setSupportData] = useState({
    subject: "",
    message: ""
  });

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "Làm thế nào để thực hiện đổi pin tại trạm sạc?",
      answer: "Để đổi pin, bạn làm theo các bước sau:\n1. Quét mã QR dán trên mặt trạm sạc bằng app EV Battery trên điện thoại của bạn.\n2. Chọn gói thuê bao đổi pin hiện tại.\n3. Hệ thống trạm sạc sẽ mở một cửa chứa pin trống. Hãy đặt pin đã dùng vào cửa đó và đóng chặt.\n4. Trạm sạc sẽ tự động xác nhận và mở một khe cửa mới chứa pin đã sạc đầy. Bạn lấy pin mới ra lắp vào xe, sau đó đóng cửa trạm sạc lại để hoàn tất giao dịch."
    },
    {
      id: 2,
      question: "Các gói cước thuê pin hoạt động như thế nào?",
      answer: "Chúng tôi cung cấp 3 gói cước chính phù hợp với từng nhu cầu sử dụng:\n- Gói Basic (Cơ Bản): Tiết kiệm cho người đi lại ít.\n- Gói Standard (Tiêu Chuẩn): Phổ biến nhất, đáp ứng đi lại hàng ngày thoải mái.\n- Gói Premium (Cao Cấp): Không giới hạn số lần đổi pin, dành cho tài xế công nghệ hoặc người di chuyển nhiều."
    },
    {
      id: 3,
      question: "Tôi phải làm gì nếu trạm sạc bị kẹt pin hoặc cửa trạm không mở?",
      answer: "Đừng lo lắng! Trong trường hợp trạm sạc gặp sự cố kẹt cửa hoặc kẹt pin:\n1. Kiểm tra xem cửa đã được đẩy hết cỡ vào chưa.\n2. Liên hệ ngay với số Hotline khẩn cấp in trên trạm: 1900 1234.\n3. Hoặc bạn có thể gửi Ticket báo lỗi qua biểu mẫu hỗ trợ ở trên với Mã trạm sạc (Ví dụ: TR-001) kèm mô tả chi tiết lỗi."
    },
    {
      id: 4,
      question: "Cách cập nhật thông tin tài khoản và đổi mật khẩu?",
      answer: "Bạn có thể dễ dàng quản lý thông tin bằng cách nhấn vào Avatar cá nhân ở góc trên bên phải màn hình:\n- Chọn 'Edit profile' để cập nhật Tên, Số điện thoại, Địa chỉ.\n- Chọn 'Account settings' để thay đổi Mật khẩu mới bảo mật hơn."
    }
  ];

  const toggleFaq = (id: number) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSupportData({
      ...supportData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting support ticket", supportData);
    alert("Yêu cầu hỗ trợ của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất!");
    setSupportData({ subject: "", message: "" });
  };

  return (
    <>
      <PageMeta
        title="Support | EV Battery Admin"
        description="Support and help center page"
      />
      <PageBreadcrumb pageTitle="Hỗ Trợ Khách Hàng" />
      <div className="grid grid-cols-1 gap-6 lg:gap-7.5 max-w-4xl mx-auto">
        <ComponentCard title="Gửi yêu cầu hỗ trợ">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
            <div>
              <Label>Chủ đề</Label>
              <Input 
                type="text" 
                name="subject"
                value={supportData.subject}
                onChange={handleChange}
                placeholder="Ví dụ: Báo lỗi hệ thống trạm" 
              />
            </div>
            <div>
              <Label>Nội dung chi tiết</Label>
              <textarea 
                name="message"
                value={supportData.message}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-500"
                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                required
              ></textarea>
            </div>
            <div className="flex justify-end mt-4">
              <Button>Gửi Yêu Cầu</Button>
            </div>
          </form>
        </ComponentCard>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-900">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Trung Tâm Trợ Giúp</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Tìm kiếm các bài viết hướng dẫn sử dụng và giải đáp thắc mắc thường gặp.
            </p>
            <Button variant="outline" size="sm" onClick={() => setIsHelpOpen(true)}>Truy Cập</Button>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-gray-900">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Liên Hệ Trực Tiếp</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Gọi hotline: 1900 1234 <br /> Email: support@evbattery.com
            </p>
          </div>
        </div>
      </div>

      {/* Modal Trung Tâm Trợ Giúp / FAQ */}
      <Modal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-11 max-h-[85vh]">
          <div className="pr-12">
            <h4 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
              Trung Tâm Trợ Giúp & FAQ
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Tổng hợp những thắc mắc thường gặp nhất về hệ thống đổi pin xe điện.
            </p>
          </div>

          <div className="space-y-4 my-6">
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="flex w-full items-center justify-between text-left font-medium text-gray-800 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  <span>{faq.question}</span>
                  <svg
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                      activeFaq === faq.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeFaq === faq.id && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-line bg-gray-50 dark:bg-gray-850 p-4 rounded-xl">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-8">
            <Button onClick={() => setIsHelpOpen(false)}>Đóng</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
