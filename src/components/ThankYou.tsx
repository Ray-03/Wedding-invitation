/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

export default function ThankYou() {
  return (
    <section
      id="thank-you"
      className="min-h-[80vh] flex flex-col justify-center items-center bg-transparent text-[#03307B] py-24 px-6 relative overflow-hidden"
    >
      {/* Decorative Overlays */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#03307B]/10 to-transparent" />
      
      <div className="max-w-3xl mx-auto w-full relative z-10 flex flex-col items-center text-center space-y-10">
        
        {/* Elegant Ornament */}
        <div className="text-[#3A75C4]">
          <svg width="80" height="40" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M10 25 Q 30 5, 50 25 T 90 25" />
            <circle cx="50" cy="25" r="3" fill="currentColor" />
          </svg>
        </div>

        <div className="space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#03307B] tracking-tight leading-tight">
            Thank You for Your <br className="hidden sm:block" /> Attendance and Support
          </h2>
          
          <div className="w-16 h-[1px] bg-[#3A75C4]/70 mx-auto" />
          
          <p className="font-sans text-base sm:text-lg text-[#03307B]/85 max-w-xl mx-auto leading-relaxed italic">
            "It is a pleasure and honor for us, if you are willing to attend and give us your blessing."
          </p>
        </div>

      </div>
    </section>
  );
}
