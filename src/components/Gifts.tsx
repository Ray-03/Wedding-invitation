/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, CreditCard, Copy, Check, Sparkles } from "lucide-react";
import { WEDDING_CONFIG } from "../config";
import Section from "./ui/Section";
import SectionHeader from "./ui/SectionHeader";

const ACCOUNT_GRADIENTS = [
  "from-[#1E3A8A]/10 to-[#3B82F6]/5",
  "from-[#1E3A8A]/10 to-[#3B82F6]/5",
] as const;

export default function Gifts() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const bankAccounts = WEDDING_CONFIG.giftAccounts.map((account, index) => ({
    ...account,
    colorClass: ACCOUNT_GRADIENTS[index % ACCOUNT_GRADIENTS.length],
  }));

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <Section id="gifts" className="!py-10 sm:!py-16 px-4">
      {/* Decorative Warm Backdrops */}
      <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#3A75C4]/3 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#03307B]/3 blur-[100px] pointer-events-none" />

      {/* Frame decoration */}
      <div className="absolute top-6 left-6 font-mono text-[8px] tracking-[0.25em] uppercase text-[#03307B]/20 [writing-mode:vertical-lr] hidden sm:block h-24">
        SHARE YOUR BLESSINGS
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[8px] tracking-[0.25em] uppercase text-[#03307B]/20 [writing-mode:vertical-lr] rotate-180 hidden sm:block h-24">
        WEDDING REGISTRY . {WEDDING_CONFIG.weddingYear}
      </div>

      <div className="max-w-xl mx-auto w-full relative z-10 flex flex-col items-center">
        {/* Elegant Top Icon & Sparkles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative text-[#3A75C4] mb-2"
        >
          <Gift className="w-8 h-8 stroke-[1.2]" />
          <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-2 animate-pulse text-[#3A75C4]/60" />
        </motion.div>

        <SectionHeader
          label="Love Token"
          title="Digital Gift"
          description="Your blessings are the most beautiful gift for us. However, if you wish to give a token of love, you can channel it through the account below:"
        />

        {/* Gift Options Grid - Extremely centered and compact */}
        <div className="w-full pt-4">
          {/* Bank Transfer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col bg-white border border-[#03307B]/10 rounded-xl p-4 sm:p-6 shadow-sm justify-between relative"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-[#3A75C4] stroke-[1.5]" />
                <span className="font-serif text-base font-medium text-[#03307B]">
                  Bank Transfer
                </span>
              </div>

              {/* Accounts List */}
              <div className="space-y-3">
                {bankAccounts.length === 0 && (
                  <p className="font-sans text-sm text-[#03307B]/70 leading-relaxed">
                    Gift account details can be added via environment variables.
                  </p>
                )}
                {bankAccounts.map((account, index) => {
                  const id = `bank-${index}`;
                  const isCopied = copiedIndex === id;
                  return (
                    <div
                      key={id}
                      className={`p-3.5 sm:p-4 rounded-lg border border-[#03307B]/5 bg-gradient-to-br ${account.colorClass} space-y-2 shadow-inner relative overflow-hidden`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-wider text-[#3A75C4] font-bold">
                            {account.bankName}
                          </p>
                          <p
                            className="font-mono text-sm sm:text-base tracking-wider font-semibold text-[#03307B]/90 mt-0.5"
                            // Keep iOS/WhatsApp from labeling account numbers as phone numbers
                            x-apple-data-detectors="false"
                          >
                            {account.accountNumber}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(account.accountNumber, id)}
                          className={`min-touch p-1.5 rounded-full border transition-all duration-300 inline-flex items-center justify-center ${
                            isCopied
                              ? "bg-[#3A75C4] text-white border-[#3A75C4]"
                              : "bg-white hover:bg-[#3A75C4]/10 hover:border-[#3A75C4]/30 border-[#03307B]/10 text-[#03307B]"
                          }`}
                          title="Copy account number"
                          aria-label="Copy account number"
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {isCopied ? (
                              <motion.span
                                key="checked"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Check className="w-3 h-3" />
                              </motion.span>
                            ) : (
                              <motion.span
                                key="copy"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Copy className="w-3 h-3" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>
                      <div className="pt-1.5 border-t border-[#03307B]/5 flex items-center justify-between">
                        <span className="font-sans text-[8px] sm:text-[9px] text-[#03307B]/40 uppercase tracking-widest">
                          Account Holder
                        </span>
                        <span className="font-sans text-xs font-semibold text-[#03307B]/80">
                          {account.accountHolder}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#03307B]/5 text-center">
              <p className="font-serif text-xs italic text-[#3A75C4] font-medium block">
                Thank you for your blessings & token of love
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
