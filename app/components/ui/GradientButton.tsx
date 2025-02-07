"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

const buttonVariants = cva(
  "group relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-[#4355ff] to-[#ff3d79] font-semibold text-white transition-all hover:shadow-[0_0_40px_8px_rgba(67,85,255,0.2)]",
  {
    variants: {
      size: {
        sm: "px-4 py-1.5 text-sm",
        md: "px-8 py-3 text-base",
        lg: "px-12 py-4 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLink?: boolean;
  href?: string;
}

const GradientButton = ({
  className,
  size,
  isLink,
  href,
  children,
  ...props
}: GradientButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Enhanced spring configuration for more responsive movement
  const springConfig = {
    stiffness: 300, // Increased for faster response
    damping: 20, // Balanced for smooth movement
    mass: 0.2, // Lighter for quicker reaction
    restSpeed: 0.005, // Fine-tuned rest threshold
  };

  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const element = buttonRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();

      // Get mouse position relative to button center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      // Calculate actual pixel distance
      const dist = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Only apply magnetic effect within radius
      if (dist < 100) {
        // Enhanced pull strength calculation
        const pull = Math.pow(1 - dist / 100, 2); // Quadratic falloff for stronger close-range effect

        // Increased movement range and added directional bias
        const moveX = distanceX * 0.7 * pull;
        const moveY = distanceY * 0.7 * pull;

        mouseX.set(moveX);
        mouseY.set(moveY);
      } else {
        // Smooth return to original position
        mouseX.set(0);
        mouseY.set(0);
      }
    };

    const handleMouseLeave = () => {
      // Smoothly return to original position
      mouseX.set(0);
      mouseY.set(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  const content = (
    <span
      className={`relative flex ${
        size === "sm" ? "h-5" : size === "md" ? "h-6" : "h-7"
      } overflow-hidden`}
    >
      <span className="flex items-center transition-transform duration-500 ease-out group-hover:-translate-y-full">
        {children}
      </span>
      <span className="absolute flex translate-y-full items-center transition-transform duration-500 ease-out group-hover:translate-y-0">
        {children}
      </span>
    </span>
  );

  const buttonContent = (
    <motion.div
      ref={buttonRef}
      style={{ x, y }}
      className={cn(buttonVariants({ size, className }))}
    >
      {content}
    </motion.div>
  );

  if (isLink && href) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  return buttonContent;
};

export default GradientButton;
