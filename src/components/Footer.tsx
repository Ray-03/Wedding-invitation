/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
"use client";

import React from "react";
import { Heart } from "lucide-react";
import { WEDDING_CONFIG, getCoupleDisplayNames } from "../config";
import { useGuest } from "../context/GuestContext";

export default function Footer() {
  const { guest } = useGuest();
  const { groomName, brideName } = getCoupleDisplayNames(guest.inviteType);

  return (
    <footer className="w-full text-center border-t border-[#03307B]/5 pt-8 pb-12 bg-transparent space-y-1 relative z-10">
      <p className="font-serif text-base text-[#03307B] italic">
        {groomName} &amp; {brideName}
      </p>
      <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[#3A75C4] font-semibold">
        {WEDDING_CONFIG.weddingDateNumeric}
      </p>
      <p className="mt-6 inline-flex items-center justify-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[#03307B]/40">
        <span>Made with</span>
        <Heart className="w-3 h-3 fill-[#3A75C4] text-[#3A75C4]" aria-hidden />
        <span>by Richard Rinaldy</span>
      </p>
    </footer>
  );
}
