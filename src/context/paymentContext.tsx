import { FC, ReactNode, createContext, useContext, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { STRIPE_PUBLISHABLE_KEY } from "../constants/prices";
import { PAYMENT_SERVER_URL } from "../constants/urls";

const stripePromise: Promise<Stripe | null> = loadStripe(
  STRIPE_PUBLISHABLE_KEY!
);

export type LessonPackageId =
  | "1_lesson"
  | "3_lessons"
  | "6_lessons"
  | "12_lessons";

interface PaymentContextProps {
  stripePromise: Promise<Stripe | null>;
  isPaymentIntentLoading: boolean;
  createPaymentIntent: (packageId: string) => Promise<string>;
  selectedPackageId: LessonPackageId;
  changeSelectedPackageId: (packageId: LessonPackageId) => void;
}

const PaymentContext = createContext<PaymentContextProps>({
  stripePromise,
  isPaymentIntentLoading: false,
  createPaymentIntent: async () => "",
  selectedPackageId: "3_lessons",
  changeSelectedPackageId: () => {},
});

export const usePaymentContext = () => useContext(PaymentContext);

const PaymentProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isPaymentIntentLoading, setIsPaymentIntentLoading] = useState(false);
  const [selectedPackageId, setSelectedPackageId] =
    useState<LessonPackageId>("3_lessons");

  const createPaymentIntent = async (packageId: string): Promise<string> => {
    setIsPaymentIntentLoading(true);

    console.log("Creating payment intent for packageId:", packageId);

    try {
      const response = await fetch(
        `${PAYMENT_SERVER_URL}/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ packageId }),
        }
      );
      const paymentJSON = await response.json();

      const { clientSecret } = paymentJSON;

      setIsPaymentIntentLoading(false);

      return clientSecret;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      setIsPaymentIntentLoading(false);
      return "";
    }
  };

  const changeSelectedPackageId = (
    packageId: "1_lesson" | "3_lessons" | "6_lessons" | "12_lessons"
  ) => {
    setSelectedPackageId(packageId);
  };

  const values = {
    stripePromise,
    isPaymentIntentLoading,
    createPaymentIntent,
    selectedPackageId,
    changeSelectedPackageId,
  };

  return (
    <Elements stripe={stripePromise}>
      <PaymentContext.Provider value={values}>
        {children}
      </PaymentContext.Provider>
    </Elements>
  );
};

export default PaymentProvider;
