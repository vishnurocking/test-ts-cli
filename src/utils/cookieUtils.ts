// ts-client/src/utils/cookieUtils.ts
// Cookie and storage management utilities for fallback logout

import type { AuthCookies } from "@/types";

/**
 * Clear all authentication-related cookies
 * Used as fallback when API logout fails
 */
export const clearAuthCookies = (): void => {
  console.log("🍪 Clearing authentication cookies...");

  const cookiesToClear: string[] = [
    "token", // Main JWT token
    "auth_token", // Alternative token name
    "session_id", // Session identifier
    "user_id", // User identifier
    "refresh_token", // Refresh token
    "google_token", // Google OAuth token
    "razorpay_session", // Razorpay session if any
  ];

  // Get current domain variations to try
  const hostname = window.location.hostname;
  const domains: string[] = [
    hostname, // Current domain
    `.${hostname}`, // With leading dot
    hostname.replace("dev.", ""), // Remove subdomain
    `.${hostname.replace("dev.", "")}`, // Remove subdomain with dot
  ];

  // Clear cookies for each domain variation
  cookiesToClear.forEach((cookieName) => {
    domains.forEach((domain) => {
      // Clear with different path and domain combinations
      const cookieStrings: string[] = [
        `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
        `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`,
        `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}; secure;`,
        `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}; secure; samesite=none;`,
      ];

      cookieStrings.forEach((cookieString) => {
        try {
          document.cookie = cookieString;
        } catch (error) {
          // Silently fail if cookie clearing doesn't work
        }
      });
    });
  });

  console.log("✅ Cookie clearing attempted");
};

/**
 * Clear all authentication-related browser storage
 */
export const clearAuthStorage = (): void => {
  console.log("🗄️ Clearing authentication storage...");

  const storageKeyPrefixes: string[] = [
    "auth",
    "user",
    "token",
    "session",
    "login",
    "google",
    "oauth",
    "razorpay",
  ];

  try {
    // Clear localStorage items
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach((key) => {
      const shouldClear = storageKeyPrefixes.some((prefix) =>
        key.toLowerCase().includes(prefix.toLowerCase())
      );

      if (shouldClear) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed localStorage: ${key}`);
      }
    });

    // Clear sessionStorage items
    const sessionStorageKeys = Object.keys(sessionStorage);
    sessionStorageKeys.forEach((key) => {
      const shouldClear = storageKeyPrefixes.some((prefix) =>
        key.toLowerCase().includes(prefix.toLowerCase())
      );

      if (shouldClear) {
        sessionStorage.removeItem(key);
        console.log(`🗑️ Removed sessionStorage: ${key}`);
      }
    });

    console.log("✅ Storage clearing completed");
  } catch (error) {
    console.warn("⚠️ Storage clearing partial failure:", error);
  }
};

interface LogoutResult {
  success: boolean;
  method: string;
  error?: string;
}

/**
 * Perform a complete fallback logout
 * Used when API logout fails or Chrome-specific issues occur
 */
export const performFallbackLogout = (): LogoutResult => {
  console.log("🚀 Performing fallback logout...");

  try {
    // Clear cookies first
    clearAuthCookies();

    // Clear browser storage
    clearAuthStorage();

    // Clear any Chrome-specific credentials if available
    if (
      "credentials" in navigator &&
      (navigator.credentials as any).preventSilentAccess
    ) {
      (navigator.credentials as any).preventSilentAccess();
      console.log("🔒 Prevented Chrome silent access");
    }

    // Clear any FedCM-related state if available
    if ((window as any).IdentityCredential && (window as any).IdentityCredential.logoutRPs) {
      // This is experimental and may not be available
      try {
        (window as any).IdentityCredential.logoutRPs([]);
        console.log("🔒 Cleared FedCM logout state");
      } catch (fedcmError: any) {
        console.log("ℹ️ FedCM logout not available:", fedcmError.message);
      }
    }

    console.log("✅ Fallback logout completed successfully");
    return { success: true, method: "fallback" };
  } catch (error: any) {
    console.error("❌ Fallback logout failed:", error);
    return { success: false, error: error.message, method: "fallback" };
  }
};

interface AuthItems {
  localStorage: Record<string, string | null>;
  sessionStorage: Record<string, string | null>;
  cookies: Record<string, string>;
}

/**
 * Debug storage and cookie state
 * Useful for troubleshooting authentication issues
 */
export const debugStorageState = (): AuthItems => {
  console.log("🔍 Current Storage State:");
  console.log("🍪 Cookies:", document.cookie);
  console.log("🗄️ LocalStorage keys:", Object.keys(localStorage));
  console.log("🗄️ SessionStorage keys:", Object.keys(sessionStorage));

  // Check for auth-related items
  const authItems: AuthItems = {
    localStorage: {},
    sessionStorage: {},
    cookies: {},
  };

  // Check localStorage
  Object.keys(localStorage).forEach((key) => {
    if (
      key.toLowerCase().includes("auth") ||
      key.toLowerCase().includes("user") ||
      key.toLowerCase().includes("token")
    ) {
      authItems.localStorage[key] = localStorage.getItem(key);
    }
  });

  // Check sessionStorage
  Object.keys(sessionStorage).forEach((key) => {
    if (
      key.toLowerCase().includes("auth") ||
      key.toLowerCase().includes("user") ||
      key.toLowerCase().includes("token")
    ) {
      authItems.sessionStorage[key] = sessionStorage.getItem(key);
    }
  });

  // Parse cookies
  if (document.cookie) {
    document.cookie.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (
        name &&
        (name.toLowerCase().includes("auth") ||
          name.toLowerCase().includes("user") ||
          name.toLowerCase().includes("token"))
      ) {
        authItems.cookies[name] = value || "";
      }
    });
  }

  console.log("🔍 Auth-related items:", authItems);
  return authItems;
};