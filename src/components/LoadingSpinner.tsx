// ts-client/src/components/LoadingSpinner.tsx
import { Loader } from "lucide-react";
import type { LoadingSpinnerProps } from "@/types";

const LoadingSpinner = ({ size = "md", text = "Loading, please wait...", className = "" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16", 
    lg: "h-24 w-24"
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-50 ${className}`}>
      <Loader className={`animate-spin ${sizeClasses[size]} text-purple-500`} />
      <p className="mt-4 text-lg font-semibold text-gray-700">
        {text}
      </p>
    </div>
  );
};

export default LoadingSpinner;