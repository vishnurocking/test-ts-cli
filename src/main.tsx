// ts-client/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider, useSelector } from "react-redux";
import { appStore } from "./app/store";
import { Toaster } from "./components/ui/sonner";
import { useLoadUserQuery } from "./features/api/authApi";
import LoadingSpinner from "./components/LoadingSpinner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { RootState } from "./types";

// App initializer component for startup logic
const AppInitializer = (): JSX.Element => {
  // Trigger the API call to load user data
  useLoadUserQuery();

  // Get reliable loading state from auth slice
  const { loading } = useSelector((state: RootState) => state.auth);

  // Show spinner while loading, otherwise show app
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <App />
      <Toaster />
    </>
  );
};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <Provider store={appStore}>
        <AppInitializer />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);