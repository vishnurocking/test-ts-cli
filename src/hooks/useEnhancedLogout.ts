// ts-client/src/hooks/useEnhancedLogout.ts
// Enhanced logout hook with Chrome-specific handling and fallback mechanisms

import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { userLoggedOut } from "@/features/authSlice";
import {
  isChrome,
  getBrowserInfo,
  logBrowserInfo,
  hasAuthIssues,
  clearAuthIssueFlag,
} from "@/utils/browserUtils";
import {
  performFallbackLogout,
  clearAuthCookies,
  clearAuthStorage,
  debugStorageState,
} from "@/utils/cookieUtils";
import type { UseEnhancedLogoutReturn, BrowserInfo } from "@/types";

interface LogoutOptions {
  showToast?: boolean;
  redirectTo?: string;
  fallbackOnError?: boolean;
  skipAPI?: boolean;
}

interface LogoutResult {
  success: boolean;
  method: string;
  error?: string;
}

/**
 * Enhanced logout hook with Chrome-specific handling
 * Provides fallback mechanisms for Chrome FedCM issues
 */
export const useEnhancedLogout = (): UseEnhancedLogoutReturn => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutUserAPI, { isLoading: isAPILoading }] = useLogoutUserMutation();

  // Internal loading state for custom logout operations
  const [isCustomLoading, setIsCustomLoading] = useState<boolean>(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  // Combined loading state
  const isLoggingOut = isAPILoading || isCustomLoading;

  // Browser information
  const isChromeDetected = isChrome();
  const browserInfo: BrowserInfo = getBrowserInfo();

  /**
   * Direct logout function - performs API logout with fallback
   */
  const logout = useCallback(
    async (options: LogoutOptions = {}): Promise<void> => {
      const {
        showToast = true,
        redirectTo = "/login",
        fallbackOnError = true,
        skipAPI = false,
      } = options;

      setIsCustomLoading(true);
      setLogoutError(null);

      try {
        console.log("🔐 Starting standard logout process...");

        // Log browser information for debugging
        logBrowserInfo();

        if (!skipAPI) {
          // Attempt API logout first
          console.log("📡 Attempting API logout...");

          try {
            const result = await logoutUserAPI().unwrap();
            console.log("✅ API logout successful:", result);

            // Dispatch logout action to clear Redux state
            dispatch(userLoggedOut());

            if (showToast) {
              toast.success("Logout successful");
            }

            // Clear client-side data as additional security
            if (isChromeDetected) {
              console.log("🍪 Clearing Chrome-specific data...");
              clearAuthCookies();
            }

            // Clear auth issue flags on successful logout
            clearAuthIssueFlag();

            // Navigate to login page
            setTimeout(() => navigate(redirectTo), 100);

            setIsCustomLoading(false);
            return;
          } catch (apiError: any) {
            console.error("❌ API logout failed:", apiError);

            // Check if it's a Chrome-specific error
            const isChromeError =
              isChromeDetected &&
              (apiError.message?.includes("AbortError") ||
                apiError.message?.includes("FedCM") ||
                apiError.status === "FETCH_ERROR" ||
                apiError.message?.includes("signal is aborted") ||
                apiError.message?.includes("credential"));

            if (isChromeError) {
              console.log(
                "🔍 Chrome-specific error detected, using fallback..."
              );
            }

            if (fallbackOnError || isChromeError) {
              console.log("🚀 Switching to fallback logout...");
              return await performDirectLogout(showToast, redirectTo);
            } else {
              throw apiError;
            }
          }
        } else {
          console.log("⏭️ Skipping API, performing direct fallback...");
          return await performDirectLogout(showToast, redirectTo);
        }
      } catch (error: any) {
        console.error("❌ Logout process failed:", error);
        setLogoutError(error.message);

        if (fallbackOnError) {
          console.log("🔄 Attempting fallback logout due to error...");
          return await performDirectLogout(showToast, redirectTo);
        } else {
          setIsCustomLoading(false);
          if (showToast) {
            toast.error("Logout failed. Please try again.");
          }
        }
      }
    },
    [logoutUserAPI, dispatch, navigate, isChromeDetected]
  );

  /**
   * Retry logout function
   */
  const retryLogout = useCallback(
    async (): Promise<void> => {
      console.log("🔄 Retrying logout...");
      return await logout({ fallbackOnError: true });
    },
    [logout]
  );

  /**
   * Perform direct logout without API (fallback method)
   */
  const performDirectLogout = useCallback(
    async (showToast = true, redirectTo = "/login"): Promise<void> => {
      console.log("🚀 Performing direct logout...");

      try {
        // Clear Redux state first
        dispatch(userLoggedOut());

        // Perform complete client-side cleanup
        const fallbackResult = performFallbackLogout();

        if (showToast) {
          if (fallbackResult.success) {
            toast.success("Logout completed");
          } else {
            toast.warning("Logout completed with issues");
          }
        }

        // Navigate after cleanup
        setTimeout(() => navigate(redirectTo), 100);

        setIsCustomLoading(false);
      } catch (error: any) {
        console.error("❌ Direct logout failed:", error);
        setIsCustomLoading(false);
        setLogoutError(error.message);

        if (showToast) {
          toast.error("Logout encountered issues");
        }

        // Still try to navigate even if cleanup failed
        setTimeout(() => navigate(redirectTo), 100);
      }
    },
    [dispatch, navigate]
  );

  /**
   * Quick logout without confirmation (for emergency situations)
   */
  const emergencyLogout = useCallback((): void => {
    console.log("🚨 Emergency logout initiated");

    // Immediate state clearing
    dispatch(userLoggedOut());

    // Immediate storage clearing
    performFallbackLogout();

    // Immediate navigation
    navigate("/login");

    toast.warning("Emergency logout performed");
  }, [dispatch, navigate]);

  // Return the hook interface
  return {
    // Primary logout methods
    logout,
    retryLogout,
    emergencyLogout,

    // State
    isLoggingOut,
    logoutError,
  };
};