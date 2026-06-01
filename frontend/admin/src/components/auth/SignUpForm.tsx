import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

export default function SignUpForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLengthValid = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fname || !lname || !email || !password) {
      setError("Vui lòng điền đầy đủ tất cả thông tin bắt buộc!");
      return;
    }

    if (!email.includes("@")) {
      setError("Địa chỉ email không hợp lệ!");
      return;
    }

    if (!isLengthValid || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setError("Mật khẩu chưa đáp ứng đầy đủ các yêu cầu bảo mật bắt buộc!");
      return;
    }

    if (!isChecked) {
      setError("Bạn phải đồng ý với Điều khoản và Điều kiện bảo mật để tiếp tục!");
      return;
    }

    setSuccess("Đăng ký tài khoản thành công! Đang chuyển hướng sang Đăng Nhập...");
    setTimeout(() => {
      navigate("/signin");
    }, 1800);
  };

  const handleSocialSignUp = (platform: string) => {
    setError("");
    setSuccess(`Đăng ký và liên kết tài khoản qua ${platform} thành công!`);
    setTimeout(() => {
      navigate("/");
    }, 1800);
  };

  return (
    <div className="flex flex-col w-full no-scrollbar">
      {/* Toast Notification */}
      {success && (
        <div className="fixed top-5 right-5 z-99999 rounded-xl bg-green-500 px-5 py-4 text-white shadow-xl transition-all animate-bounce">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-semibold">{success}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Quay lại bảng điều khiển
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto my-6">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng Ký Tài Khoản
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhập thông tin chi tiết dưới đây để tạo tài khoản Admin mới!
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button 
                onClick={() => handleSocialSignUp("Google")}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                    fill="#EB4335"
                  />
                </svg>
                Google
              </button>
              <button 
                onClick={() => handleSocialSignUp("X (Twitter)")}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <svg
                  width="21"
                  className="fill-current"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
                </svg>
                X
              </button>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Hoặc
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Họ<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      value={fname}
                      onChange={(e) => setFname(e.target.value)}
                      placeholder="Nhập họ"
                    />
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Tên<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lname"
                      value={lname}
                      onChange={(e) => setLname(e.target.value)}
                      placeholder="Nhập tên"
                    />
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@chargex.com"
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Mật khẩu<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Nhập mật khẩu của bạn"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>

                  {password && (
                    <div className="mt-2.5 p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 space-y-1.5 transition-all duration-300">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        Yêu cầu mật khẩu bảo mật bắt buộc:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-2 ${isLengthValid ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                          <span className="text-sm">{isLengthValid ? "✓" : "○"}</span> Tối thiểu 8 ký tự
                        </div>
                        <div className={`flex items-center gap-2 ${hasUppercase ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                          <span className="text-sm">{hasUppercase ? "✓" : "○"}</span> 1 chữ hoa (A-Z)
                        </div>
                        <div className={`flex items-center gap-2 ${hasLowercase ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                          <span className="text-sm">{hasLowercase ? "✓" : "○"}</span> 1 chữ thường (a-z)
                        </div>
                        <div className={`flex items-center gap-2 ${hasNumber ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                          <span className="text-sm">{hasNumber ? "✓" : "○"}</span> 1 chữ số (0-9)
                        </div>
                        <div className={`col-span-1 sm:col-span-2 flex items-center gap-2 ${hasSpecialChar ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                          <span className="text-sm">{hasSpecialChar ? "✓" : "○"}</span> 1 ký tự đặc biệt (@, #, $, %...)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="text-sm font-medium text-red-500 dark:text-red-400">
                    {error}
                  </p>
                )}

                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={(checked) => {
                      if (!hasReadTerms) {
                        setError("Bạn phải mở đọc Điều khoản & Điều kiện sử dụng trước khi tích chọn đồng ý!");
                        setShowTermsModal(true);
                        setHasScrolledToBottom(false);
                        return;
                      }
                      setIsChecked(checked);
                    }}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    Bằng việc tạo tài khoản, bạn đồng ý với các{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setShowTermsModal(true);
                        setHasScrolledToBottom(false);
                      }}
                      className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium hover:underline inline cursor-pointer"
                    >
                      Điều khoản & Điều kiện sử dụng
                    </button>{" "}
                    của chúng tôi.
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    Đăng Ký
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Đã có tài khoản? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Đăng Nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-99999 bg-gray-400/50 dark:bg-black/75 backdrop-blur-lg p-4 transition-all">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 pr-6">
              Điều khoản & Điều kiện Sử dụng
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Cập nhật lần cuối: 18 tháng 5, 2026
            </p>

            <div 
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollHeight - scrollTop <= clientHeight + 15) {
                  setHasScrolledToBottom(true);
                }
              }}
              className="overflow-y-auto pr-2 flex-1 space-y-4 text-sm text-gray-600 dark:text-gray-300 custom-scrollbar max-h-[300px]"
            >
              <section>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1.5">
                  1. Quyền hạn & Trách nhiệm của Tài khoản Admin
                </h4>
                <p className="leading-relaxed text-xs">
                  Tài khoản Admin có quyền hạn truy cập cao nhất vào hệ thống ChargeX. Người quản trị chịu hoàn toàn trách nhiệm bảo mật thông tin đăng nhập, không chia sẻ quyền truy cập cho bên thứ ba trái phép và đảm bảo vận hành các tác vụ hành chính đúng chuẩn mực.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1.5">
                  2. Bảo mật dữ liệu & Thông tin khách hàng
                </h4>
                <p className="leading-relaxed text-xs">
                  Hệ thống ChargeX cam kết bảo vệ toàn diện dữ liệu thông tin cá nhân của khách hàng, lịch sử thuê pin, doanh thu và sơ đồ phân bố trạm pin. Admin không được sử dụng dữ liệu này cho mục đích cá nhân hoặc thương mại ngoài phạm vi công việc.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1.5">
                  3. Quản lý Vận hành & Cân bằng Nguồn cung Pin
                </h4>
                <p className="leading-relaxed text-xs">
                  Người quản trị có trách nhiệm giám sát chặt chẽ lượng pin khả dụng trên các trạm sạc. Khi nhận được cảnh báo "Thiếu pin nghiêm trọng" từ hệ thống AI, Admin cần chủ động ra lệnh điều phối xe tải chuyển pin từ các trạm dư thừa về trạm thiếu hụt để duy trì dịch vụ liên tục.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1.5">
                  4. Quy định về Gói thuê pin & Thanh toán
                </h4>
                <p className="leading-relaxed text-xs">
                  Mọi thay đổi liên quan đến cấu hình gói cước thuê pin (tên gói, giá tiền, tính năng Premium) cần tuân thủ đúng bảng giá niêm yết của công ty. Admin không được tự ý sửa đổi giá cước sai quy định gây thất thoát tài sản doanh nghiệp.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1.5">
                  5. Cam kết an toàn & Xử lý vi phạm
                </h4>
                <p className="leading-relaxed text-xs">
                  Bất kỳ hành vi lạm dụng quyền hạn Admin để can thiệp trái phép vào hệ thống, sửa đổi thông tin người dùng, xóa trạm pin bất hợp lý hoặc rò rỉ dữ liệu sẽ bị xử phạt nghiêm khắc, đình chỉ tài khoản vĩnh viễn và xử lý theo quy định của pháp luật.
                </p>
              </section>
            </div>

            <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
              {!hasScrolledToBottom ? (
                <span className="text-xs text-gray-400 animate-pulse mr-auto">
                  Cuộn xuống dưới cùng để đồng ý...
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              {hasScrolledToBottom && (
                <button
                  type="button"
                  onClick={() => {
                    setHasReadTerms(true);
                    setIsChecked(true);
                    setShowTermsModal(false);
                    setError("");
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-sm cursor-pointer transition-all duration-300 transform scale-100 hover:scale-105"
                >
                  Đồng ý & Chấp nhận
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
