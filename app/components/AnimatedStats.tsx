"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  {
    label: "Active Users",
    value: "10K+",
    speed: 2000,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    label: "Files Processed",
    value: "1M+",
    speed: 5000,
    gradient: "from-purple-500 to-pink-600",
  },
  {
    label: "Time Saved",
    value: "1000h+",
    speed: 300,
    gradient: "from-orange-500 to-red-600",
  },
];

const AnimatedStats = () => {
  return (
    <section className="relative mt-32 w-full overflow-hidden py-16">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Content Container */}
      <div className="relative mx-auto max-w-6xl px-4">
        {/* Section Title */}
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl"
          >
            Trusted by Thousands
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-4 text-zinc-400"
          >
            Join the community of creators who trust MetaBoost
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              key={stat.label}
              className="relative"
            >
              {/* Card */}
              <div className="group relative overflow-hidden rounded-2xl">
                {/* Gradient Border */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-20`}
                />

                {/* Inner Content */}
                <div className="relative space-y-4 bg-zinc-900/90 p-8">
                  {/* Number */}
                  <div className="flex items-baseline justify-center">
                    <span
                      className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-6xl font-bold tracking-tight text-transparent md:text-7xl`}
                    >
                      <AnimatedCounter value={stat.value} speed={stat.speed} />
                    </span>
                  </div>

                  {/* Label */}
                  <div>
                    <h3 className="text-center text-lg font-medium text-white">
                      {stat.label}
                    </h3>
                  </div>

                  {/* Hover Effect - Line */}
                  <div className="absolute bottom-0 left-0 right-0">
                    <div
                      className={`h-1 w-0 bg-gradient-to-r ${stat.gradient} transition-all duration-300 group-hover:w-full`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedStats;
