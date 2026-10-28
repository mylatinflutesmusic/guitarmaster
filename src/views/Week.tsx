import { useState } from "react";
import { useStore } from "../store";
import { PHASES } from "../types";
import type { DayPlan, MethodId } from "../types";
import { formatMinutes, goalCountdown, todayKey, WEEKDAY_SHORT } from "../engine/dates";
import { PRINCIPLES } from "../data/methods";
import { technique as getTechnique } from "../data/library";
import { Sheet } from "../components/Sheet";
import { SectionHelp } from "../components/SectionHelp";

const METHOD_LABEL: Record<MethodId, string> = {
  slow: "slow pass",
  fix: "isolate",
  join: "join seams",
  memory: "memory check",
  ladder: "ladder",
  run: "run-through",
  record: "record",
  maintain: "maintain",
};

export function Week() {
  const { state, week } = useStore();
  const [open, setOpen] = useState<string | null>(todayKey());
  const [showPrinciples, setShowPrinciples] = useState(false);
  const today = todayKey();
  const phaseInfo = PHASES[week.phase];
  const goal = state.profile.goal;
  const focusNames = (state.profile.focuses.length ? state.profile.focuses : []).map((id) => ({
    id,
    name: getTechnique(id)?.name ?? id,
  }));
  const coveredIds = new Set(week.coverage.map((c) => c.techniqueId));
  const focus = state.pieces.find((p) => p.id === state.profile.focusPieceId);

  const techniqueMinutes = week.totals.technique;
  const repertoireMinutes = week.totals.repertoire;
  const readingMinutes = week.totals.reading;
  const base = Math.max(1, techniqueMinutes + repertoireMinutes + readingMinutes);

  return (
    <div className="view">
      <SectionHelp topic="week" />

      <div className="card card--accent">
        <div className="row row--between">
          <span className="chip chip--accent">{phaseInfo.label}</span>
          <span className="tiny muted">
            {week.totals.minutes ? formatMinutes(week.totals.minutes) : ""} this week
          </span>
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>
          {phaseInfo.blurb}
        </p>
        {goal ? (
          <p className="tiny muted" style={{ marginTop: 6 }}>
            {goal.label} · {goalCountdown(goal.date)}
          </p>
        ) : (
          <p className="tiny muted" style={{ marginTop: 6 }}>
            No deadline: a four-week cycle, with every fourth week lighter.
          </p>
        )}
        <div className="meter" style={{ marginTop: 12 }}>
          <span style={{ width: `${(techniqueMinutes / base) * 100}%`, background: "#d8a44a" }} />
          <span style={{ width: `${(repertoireMinutes / base) * 100}%`, background: "#6fb3a0" }} />
          <span style={{ width: `${(readingMinutes / base) * 100}%`, background: "#8f8fd0" }} />
        </div>
        <div className="row row--wrap tiny muted" style={{ marginTop: 8, gap: 12 }}>
          <span>● {techniqueMinutes}′ technique</span>
          <span style={{ color: "#6fb3a0" }}>● {repertoireMinutes}′ repertoire</span>
          <span style={{ color: "#8f8fd0" }}>● {readingMinutes}′ reading</span>
        </div>
        <button type="button" className="btn btn--small btn--ghost" style={{ marginTop: 10 }} onClick={() => setShowPrinciples(true)}>
          How this plan is built
        </button>
      </div>

      {focus ? (
        <div className="notice notice--info">
          Built around <strong>{focus.title}</strong> — it leads every session it appears in, is scheduled most often, and is the last to
          give up minutes. Change that in Pieces.
        </div>
      ) : null}

      {week.warnings.length ? (
        <div className="card">
          <h3 className="section-title">Watch out</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {week.warnings.map((warning) => (
              <div key={warning} className="notice notice--warn">
                {warning}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="notice notice--info">Nothing looks overloaded this week. Hold the shape and let it accumulate.</div>
      )}

      <div className="row row--between">
        <h3 className="section-title">The week</h3>
        <span className="tiny muted">tap a day</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {week.days.map((day) => (
          <DayRow
            key={day.date}
            day={day}
            open={open === day.date}
            isToday={day.date === today}
            logged={state.log.find((e) => e.date === day.date)?.minutes}
            onToggle={() => setOpen((current) => (current === day.date ? null : day.date))}
          />
        ))}
      </div>

      <div className="card">
        <h3 className="section-title">Technique coverage</h3>
        <p className="tiny muted">Every focus area should get at least one block a week. The rest is extra.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {week.coverage.length ? (
            week.coverage.map((entry) => (
              <div key={entry.techniqueId} className="row row--between small">
                <span>{entry.name}</span>
                <span className="muted mono">
                  {entry.blocks} × · {entry.minutes}′
                </span>
              </div>
            ))
          ) : (
            <div className="empty">No technique blocks this week.</div>
          )}
        </div>
        {focusNames.some((f) => !coveredIds.has(f.id)) ? (
          <div className="notice notice--warn" style={{ marginTop: 10 }}>
            Not on the plan this week:{" "}
            {focusNames
              .filter((f) => !coveredIds.has(f.id))
              .map((f) => f.name)
              .join(", ")}
            .
          </div>
        ) : null}
      </div>

      <div className="card">
        <h3 className="section-title">Repertoire this week</h3>
        {week.pieces.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {week.pieces.map((entry) => (
              <div key={entry.pieceId}>
                <div className="row row--between">
                  <span className="small" style={{ fontWeight: 600 }}>
                    {entry.title}
                  </span>
                  <span className="tiny muted">
                    {entry.passes} pass{entry.passes === 1 ? "" : "es"} over {entry.days} day{entry.days === 1 ? "" : "s"} · {entry.minutes}′
                  </span>
                </div>
                <div className="chip-row" style={{ marginTop: 5 }}>
                  {entry.methods.map((m) => (
                    <span key={m} className="chip">
                      {METHOD_LABEL[m as MethodId] ?? m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            No pieces scheduled. Add repertoire in the Pieces tab and the planner will rotate passes of each one through slow work,
            isolation, ladders and run-throughs.
          </div>
        )}
      </div>

      {showPrinciples ? (
        <Sheet
          title="How this plan is built"
          subtitle={`${PRINCIPLES.length} practice principles, applied`}
          onClose={() => setShowPrinciples(false)}
        >
          {PRINCIPLES.map((principle) => (
            <div key={principle.id} className="card card--tight">
              <div className="section-title" style={{ fontSize: 14 }}>
                {principle.name}
              </div>
              <p className="small muted" style={{ marginTop: 6 }}>
                {principle.what}
              </p>
              <p className="tiny" style={{ marginTop: 6, color: "#d8a44a" }}>
                In your plan: {principle.inPlan}
              </p>
            </div>
          ))}
        </Sheet>
      ) : null}
    </div>
  );
}

function DayRow({
  day,
  open,
  isToday,
  logged,
  onToggle,
}: {
  day: DayPlan;
  open: boolean;
  isToday: boolean;
  logged?: number;
  onToggle: () => void;
}) {
  const blocks = day.session?.blocks ?? [];
  const titles = blocks
    .filter((b) => b.kind !== "warmup" && b.kind !== "close" && b.kind !== "break")
    .map((b) => b.title)
    .slice(0, 2)
    .join(" · ");

  return (
    <div className={`day${isToday ? " day--today" : ""}${day.kind === "rest" ? " day--rest" : ""}`}>
      <button type="button" className="day__head" onClick={onToggle} aria-expanded={open}>
        <span className="day__weekday">{WEEKDAY_SHORT[day.weekday]}</span>
        <span className="day__minutes">{day.kind === "rest" ? "rest" : `${day.minutes}′`}</span>
        <span className="day__title">{day.kind === "rest" ? (isToday ? "rest day" : "—") : titles || "—"}</span>
        {logged ? <span className="chip chip--on">{logged}′ done</span> : null}
        {day.load >= 10 ? <span className="chip chip--danger">load {day.load}′</span> : null}
      </button>
      {open ? (
        <div className="day__body">
          {day.kind === "rest" ? (
            <p className="small muted">
              No practice scheduled. Rest is part of the load management: consecutive loaded days are how players end up unable to play at
              all.
            </p>
          ) : (
            <>
              <div className="small" style={{ fontWeight: 600 }}>
                {day.session?.headline}
              </div>
              {blocks.map((block) => (
                <div key={block.id} className="mini-block">
                  <span className="mini-block__m">{block.minutes}′</span>
                  <span>
                    {block.title}
                    {block.optional ? <span className="tiny muted"> · shed first</span> : null}
                  </span>
                </div>
              ))}
              {day.session?.notes.map((note) => (
                <div key={note} className="tiny muted">
                  · {note}
                </div>
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
