import { useMemo, useState } from "react";
import { useStore } from "../store";
import { adHocSession } from "../engine/plan";
import { PHASES } from "../types";
import type { Block, Session } from "../types";
import { daysBetween, formatMinutes, goalCountdown, todayKey } from "../engine/dates";
import { BlockCard } from "../components/BlockCard";
import { SessionRunner } from "../components/SessionRunner";
import { Sheet } from "../components/Sheet";
import { PieceSheet } from "../components/PieceSheet";
import { technique as getTechnique } from "../data/library";
import { Icon } from "../components/Icon";
import { SectionHelp } from "../components/SectionHelp";
import { BackupReminder } from "../components/BackupReminder";

const QUICK_MINUTES = [15, 25, 45, 70];

export function Today() {
  const { state, week, phase, daysToGoal, logSession, deleteLog } = useStore();
  const dateKey = todayKey();
  const day = week.days.find((d) => d.date === dateKey);
  const logged = state.log.find((e) => e.date === dateKey);
  const [override, setOverride] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [showPhase, setShowPhase] = useState(false);
  const [addingPiece, setAddingPiece] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const focusPiece = state.pieces.find((p) => p.id === state.profile.focusPieceId);

  const session: Session | undefined = useMemo(() => {
    if (day?.session && override === null) return day.session;
    if (!override && day?.kind === "rest") return undefined;
    const minutes = override ?? day?.minutes ?? state.profile.minutes;
    const schedule =
      day?.schedule.length
        ? day.schedule
            .map((s) => {
              const piece = state.pieces.find((p) => p.id === s.pieceId);
              return piece ? { piece, passIndex: s.passIndex } : undefined;
            })
            .filter((s): s is { piece: (typeof state.pieces)[number]; passIndex: number } => Boolean(s))
        : undefined;
    return adHocSession({
      dateKey,
      minutes,
      profile: state.profile,
      pieces: state.pieces,
      log: state.log,
      schedule,
    });
  }, [day, override, state.profile, state.pieces, state.log, dateKey]);


  const goal = state.profile.goal;
  const phaseInfo = PHASES[phase];

  return (
    <div className="view">
      <SectionHelp topic="today" />

      <BackupReminder />

      <div className="card card--accent">
        <div className="row row--between">
          <button type="button" className="chip chip--accent chip--button" onClick={() => setShowPhase(true)}>
            {phaseInfo.label}
          </button>
          {goal ? (
            <span className="chip">
              {goal.label} · {goalCountdown(goal.date)}
            </span>
          ) : (
            <span className="chip">no deadline set</span>
          )}
        </div>
        <h2 style={{ marginTop: 12, fontSize: 25 }}>
          {day?.kind === "rest" && override === null ? "Rest day" : `${session?.minutes ?? day?.minutes ?? 0} minutes`}
        </h2>
        <p className="small muted" style={{ marginTop: 4 }}>
          {day?.kind === "rest" && override === null
            ? "Nothing is scheduled. Hands rebuild on rest days — that is part of the plan, not a gap in it."
            : session?.headline}
        </p>
        {focusPiece ? (
          <button type="button" className="chip chip--button" style={{ marginTop: 6 }} onClick={() => setAddingPiece(true)}>
            built around {focusPiece.title}
          </button>
        ) : null}

        <div className="row row--between" style={{ marginTop: 12 }}>
          <span className="tiny muted">
            {session
              ? `${session.totals.technique}′ technique · ${session.totals.repertoire}′ repertoire · ${session.totals.reading}′ reading`
              : `${state.profile.days.length} practice days a week`}
          </span>
          {session ? (
            <button type="button" className="btn btn--primary btn--small" onClick={() => setRunning(true)}>
              <Icon name="play" size={16} /> Start
            </button>
          ) : null}
        </div>
      </div>

      <div className="card card--tight">
        <div className="label">Time I actually have</div>
        <div className="chip-row" style={{ marginTop: 8 }}>
          {QUICK_MINUTES.map((minutes) => (
            <button
              key={minutes}
              type="button"
              className={`chip chip--button${override === minutes || (override === null && day?.minutes === minutes) ? " chip--on" : ""}`}
              onClick={() => setOverride(minutes)}
            >
              {minutes}′
            </button>
          ))}
          {day?.session && override !== null ? (
            <button type="button" className="chip chip--button" onClick={() => setOverride(null)}>
              back to the plan ({day.minutes}′)
            </button>
          ) : null}
        </div>
        <p className="tiny muted" style={{ marginTop: 8 }}>
          Change this and the session is rebuilt for that length: shorter days drop the least valuable work first.
        </p>
      </div>

      {!focusPiece ? (
        <div className="card card--tight">
          <div className="row row--between">
            <div style={{ flex: 1 }}>
              <div className="section-title" style={{ fontSize: 14 }}>
                A piece in mind?
              </div>
              <p className="tiny muted" style={{ marginTop: 4 }}>
                Suggest anything you want to play and the plan can be built around it.
              </p>
            </div>
            <button type="button" className="btn btn--small" onClick={() => setAddingPiece(true)}>
              <Icon name="plus" size={16} /> Suggest
            </button>
          </div>
        </div>
      ) : null}

      {session ? (
        <>
          <div className="row row--between">
            <h3 className="section-title">Tonight, in order</h3>
            <span className="tiny muted">{formatMinutes(session.blocks.reduce((sum, b) => sum + b.minutes, 0))}</span>
          </div>

          <div className="block-list">
            {session.blocks.map((block, index) => (
              <BlockCard
                key={block.id}
                block={block}
                index={index}
                done={done[block.id]}
                onToggle={() => setDone((d) => ({ ...d, [block.id]: !d[block.id] }))}
                extra={<WhyItWorks block={block} />}
              />
            ))}
          </div>

          {session.notes.length ? (
            <div className="notice notice--info">
              {session.notes.map((note) => (
                <div key={note}>· {note}</div>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            className="btn btn--block"
            onClick={() =>
              logSession({
                date: dateKey,
                minutes: session.blocks.reduce((sum, b) => sum + b.minutes, 0),
                plannedMinutes: session.blocks.reduce((sum, b) => sum + b.minutes, 0),
                phase: session.phase,
                blocks: session.blocks.map((b) => ({
                  blockId: b.id,
                  kind: b.kind,
                  title: b.title,
                  minutes: b.minutes,
                  techniqueId: b.techniqueId,
                  pieceId: b.pieceId,
                  methodId: b.methodId,
                })),
              })
            }
          >
            Log it as planned (no timer)
          </button>
        </>
      ) : (
        <div className="card">
          <h3 className="section-title">Rest is load management</h3>
          <p className="small muted">
            Sore forearms, buzzing barres and a collapsing tremolo are usually fatigue rather than weakness. If you want to play anyway,
            pick a length above and you will get a short, low-load session.
          </p>
          <button type="button" className="btn btn--block" style={{ marginTop: 10 }} onClick={() => setOverride(15)}>
            Give me fifteen minutes of something useful
          </button>
        </div>
      )}

      {logged ? (
        <div className="card">
          <div className="row row--between">
            <h3 className="section-title">Logged today</h3>
            <span className="chip chip--on">{formatMinutes(logged.minutes)}</span>
          </div>
          <p className="tiny muted" style={{ marginTop: 6 }}>
            {logged.blocks.length} blocks · planned {logged.plannedMinutes}′
            {logged.note ? ` · “${logged.note}”` : ""}
          </p>
          <button type="button" className="btn btn--danger btn--small" style={{ marginTop: 10 }} onClick={() => deleteLog(logged.id)}>
            Delete today's entry
          </button>
        </div>
      ) : null}

      {running && session ? (
        <SessionRunner
          session={session}
          dateKey={dateKey}
          onSave={(input) => {
            logSession(input);
            setRunning(false);
          }}
          onClose={() => setRunning(false)}
        />
      ) : null}

      {showPhase ? (
        <Sheet title={phaseInfo.label} subtitle="How the plan is behaving this week" onClose={() => setShowPhase(false)}>
          <p className="small">{phaseInfo.blurb}</p>
          {goal ? (
            <div className="notice notice--info">
              {goal.label} · {goalCountdown(goal.date)}
              {daysToGoal !== undefined ? ` (${daysBetween(todayKey(), goal.date)} days away)` : ""}
            </div>
          ) : (
            <p className="small muted">
              Without a date the plan runs a four-week cycle: three weeks of building, then a lighter consolidation week so the hands
              recover and what you have learned settles.
            </p>
          )}
        </Sheet>
      ) : null}

      {addingPiece ? <PieceSheet onClose={() => setAddingPiece(false)} /> : null}
    </div>
  );
}

function WhyItWorks({ block }: { block: Block }) {
  const technique = block.techniqueId ? getTechnique(block.techniqueId) : undefined;
  if (technique && block.kind === "technique") {
    return (
      <div>
        <div className="label">Why this earns the minutes</div>
        <div className="small muted">{technique.why}</div>
      </div>
    );
  }
  return null;
}
