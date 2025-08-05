// ts-client/src/features/api/baseApi.ts
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { isChrome, getBrowserInfo } from "@/utils/browserUtils";
import type { RootState } from "@/app/store";
import type { BrowserInfo } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined in your .env file");
}

// Shared base query configuration for authenticated APIs
export const createBaseQuery = (baseUrl: string) => {
  return fetchBaseQuery({
    baseUrl: `${API_BASE_URL}${baseUrl}`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      try {
        const state = getState() as RootState;
        const browserInfo: BrowserInfo = getBrowserInfo();

        // Add stored token to Authorization header
        const token = state.auth.token || localStorage.getItem("auth_token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        // Add Chrome-specific headers for FedCM compatibility
        if (browserInfo.isChrome) {
          headers.set("X-Browser", "Chrome");
          if (browserInfo.chromeVersion) {
            headers.set("X-Chrome-Version", browserInfo.chromeVersion);
          }
          if (browserInfo.supportsFedCM) {
            headers.set("X-Supports-FedCM", "true");
          }
        } else if (browserInfo.name === "Firefox") {
          headers.set("X-Browser", "Firefox");
        }

        // Add request timestamp for debugging
        headers.set("X-Request-Timestamp", new Date().toISOString());
      } catch (error) {
        console.warn("Header preparation failed:", error);
      }

      return headers;
    },
    // Enhanced timeout for Chrome FedCM issues
    timeout: isChrome() ? 10000 : 5000,
  });
};

// Public base query configuration (no authentication)
export const createPublicBaseQuery = (baseUrl: string) => {
  return fetchBaseQuery({
    baseUrl: `${API_BASE_URL}${baseUrl}`,
    prepareHeaders: (headers) => {
      try {
        const browserInfo: BrowserInfo = getBrowserInfo();

        // Add browser info for debugging (no auth headers)
        if (browserInfo.isChrome) {
          headers.set("X-Browser", "Chrome");
        } else if (browserInfo.name === "Firefox") {
          headers.set("X-Browser", "Firefox");
        }

        headers.set("X-Request-Timestamp", new Date().toISOString());
      } catch (error) {
        console.warn("Public header preparation failed:", error);
      }

      return headers;
    },
    timeout: 5000,
  });
};