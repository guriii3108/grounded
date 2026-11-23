"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { cn } from "../../lib/utils";

export type MascotName = "retriever" | "owl" | "mole";
export type MascotPose = "idle" | "thinking" | "fetching" | "celebrate" | "error" | "judge";

interface MascotProps {
  name: MascotName;
  pose?: MascotPose;
  size?: number;
  className?: string;
  priority?: boolean;
  delay?: number;
}

// Only verified production files are mapped. Missing poses are intentionally loud
// in development so placeholder artwork can never creep back into the interface.
const assetMap: Record<MascotName, string> = {
  retriever: "/mascot/pup-idle.webp",
  owl: "/mascot/violet-idle.webp",
  mole: "/mascot/star-idle.webp",
};

export function Mascot({ name, pose = "idle", size = 56, className, priority = false, delay = 0 }: MascotProps) {
  const reduceMotion = useReducedMotion();
  const src = assetMap[name];
  const [lean, setLean] = useState({ x: 0, y: 0, rotate: 0 });

  if (!src) {
    const filename = `${name}-${pose}.webp`;
    return (
      <div aria-label={`MISSING: ${filename}`} className={cn("grid shrink-0 place-items-center border border-dashed border-[var(--negative)] px-2 text-center text-[10px] leading-tight text-[var(--negative)]", className)} style={{ width: size, height: size }}>
        MISSING: {filename}
      </div>
    );
  }

  return (
    <motion.div
      aria-label={`${name} mascot (${pose})`}
      role="img"
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      animate={reduceMotion ? { y: 0 } : { y: [-5, 5, -5] }}
      transition={reduceMotion ? undefined : { duration: 7, ease: "easeInOut", repeat: Infinity, delay }}
    >
      <motion.div
        className="relative size-full"
        animate={reduceMotion ? undefined : lean}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          setLean({ x: x * 4, y: y * 2, rotate: x * 4 });
        }}
        onPointerLeave={() => setLean({ x: 0, y: 0, rotate: 0 })}
      >
        <Image src={src} alt="" fill sizes={`${size}px`} priority={priority} className="object-contain" />
      </motion.div>
    </motion.div>
  );
}
