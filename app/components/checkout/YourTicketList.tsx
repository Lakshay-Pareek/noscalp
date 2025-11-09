"use client";
import { motion } from "framer-motion";
import TicketListItem from "./TicketListItem";
import { SelectedTicket } from "@/app/types/seat";

interface YourTicketListProps {
  tickets: SelectedTicket[];
}

export default function YourTicketList({ tickets }: YourTicketListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-6 text-lg font-bold text-gray-900 sm:text-xl">
        Your Ticket List
      </h2>
      <div className="flex flex-col gap-4 sm:gap-6">
        {tickets.map((ticket, index) => (
          <TicketListItem key={ticket.seat.id} ticket={ticket} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
