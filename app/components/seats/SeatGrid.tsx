"use client";
import { motion } from "framer-motion";
import { Section, Seat } from "@/app/types/seat";

interface SeatGridProps {
  section: Section;
  seats: Seat[];
  onSeatClick: (seat: Seat) => void;
}

export default function SeatGrid({
  section,
  seats,
  onSeatClick,
}: SeatGridProps) {
  // Group seats by row
  const seatsByRow: Seat[][] = [];
  for (let rowIndex = 0; rowIndex < section.rows; rowIndex++) {
    const rowSeats = seats.filter((seat) => seat.row === rowIndex + 1);
    seatsByRow.push(rowSeats);
  }

  const getSeatColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-blue-100 hover:bg-blue-200 border-blue-300";
      case "reserved":
        return "bg-blue-600 cursor-not-allowed";
      case "selected":
        return "bg-red-500 border-red-600";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5 sm:gap-1">
      {seatsByRow.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-0.5 sm:gap-1">
          {row.map((seat) => (
            <motion.button
              key={seat.id}
              whileHover={
                seat.status !== "reserved" ? { scale: 1.1 } : undefined
              }
              whileTap={
                seat.status !== "reserved" ? { scale: 0.95 } : undefined
              }
              onClick={() => {
                if (seat.status !== "reserved") {
                  onSeatClick(seat);
                }
              }}
              disabled={seat.status === "reserved"}
              className={`h-4 w-4 rounded-sm border text-[6px] font-bold text-white transition-colors sm:h-5 sm:w-5 sm:text-[8px] md:h-6 md:w-6 md:text-[9px] ${getSeatColor(
                seat.status
              )}`}
              title={`Row ${seat.row}, Seat ${seat.number}`}
            >
              {seat.number}
            </motion.button>
          ))}
        </div>
      ))}
    </div>
  );
}
