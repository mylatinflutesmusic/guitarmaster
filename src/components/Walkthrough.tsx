import { useCallback, useLayoutEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "./Icon";
import type { TabId } from "./TabBar";

/** Bumped when the tour covers something new, so it is shown once more. */
export const TOUR_VERSION = 2;

interface Step {
  /** Section shown behind the card while this step runs. */
  tab: TabId;
  /** Element the spotlight should ring. */
  target: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    tab: "today",
    target: ".section-head",
    title: "Practice",
    body: "Your session. Tonight's blocks in the order they should be played — start the timer here, and log it when you finish.",
  },
  {
    tab: "today",
    target: ".icon-btn--help",
    title: "Every section explains itself",
    body: "Tap the ? at the top right of a section for what it is for, the order to work in there, and what catches guitarists out. This tour sits behind the ? next to the settings cog if you ever want it again.",
  },
  {
    tab: "week",
    target: ".section-head",
    title: "Week",
    body: "The seven days the plan built: minutes, the technique and repertoire split, and a warning when hand load or coverage is off. This is the map, not the practice.",
  },
  {
    tab: "pieces",
    target: ".section-head",
    title: "Pieces",
    body: "Your repertoire. Add a piece, say honestly whether you are learning, polishing or maintaining it, and tap “Build around this” on the one that matters most.",
  },
  {
    tab: "progress",
    target: ".section-head",
    title: "Progress",
    body: "The evidence: streak, minutes, the last fourteen days, and the tempo marks you log. Every finished session keeps the blocks it contained.",
  },
  {
    tab: "library",
    target: ".section-head",
    title: "Library",
    body: "The reference behind the plan — how to work each technique, the warm-ups the session opens with, and the practice principles it follows.",
  },
];

export function Walkthrough({
  onDone,
  onNavigate,
  review = false,
}: {
  onDone: () => void;
  onNavigate: (tab: TabId) => void;
  /** Reopened from the header rather than shown for the first time. */
  review?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  const measure = useCallback(() => {
    const element = document.querySelector(STEPS[index].target);
    if (!element) {
      setRect(null);
      return;
    }
    const box = element.getBoundingClientRect();
    setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
  }, [index]);

  useLayoutEffect(() => {
    // Switch to the section this step is about, then measure once its heading is
    // in the DOM (a new tab renders on the next commit, so retry a few frames).
    onNavigate(STEPS[index].tab);
    let frame = 0;
    let tries = 0;
    const look = () => {
      const element = document.querySelector(STEPS[index].target);
      if (element) {
        element.scrollIntoView({ block: "nearest" });
        measure();
        return;
      }
      if (tries++ < 20) frame = requestAnimationFrame(look);
    };
    look();

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [index, measure, onNavigate]);

  // Ring the target with a little air around it, kept just inside the screen so
  // a tab flush with the bottom edge still shows its whole outline.
  const pad = 8;
  const ring = rect
    ? (() => {
        const top = Math.max(4, rect.top - pad);
        const left = Math.max(4, rect.left - pad);
        const right = Math.min(window.innerWidth - 4, rect.left + rect.width + pad);
        const bottom = Math.min(window.innerHeight - 4, rect.top + rect.height + pad);
        return { top, left, width: right - left, height: bottom - top };
      })()
    : undefined;

  // Keep the card clear of the thing it is pointing at: above for targets in the
  // lower half of the screen (the tab bar), below for targets near the top.
  const cardStyle: CSSProperties =
    rect && rect.top + rect.height / 2 > window.innerHeight / 2
      ? { bottom: window.innerHeight - rect.top + 18 }
      : rect
        ? { top: rect.top + rect.height + 18 }
        : { bottom: 90 };

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label="Quick tour">
      <div className="tour__veil" />
      {ring ? <div className="tour__ring" style={ring} /> : null}
      <div className="tour__card" style={cardStyle}>
        <span className="chip chip--accent">
          {index + 1} of {STEPS.length}
        </span>
        <h3 className="section-title" style={{ marginTop: 10, fontSize: 18 }}>
          {step.title}
        </h3>
        <p className="small muted" style={{ marginTop: 6 }}>
          {step.body}
        </p>
        <div className="btn-row" style={{ marginTop: 14, alignItems: "center" }}>
          <button type="button" className="btn btn--ghost" onClick={onDone}>
            {review ? "Close tour" : "Skip tour"}
          </button>
          <span className="spacer" />
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => (last ? onDone() : setIndex((i) => i + 1))}
          >
            {last ? (review ? "Done" : "Start practising") : "Next"}
            {last ? null : <Icon name="play" size={14} />}
          </button>
        </div>
        <div className="tour__dots" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s.title} className={`tour__dot${i === index ? " tour__dot--on" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
