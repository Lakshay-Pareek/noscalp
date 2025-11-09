"use client";
import { motion } from "framer-motion";

export default function SuccessHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: "#dcfce7" }}
      >
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          strokeWidth="2.5"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-2 text-2xl font-bold text-teal-700 sm:text-3xl"
      >
        Payment Successful!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-gray-600 sm:text-base"
      >
        You got your ticket. Download it here.
      </motion.p>
    </motion.div>
  );
}
