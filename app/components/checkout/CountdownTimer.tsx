"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  initialMinutes?: number;
  initialSeconds?: number;
}

export default function CountdownTimer({
  initialMinutes = 5,
  initialSeconds = 12,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    minutes: initialMinutes,
    seconds: initialSeconds,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = `${String(timeLeft.minutes).padStart(2, "0")}:${String(
    timeLeft.seconds
  ).padStart(2, "0")}`;

  const isLowTime = timeLeft.minutes < 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center gap-2"
    >
      <motion.div
        animate={isLowTime ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
          isLowTime ? "bg-red-50" : "bg-gray-50"
        }`}
      >
        <svg
          className={`h-5 w-5 ${isLowTime ? "text-red-500" : "text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        <span
          className={`font-mono md:text-lg text-sm font-semibold ${
            isLowTime ? "text-red-600" : "text-gray-700"
          }`}
        >
          {formattedTime}
        </span>
      </motion.div>
    </motion.div>
  );
}
