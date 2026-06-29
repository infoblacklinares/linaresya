"use client";
import { motion } from "framer-motion";

export default function FadeInSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, type: "spring", stiffness: 220, damping: 20, mass: 0.7 }}
    >
      {children}
    </motion.div>
  );
}
