"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  value: string;
  speed?: number; // Numbers per second
}

const AnimatedCounter = ({ value, speed = 100 }: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const numberValue = parseInt(value.replace(/\D/g, ""));
  const motionValue = useMotionValue(0);

  // Calculate duration based on the target number and speed
  const duration = Math.max(1, numberValue / speed);

  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    // Smoother animation with custom spring physics
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (inView) {
      motionValue.set(numberValue);
    }
  }, [inView, motionValue, numberValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        // Round to nearest integer and add suffix
        const currentValue = Math.round(latest);
        ref.current.textContent =
          currentValue + (value.includes("+") ? "+" : "");
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [springValue, value]);

  // Initial value with suffix
  return <span ref={ref}>0{value.includes("+") ? "+" : ""}</span>;
};

export default AnimatedCounter;
