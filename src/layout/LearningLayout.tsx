// ts-client/src/layout/LearningLayout.tsx

import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

const LearningLayout = (): JSX.Element => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Unified Navbar - handles all navigation logic including mobile learning nav */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-16 md:pb-0">
        {/* 
          pt-16: Top padding for fixed navbar
          pb-16: Bottom padding for mobile navigation (on mobile only)
          md:pb-0: Remove bottom padding on desktop
        */}
        <Outlet />
      </main>
    </div>
  );
};

export default LearningLayout;