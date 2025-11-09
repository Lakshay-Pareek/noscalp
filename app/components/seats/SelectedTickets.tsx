"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SelectedTicket } from "@/app/types/seat";

interface SelectedTicketsProps {
  tickets: SelectedTicket[];
  onRemoveTicket: (ticketId: string) => void;
}

export default function SelectedTickets({
  tickets,
  onRemoveTicket,
}: SelectedTicketsProps) {
  if (tickets.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="popLayout">
        {tickets.map((ticket, index) => (
          <motion.div
            key={ticket.seat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.05 }}
            className="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:gap-4 sm:p-4"
          >
            {/* Event Image */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
              <Image
                src={ticket.eventImage}
                alt={ticket.eventTitle}
                fill
                className="object-cover"
              />
            </div>

            {/* Ticket Details */}
            <div className="flex-1 min-w-0">
              <h4 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                {ticket.eventTitle}
              </h4>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                {ticket.eventDate}, {ticket.eventTime} · {ticket.tier.name}
              </p>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                Section {ticket.seat.section.replace("section-", "")} | Row{" "}
                {ticket.seat.row} | Seat {ticket.seat.number}
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900 sm:text-base">
                Price ${ticket.tier.price.toFixed(2)}
              </p>
            </div>

            {/* Remove Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemoveTicket(ticket.seat.id)}
              className="shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
              aria-label="Remove ticket"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
