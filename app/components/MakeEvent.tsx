"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function MakeEvent() {
  return (
    <section className="bg-linear-to-r from-purple-100 via-pink-50 to-purple-100 px-4 py-16 sm:px-6 lg:px-8 lg:py-2">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="-mt-15 relative h-64 w-full max-w-md sm:h-80 lg:h-72 lg:flex-1"
          >
            <Image
              src="/makeEvent.png"
              alt="Create Event Illustration"
              fill
              className="object-contain"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
          >
            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              Make your own Event
            </h2>
            <p className="mb-4 max-w-md text-base text-gray-600 sm:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-pink-600 px-10 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-pink-500 hover:shadow-xl"
            >
              Create Events
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
