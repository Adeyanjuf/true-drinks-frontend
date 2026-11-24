"use client";

import { useEffect, useReducer, useState } from "react";
import Image from "next/image";
import {
  Beer,
  ChevronLeft,
  ChevronRight,
  Barrel,
  CupSoda,
  Martini,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  caption: string;
} & (
  | { kind: "photo"; src: string; alt: string; position: string; sizes: string }
  | { kind: "gradient"; background: string }
);

// Swap a `src` for real product photography when it is available.
const SLIDES: Slide[] = [
  {
    id: "spirits",
    kind: "photo",
    src: "/assets/5e1d857ec64b5a72fbb217fc162b9b1801b014c6.jpg",
    alt: "A bottle of Tennessee whiskey with three shot glasses",
    position: "50% 45%",
    sizes: "50vw",
    icon: Martini,
    eyebrow: "Spirits",
    title: "Crafted spirits",
    caption: "Small batch gins, whiskies and rums, delivered across the UK.",
  },
  {
    id: "cider",
    kind: "photo",
    src: "/assets/Whisky-Cider-Individual-Bottle-2154758519.jpg",
    alt: "A glass of sparkling cider beside a bottle of whisky cask cider, with apples and oak leaves",
    // Glass and bottle sit left of centre in the landscape frame, so keep both in the tall crop.
    position: "42% 50%",
    sizes: "90vw",
    icon: Beer,
    eyebrow: "Beer and cider",
    title: "Cold beers and ciders",
    caption: "Local favourites and world classics, ready to chill.",
  },
  {
    id: "wine",
    kind: "photo",
    src: "/assets/9ecbbc199b642c00899b6de3256e6a5b95a82240.jpg",
    alt: "A dark red wine bottle in warm studio light",
    position: "50% 50%",
    // Landscape photo cropped to a tall frame: request a larger file so it stays sharp.
    sizes: "90vw",
    icon: Wine,
    eyebrow: "Wine",
    title: "Fine wines",
    caption: "Reds, whites and sparkling picked for every table.",
  },
  {
    id: "mixers",
    kind: "photo",
    src: "/assets/pexels-sa-nguy-n-487841314-33471044.jpg",
    alt: "A citrus cocktail with a physalis garnish beside a tequila bottle on a leather sofa",
    // Shift the crop to the bottom so the drink sits above the caption card.
    position: "40% 100%",
    sizes: "50vw",
    icon: CupSoda,
    eyebrow: "Cocktails and mixers",
    title: "Mixers and more",
    caption: "Everything you need to pour the perfect serve.",
  },
  {
    id: "scotch",
    kind: "photo",
    src: "/assets/da4f26fad228fd3cc980bc407268a90b8aa7bcd9.jpg",
    alt: "A blended malt Scotch whisky bottle resting on rope and a cask",
    position: "50% 40%",
    sizes: "50vw",
    icon: Barrel,
    eyebrow: "Whisky",
    title: "Whisky and Scotch",
    caption: "Blended malts and single casks from the distilleries we trust.",
  },
];

const INTERVAL_MS = 5000;
const TICK_MS = 50;
const ZOOM = 0.1;

type Clock = { index: number; progress: number };
type ClockAction = { type: "tick" } | { type: "goto"; index: number };

function clockReducer(state: Clock, action: ClockAction): Clock {
  const count = SLIDES.length;
  if (action.type === "goto") {
    return { index: (action.index + count) % count, progress: 0 };
  }
  const progress = state.progress + TICK_MS / INTERVAL_MS;
  return progress >= 1
    ? { index: (state.index + 1) % count, progress: 0 }
    : { ...state, progress };
}

export function AuthSlideshow() {
  // progress goes 0 to 1 through the current slide; it drives the bar and the zoom.
  const [{ index, progress }, dispatch] = useReducer(clockReducer, { index: 0, progress: 0 });
  const [hovering, setHovering] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = SLIDES.length;
  const paused = hovering || keyboardFocus || hidden || reduceMotion;
  const go = (i: number) => dispatch({ type: "goto", index: i });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    const visibility = () => setHidden(document.hidden);
    update();
    query.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      query.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  // One clock for everything: it stops while paused and resumes where it left off.
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => dispatch({ type: "tick" }), TICK_MS);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <aside
      aria-label="Our range"
      aria-roledescription="carousel"
      data-testid="auth-slideshow"
      data-paused={paused}
      className="group relative hidden overflow-hidden bg-midnight lg:block"
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      // Only keyboard focus pauses; a mouse click must not leave it stuck.
      onFocus={(e) => setKeyboardFocus(e.target.matches(":focus-visible"))}
      onBlur={() => setKeyboardFocus(false)}
    >
      {SLIDES.map((slide, i) => {
        const active = i === index;
        const Icon = slide.icon;
        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={!active}
            data-active={active}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none",
              active ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {slide.kind === "photo" ? (
              <>
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes={slide.sizes}
                  loading={i === 0 ? "eager" : "lazy"}
                  style={{
                    objectPosition: slide.position,
                    transform: `scale(${1 + ZOOM * (active && !reduceMotion ? progress : 1)})`,
                  }}
                  className="object-cover will-change-transform"
                />
                {/* Palette scrim keeps warm photos on brand and the caption readable. */}
                <div className="absolute inset-0 bg-linear-to-t from-midnight via-midnight/45 to-indigo-depth/25" />
              </>
            ) : (
              <div className={cn("absolute inset-0", slide.background)}>
                <span aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full bg-gold/10" />
                <span aria-hidden className="absolute -bottom-32 -left-24 size-[28rem] rounded-full bg-white/5" />
                <Icon
                  aria-hidden
                  strokeWidth={0.75}
                  className="absolute right-12 top-1/4 size-72 text-gold/20"
                />
              </div>
            )}

            <div className="absolute inset-x-10 bottom-28 max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 text-mist shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-gold">
                  <Icon className="size-4" />
                  {slide.eyebrow}
                </span>
                <span className="text-xs tabular-nums text-mist/60">
                  {String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">{slide.title}</h2>
              <p className="mt-2 text-sm text-mist/75">{slide.caption}</p>
            </div>
          </div>
        );
      })}

      <div className="absolute inset-x-10 bottom-10 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show slide ${i + 1}: ${slide.title}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className="group/bar flex h-5 flex-1 items-center"
          >
            <span className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-all group-hover/bar:h-1.5">
              {i < index && <span className="absolute inset-0 bg-gold/80" />}
              {i === index && (
                <span
                  className="absolute inset-0 origin-left bg-gold"
                  style={{ transform: `scaleX(${reduceMotion ? 1 : Math.min(progress, 1)})` }}
                />
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="absolute right-6 top-6 flex gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => go(index - 1)}
          className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-mist backdrop-blur-md transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(index + 1)}
          className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-mist backdrop-blur-md transition-colors hover:bg-white/20"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </aside>
  );
}
