// ts-client/src/components/Navbar.tsx
// Enhanced Navbar with Chrome-compatible logout functionality

import {
  Menu,
  School,
  MessagesSquare,
  Home,
  CirclePlay,
  User as UserIcon,
  ArrowLeft,
  ChartNoAxesColumn,
  SquareLibrary,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useEnhancedLogout } from "@/hooks/useEnhancedLogout";
import type { RootState, User } from "@/types";

interface NavigationItem {
  path: string;
  icon: LucideIcon;
  label: string;
  exact: boolean;
}

interface ContextInfo {
  context: "learning" | "admin" | "general";
  showBackButton: boolean;
  title: string;
  isLearningFlow: boolean;
}

interface MobileNavMenuProps {
  user: User | null;
  navigationItems: NavigationItem[];
  handleLogout: () => Promise<void>;
  isLogoutLoading: boolean;
}

const Navbar = (): JSX.Element => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // Use enhanced logout hook with Chrome compatibility
  const {
    logout,
    chromeLogout,
    isLoading: isLogoutLoading,
    isChrome,
    hasAuthIssues,
    emergencyLogout,
  } = useEnhancedLogout();

  // Show Chrome compatibility notice on mount if needed
  useEffect(() => {
    if (isChrome && hasAuthIssues && user) {
      const hasShownNotice = localStorage.getItem("chrome_notice_shown");
      if (!hasShownNotice) {
        setTimeout(() => {
          toast.info(
            "Chrome compatibility mode enabled for better logout experience"
          );
          localStorage.setItem("chrome_notice_shown", "true");
        }, 2000);
      }
    }
  }, [isChrome, hasAuthIssues, user]);

  // Determine current context and page info
  const getContextInfo = (): ContextInfo => {
    const path = location.pathname;

    // Language learning context
    if (path.includes("/learn")) {
      if (path.includes("/lesson/")) {
        return {
          context: "learning",
          showBackButton: true,
          title: "Learning",
          isLearningFlow: true,
        };
      }
      if (path.includes("/unit/")) {
        return {
          context: "learning",
          showBackButton: true,
          title: "Unit Overview",
          isLearningFlow: true,
        };
      }
      return {
        context: "learning",
        showBackButton: false,
        title: "Language",
        isLearningFlow: true,
      };
    }

    // Admin/Instructor dashboard context
    if (path.includes("/admin")) {
      return {
        context: "admin",
        showBackButton: false,
        title: "Dashboard",
        isLearningFlow: false,
      };
    }

    // General context (home, courses, profile, etc.)
    return {
      context: "general",
      showBackButton: false,
      title: "E-Learning",
      isLearningFlow: false,
    };
  };

  const contextInfo = getContextInfo();

  // Navigation items based on user role and context
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { path: "/", icon: Home, label: "Home", exact: true },
      {
        path: "/learn",
        icon: MessagesSquare,
        label: "Learn",
        exact: false,
      },
      { path: "/courses", icon: CirclePlay, label: "Courses", exact: true },
      { path: "/profile", icon: UserIcon, label: "Profile", exact: true },
    ];

    // Add instructor-specific items
    if (user?.role === "Instructor") {
      baseItems.splice(-1, 0, {
        path: "/admin/dashboard",
        icon: ChartNoAxesColumn,
        label: "Dashboard",
        exact: false,
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  // Enhanced logout handler with Chrome-specific logic
  const handleLogout = async (): Promise<void> => {
    try {
      console.log("🔐 Navbar logout initiated");

      // Show loading state
      toast.loading("Logging out...", { id: "logout-toast" });

      let result;

      if (isChrome) {
        console.log("🌐 Using Chrome-specific logout");
        result = await chromeLogout();
      } else {
        console.log("🌐 Using standard logout");
        result = await logout();
      }

      // Dismiss loading toast
      toast.dismiss("logout-toast");

      if (result.success) {
        console.log("✅ Logout completed successfully:", result.method);

        // Don't show success toast here as the hook handles it
        // Navigation is also handled by the logout hook
      } else {
        console.error("❌ Logout failed:", result.error);
        toast.error(result.error || "Logout failed");
      }
    } catch (error) {
      console.error("❌ Navbar logout error:", error);
      toast.dismiss("logout-toast");

      // If all else fails, try emergency logout
      if (isChrome) {
        toast.error(
          "Chrome logout issue detected. Attempting emergency logout..."
        );
        emergencyLogout();
      } else {
        toast.error("Logout error occurred");
      }
    }
  };

  const isActive = (path: string, exact = false): boolean => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Render user dropdown menu
  const renderUserMenu = (): JSX.Element => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage
            src={user?.photoUrl || "/default-avatar.png"}
            alt="User Avatar"
          />
          <AvatarFallback>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link to="/learn" className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4" />
              Learn
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link to="/courses" className="flex items-center gap-2">
              <CirclePlay className="h-4 w-4" />
              Courses
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link to="/profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLogoutLoading}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            {isLogoutLoading ? "Logging out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {user?.role === "Instructor" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <ChartNoAxesColumn className="h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Main Navbar - Fixed at top */}
      <div className="h-16 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-50">
        {/* Desktop Navigation */}
        <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <School size={30} />
            <Link to="/">
              <h1 className="font-extrabold text-2xl">E-Learning</h1>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <div className="flex items-center gap-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
                      active
                        ? "bg-purple-200 dark:bg-purple-600 text-purple-700 dark:text-purple-300"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Menu & Dark Mode */}
          <div className="flex items-center gap-4">
            {user ? (
              renderUserMenu()
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/login")}>Signup</Button>
              </div>
            )}
            <DarkMode />
          </div>
        </div>

        {/* Mobile Navigation Header */}
        <div className="flex md:hidden items-center justify-between px-4 h-full">
          {/* Mobile Left Section */}
          <div className="flex items-center gap-3">
            {contextInfo.showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="font-extrabold text-lg truncate">
              {contextInfo.title}
            </h1>
          </div>

          {/* Mobile Right Section */}
          <div className="flex items-center gap-2">
            <DarkMode />
            <MobileNavMenu
              user={user}
              navigationItems={navigationItems}
              handleLogout={handleLogout}
              isLogoutLoading={isLogoutLoading}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only show for authenticated users and not in admin context */}
      {user && contextInfo.context !== "admin" && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40">
          <div className="flex items-center justify-around py-2">
            {navigationItems
              .filter((item) => item.path !== "/admin/dashboard") // Hide admin dashboard from bottom nav
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors duration-200 ${
                      active
                        ? "bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
};

// Enhanced Mobile Navigation Menu Component
const MobileNavMenu = ({
  user,
  navigationItems,
  handleLogout,
  isLogoutLoading,
}: MobileNavMenuProps): JSX.Element => {
  const navigate = useNavigate();

  const renderMobileLogout = (): JSX.Element => (
    <Button
      onClick={handleLogout}
      disabled={isLogoutLoading}
      variant="outline"
      className="w-full justify-start gap-2"
    >
      <LogOut className="h-4 w-4" />
      {isLogoutLoading ? "Logging out..." : "Log out"}
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>

        {user ? (
          <div className="flex flex-col gap-4 mt-6">
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Avatar>
                <AvatarImage
                  src={user?.photoUrl || "/default-avatar.png"}
                  alt="User Avatar"
                />
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SheetClose key={item.path} asChild>
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please log in to access the platform
            </p>
          </div>
        )}

        <SheetFooter className="mt-auto">
          {user ? (
            renderMobileLogout()
          ) : (
            <SheetClose asChild>
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
            </SheetClose>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default Navbar;