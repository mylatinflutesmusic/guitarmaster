import { useState } from "react";
import type { ReactNode } from "react";
import type { Block } from "../types";

const KIND_LABEL: Record<Block["kind"], string> = {
  warmup: "Warm-up",
  technique: "Technique",
  repertoire: "Repertoire",
  reading: "Sight-reading",
  memory: "Memory · no hands",
  performance: "Run-through",
  break: "Break",
  close: "Close",
};

export function BlockCard({
  block,
  index,
  done,
  onToggle,
  compact,
  extra,
}: {
  block: Block;
  index: number;
  done?: boolean;
  onToggle?: () => void;
  compact?: boolean;
  extra?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`block${done ? " block--done" : ""}`} onClick={() => setOpen((v) => !v)} role="button" tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((v) => !v);
        }
      }}>
      <div className="block__rail">
        <span className="block__minutes">{block.minutes}′</span>
        <span className={`block__dot block__dot--${block.kind}`} />
      </div>
      <div className="block__body">
        <div className="row row--between" style={{ gap: 8 }}>
          <span className="block__kind">
            {index + 1}. {KIND_LABEL[block.kind]}
            {block.optional ? " · shed first" : ""}
          </span>
          {onToggle ? (
            <button
              type="button"
              className="chip chip--button"
              style={done ? { borderColor: "#3f4f2c", color: "#93b96a" } : undefined}
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              aria-pressed={done}
            >
              {done ? "✓ done" : "mark done"}
            </button>
          ) : null}
        </div>
        <div className="block__title" style={{ marginTop: 4 }}>
          {block.title}
        </div>
        {!compact ? <div className="block__intent">{block.intent}</div> : null}

        {open ? (
          <div className="block__detail">
            <div>
              <div className="label">How</div>
              <ol className="steps">
                {block.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            {block.tempo ? (
              <div>
                <div className="label">Tempo</div>
                <div className="small">{block.tempo}</div>
              </div>
            ) : null}
            <div>
              <div className="label">Done when</div>
              <div className="pill pill--ok">{block.success}</div>
            </div>
            {extra}
            <div className="tiny muted">Tap the card again to fold this away.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
