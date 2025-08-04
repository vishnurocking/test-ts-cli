// ts-client/src/layout/MainLayout.tsx

import Navbar from "@/components/Navbar";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

const MainLayout = (): JSX.Element => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  // Determine if we need bottom padding for mobile navigation
  const needsBottomPadding = (): boolean => {
    // Only add bottom padding if user is logged in and not on admin pages
    return Boolean(user && !location.pathname.includes("/admin"));
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Unified Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <div
        className={`flex-1 pt-16 ${
          needsBottomPadding() ? "pb-16 md:pb-0" : ""
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;