"use client";
import { motion } from "framer-motion";
import { TicketTier } from "@/app/types/seat";

interface TicketPricingProps {
  tiers: TicketTier[];
}

export default function TicketPricing({ tiers }: TicketPricingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
        {/* Label */}
        <h3 className="shrink-0 text-md font-semibold text-gray-900 sm:text-lg">
          Ticket Price:
        </h3>

        {/* Price Tiers */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 rounded-lg border-2 border-gray-300 bg-white px-5 py-2.5 sm:px-6 sm:py-3"
            >
              <span className="text-lg font-bold text-gray-900 sm:text-xl">
                ${tier.price}
              </span>
              <span className="text-sm text-gray-600 sm:text-base">
                {tier.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
