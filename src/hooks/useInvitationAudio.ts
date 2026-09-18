import { useCallback, useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/background.m4a";
const VOLUME = 0.4;

export function useInvitationAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayRequestedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = "auto";
    audioRef.current = audio;
    return audio;
  }, []);

  const play = useCallback(() => {
    const audio = ensureAudio();
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        isPlayRequestedRef.current = true;
      })
      .catch((err) => {
        console.warn(
          "Direct audio play failed or was blocked by browser:",
          err,
        );
      });
  }, [ensureAudio]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      isPlayRequestedRef.current = false;
      return;
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        isPlayRequestedRef.current = true;
      })
      .catch((err) => {
        console.warn("Music toggle play failed:", err);
      });
  }, [isPlaying]);

  return { isPlaying, play, toggle };
}
