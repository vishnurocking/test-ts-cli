// ts-client/src/components/GoogleLoginWrapper.tsx
// Google Sign-In wrapper with Chrome FedCM handling

import { useEffect } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { isChrome, getBrowserInfo, logBrowserInfo } from "@/utils/browserUtils";
import { toast } from "sonner";
import type { GoogleLoginWrapperProps } from "@/types";

interface ExtendedGoogleLoginWrapperProps extends GoogleLoginWrapperProps {
  useOneTap?: boolean;
  theme?: "outline" | "filled_blue" | "filled_black";
  shape?: "rectangular" | "pill" | "circle" | "square";
}

/**
 * Enhanced Google Login wrapper that handles Chrome FedCM issues
 */
const GoogleLoginWrapper = ({
  onSuccess,
  onError,
  useOneTap = true,
  theme = "filled_blue",
  shape = "rectangular",
  ...otherProps
}: ExtendedGoogleLoginWrapperProps): JSX.Element => {
  useEffect(() => {
    const browserInfo = logBrowserInfo();

    if (browserInfo.isChrome) {
      console.log(
        "🌐 Chrome detected, configuring Google Sign-In for Chrome compatibility"
      );

      // Disable FedCM if it's causing issues
      if (browserInfo.supportsFedCM && (window as any).google) {
        try {
          // Try to configure Google Sign-In to not use FedCM
          (window as any).google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: () => {}, // Placeholder
            use_fedcm_for_prompt: false, // Disable FedCM
            cancel_on_tap_outside: false,
            auto_select: false,
          });
          console.log("✅ FedCM disabled for Google Sign-In");
        } catch (error) {
          console.warn(
            "⚠️ Could not configure Google Sign-In FedCM settings:",
            error
          );
        }
      }
    }
  }, []);

  // Enhanced error handler
  const handleGoogleError = (error?: any): void => {
    console.error("❌ Google Login Error:", error);

    const browserInfo = getBrowserInfo();

    if (browserInfo.isChrome) {
      // Check for Chrome-specific errors
      if (
        error?.message?.includes("FedCM") ||
        error?.message?.includes("AbortError") ||
        error?.message?.includes("Credential")
      ) {
        console.log("🔍 Chrome FedCM error detected");
        toast.error(
          "Chrome login issue detected. Please try refreshing the page."
        );

        // Suggest refresh or alternative
        setTimeout(() => {
          toast.info(
            "If login issues persist, try using Firefox or Safari temporarily."
          );
        }, 3000);

        return;
      }
    }

    // Call the original error handler
    if (onError) {
      onError(error);
    } else {
      toast.error("Google login failed. Please try again.");
    }
  };

  // Enhanced success handler
  const handleGoogleSuccess = (credentialResponse: CredentialResponse): void => {
    console.log("✅ Google Login Success");

    const browserInfo = getBrowserInfo();

    if (browserInfo.isChrome) {
      console.log("🌐 Chrome login successful");
    }

    // Call the original success handler
    if (onSuccess) {
      onSuccess(credentialResponse);
    }
  };

  // Chrome-specific configuration
  const chromeConfig = isChrome()
    ? {
        useOneTap: false, // Disable One Tap in Chrome to avoid FedCM issues
        cancel_on_tap_outside: false,
        auto_select: false,
      }
    : {};

  return (
    <div className="google-login-wrapper">
      {/* Show browser-specific message for Chrome users */}
      {isChrome() && (
        <div className="mb-2 text-xs text-muted-foreground text-center">
          Chrome detected - using compatibility mode
        </div>
      )}

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={isChrome() ? false : useOneTap} // Disable One Tap for Chrome
        theme={theme}
        shape={shape}
        {...chromeConfig}
        {...otherProps}
      />

      {/* Fallback message for persistent Chrome issues */}
      {isChrome() && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Having issues? Try{" "}
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:underline"
          >
            refreshing the page
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleLoginWrapper;