/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import Section from './ui/Section';
import SectionHeader from './ui/SectionHeader';

export default function DressCode() {
  return (
    <Section id="dresscode" className="bg-white">
      <div className="absolute top-[12%] left-[6%] w-72 h-72 rounded-full bg-[#03307B]/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[8%] w-72 h-72 rounded-full bg-[#DB2777]/10 blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto w-full relative z-10 flex flex-col items-center px-4">
        <SectionHeader label="Dress Code" title="Attire" className="mb-8" />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-sm sm:text-base text-[#03307B]/80 leading-relaxed text-center max-w-lg"
        >
          We kindly ask all guests to wear formal attire. For gentlemen, please do not
          wear jeans. For ladies, please do not wear pants. Thank you for helping us
          keep the evening elegant.
        </motion.p>
      </div>
    </Section>
  );
}
