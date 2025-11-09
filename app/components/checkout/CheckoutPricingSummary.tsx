"use client";
import { motion } from "framer-motion";

interface CheckoutPricingSummaryProps {
  subtotal: number;
  serviceFee: number;
  itemCount: number;
}

export default function CheckoutPricingSummary({
  subtotal,
  serviceFee,
  itemCount,
}: CheckoutPricingSummaryProps) {
  const total = subtotal + serviceFee;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-6"
    >
      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Subtotal</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm font-semibold text-gray-900"
        >
          ${subtotal.toFixed(2)} x{itemCount}
        </motion.span>
      </div>

      {/* Service Fees */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Service Fees</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm font-semibold text-gray-900"
        >
          ${serviceFee.toFixed(2)} x{itemCount}
        </motion.span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300"></div>

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-gray-900">
          Total USD ({itemCount} item{itemCount !== 1 ? "s" : ""})
        </span>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
          className="text-xl font-bold text-purple-700"
        >
          ${total.toFixed(2)}
        </motion.span>
      </div>
    </motion.div>
  );
}
