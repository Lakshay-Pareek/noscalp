"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export interface TimeSlot {
  date: string;
  day: string;
  dayOfWeek: string;
  time: string;
  venue: string;
  price: string;
  ticketsAvailable: number;
}

interface DateTimeSelectorProps {
  timeSlots: TimeSlot[];
  onBookNow?: (slot: TimeSlot) => void;
}

export default function DateTimeSelector({
  timeSlots,
  onBookNow,
}: DateTimeSelectorProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const handleBookNow = (slot: TimeSlot, index: number) => {
    setSelectedSlot(index);
    if (onBookNow) {
      onBookNow(slot);
    }
  };

  return (
    <div className="w-full bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-[1180px]">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Choose Date And Time
          </h2>
          <p className="text-sm text-gray-600">
            All Available Tickets Are Here
          </p>
        </motion.div>

        {/* Time Slots Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
          {timeSlots.map((slot, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ y: -4 }}
              style={{
                borderColor: selectedSlot === index ? "#5522CC" : "#f3f4f6",
              }}
              className={`flex flex-col overflow-hidden rounded-2xl border-2 bg-white shadow-md transition-all sm:flex-row ${
                selectedSlot === index ? "shadow-lg" : "hover:shadow-lg"
              }`}
              onMouseEnter={(e) => {
                if (selectedSlot !== index) {
                  e.currentTarget.style.borderColor = "rgba(85, 34, 204, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSlot !== index) {
                  e.currentTarget.style.borderColor = "#f3f4f6";
                }
              }}
            >
              {/* Date Badge */}
              <div
                className="flex w-full shrink-0 items-center justify-center px-6 py-4 text-white sm:w-24 sm:flex-col"
                style={{ backgroundColor: "#5522CC" }}
              >
                <div className="flex flex-row items-baseline gap-2 sm:flex-col sm:items-center sm:gap-0">
                  <span className="text-3xl font-bold leading-none sm:text-4xl">
                    {slot.date}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide sm:text-sm">
                    {slot.day}
                  </span>
                </div>
              </div>

              {/* Slot Details */}
              <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                <div className="mb-4 flex-1">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">
                        Taylor Swift
                      </h3>
                      <p className="text-sm text-gray-600">The Eras Tour</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-500">From</p>
                      <p
                        className="text-lg font-bold"
                        style={{ color: "#5522CC" }}
                      >
                        {slot.price}
                      </p>
                      <p className="text-xs text-gray-500">/ person</p>
                    </div>
                  </div>

                  {/* Venue and Time Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="h-4 w-4 text-gray-400"
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
                      <span>{slot.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="h-4 w-4 text-gray-400"
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
                      <span>{slot.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                      <span>{slot.ticketsAvailable} Tickets Available!</span>
                    </div>
                  </div>
                </div>

                {/* Book Now Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBookNow(slot, index)}
                  style={{
                    borderColor: "#5522CC",
                    color: "#5522CC",
                  }}
                  className="mt-4 w-full rounded-full border-2 bg-white px-6 py-2.5 text-sm font-medium transition-all"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#5522CC";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.color = "#5522CC";
                  }}
                >
                  Book Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
