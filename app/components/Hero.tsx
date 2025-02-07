"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import GradientButton from "./ui/GradientButton";

interface HeroProps {
  isAuthenticated: boolean;
}

const Hero = ({ isAuthenticated }: HeroProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Different spring configs for different elements
  const gridSpringConfig = { damping: 30, stiffness: 200 };
  const textSpringConfig = { damping: 15, stiffness: 150 };
  const buttonSpringConfig = { damping: 20, stiffness: 300 };

  // Springs for grid
  const gridSpringX = useSpring(mouseX, gridSpringConfig);
  const gridSpringY = useSpring(mouseY, gridSpringConfig);

  // Springs for text with less movement
  const textSpringX = useSpring(mouseX, textSpringConfig);
  const textSpringY = useSpring(mouseY, textSpringConfig);

  // Springs for button with more responsive movement
  const buttonSpringX = useSpring(mouseX, buttonSpringConfig);
  const buttonSpringY = useSpring(mouseY, buttonSpringConfig);

  // Transform ranges for different elements
  const textX = useTransform(textSpringX, [-20, 20], [-10, 10]);
  const textY = useTransform(textSpringY, [-20, 20], [-10, 10]);

  const titleX = useTransform(textSpringX, [-20, 20], [-15, 15]);
  const titleY = useTransform(textSpringY, [-20, 20], [-15, 15]);

  const buttonX = useTransform(buttonSpringX, [-20, 20], [-25, 25]);
  const buttonY = useTransform(buttonSpringY, [-20, 20], [-25, 25]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);

      mouseX.set(x * 20);
      mouseY.set(y * 20);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="perspective-1000 relative min-h-screen overflow-hidden bg-[#030014]"
    >
      {/* Noise texture */}
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light">
        <div className="h-full w-full bg-[url('/noise.jpg')] bg-repeat" />
      </div>

      {/* Interactive Grid Background */}
      <div className="absolute inset-0">
        {/* Grid pattern with parallax effect */}
        <motion.div
          style={{
            x: gridSpringX,
            y: gridSpringY,
          }}
          className="absolute inset-0 transition-transform"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />
        </motion.div>

        {/* Radial gradients that follow mouse */}
        <motion.div
          style={{
            x: gridSpringX,
            y: gridSpringY,
          }}
          className="absolute inset-0 transition-transform"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#4355ff60,transparent_80%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_-100px,#ff3d7960,transparent_80%)]" />
        </motion.div>

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

        {/* Mouse-following spotlight effect */}
        <motion.div
          style={{
            x: gridSpringX,
            y: gridSpringY,
            scale: 1.5,
          }}
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_closest-side,#ffffff05,transparent)] blur-sm" />
        </motion.div>

        {/* Interactive grid dots */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]">
          <motion.div
            style={{
              x: gridSpringX,
              y: gridSpringY,
            }}
            className="absolute inset-0 transition-transform"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pt-32 sm:pt-40 lg:pt-48">
        <div className="mx-auto max-w-7xl">
          {/* Version Badge */}
          <motion.div
            style={{ x: textX, y: textY }}
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
                    ✨ AI powered file sharing
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            style={{ x: titleX, y: titleY }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 text-center"
          >
            <motion.h1
              className="font-display bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl md:text-9xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              Bulk Metadata
              <br />
              <motion.span
                className="inline-block bg-gradient-to-r from-[#4355ff] to-[#ff3d79] bg-clip-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                Like Pro&apos;s
              </motion.span>
            </motion.h1>
          </motion.div>

          {/* Description */}
          <motion.div
            style={{ x: textX, y: textY }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-12 max-w-3xl"
          >
            <p className="text-center text-xl text-zinc-400 sm:text-2xl">
              Streamline your microstock workflow with our efficient tool.
              Select your files and instantly generate a CSV with AI-powered
              assistance.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            style={{ x: buttonX, y: buttonY }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 flex justify-center gap-4"
          >
            <GradientButton
              size="lg"
              isLink
              href={isAuthenticated ? "/dashboard" : "/login"}
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
            </GradientButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
