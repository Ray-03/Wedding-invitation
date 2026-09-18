/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  label?: string;
  title: string | React.ReactNode;
  description?: string;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut" as any,
    },
  },
};

export default function SectionHeader({
  label,
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`text-center max-w-lg mb-16 space-y-3 flex flex-col items-center ${className}`}
    >
      <motion.div variants={itemVariants} className="overflow-hidden">
        <span className="font-mono text-[11px] sm:text-xs tracking-[0.35em] uppercase text-[#3A75C4] font-bold block">
          {label}
        </span>
      </motion.div>

      <motion.div variants={itemVariants} className="overflow-hidden">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#03307B] tracking-wide font-normal">
          {title}
        </h2>
      </motion.div>

      <motion.div
        variants={lineVariants}
        className="w-12 h-[1px] bg-[#3366CC]/50 my-3 origin-center"
      />

      {description && (
        <motion.div variants={itemVariants}>
          <p className="font-sans text-[15px] sm:text-base text-[#03307B]/80 leading-relaxed max-w-md">
            {description}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
