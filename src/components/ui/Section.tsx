/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface SectionProps extends HTMLMotionProps<"section"> {
  id: string;
  className?: string;
  children: React.ReactNode;
}

export default React.forwardRef<HTMLElement, SectionProps>(function Section(
  { id, className = "", children, ...props },
  ref,
) {
  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      className={`py-24 px-6 relative overflow-hidden flex flex-col items-center ${className}`}
      {...props}
    >
      {children}
    </motion.section>
  );
});
