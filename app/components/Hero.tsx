"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Contract:
// Renders hero banner with: left performer image, right heading/text/CTAs, decorative gradient panels, and bottom floating search bar.
// Props could be added later; currently static to match provided design.

const heading = [
  "SBS MTV The Kpop",
  "Show Ticket  Package", // double space mimics visual break emphasis
];

export default function Hero() {
  return (
    <section className="relative h-full w-full z-50 overflow-hidden">
      {/* Content container */}
      <div className="flex flex-col gap-2">
        <div className="mx-auto max-w-[1180px] px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
          <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
            {/* Group Image */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="relative shrink-0"
            >
              <Image
                src="/Hero/hero.png"
                alt="Performers"
                width={1000}
                height={600}
                priority
                className="h-auto w-full max-w-[400px] select-none sm:max-w-[1000px] lg:w-[540px]"
              />
            </motion.div>

            {/* Text / CTAs */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.12 },
                },
              }}
              className="relative flex-1 text-center lg:text-left"
            >
              {/* Decorative overlay panels - hidden on mobile */}
              <div className="pointer-events-none absolute inset-0 hidden lg:block">
                <div className="absolute top-10 left-0 h-64 w-56 rounded bg-linear-to-b from-purple-600/40 to-purple-800/60 blur-xl" />
                <div className="absolute bottom-[-140px] right-6 h-[420px] w-56 rounded bg-linear-to-b from-purple-700/50 to-purple-900/70 blur-xl" />
              </div>

              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="relative z-10 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]"
              >
                {heading.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </motion.h1>
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="relative z-10 mx-auto mt-4 max-w-[420px] text-sm leading-relaxed text-white/80 lg:mx-0 lg:mt-6"
              >
                Look no further! Our SBS The Show tickets are the simplest way
                for you to experience a live Kpop recording.
              </motion.p>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="relative z-10 mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:mt-8 lg:justify-start lg:gap-5"
              >
                <Link
                  href="/event/taylor-swift-eras-tour"
                  className="w-full sm:w-auto"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="h-12 w-full rounded-full bg-pink-600 px-8 text-sm font-medium text-white shadow-[0_6px_18px_-6px_rgba(236,72,153,0.6)] transition-colors hover:bg-pink-500 focus:outline-none sm:w-auto"
                  >
                    Get Ticket
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-12 w-full rounded-full border border-white/60 bg-transparent px-8 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus:outline-none sm:w-auto"
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Floating Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="relative left-1/2 w-full max-w-[1180px] my-10 -translate-x-1/2 px-4 lg:px-8"
        >
          <div className="rounded-2xl bg-[#141b38] px-6 py-6 text-white shadow-xl sm:px-8 lg:px-12 lg:py-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {/* Column */}
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wide text-white/50">
                  Search Event
                </label>
                <div className="mt-3 text-sm font-medium">Konser Jazz</div>
                <div className="mt-4 h-px w-full bg-white/10" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wide text-white/50">
                  Place
                </label>
                <div className="mt-3 text-sm font-medium">Indonesia</div>
                <div className="mt-4 h-px w-full bg-white/10" />
              </div>
              <div className="flex flex-col sm:col-span-2 lg:col-span-1">
                <label className="text-xs uppercase tracking-wide text-white/50">
                  Time
                </label>
                <div className="mt-3 flex items-center justify-between text-sm font-medium">
                  <span>Any date</span>
                  <span className="text-xs">▼</span>
                </div>
                <div className="mt-4 h-px w-full bg-white/10" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
