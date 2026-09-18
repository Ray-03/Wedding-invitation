/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Heart } from "lucide-react";
import storiesData from "../data/stories.json";

interface StoryPhoto {
  src: string;
  caption: string;
  desc?: string;
}

interface StoryChapter {
  chapter: string;
  date: string;
  title: string;
  subtitle: string;
  location: string;
  desc: string;
  photos: StoryPhoto[];
  rotation: number;
}

type RawStory = {
  chapter: string;
  date: string;
  title: string;
  subtitle: string;
  location: string;
  desc: string;
  image?: string;
  images?: string[];
  caption?: string;
  captions?: string[];
  descs?: string[];
  rotation: number;
};

const resolveImage = (path: string) => {
  if (!path) return "";
  if (
    path.startsWith("/") ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const key = path.replace(/\.webp$/i, "");
  return `/images/story/${key}.webp`;
};

const stories: StoryChapter[] = (storiesData as RawStory[]).map((story) => {
  const imageKeys = story.images?.length
    ? story.images
    : story.image
      ? [story.image]
      : [];
  const captions = story.captions?.length
    ? story.captions
    : story.caption
      ? [story.caption]
      : [];

  return {
    chapter: story.chapter,
    date: story.date,
    title: story.title,
    subtitle: story.subtitle,
    location: story.location,
    desc: story.desc,
    rotation: story.rotation,
    photos: imageKeys.map((key, i) => ({
      src: resolveImage(key),
      caption: captions[i] ?? captions[0] ?? "",
      desc: story.descs?.[i] ?? story.desc,
    })),
  };
});

function Polaroid({
  photos,
  title,
  rotation,
  className,
  style,
}: {
  photos: StoryPhoto[];
  title: string;
  rotation: number;
  className?: string;
  style?: React.ComponentProps<typeof motion.div>["style"];
}) {
  if (photos.length === 0) return null;

  return (
    <motion.div style={style} className={className}>
      {photos.map((photo, index) => {
        const centeredOffset = index - (photos.length - 1) / 2;
        return (
          <motion.div
            key={photo.src}
            animate={{
              x: centeredOffset * 32,
              y: index * 12,
              rotate: rotation + centeredOffset * 7,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full bg-white p-4 pb-6 sm:p-4 sm:pb-8 border border-[#03307B]/10 shadow-md select-none origin-center ${
              index === 0 ? "relative" : "absolute inset-0"
            }`}
          >
            <div className="w-full bg-[#03307B]/5 overflow-hidden relative">
              <motion.img
                src={photo.src}
                alt={`${title} — photo ${index + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45 }}
                className="block w-full h-auto object-contain filter sepia-[0.05] contrast-[0.98] brightness-[0.97]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="text-center mt-2.5 sm:mt-3.5">
              <p className="font-serif font-medium text-[11px] sm:text-[13px] text-[#03307B] tracking-wide italic leading-tight sm:leading-relaxed">
                {photo.caption}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function Story() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    stories.forEach((story) => {
      story.photos.forEach((photo) => {
        if (photo.src) {
          const img = new Image();
          img.src = photo.src;
        }
      });
    });
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile === null) {
    return <section id="story" className="min-h-screen w-full bg-white" />;
  }

  return isMobile ? <MobileStory /> : <DesktopStory />;
}

function MobileStory() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: mobileScrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const mobileTextBgX = useTransform(
    mobileScrollYProgress,
    [0, 1],
    ["5%", "-25%"],
  );

  const scrollSteps = [0, 0.25, 0.5, 0.75, 1];
  const imgY1 = useTransform(
    mobileScrollYProgress,
    scrollSteps,
    [0, 0, 0, 0, 0],
  );
  const imgScale1 = useTransform(
    mobileScrollYProgress,
    scrollSteps,
    [1, 0.96, 0.92, 0.9, 0.9],
  );

  const imgY1b = useTransform(
    mobileScrollYProgress,
    scrollSteps,
    [320, 0, 0, 0, 0],
  );
  const imgScale1b = useTransform(
    mobileScrollYProgress,
    scrollSteps,
    [0.96, 1, 0.96, 0.92, 0.92],
  );
  const imgOpacity1b = useTransform(
    mobileScrollYProgress,
    [0, 0.15, 0.25, 1],
    [0, 0, 1, 1],
  );

  const imgY2 = useTransform(
    mobileScrollYProgress,
    scrollSteps,
    [320, 320, 0, 0, 0],
  );
  const imgScale2 = useTransform(
    mobileScrollYProgress,
    scrollSteps,
    [0.96, 0.96, 1, 0.96, 0.96],
  );
  const imgOpacity2 = useTransform(
    mobileScrollYProgress,
    [0, 0.4, 0.5, 1],
    [0, 0, 1, 1],
  );

  const imgY3 = useTransform(
    mobileScrollYProgress,
    scrollSteps,
    [320, 320, 320, 0, 0],
  );
  const imgScale3 = useTransform(
    mobileScrollYProgress,
    scrollSteps,
    [0.96, 0.96, 0.96, 1, 1],
  );
  const imgOpacity3 = useTransform(
    mobileScrollYProgress,
    [0, 0.65, 0.75, 1],
    [0, 0, 1, 1],
  );

  useEffect(() => {
    const unsubscribe = mobileScrollYProgress.on("change", (latest) => {
      if (latest < 0.5) {
        setActiveIdx(0);
        setActivePhotoIdx(latest < 0.25 ? 0 : 1);
      } else if (latest < 0.75) {
        setActiveIdx(1);
        setActivePhotoIdx(0);
      } else {
        setActiveIdx(2);
        setActivePhotoIdx(0);
      }
    });
    return () => unsubscribe();
  }, [mobileScrollYProgress]);

  const activeStory = stories[activeIdx] || stories[0];
  const activeDescription =
    activeStory.photos[activePhotoIdx]?.desc ?? activeStory.desc;

  return (
    <div ref={containerRef} className="relative w-full h-[360vh] bg-white">
      <div className="sticky top-0 h-screen w-full flex flex-col pt-10 pb-4 px-4 overflow-hidden bg-white">
        <motion.div
          style={{ x: mobileTextBgX }}
          className="absolute top-[32%] left-0 font-serif text-[22vw] leading-none text-[#03307B]/[0.012] uppercase select-none pointer-events-none whitespace-nowrap z-0 font-bold tracking-widest will-change-transform"
        >
          OUR LOVE STORY . OUR LOVE STORY . OUR LOVE STORY
        </motion.div>

        <div className="relative z-10 w-full text-center space-y-2 shrink-0">
          <div>
            <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#03307B]/80 font-bold block mb-0.5">
              Our Journey Story
            </span>
            <h2 className="font-serif text-2xl text-[#03307B] font-semibold tracking-tight">
              Our Love Story
            </h2>
            <div className="h-px w-6 bg-[#3A75C4]/30 mt-1.5 mx-auto" />
          </div>

          <div className="flex items-center gap-2 justify-center">
            {stories.map((story, i) => {
              const isActive = activeIdx === i;
              return (
                <div
                  key={story.chapter}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider transition-all duration-300 ${
                    isActive
                      ? "bg-[#03307B]/10 text-[#03307B] font-semibold"
                      : "text-[#3A75C4]/40"
                  }`}
                >
                  {story.chapter}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-start pt-3 gap-3 w-full">
          <div className="relative z-40 min-h-[96px] max-w-sm mx-auto w-full text-center px-2 mb-6 shrink-0 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-center gap-1.5 text-rose-500/80">
                  <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
                  <span className="font-mono text-[9px] tracking-widest uppercase text-[#03307B]/80">
                    {activeStory.date} • {activeStory.location}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-[#03307B] font-bold tracking-wide">
                  {activeStory.title}
                </h3>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={activeDescription}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="font-sans text-[12.5px] text-[#03307B]/80 leading-relaxed"
                  >
                    {activeDescription}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-10 w-full h-[min(48vh,380px)] flex items-center justify-center shrink-0 pt-1">
            <Polaroid
              photos={[stories[0].photos[0]]}
              title={stories[0].title}
              rotation={stories[0].rotation}
              style={{ y: imgY1, scale: imgScale1 }}
              className="absolute w-[calc(75vw-2.25rem)] max-w-[285px] will-change-transform origin-center z-10"
            />
            {stories[0].photos[1] && (
              <Polaroid
                photos={[stories[0].photos[1]]}
                title={stories[0].title}
                rotation={stories[0].rotation + 5}
                style={{ y: imgY1b, scale: imgScale1b, opacity: imgOpacity1b }}
                className="absolute w-[calc(75vw-2.25rem)] max-w-[285px] will-change-transform origin-center z-15"
              />
            )}
            <Polaroid
              photos={stories[1].photos}
              title={stories[1].title}
              rotation={stories[1].rotation}
              style={{ y: imgY2, scale: imgScale2, opacity: imgOpacity2 }}
              className="absolute w-[calc(75vw-2.25rem)] max-w-[285px] will-change-transform origin-center z-20"
            />
            <Polaroid
              photos={stories[2].photos}
              title={stories[2].title}
              rotation={stories[2].rotation}
              style={{ y: imgY3, scale: imgScale3, opacity: imgOpacity3 }}
              className="absolute w-[calc(75vw-2.25rem)] max-w-[285px] will-change-transform origin-center z-30"
            />
          </div>
        </div>

        <div className="relative z-10 text-[9px] font-mono text-[#03307B]/70 flex items-center justify-center gap-1.5 select-none pt-1 pb-2 shrink-0 mt-auto">
          <div className="w-3 h-px bg-[#03307B]/30" />
          <span>Scroll to see our journey stack</span>
        </div>
      </div>
    </div>
  );
}

function DesktopStory() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const textBgX = useTransform(scrollYProgress, [0, 1], ["5%", "-15%"]);

  const scrollSteps = [0, 0.25, 0.5, 0.75, 1];
  const imgY1 = useTransform(
    scrollYProgress,
    scrollSteps,
    [0, 0, 0, 0, 0],
  );
  const imgScale1 = useTransform(
    scrollYProgress,
    scrollSteps,
    [1, 0.95, 0.92, 0.9, 0.9],
  );

  const imgY1b = useTransform(scrollYProgress, scrollSteps, [480, 0, 0, 0, 0]);
  const imgScale1b = useTransform(
    scrollYProgress,
    scrollSteps,
    [0.95, 1, 0.95, 0.92, 0.92],
  );
  const imgOpacity1b = useTransform(
    scrollYProgress,
    [0, 0.15, 0.25, 1],
    [0, 0, 1, 1],
  );

  const imgY2 = useTransform(
    scrollYProgress,
    scrollSteps,
    [480, 480, 0, 0, 0],
  );
  const imgScale2 = useTransform(
    scrollYProgress,
    scrollSteps,
    [0.95, 0.95, 1, 0.95, 0.95],
  );
  const imgOpacity2 = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 1],
    [0, 0, 1, 1],
  );

  const imgY3 = useTransform(
    scrollYProgress,
    scrollSteps,
    [480, 480, 480, 0, 0],
  );
  const imgScale3 = useTransform(
    scrollYProgress,
    scrollSteps,
    [0.95, 0.95, 0.95, 1, 1],
  );
  const imgOpacity3 = useTransform(
    scrollYProgress,
    [0, 0.65, 0.75, 1],
    [0, 0, 1, 1],
  );

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.5) {
        setActiveIdx(0);
        setActivePhotoIdx(latest < 0.25 ? 0 : 1);
      } else if (latest < 0.75) {
        setActiveIdx(1);
        setActivePhotoIdx(0);
      } else {
        setActiveIdx(2);
        setActivePhotoIdx(0);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const activeStory = stories[activeIdx] || stories[0];
  const activeDescription =
    activeStory.photos[activePhotoIdx]?.desc ?? activeStory.desc;

  return (
    <div ref={containerRef} className="relative w-full h-[400vh] bg-white">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ x: textBgX }}
          className="absolute top-[35%] left-0 font-serif text-[18vw] leading-none text-[#03307B]/[0.012] uppercase select-none pointer-events-none whitespace-nowrap z-0 font-bold tracking-widest will-change-transform"
        >
          OUR LOVE STORY . CHAPTER BY CHAPTER
        </motion.div>

        <div className="absolute top-[15%] left-[5%] w-80 h-80 rounded-full bg-[#3A75C4]/5 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[5%] w-80 h-80 rounded-full bg-[#03307B]/4 blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-8 w-full grid grid-cols-12 gap-12 items-center relative z-10">
          <div className="col-span-5 relative h-[460px] flex items-center justify-center">
            <Polaroid
              photos={[stories[0].photos[0]]}
              title={stories[0].title}
              rotation={stories[0].rotation}
              style={{ y: imgY1, scale: imgScale1 }}
              className="absolute w-[clamp(280px,28vw,360px)] will-change-transform origin-center z-10"
            />
            {stories[0].photos[1] && (
              <Polaroid
                photos={[stories[0].photos[1]]}
                title={stories[0].title}
                rotation={stories[0].rotation + 5}
                style={{ y: imgY1b, scale: imgScale1b, opacity: imgOpacity1b }}
                className="absolute w-[clamp(280px,28vw,360px)] will-change-transform origin-center z-15"
              />
            )}
            <Polaroid
              photos={stories[1].photos}
              title={stories[1].title}
              rotation={stories[1].rotation}
              style={{ y: imgY2, scale: imgScale2, opacity: imgOpacity2 }}
              className="absolute w-[clamp(280px,28vw,360px)] will-change-transform origin-center z-20"
            />
            <Polaroid
              photos={stories[2].photos}
              title={stories[2].title}
              rotation={stories[2].rotation}
              style={{ y: imgY3, scale: imgScale3, opacity: imgOpacity3 }}
              className="absolute w-[clamp(280px,28vw,360px)] will-change-transform origin-center z-30"
            />
          </div>

          <div className="col-span-7 flex flex-col justify-center space-y-6 pl-8">
            <div>
              <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-[#03307B]/80 font-bold block mb-1">
                Our Journey Story
              </span>
              <h2 className="font-serif text-3xl text-[#03307B] font-semibold tracking-tight">
                Our Love Story
              </h2>
              <div className="h-px w-8 bg-[#3A75C4]/30 mt-2" />
            </div>

            <div className="flex items-center gap-3">
              {stories.map((story, i) => {
                const isActive = activeIdx === i;
                return (
                  <div
                    key={story.chapter}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ${
                      isActive
                        ? "bg-[#03307B]/10 text-[#03307B] font-semibold"
                        : "text-[#3A75C4]/40"
                    }`}
                  >
                    {story.chapter}
                  </div>
                );
              })}
            </div>

            <div className="relative min-h-[160px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-3.5"
                >
                  <div className="flex items-center gap-2 text-rose-500/80">
                    <Heart className="w-4 h-4 fill-current animate-pulse" />
                    <span className="font-mono text-[10px] tracking-widest uppercase text-[#03307B]/80">
                      {activeStory.date} • {activeStory.location}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl text-[#03307B] font-bold tracking-wide leading-tight">
                    {activeStory.title}
                  </h3>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={activeDescription}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="font-sans text-[14px] text-[#03307B]/80 leading-relaxed max-w-lg"
                    >
                      {activeDescription}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="pt-2 text-[10px] font-mono text-[#03307B]/70 flex items-center gap-2 select-none">
              <div className="w-4 h-px bg-[#03307B]/30" />
              <span>Scroll down to continue our journey</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
