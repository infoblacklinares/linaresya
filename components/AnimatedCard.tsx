"use client";
import { motion } from "framer-motion";

export default function AnimatedCard({
  children,
  index,
  className,
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, scale: 0.86 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        delay: Math.min(index, 10) * 0.07,
        type: "spring",
        stiffness: 260,
        damping: 18,
        mass: 0.6,
      }}
    >
      {children}
    </motion.div>
  );
}
