import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

type LoginResponse = {
  accessToken?: string;
  token?: string;
  tokenType?: string;
  role?: string;
};

export default function SignInForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  
  // Thêm state isLoading
  const [isLoading, setIsLoading] = useState(false);

  // Login Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Forgot Password flow states
  const [forgotStep, setForgotStep] = useState<"none" | "email" | "otp" | "reset">("none");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState("");

  // Live forgot password validation criteria
  const isForgotLengthValid = newPassword.length >= 8;
  const hasForgotUppercase = /[A-Z]/.test(newPassword);
  const hasForgotLowercase = /[a-z]/.test(newPassword);
  const hasForgotNumber = /[0-9]/.test(newPassword);
  const hasForgotSpecialChar = /[^A-Za-z0-9]/.test(newPassword);

  const normalizeRole = (role?: string) => role?.toUpperCase().replace(/^ROLE_/, "") ?? "";

  // HÀM XỬ LÝ ĐĂNG NHẬP ĐÃ TÍCH HỢP API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Vui lòng điền đầy đủ tài khoản và mật khẩu!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải dài tối thiểu 6 ký tự!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email, // API dùng username, ta map từ state email sang
          password: password,
        }),
      });

      if (!response.ok) {
        // Cố gắng đọc thông báo lỗi từ server nếu có
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || "Tài khoản hoặc mật khẩu không chính xác!"
        );
      }

      const data = (await response.json()) as LoginResponse;
      const token = data.accessToken || data.token;
      const role = normalizeRole(data.role);

      if (!token) {
        throw new Error("Máy chủ không trả về token đăng nhập hợp lệ.");
      }

      if (role && role !== "ADMIN") {
        throw new Error("Tài khoản này không có quyền truy cập giao diện Admin.");
      }

      login(token, {
        username: email,
        role: role || "ADMIN",
      });

      setSuccess(`Đăng nhập thành công với quyền ${role || "ADMIN"}! Đang chuyển hướng...`);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể kết nối đến máy chủ. Vui lòng thử lại!";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform: string) => {
    setSuccess("");
    setError(`Đăng nhập qua ${platform} chưa được cấu hình cho giao diện Admin.`);
  };

  // Các hàm Forgot Password giữ nguyên
  const handleForgotEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail) {
      setForgotError("Vui lòng nhập địa chỉ email!");
      return;
    }
    if (!forgotEmail.includes("@")) {
      setForgotError("Địa chỉ email không hợp lệ!");
      return;
    }
    
    setForgotStep("otp");
    setForgotSuccessMessage("Đã gửi mã OTP đến email của bạn! (Nhập 123456 để thử)");
    setTimeout(() => setForgotSuccessMessage(""), 4000);
  };

  const handleForgotOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotOtp) {
      setForgotError("Vui lòng nhập mã OTP!");
      return;
    }
    if (forgotOtp !== "123456") {
      setForgotError("Mã xác thực OTP không chính xác! Hãy nhập 123456 để thử.");
      return;
    }

    setForgotStep("reset");
  };

  const handleForgotResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (!newPassword || !confirmNewPassword) {
      setForgotError("Vui lòng điền đầy đủ mật khẩu mới và xác nhận mật khẩu!");
      return;
    }
    if (!isForgotLengthValid || !hasForgotUppercase || !hasForgotLowercase || !hasForgotNumber || !hasForgotSpecialChar) {
      setForgotError("Mật khẩu mới chưa đáp ứng đầy đủ các yêu cầu bảo mật bắt buộc!");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError("Mật khẩu mới và Xác nhận mật khẩu không trùng khớp!");
      return;
    }

    setForgotStep("none");
    setSuccess("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.");
    setForgotEmail("");
    setForgotOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <div className="flex flex-col flex-1">
      {success && (
        <div className="fixed top-5 right-5 z-50 rounded-xl bg-green-500 px-5 py-4 text-white shadow-xl transition-all animate-bounce">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-semibold">{success}</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md pt-10 mx-auto">
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
              Đăng Nhập
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhập tên đăng nhập và mật khẩu của bạn để truy cập hệ thống EV Admin!
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button 
                onClick={() => handleSocialLogin("Google")}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4" />
                  <path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853" />
                  <path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05" />
                  <path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335" />
                </svg>
                Google
              </button>
              <button 
                onClick={() => handleSocialLogin("X (Twitter)")}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <svg width="21" className="fill-current" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <div className="space-y-6">
                <div>
                  <Label>
                    Tên đăng nhập / Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin hoặc admin@evbattery.com" 
                  />
                </div>
                <div>
                  <Label>
                    Mật khẩu <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn"
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
                </div>
                
                {error && (
                  <p className="text-sm font-medium text-red-500 dark:text-red-400">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Ghi nhớ đăng nhập
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep("email");
                      setForgotError("");
                    }}
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div>
                  <Button 
                    className="w-full disabled:opacity-50 disabled:cursor-not-allowed" 
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Chưa có tài khoản? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Đăng Ký Ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Flow Modal - GIỮ NGUYÊN NHƯ CŨ */}
      {forgotStep !== "none" && (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-50 bg-gray-400/50 dark:bg-black/75 backdrop-blur-lg p-4 transition-all">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setForgotStep("none")}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Bước 1: Nhập Email */}
            {forgotStep === "email" && (
              <form onSubmit={handleForgotEmailSubmit}>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  Khôi phục mật khẩu
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Vui lòng điền địa chỉ email đã đăng ký. Chúng tôi sẽ gửi mã OTP gồm 6 chữ số để khôi phục mật khẩu của bạn.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label>Địa chỉ Email <span className="text-error-500">*</span></Label>
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@evbattery.com"
                    />
                  </div>

                  {forgotError && (
                    <p className="text-sm font-medium text-red-500 dark:text-red-400">
                      {forgotError}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep("none")}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 rounded-xl"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-sm"
                    >
                      Gửi mã OTP
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Bước 2: Nhập OTP */}
            {forgotStep === "otp" && (
              <form onSubmit={handleForgotOtpSubmit}>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  Xác thực mã OTP
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Mã xác thực OTP đã được gửi đến email <span className="font-semibold text-gray-800 dark:text-white">{forgotEmail}</span>. Vui lòng kiểm tra hộp thư.
                </p>

                {forgotSuccessMessage && (
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 p-2.5 rounded-lg mb-4">
                    {forgotSuccessMessage}
                  </p>
                )}

                <div className="space-y-4">
                  <div>
                    <Label>Nhập mã OTP <span className="text-error-500">*</span></Label>
                    <Input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.slice(0, 6))}
                      placeholder="Nhập 6 chữ số OTP"
                      className="text-center tracking-[12px] text-lg font-bold"
                    />
                  </div>

                  {forgotError && (
                    <p className="text-sm font-medium text-red-500 dark:text-red-400">
                      {forgotError}
                    </p>
                  )}

                  <div className="flex justify-between items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotOtp("");
                        setForgotError("");
                        setForgotSuccessMessage("Đã gửi lại mã OTP mới! (123456)");
                        setTimeout(() => setForgotSuccessMessage(""), 4000);
                      }}
                      className="text-sm font-medium text-brand-500 hover:underline dark:text-brand-400"
                    >
                      Gửi lại mã
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForgotStep("email")}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 rounded-xl"
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-sm"
                      >
                        Xác minh
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Bước 3: Đặt lại mật khẩu */}
            {forgotStep === "reset" && (
              <form onSubmit={handleForgotResetSubmit}>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  Đặt lại mật khẩu mới
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Tạo mật khẩu bảo mật mới cho tài khoản của bạn. Vui lòng đảm bảo hai mật khẩu trùng khớp hoàn toàn.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label>Mật khẩu mới <span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                      />
                      <span
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showNewPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>

                  {newPassword && (
                    <div className="mt-2 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 space-y-1.5 transition-all duration-300">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                        Yêu cầu mật khẩu bảo mật bắt buộc:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-2 ${isForgotLengthValid ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                          <span className="text-sm">{isForgotLengthValid ? "✓" : "○"}</span> Tối thiểu 8 ký tự
                        </div>
                        <div className={`flex items-center gap-2 ${hasForgotUppercase ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                          <span className="text-sm">{hasForgotUppercase ? "✓" : "○"}</span> 1 chữ hoa (A-Z)
                        </div>
                        <div className={`flex items-center gap-2 ${hasForgotLowercase ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                          <span className="text-sm">{hasForgotLowercase ? "✓" : "○"}</span> 1 chữ thường (a-z)
                        </div>
                        <div className={`flex items-center gap-2 ${hasForgotNumber ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                          <span className="text-sm">{hasForgotNumber ? "✓" : "○"}</span> 1 chữ số (0-9)
                        </div>
                        <div className={`col-span-1 sm:col-span-2 flex items-center gap-2 ${hasForgotSpecialChar ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                          <span className="text-sm">{hasForgotSpecialChar ? "✓" : "○"}</span> 1 ký tự đặc biệt (@, #, $, %...)
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Xác nhận mật khẩu mới <span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu mới"
                      />
                      <span
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showConfirmNewPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>

                  {forgotError && (
                    <p className="text-sm font-medium text-red-500 dark:text-red-400">
                      {forgotError}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep("none")}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 rounded-xl"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-sm"
                    >
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}