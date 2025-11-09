"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { SelectedTicket } from "@/app/types/seat";

interface TicketListItemProps {
  ticket: SelectedTicket;
  index: number;
}

export default function TicketListItem({ ticket, index }: TicketListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex flex-col gap-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:gap-6"
    >
      {/* Event Image */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28"
      >
        <Image
          src={ticket.eventImage}
          alt={ticket.eventTitle}
          fill
          className="object-cover"
        />
        {/* Checkmark overlay */}
        <div className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
          <svg
            className="h-4 w-4 text-green-500"
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
        </div>
      </motion.div>

      {/* Ticket Details */}
      <div className="flex flex-1 flex-col gap-1.5 sm:gap-2">
        <h3 className="text-base font-semibold leading-tight text-gray-900 sm:text-lg">
          {ticket.eventTitle}
        </h3>
        <div className="flex flex-col gap-0.5 text-xs text-gray-600 sm:text-sm">
          <p>
            {ticket.eventDate}, {ticket.eventTime} ·{" "}
            <span className="font-medium">{ticket.tier.name}</span>
          </p>
          <p className="text-gray-500">
            {ticket.seat.section.replace("section-", "Section ")} · Row{" "}
            {String.fromCharCode(64 + ticket.seat.row)}, Seat{" "}
            {ticket.seat.number}
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-start justify-between sm:flex-col sm:items-end sm:justify-start">
        <span className="text-xs text-gray-500 sm:mb-1">Price</span>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            delay: index * 0.1 + 0.2,
          }}
          className="text-lg font-bold text-gray-900 sm:text-xl"
        >
          ${ticket.tier.price.toFixed(2)}
        </motion.span>
      </div>
    </motion.div>
  );
}
