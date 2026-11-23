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
  const [pressed, setPressed] = useState(false);
  const stateMotion = {
    idle: { y: [-5, 5, -5] },
    thinking: { y: [-3, 3, -3], rotate: [-3, 3, -3] },
    fetching: { y: [-5, 5, -5], rotate: [-1, 1, -1] },
    judge: { y: [-3, 3, -3], rotate: [-1.5, 1.5, -1.5] },
    celebrate: { y: [0, -14, 0, -9, 0], scale: [1, 1.06, 0.98, 1.04, 1] },
    error: { x: [0, -3, 3, -2, 2, 0], scale: [1, 0.96, 1] },
  }[pose];

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
      aria-hidden="true"
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      animate={reduceMotion ? { y: 0 } : stateMotion}
      transition={reduceMotion ? undefined : { duration: pose === "celebrate" || pose === "error" ? 0.7 : 7, ease: "easeInOut", repeat: pose === "celebrate" || pose === "error" ? 0 : Infinity, delay }}
    >
      <motion.div
        className="relative size-full"
        animate={reduceMotion ? undefined : { ...lean, scale: pressed ? [0.88, 1.06, 1] : 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          setLean({ x: x * 4, y: y * 2, rotate: x * 4 });
        }}
        onPointerLeave={() => setLean({ x: 0, y: 0, rotate: 0 })}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
      >
        <Image src={src} alt="" fill sizes={`${size}px`} priority={priority} className="object-contain" />
      </motion.div>
    </motion.div>
  );
}
