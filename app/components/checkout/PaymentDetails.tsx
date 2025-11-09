"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PaymentForm from "./PaymentForm";
import CheckoutPricingSummary from "./CheckoutPricingSummary";

type PaymentMethod = "paypal" | "credit-card" | "paypal-checkout";

interface PaymentDetailsProps {
  subtotal: number;
  serviceFee: number;
  itemCount: number;
  onPayment: () => void;
}

export default function PaymentDetails({
  subtotal,
  serviceFee,
  itemCount,
  onPayment,
}: PaymentDetailsProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("credit-card");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const handlePayment = () => {
    if (!agreedToPolicy) {
      alert("Please agree to the privacy policy to continue.");
      return;
    }
    onPayment();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-6 text-lg font-bold text-gray-900 sm:text-xl">
        Payment Details
      </h2>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-gray-700">
          Select Payment Method
        </h3>
        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onMethodChange={setSelectedMethod}
        />
      </div>

      {/* Payment Form */}
      {selectedMethod === "credit-card" && (
        <div className="mb-6">
          <PaymentForm />
        </div>
      )}

      {/* Pricing Summary */}
      <div className="mb-6">
        <CheckoutPricingSummary
          subtotal={subtotal}
          serviceFee={serviceFee}
          itemCount={itemCount}
        />
      </div>

      {/* Privacy Policy Agreement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6 flex items-start gap-3"
      >
        <input
          type="checkbox"
          id="privacy-policy"
          checked={agreedToPolicy}
          onChange={(e) => setAgreedToPolicy(e.target.checked)}
          className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-purple-600 transition-all focus:ring-2 focus:ring-purple-500"
        />
        <label
          htmlFor="privacy-policy"
          className="cursor-pointer text-sm text-gray-600"
        >
          By clicking this, I agree to Ticketor{" "}
          <a href="#" className="font-medium text-purple-600 hover:underline">
            Privacy Policy
          </a>
        </label>
      </motion.div>

      {/* Pay Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePayment}
        className="w-full rounded-lg bg-linear-to-r from-purple-600 to-pink-500 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
        disabled={!agreedToPolicy}
      >
        Pay ${(subtotal + serviceFee).toFixed(2)}
      </motion.button>
    </motion.div>
  );
}
