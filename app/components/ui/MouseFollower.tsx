"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const MouseFollower = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [variant, setVariant] = useState<"default" | "button">("default");

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const followerX = useSpring(cursorX, springConfig);
  const followerY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleElementMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setVariant("button");
      }
    };

    const handleElementMouseLeave = () => {
      setVariant("default");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleElementMouseEnter);
    document.addEventListener("mouseout", handleElementMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleElementMouseEnter);
      document.removeEventListener("mouseout", handleElementMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      style={{
        left: followerX,
        top: followerY,
      }}
      animate={{
        width: variant === "button" ? 50 : 32,
        height: variant === "button" ? 50 : 32,
        x: "-50%",
        y: "-50%",
        scale: variant === "button" ? 1.2 : 1,
        opacity: variant === "button" ? 0.5 : 0.3,
      }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 150,
        mass: 0.5,
      }}
      className="pointer-events-none fixed z-[9999] rounded-full border border-white/50 bg-white/30 mix-blend-difference backdrop-blur-[1px]"
    />
  );
};

export default MouseFollower;
