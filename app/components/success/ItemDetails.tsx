"use client";
import { motion } from "framer-motion";

interface ItemDetailsProps {
  eventTitle: string;
  quantity: number;
  amount: number;
}

export default function ItemDetails({
  eventTitle,
  quantity,
  amount,
}: ItemDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-3"
    >
      <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
        Item Details
      </h2>
      <div className="space-y-2 text-sm sm:text-base">
        <div className="flex justify-between gap-4">
          <span className="text-gray-700">Item:</span>
          <span className="font-medium text-gray-900 text-right">
            {eventTitle}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-700">Quantity:</span>
          <span className="font-medium text-gray-900">
            {quantity} Ticket{quantity !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-700">Amount:</span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            className="font-bold text-gray-900"
          >
            ${amount}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
