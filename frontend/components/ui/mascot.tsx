"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";

export type MascotName = "retriever" | "owl" | "mole";
export type MascotPose = "idle" | "thinking" | "judging" | "celebrating" | "working";

interface MascotProps {
  name: MascotName;
  pose?: MascotPose;
  size?: number;
  className?: string;
  showFallbackBadge?: boolean;
}

/**
 * Mascot Character System
 *
 * Characters:
 * - retriever: warm paper apricot guardian, used in collections, chat, ingestion
 * - owl: sage judge & evaluator, used in evals and quality metrics
 * - mole: diligent ground researcher, used in index builders and chunkers
 *
 * Respects prefers-reduced-motion with gentle ±4px floating animation and periodic blinking.
 */
export function Mascot({
  name,
  pose = "idle",
  size = 56,
  className,
}: MascotProps) {
  const shouldReduceMotion = useReducedMotion();
  const [blinking, setBlinking] = useState(false);

  // Periodic subtle blink (every 4-7s)
  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 160);
    }, 4500);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // Mascot color themes
  const colorMap = {
    retriever: {
      bg: "bg-[#E9A66B]/20 text-[#E9A66B] border-[#E9A66B]/30",
      accent: "#E9A66B",
      label: "Retriever",
    },
    owl: {
      bg: "bg-[#4F8A5B]/20 text-[#4F8A5B] border-[#4F8A5B]/30",
      accent: "#4F8A5B",
      label: "Owl",
    },
    mole: {
      bg: "bg-[#D69A2D]/20 text-[#D69A2D] border-[#D69A2D]/30",
      accent: "#D69A2D",
      label: "Mole",
    },
  }[name];

  return (
    <motion.div
      animate={shouldReduceMotion ? { y: 0 } : { y: [-4, 4, -4] }}
      transition={
        shouldReduceMotion
          ? undefined
          : {
              duration: 6,
              ease: "easeInOut",
              repeat: Infinity,
            }
      }
      style={{ width: size, height: size }}
      className={cn(
        "relative flex items-center justify-center rounded-2xl select-none shrink-0",
        className
      )}
      role="img"
      aria-label={`${name} mascot (${pose})`}
    >
      {/* TODO: When production custom-illustrated .webp assets are finalized in /public/mascot/,
          switch to direct Next.js <Image /> rendering:
          <Image
            src={`/mascot/${name}-${pose}.webp`}
            alt={`${name} mascot`}
            width={size}
            height={size}
            className="w-full h-full object-contain pointer-events-none"
          />
      */}

      {/* Styled Character Placeholder Blob with responsive proportions */}
      <div
        className={cn(
          "w-full h-full rounded-2xl border flex flex-col items-center justify-center p-1 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          colorMap.bg
        )}
      >
        {name === "retriever" && (
          <svg
            viewBox="0 0 36 36"
            className="w-4/5 h-4/5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Floppy dog ears */}
            <path
              d="M8 12C6 8 10 5 12 8C13 11 11 15 8 12Z"
              fill={colorMap.accent}
              fillOpacity="0.8"
            />
            <path
              d="M28 12C30 8 26 5 24 8C23 11 25 15 28 12Z"
              fill={colorMap.accent}
              fillOpacity="0.8"
            />
            {/* Head */}
            <circle cx="18" cy="18" r="11" fill={colorMap.accent} fillOpacity="0.9" />
            {/* Muzzle */}
            <ellipse cx="18" cy="22" rx="6" ry="4.5" fill="var(--surface)" />
            {/* Nose */}
            <ellipse cx="18" cy="20" rx="2" ry="1.4" fill="var(--ink)" />
            {/* Eyes (blink animation) */}
            <ellipse
              cx="14"
              cy="16"
              rx="1.4"
              ry={blinking ? "0.2" : "1.6"}
              fill="var(--surface)"
            />
            <ellipse
              cx="22"
              cy="16"
              rx="1.4"
              ry={blinking ? "0.2" : "1.6"}
              fill="var(--surface)"
            />
          </svg>
        )}

        {name === "owl" && (
          <svg
            viewBox="0 0 36 36"
            className="w-4/5 h-4/5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Owl ear tufts */}
            <path d="M11 9L15 15H9L11 9Z" fill={colorMap.accent} fillOpacity="0.75" />
            <path d="M25 9L27 15H21L25 9Z" fill={colorMap.accent} fillOpacity="0.75" />
            {/* Head/Body */}
            <circle cx="18" cy="19" r="11" fill={colorMap.accent} fillOpacity="0.9" />
            {/* Round Spectacles/Eyes */}
            <circle cx="14" cy="18" r="4.5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="0.8" />
            <circle cx="22" cy="18" r="4.5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="0.8" />
            <line x1="17.5" y1="18" x2="18.5" y2="18" stroke="var(--ink)" strokeWidth="0.8" />
            {/* Pupils with blink */}
            <circle cx="14" cy="18" r={blinking ? "0.4" : "1.8"} fill="var(--ink)" />
            <circle cx="22" cy="18" r={blinking ? "0.4" : "1.8"} fill="var(--ink)" />
            {/* Beak */}
            <path d="M18 21L16.5 24H19.5L18 21Z" fill="#D69A2D" />
          </svg>
        )}

        {name === "mole" && (
          <svg
            viewBox="0 0 36 36"
            className="w-4/5 h-4/5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hard hat or burrow crown */}
            <path d="M12 12C12 9 24 9 24 12V14H12V12Z" fill="#D69A2D" />
            {/* Head */}
            <circle cx="18" cy="19" r="11" fill={colorMap.accent} fillOpacity="0.9" />
            {/* Snout */}
            <ellipse cx="18" cy="22" rx="5" ry="3.5" fill="var(--surface)" />
            <ellipse cx="18" cy="21" rx="2" ry="1.2" fill="#C4553D" />
            {/* Small eyes / spectacles */}
            <circle cx="14" cy="16" r={blinking ? "0.3" : "1.2"} fill="var(--ink)" />
            <circle cx="22" cy="16" r={blinking ? "0.3" : "1.2"} fill="var(--ink)" />
            {/* Whisker dots */}
            <circle cx="15" cy="23" r="0.6" fill="var(--muted)" />
            <circle cx="21" cy="23" r="0.6" fill="var(--muted)" />
          </svg>
        )}
      </div>
    </motion.div>
  );
}
