// ts-client/src/components/BuyCourseButton.tsx

import { Button } from "./ui/button";
import {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
} from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/types";

interface BuyCourseButtonProps {
  courseId: string;
  onSuccess?: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name?: string;
    email?: string;
  };
  notes: {
    courseId: string;
    userId?: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: any) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const BuyCourseButton = ({ courseId, onSuccess }: BuyCourseButtonProps): JSX.Element => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [createRazorpayOrder, { isLoading: isCreatingOrder }] =
    useCreateRazorpayOrderMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] =
    useVerifyPaymentMutation();

  const purchaseCourseHandler = async (): Promise<void> => {
    try {
      const orderData = await createRazorpayOrder(courseId).unwrap();
      const { order } = orderData;

      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "LMS Platform",
        description: "Course Purchase Transaction",
        image: "/logo.svg",
        order_id: order.id,
        handler: async function (response: RazorpayResponse): Promise<void> {
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: courseId,
            };

            const verificationResult = await verifyPayment(
              verificationData
            ).unwrap();

            if (verificationResult?.success) {
              toast.success(
                verificationResult?.message || "Payment successful!"
              );
              // Call the parent's onSuccess callback instead of navigating directly
              if (onSuccess) {
                onSuccess();
              }
            } else {
              toast.error(
                verificationResult?.message || "Payment verification failed."
              );
            }
          } catch (error: any) {
            toast.error(
              error?.data?.message ||
                "An error occurred during payment verification."
            );
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        notes: {
          courseId: courseId,
          userId: user?.userId,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
      rzp1.on("payment.failed", function (response: any) {
        toast.error("Payment Failed!", {
          description: response.error.description,
        });
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to initiate purchase.");
    }
  };

  const isLoading = isCreatingOrder || isVerifyingPayment;

  return (
    <Button
      disabled={isLoading}
      onClick={purchaseCourseHandler}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;