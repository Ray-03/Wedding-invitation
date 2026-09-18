/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef } from "react";
import { motion, useTransform, useScroll } from "framer-motion";

export default function SectionSeparator() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const ornamentY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <div
      ref={ref}
      className="flex justify-center items-center py-4 bg-transparent"
    >
      <div className="w-16 h-[1px] bg-[#3A75C4]/30" />
      <motion.div
        style={{ y: ornamentY }}
        className="mx-4 text-[#3A75C4]/70 font-serif italic text-lg select-none will-change-transform"
      >
        ❀
      </motion.div>
      <div className="w-16 h-[1px] bg-[#3A75C4]/30" />
    </div>
  );
}
