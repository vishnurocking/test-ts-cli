// ts-client/src/utils/browserUtils.ts
// Enhanced browser detection utilities for Chrome FedCM compatibility

import type { BrowserInfo } from "@/types";

/**
 * Detects if the current browser is Chrome
 */
export const isChrome = (): boolean => {
  const userAgent = navigator.userAgent;
  const isChromium = userAgent.includes("Chrome");
  const isEdge = userAgent.includes("Edg");
  return isChromium && !isEdge;
};

/**
 * Detects if the current browser is Firefox
 */
export const isFirefox = (): boolean => {
  return navigator.userAgent.includes("Firefox");
};

/**
 * Gets comprehensive browser information for debugging
 */
export const getBrowserInfo = (): BrowserInfo => {
  const userAgent = navigator.userAgent;
  const isChromeBrowser = isChrome();
  const isFirefoxBrowser = isFirefox();

  // Chrome-specific feature detection
  const hasFedCM = isChromeBrowser && "IdentityCredential" in window;
  const hasCredentialsAPI = "credentials" in navigator;
  const hasStorageAccess = "requestStorageAccess" in document;
  const hasPartitionedCookies = isChromeBrowser && "cookieStore" in window;

  // Chrome version detection
  let chromeVersion: string | null = null;
  if (isChromeBrowser) {
    const match = userAgent.match(/Chrome\/([0-9]+)/);
    chromeVersion = match ? match[1] : null;
  }

  // Browser name detection
  let name = "Unknown";
  if (isChromeBrowser) name = "Chrome";
  else if (isFirefoxBrowser) name = "Firefox";
  else if (userAgent.includes("Safari")) name = "Safari";
  else if (userAgent.includes("Edge")) name = "Edge";

  // Version detection for non-Chrome browsers
  let version = chromeVersion || "Unknown";
  if (isFirefoxBrowser) {
    const firefoxMatch = userAgent.match(/Firefox\/([0-9.]+)/);
    version = firefoxMatch ? firefoxMatch[1] : "Unknown";
  }

  // Platform detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  let platform = "Unknown";
  if (userAgent.includes("Windows")) platform = "Windows";
  else if (userAgent.includes("Mac")) platform = "macOS";
  else if (userAgent.includes("Linux")) platform = "Linux";
  else if (userAgent.includes("Android")) platform = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) platform = "iOS";

  return {
    name,
    version,
    isChrome: isChromeBrowser,
    chromeVersion,
    supportsFedCM: hasFedCM,
    hasThirdPartyCookies: !isChromeBrowser || (chromeVersion ? parseInt(chromeVersion) < 115 : true),
    isMobile,
    platform,
    userAgent,
  };
};

/**
 * Logs browser information for debugging
 */
export const logBrowserInfo = (): BrowserInfo => {
  const info = getBrowserInfo();

  console.log("🌐 Browser Detection:", {
    browser: info.name,
    version: info.version,
    features: {
      FedCM: info.supportsFedCM,
      ThirdPartyCookies: info.hasThirdPartyCookies,
      Mobile: info.isMobile,
      Platform: info.platform,
    },
  });

  return info;
};

/**
 * Detects if browser has authentication-related issues
 */
export const hasAuthIssues = (): boolean => {
  const info = getBrowserInfo();

  // Chrome versions 115+ with FedCM may have logout issues
  if (info.isChrome && info.chromeVersion && parseInt(info.chromeVersion) >= 115 && info.supportsFedCM) {
    return true;
  }

  // Check for stored Chrome issue flags
  try {
    return localStorage.getItem("chrome_auth_issues") === "true";
  } catch (error) {
    return false;
  }
};

/**
 * Sets a flag indicating Chrome authentication issues
 */
export const setAuthIssueFlag = (): void => {
  try {
    localStorage.setItem("chrome_auth_issues", "true");
  } catch (error) {
    console.warn("Could not set auth issue flag:", error);
  }
};

/**
 * Clears the Chrome authentication issues flag
 */
export const clearAuthIssueFlag = (): void => {
  try {
    localStorage.removeItem("chrome_auth_issues");
  } catch (error) {
    console.warn("Could not clear auth issue flag:", error);
  }
};