// ts-client/src/pages/admin/Sidebar.tsx

import { ChartNoAxesColumn, SquareLibrary, Menu } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Navbar from "@/components/Navbar";
import type { LucideIcon } from "lucide-react";

interface SidebarItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

const Sidebar = (): JSX.Element => {
  const location = useLocation();

  const sidebarItems: SidebarItem[] = [
    {
      path: "/admin/dashboard",
      icon: ChartNoAxesColumn,
      label: "Dashboard",
    },
    {
      path: "/admin/course",
      icon: SquareLibrary,
      label: "Courses",
    },
  ];

  const isActive = (path: string): boolean => location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen">
      {/* Unified Navbar */}
      <Navbar />

      <div className="flex flex-1 pt-16">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[250px] space-y-8 border-r border-gray-300 dark:border-gray-700 p-5 bg-white dark:bg-gray-900">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Instructor Panel
            </h2>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-md transition-colors duration-200 ${
                    active
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden fixed top-20 left-4 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Instructor Panel</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <SheetClose asChild key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 w-full p-3 text-left rounded-md transition-colors ${
                          active
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-10 bg-gray-50 dark:bg-gray-950">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;