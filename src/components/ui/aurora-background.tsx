"use client";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  className?: string;
  id?: string;
  children: ReactNode;
  showRadialGradient?: boolean;
  variant?: "default" | "immersive";
  pauseAnimation?: boolean;
}

export const AuroraBackground = ({
  className,
  id,
  children,
  showRadialGradient = true,
  variant = "default",
  pauseAnimation = false,
  ...props
}: AuroraBackgroundProps) => {
  const isImmersive = variant === "immersive";

  return (
    <div
      id={id}
      className={cn(
        "relative flex flex-col min-h-screen w-full items-center justify-center overflow-hidden transition-colors duration-500",
        "bg-white text-[#03307B]",
        className
      )}
      {...props}
    >
      {/* Animated Aurora Wave Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            `
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[6px] md:blur-[8px]
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] will-change-transform`,
            !pauseAnimation && "after:animate-aurora",
            isImmersive 
              ? `opacity-[0.18]` 
              : `opacity-[0.12]`,
            showRadialGradient &&
              (isImmersive 
                ? `[mask-image:radial-gradient(ellipse_at_50%_50%,black_45%,var(--transparent)_95%)]` 
                : `[mask-image:radial-gradient(ellipse_at_100%_0%,black_30%,var(--transparent)_85%)]`)
          )}
        ></div>
        
        {/* Soft light — lighter blur on mobile (Safari struggles with 100px+ animated blur) */}
        {isImmersive ? (
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#E6CCB2] opacity-[0.45] blur-[40px] md:blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#03307B]/20 opacity-[0.35] blur-[48px] md:blur-[120px]" />
            <div className="hidden md:block absolute top-[35%] left-[40%] w-[45%] h-[45%] rounded-full bg-[#8BABDB]/20 opacity-[0.25] blur-[90px]" />
          </div>
        ) : (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-[15%] left-[20%] w-[50%] h-[50%] rounded-full bg-[#E6CCB2] opacity-25 blur-[40px] md:blur-[100px]" />
            <div className="absolute bottom-[20%] right-[15%] w-[45%] h-[45%] rounded-full bg-[#03307B]/15 opacity-[0.15] blur-[40px] md:blur-[100px]" />
          </div>
        )}
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-center z-10 font-sans">
        {children}
      </div>
    </div>
  );
};
