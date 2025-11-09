"use client";
import { motion } from "framer-motion";
import { Section, Seat } from "@/app/types/seat";
import SeatGrid from "./SeatGrid";

interface SeatMapProps {
  sections: Section[];
  seats: Seat[];
  onSeatClick: (seat: Seat) => void;
}

export default function SeatMap({
  sections,
  seats,
  onSeatClick,
}: SeatMapProps) {
  // Group sections by position
  const centerTopSections = sections.filter((s) => s.position === "center-top");
  const centerBottomSections = sections.filter(
    (s) => s.position === "center-bottom"
  );
  const leftSections = sections.filter((s) => s.position === "left");
  const rightSections = sections.filter((s) => s.position === "right");

  const getSectionSeats = (sectionId: string) => {
    return seats.filter((seat) => seat.section === sectionId);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Stage - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 inline-block bg-gray-200 rounded-lg lg:py-6 py-3 lg:px-60 px-20 text-center text-base font-semibold text-gray-700 sm:py-4 sm:text-lg md:text-xl"
      >
        Stage
      </motion.div>

      {/* Seating layout - Exactly as in image */}
      <div className="flex flex-col items-center gap-8 sm:gap-12 lg:gap-16">
        {/* Top Row: Section 3 (Left) + Section 1 (Center) + Section 4 (Right) */}
        <div className="flex w-full flex-wrap items-start justify-center gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          {/* Left Sections */}
          {leftSections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <SeatGrid
                section={section}
                seats={getSectionSeats(section.id)}
                onSeatClick={onSeatClick}
              />
              <p className="mt-4 text-sm font-medium text-gray-700 sm:text-base">
                {section.name}
              </p>
            </motion.div>
          ))}

          {/* Center Top Sections */}
          {centerTopSections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <SeatGrid
                section={section}
                seats={getSectionSeats(section.id)}
                onSeatClick={onSeatClick}
              />
              <p className="mt-4 text-sm font-medium text-gray-700 sm:text-base">
                {section.name}
              </p>
            </motion.div>
          ))}

          {/* Right Sections */}
          {rightSections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <SeatGrid
                section={section}
                seats={getSectionSeats(section.id)}
                onSeatClick={onSeatClick}
              />
              <p className="mt-4 text-sm font-medium text-gray-700 sm:text-base">
                {section.name}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Row: Section 2 (Center) with zoom controls */}
        {centerBottomSections.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-4">
              {centerBottomSections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <SeatGrid
                    section={section}
                    seats={getSectionSeats(section.id)}
                    onSeatClick={onSeatClick}
                  />
                  <p className="mt-4 text-sm font-medium text-gray-700 sm:text-base">
                    {section.name}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="mt-6 flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50">
                <span className="text-lg">+</span>
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50">
                <span className="text-lg">−</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend - Removed from here, will be inline */}
    </div>
  );
}
