"use client";
import { motion } from "framer-motion";

export default function NudgeArrow({ className }: { className?: string }) {
  return (
    <motion.span
      className={className}
      style={{ display: "inline-block" }}
      animate={{ x: [0, 4, 0] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
    >
      →
    </motion.span>
  );
}
