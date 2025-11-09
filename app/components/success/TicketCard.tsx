"use client";
import { motion } from "framer-motion";
import { forwardRef } from "react";

interface TicketCardProps {
  eventTitle: string;
  eventImage: string;
  quantity: number;
  section: string;
  seatNumbers: string;
  date: string;
  time: string;
}

const TicketCard = forwardRef<HTMLDivElement, TicketCardProps>(
  (
    { eventTitle, eventImage, quantity, section, seatNumbers, date, time },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        data-ticket-card
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "linear-gradient(to bottom right, #1f2937, #111827)",
        }}
      >
        {/* Header Section */}
        <div
          className="px-4 py-3 text-center sm:px-6 sm:py-4"
          style={{ backgroundColor: "#111827" }}
        >
          <h3 className="text-base font-bold text-white sm:text-lg">
            Download Your Tickets!
          </h3>
          <p className="text-xs text-gray-300 sm:text-sm">{eventTitle}</p>
        </div>

        {/* Event Image */}
        <div className="relative h-48 w-full sm:h-64 md:h-80 lg:h-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={eventImage}
            alt={eventTitle}
            className="absolute inset-0 h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent, transparent, rgba(17, 24, 39, 0.7))",
            }}
          />
        </div>

        {/* Perforation Line */}
        <div className="relative h-4">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-700" />
          {/* Left Circle */}
          <div
            className="absolute -left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: "#f9fafb" }}
          />
          {/* Right Circle */}
          <div
            className="absolute -right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: "#f9fafb" }}
          />
        </div>

        {/* Ticket Details */}
        <div
          className="space-y-3 px-4 py-5 sm:space-y-4 sm:px-6 sm:py-6"
          style={{ backgroundColor: "#1f2937" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-white sm:text-lg">
                {quantity} Ticket{quantity !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-gray-400 sm:text-sm">
                Section: {section}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 sm:text-sm">Seat:</p>
              <p className="text-base font-bold text-white sm:text-lg">
                {seatNumbers}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-700 pt-3 sm:pt-4">
            <div>
              <p className="text-xs text-gray-400 sm:text-sm">Date:</p>
              <p className="text-sm font-semibold text-white sm:text-base">
                {date}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 sm:text-sm">Time:</p>
              <p className="text-sm font-semibold text-white sm:text-base">
                {time}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

TicketCard.displayName = "TicketCard";

export default TicketCard;
