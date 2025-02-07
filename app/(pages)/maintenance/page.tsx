"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const MaintenancePage = () => {
  const [countdown, setCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeUntilNextMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Set to next midnight

      let diff = midnight.getTime() - now.getTime();

      // Convert to hours, minutes, seconds
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);

      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * (1000 * 60);

      const seconds = Math.floor(diff / 1000);

      return { hours, minutes, seconds };
    };

    const updateCountdown = () => {
      setCountdown(calculateTimeUntilNextMidnight());
    };

    // Update immediately and then every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030014]">
      {/* Noise texture */}
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light">
        <div className="h-full w-full bg-[url('/noise.jpg')] bg-repeat" />
      </div>

      {/* Interactive Grid Background */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />
        </div>

        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.4, 0.6],
            x: ["-25%", "15%", "-25%"],
            y: ["-25%", "15%", "-25%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-20 -top-20 h-[600px] w-[600px] rounded-full bg-[#4355ff] opacity-50 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.3, 0.5],
            x: ["25%", "-15%", "25%"],
            y: ["15%", "-25%", "15%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-20 top-20 h-[600px] w-[600px] rounded-full bg-[#ff3d79] opacity-50 blur-[120px]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <div className="group relative inline-flex items-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4355ff] to-[#ff3d79]" />
            <div className="relative m-[1px] rounded-full bg-[#030014] px-6 py-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-white">
                  🛠️ Scheduled Maintenance
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-center text-6xl font-bold tracking-tight text-transparent sm:text-7xl"
        >
          We&apos;ll be back soon
        </motion.h1>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex gap-8"
        >
          {[
            { label: "Hours", value: countdown.hours },
            { label: "Minutes", value: countdown.minutes },
            { label: "Seconds", value: countdown.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-sm"
            >
              <span className="text-4xl font-bold text-white">
                {item.value.toString().padStart(2, "0")}
              </span>
              <span className="mt-1 text-sm text-zinc-400">{item.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-2xl text-center text-lg text-zinc-400"
        >
          We&apos;re currently performing scheduled maintenance to improve your
          experience. We&apos;ll be back online at 12:00 AM.
        </motion.p>
      </div>
    </div>
  );
};

export default MaintenancePage;
