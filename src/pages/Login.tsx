// ts-client/src/pages/Login.tsx
// Updated with Chrome-compatible Google Login

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGoogleLoginMutation,
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import GoogleLoginWrapper from "@/components/GoogleLoginWrapper";
import { Loader2 } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isChrome, logBrowserInfo } from "@/utils/browserUtils";
import type { CredentialResponse } from "@react-oauth/google";

interface SignupInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

type InputType = "signup" | "login";

const Login = (): JSX.Element => {
  // State for all forms
  const [signupInput, setSignupInput] = useState<SignupInput>({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState<LoginInput>({ 
    email: "", 
    password: "" 
  });

  const navigate = useNavigate();

  // RTK Query Hooks for all auth methods
  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();

  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();

  const [
    googleLogin,
    {
      data: googleData,
      error: googleError,
      isLoading: googleIsLoading,
      isSuccess: googleIsSuccess,
    },
  ] = useGoogleLoginMutation();

  // Log browser info on component mount
  useEffect(() => {
    const browserInfo = logBrowserInfo();
    if (browserInfo.isChrome) {
      console.log("🌐 Chrome user detected on login page");

      // Show Chrome-specific welcome message if there were previous issues
      const hadChromeIssues = localStorage.getItem("chrome_auth_issues");
      if (hadChromeIssues) {
        toast.info("Chrome compatibility mode enabled for better experience");
        localStorage.removeItem("chrome_auth_issues"); // Clear the flag
      }
    }
  }, []);

  // Input handler for email/password forms
  const changeInputHandler = (
    e: ChangeEvent<HTMLInputElement>, 
    type: InputType
  ): void => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  // Submit handlers
  const handleEmailRegistration = (): void => {
    registerUser(signupInput);
  };

  const handleEmailLogin = (): void => {
    loginUser(loginInput);
  };

  // Enhanced Google handlers with Chrome-specific logic
  const handleGoogleSuccess = (credentialResponse: CredentialResponse): void => {
    console.log("🔐 Google login success, processing...");

    if (isChrome()) {
      console.log("🌐 Processing Chrome Google login");
    }

    // Call the mutation
    if (credentialResponse.credential) {
      googleLogin(credentialResponse.credential);
    }
  };

  const handleGoogleError = (error?: any): void => {
    console.error("❌ Google login error:", error);

    if (isChrome()) {
      // Set flag for Chrome issues
      localStorage.setItem("chrome_auth_issues", "true");
      toast.error(
        "Chrome login issue. Please try refreshing or use a different browser."
      );
    } else {
      toast.error("Google login failed. Please try again.");
    }
  };

  // Unified useEffect for handling success/error toasts and navigation
  useEffect(() => {
    if (registerIsSuccess)
      toast.success(registerData?.message || "Signup successful!");
    if (registerError)
      toast.error((registerError as any)?.data?.message || "Signup Failed");

    if (loginIsSuccess) {
      toast.success(loginData?.message || "Login successful.");
      navigate("/");
    }
    if (loginError) 
      toast.error((loginError as any)?.data?.message || "Login Failed");

    if (googleIsSuccess) {
      const message = googleData?.message || "Login successful!";
      toast.success(message);

      // Clear any Chrome issue flags on success
      if (isChrome()) {
        localStorage.removeItem("chrome_auth_issues");
      }

      navigate("/");
    }

    if (googleError) {
      console.error("Google login mutation error:", googleError);

      const errorMessage =
        (googleError as any)?.data?.message || "An error occurred during login.";

      if (isChrome()) {
        // Set flag for Chrome issues
        localStorage.setItem("chrome_auth_issues", "true");
        toast.error(`Chrome: ${errorMessage}`);
      } else {
        toast.error(errorMessage);
      }
    }
  }, [
    registerIsSuccess,
    registerError,
    registerData,
    loginIsSuccess,
    loginError,
    loginData,
    googleIsSuccess,
    googleError,
    googleData,
    navigate,
  ]);

  // This variable will control whether the email/password tabs are visible
  const enableEmailPassword =
    import.meta.env.VITE_ENABLE_EMAIL_LOGIN === "true";

  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs defaultValue="google" className="w-[400px]">
        <TabsList
          className={`grid w-full ${
            enableEmailPassword ? "grid-cols-3" : "grid-cols-1"
          }`}
        >
          <TabsTrigger value="google">
            Google{" "}
            {isChrome() && <span className="ml-1 text-xs">(Chrome)</span>}
          </TabsTrigger>
          {enableEmailPassword && (
            <TabsTrigger value="login">Login</TabsTrigger>
          )}
          {enableEmailPassword && (
            <TabsTrigger value="signup">Signup</TabsTrigger>
          )}
        </TabsList>

        {/* Google Login Tab */}
        <TabsContent value="google">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sign In with Google</CardTitle>
              <CardDescription>
                The fastest and most secure way to get started.
                {isChrome() && (
                  <div className="mt-2 text-xs text-blue-600">
                    Chrome compatibility mode enabled
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-24">
              {googleIsLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-xs text-muted-foreground">
                    {isChrome()
                      ? "Processing Chrome login..."
                      : "Signing in..."}
                  </span>
                </div>
              ) : (
                <GoogleLoginWrapper
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={!isChrome()} // Disable One Tap for Chrome
                  theme="filled_blue"
                  shape="rectangular"
                />
              )}
            </CardContent>
            {isChrome() && (
              <CardFooter className="text-center">
                <p className="text-xs text-muted-foreground">
                  Chrome users: If you experience issues, try{" "}
                  <button
                    onClick={() => window.location.reload()}
                    className="text-blue-600 hover:underline"
                  >
                    refreshing the page
                  </button>{" "}
                  or using <span className="font-medium">Firefox</span>{" "}
                  temporarily.
                </p>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Email Login Tab (conditionally rendered) */}
        {enableEmailPassword && (
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Login with your existing email and password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={loginInput.email}
                    onChange={(e) => changeInputHandler(e, "login")}
                    placeholder="Patel@gmail.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    name="password"
                    value={loginInput.password}
                    onChange={(e) => changeInputHandler(e, "login")}
                    placeholder="xyz"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  disabled={loginIsLoading}
                  onClick={handleEmailLogin}
                  className="w-full"
                >
                  {loginIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}

        {/* Email Signup Tab (conditionally rendered) */}
        {enableEmailPassword && (
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Signup</CardTitle>
                <CardDescription>
                  Create a new account with email and password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={signupInput.name}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    placeholder="Patel"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={signupInput.email}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    placeholder="Patel@gmail.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    name="password"
                    value={signupInput.password}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    placeholder="xyz"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  disabled={registerIsLoading}
                  onClick={handleEmailRegistration}
                  className="w-full"
                >
                  {registerIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Signup"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Login;