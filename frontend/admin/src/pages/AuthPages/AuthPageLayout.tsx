import React from "react";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 md:p-8 overflow-y-auto">
      {/* Background ambient design glow blobs for premium aesthetics */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-brand-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-[480px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl z-10 my-8">
        {children}
      </div>

      <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
