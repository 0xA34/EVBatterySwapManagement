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
  
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [forgotStep, setForgotStep] = useState<"none" | "email" | "otp" | "reset">("none");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState("");

  const isForgotLengthValid = newPassword.length >= 8;
  const hasForgotUppercase = /[A-Z]/.test(newPassword);
  const hasForgotLowercase = /[a-z]/.test(newPassword);
  const hasForgotNumber = /[0-9]/.test(newPassword);
  const hasForgotSpecialChar = /[^A-Za-z0-9]/.test(newPassword);

  const normalizeRole = (role?: string) => role?.toUpperCase().replace(/^ROLE_/, "") ?? "";

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email, 
          password: password,
        }),
      });

      if (!response.ok) {
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
              Nhập tên đăng nhập và mật khẩu của bạn để truy cập hệ thống ChargeX Admin!
            </p>
          </div>
          <div>

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
                    placeholder="admin hoặc admin@chargex.com" 
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
                      placeholder="admin@chargex.com"
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