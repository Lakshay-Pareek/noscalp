"use client";
import { motion } from "framer-motion";
import { CustomerDetails } from "@/app/types/purchase";

interface CustomerDetailsSectionProps {
  customerDetails: CustomerDetails;
}

export default function CustomerDetailsSection({
  customerDetails,
}: CustomerDetailsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-3"
    >
      <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
        Customer details
      </h2>
      <div className="space-y-2 text-sm sm:text-base">
        <div className="flex justify-between gap-4">
          <span className="text-gray-700">Name:</span>
          <span className="font-medium text-gray-900">
            {customerDetails.name}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-700">Contact Number:</span>
          <span className="font-medium text-gray-900">
            {customerDetails.contactNumber}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-700">Email Address:</span>
          <span className="font-medium text-gray-900 break-all text-right">
            {customerDetails.email}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
