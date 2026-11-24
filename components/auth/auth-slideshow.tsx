"use client";

import { useEffect, useState } from "react";
import { Beer, GlassWater, Martini, Wine, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  id: string;
  icon: LucideIcon;
  title: string;
  caption: string;
  background: string;
};

// Placeholder artwork on the brand palette. Swap `icon` for an image when
// real photography is available.
const SLIDES: Slide[] = [
  {
    id: "spirits",
    icon: Martini,
    title: "Crafted spirits",
    caption: "Small batch gins, whiskies and rums, delivered across the UK.",
    background: "bg-linear-to-br from-midnight via-midnight to-indigo-depth",
  },
  {
    id: "wine",
    icon: Wine,
    title: "Fine wines",
    caption: "Reds, whites and sparkling picked for every table.",
    background: "bg-linear-to-br from-indigo-depth via-indigo-depth to-midnight",
  },
  {
    id: "beer",
    icon: Beer,
    title: "Cold beers and ciders",
    caption: "Local favourites and world classics, ready to chill.",
    background: "bg-linear-to-br from-[#0d0d0d] via-midnight to-indigo-depth",
  },
  {
    id: "mixers",
    icon: GlassWater,
    title: "Mixers and more",
    caption: "Everything you need to pour the perfect serve.",
    background: "bg-linear-to-br from-midnight via-indigo-depth to-[#0d0d0d]",
  },
];

const INTERVAL_MS = 5000;

export function AuthSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [paused, reduceMotion]);

  return (
    <aside
      aria-label="Our range"
      data-testid="auth-slideshow"
      className="relative hidden overflow-hidden bg-midnight lg:block"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => {
        const Icon = slide.icon;
        const active = i === index;
        return (
          <div
            key={slide.id}
            aria-hidden={!active}
            data-active={active}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center px-16 text-center transition-opacity duration-1000 motion-reduce:transition-none",
              slide.background,
              active ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <span
              aria-hidden
              className="absolute -right-24 -top-24 size-96 rounded-full bg-gold/10"
            />
            <span
              aria-hidden
              className="absolute -bottom-32 -left-24 size-[28rem] rounded-full bg-white/5"
            />
            <span className="relative flex size-32 items-center justify-center rounded-full border border-gold/40 bg-white/5 text-gold">
              <Icon className="size-14" strokeWidth={1.25} />
            </span>
            <h2 className="relative mt-10 text-3xl font-semibold text-mist">
              {slide.title}
            </h2>
            <p className="relative mt-3 max-w-sm text-base text-mist/70">
              {slide.caption}
            </p>
          </div>
        );
      })}

      <div className="absolute inset-x-0 bottom-10 flex justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show slide ${i + 1}: ${slide.title}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-8 bg-gold" : "w-2 bg-mist/40 hover:bg-mist/70",
            )}
          />
        ))}
      </div>
    </aside>
  );
}
