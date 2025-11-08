"use client";
import { motion } from "framer-motion";
import Image from "next/image";

interface EventHeaderProps {
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
}

export default function EventHeader({
  title,
  image,
  date,
  time,
  location,
}: EventHeaderProps) {
  return (
    <div className="w-full bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl"
        >
          {title}
        </motion.h1>

        {/* Main Content - Flexbox Layout */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Event Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-80 lg:h-96 lg:flex-1"
            style={{
              background:
                "linear-gradient(to bottom right, rgba(85, 34, 204, 0.4), rgba(237, 70, 144, 0.4))",
            }}
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4 lg:w-80"
          >
            {/* Date & Time */}
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(85, 34, 204, 0.1)" }}
              >
                <svg
                  className="h-5 w-5"
                  style={{ color: "#5522CC" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Date</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {date}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(85, 34, 204, 0.1)" }}
              >
                <svg
                  className="h-5 w-5"
                  style={{ color: "#5522CC" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Time</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {time}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(85, 34, 204, 0.1)" }}
              >
                <svg
                  className="h-5 w-5"
                  style={{ color: "#5522CC" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Location</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {location}
                </p>
              </div>
            </div>

            {/* Get Directions Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                borderColor: "#5522CC",
                color: "#5522CC",
              }}
              className="flex items-center justify-center gap-2 rounded-full border-2 bg-white px-6 py-3 text-sm font-medium transition-all"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(85, 34, 204, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              Get Directions
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
