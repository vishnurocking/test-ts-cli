// ts-client/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider, useSelector } from "react-redux";
import { appStore, persistor } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "./components/ui/sonner";
import LoadingSpinner from "./components/LoadingSpinner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { RootState } from "./types";

// App initializer component for startup logic
const AppInitializer = (): JSX.Element => {
  // Get auth state - no automatic API calls here
  const { isLoading: authLoading } = useSelector((state: RootState) => state.auth);

  // Show spinner only during Redux persist rehydration
  if (authLoading) {
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
        <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
          <AppInitializer />
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);