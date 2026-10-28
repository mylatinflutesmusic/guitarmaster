import { useMemo, useState } from "react";
import { LEVELS } from "../types";
import type { Level, RepStatus } from "../types";
import { WEEKDAY_SHORT } from "../engine/dates";
import { focusChoices } from "../data/library";
import { STARTERS } from "../data/starters";
import { useStore } from "../store";
import { Icon } from "../components/Icon";

interface Draft {
  level: Level;
  minutes: number;
  days: number[];
  focuses: string[];
  goalLabel: string;
  goalDate: string;
  protectHands: boolean;
}

export function Setup({ mode, onDone }: { mode: "first-run" | "edit"; onDone?: () => void }) {
  const { state, updateProfile, addPiece, removeAll } = useStore();
  const profile = state.profile;
  const [confirmErase, setConfirmErase] = useState(false);

  const [draft, setDraft] = useState<Draft>({
    level: profile.level,
    minutes: profile.minutes,
    days: profile.days,
    focuses: profile.focuses,
    goalLabel: profile.goal?.label ?? "",
    goalDate: profile.goal?.date ?? "",
    protectHands: profile.protectHands,
  });
  const [step, setStep] = useState(mode === "first-run" ? 0 : 1);
  const [starters, setStarters] = useState<Record<string, RepStatus>>({});

  const focuses = useMemo(() => focusChoices(draft.level), [draft.level]);
  // First run: welcome, level, time, limits, goal, repertoire. Editing skips the
  // welcome and the starter-repertoire screen.
  const firstStep = mode === "first-run" ? 0 : 1;
  const lastStep = mode === "first-run" ? 5 : 4;
  const stepCount = lastStep - firstStep + 1;
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const toggleFocus = (id: string) => {
    setDraft((d) => {
      if (d.focuses.includes(id)) return { ...d, focuses: d.focuses.filter((f) => f !== id) };
      if (d.focuses.length >= 6) return d;
      return { ...d, focuses: [...d.focuses, id] };
    });
  };

  const toggleDay = (day: number) => {
    setDraft((d) => ({
      ...d,
      days: d.days.includes(day) ? d.days.filter((x) => x !== day) : [...d.days, day].sort((a, b) => a - b),
    }));
  };

  const finish = () => {
    updateProfile({
      onboarded: true,
      level: draft.level,
      minutes: draft.minutes,
      days: draft.days.length ? draft.days : [1, 3, 5],
      focuses: draft.focuses,
      goal: draft.goalLabel && draft.goalDate ? { label: draft.goalLabel, date: draft.goalDate } : undefined,
      protectHands: draft.protectHands,
    });
    for (const [id, status] of Object.entries(starters)) {
      const starter = STARTERS[draft.level].find((s) => s.title === id);
      if (!starter) continue;
      addPiece({ title: starter.title, composer: starter.composer, status, priority: 2 });
    }
    onDone?.();
  };

  const canNext = () => {
    if (step === 2 && !draft.days.length) return false;
    if (step === 3 && !draft.focuses.length) return false;
    return true;
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__row">
          <div style={{ flex: 1 }}>
            <h1 className="app-title">{mode === "first-run" ? "Cuerda" : "Your setup"}</h1>
            <div className="app-sub">
              {mode === "first-run" ? "Classical guitar practice planning" : `Step ${step} of ${stepCount}`}
            </div>
          </div>
          {mode === "edit" ? (
            <button type="button" className="icon-btn" onClick={onDone} aria-label="Close settings">
              <Icon name="close" size={18} />
            </button>
          ) : null}
        </div>
      </header>

      <div className="view">
        {mode === "first-run" ? (
          <div className="chip-row">
            {Array.from({ length: lastStep + 1 }).map((_, i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 3,
                  background: i <= step ? "var(--accent)" : "var(--line)",
                }}
              />
            ))}
          </div>
        ) : null}

        {step === 0 ? (
          <div className="card">
            <h2 className="section-title">The plan fits the time you have</h2>
            <p className="small muted">
              This is not a practice log with a timer bolted on. It decides what is worth your next twenty minutes, then writes it out
              block by block: which technique, which bars, how slow, and what finished looks like.
            </p>
            <ul className="steps" style={{ marginTop: 10 }}>
              <li>Sessions are built from your limiting techniques and your repertoire, in the minutes you actually have.</li>
              <li>Pieces rotate through slow work, isolation, tempo ladders, memory checks and run-throughs.</li>
              <li>Loaded work (barre, slurs, tremolo, speed) is kept off back-to-back days.</li>
            </ul>
            <p className="tiny muted" style={{ marginTop: 10 }}>
              Everything stays on this device: no account, no uploads, no sync. Your repertoire, session history and tempo marks never
              leave your phone.
            </p>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="card">
            <h2 className="section-title">Where are you now?</h2>
            <p className="tiny muted">This sets the balance between technique and repertoire, and which work is offered to you.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {LEVELS.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  className={`option${draft.level === level.id ? " option--on" : ""}`}
                  onClick={() => patch({ level: level.id, focuses: [] })}
                >
                  <span className="option__mark">{draft.level === level.id ? "✓" : ""}</span>
                  <span>
                    <span className="option__title">
                      {level.label} <span className="tiny muted">· {level.years}</span>
                    </span>
                    <span className="option__blurb" style={{ display: "block" }}>
                      {level.blurb}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="card">
            <h2 className="section-title">How much time, and which days?</h2>
            <p className="tiny muted">Be honest rather than aspirational. A plan you keep beats a plan you admire.</p>

            <div className="row row--between" style={{ marginTop: 14 }}>
              <span className="small">Practice day length</span>
              <div className="stepper">
                <button type="button" className="icon-btn" onClick={() => patch({ minutes: Math.max(10, draft.minutes - 5) })} aria-label="Less time">
                  <Icon name="minus" size={18} />
                </button>
                <span className="stepper__value">{draft.minutes}′</span>
                <button type="button" className="icon-btn" onClick={() => patch({ minutes: Math.min(180, draft.minutes + 5) })} aria-label="More time">
                  <Icon name="plus" size={18} />
                </button>
              </div>
            </div>

            <div className="label" style={{ marginTop: 16 }}>
              Practice days
            </div>
            <div className="chip-row" style={{ marginTop: 6 }}>
              {WEEKDAY_SHORT.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={`chip chip--button${draft.days.includes(index) ? " chip--on" : ""}`}
                  onClick={() => toggleDay(index)}
                  aria-pressed={draft.days.includes(index)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="tiny muted" style={{ marginTop: 8 }}>
              {draft.days.length
                ? `${draft.days.length} days, about ${Math.round((draft.days.length * draft.minutes) / 6) / 10} hours a week.`
                : "Pick at least one day."}
            </p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="card">
            <h2 className="section-title">What limits you most?</h2>
            <p className="tiny muted">
              Tap in order of importance — the first gets the most minutes. Pick up to six. Under a short day only the most valuable ones
              survive.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {focuses.map((technique) => {
                const position = draft.focuses.indexOf(technique.id);
                return (
                  <button
                    key={technique.id}
                    type="button"
                    className={`option${position >= 0 ? " option--on" : ""}`}
                    onClick={() => toggleFocus(technique.id)}
                  >
                    <span className="option__mark">{position >= 0 ? position + 1 : ""}</span>
                    <span>
                      <span className="option__title">{technique.focusLabel}</span>
                      <span className="option__blurb" style={{ display: "block" }}>
                        {technique.focusHint ?? technique.short}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="row" style={{ gap: 10, marginTop: 14, alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={draft.protectHands}
                onChange={(e) => patch({ protectHands: e.target.checked })}
                style={{ width: 20, height: 20, marginTop: 2 }}
              />
              <span className="small">
                Protect my hands
                <span className="tiny muted" style={{ display: "block" }}>
                  Cuts loaded work (barre, slurs, tremolo, speed) to three quarters of its usual dose and keeps it out of consecutive days.
                </span>
              </span>
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="card">
            <h2 className="section-title">Anything you are working towards?</h2>
            <p className="tiny muted">
              With a date, the plan shifts phase: the last month consolidates, the last week is run-throughs and memory checks only, and
              the final days taper. Without a date it rotates through a four-week cycle on its own.
            </p>
            <div className="field" style={{ marginTop: 12 }}>
              <label className="label" htmlFor="goal-label">
                What is it
              </label>
              <input
                id="goal-label"
                className="input"
                placeholder="e.g. grade 8 exam, end-of-term recital"
                value={draft.goalLabel}
                onChange={(e) => patch({ goalLabel: e.target.value })}
              />
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label className="label" htmlFor="goal-date">
                When
              </label>
              <input
                id="goal-date"
                className="input"
                type="date"
                value={draft.goalDate}
                onChange={(e) => patch({ goalDate: e.target.value })}
              />
            </div>
            <button type="button" className="btn btn--ghost btn--block" style={{ marginTop: 10 }} onClick={() => patch({ goalLabel: "", goalDate: "" })}>
              No date — plan in a continuous cycle
            </button>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="card">
            <h2 className="section-title">What is on the music stand?</h2>
            <p className="tiny muted">
              Repertoire is half the plan. Add what you are actually playing — you can change or delete any of it later.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {STARTERS[draft.level].map((starter) => {
                const chosen = starters[starter.title];
                return (
                  <div key={starter.title} className={`option${chosen ? " option--on" : ""}`}>
                    <span className="option__mark">{chosen ? "✓" : ""}</span>
                    <span style={{ flex: 1 }}>
                      <span className="option__title">{starter.title}</span>
                      <span className="option__blurb" style={{ display: "block" }}>
                        {starter.composer} · {starter.note}
                      </span>
                      {chosen ? (
                        <span className="chip-row" style={{ marginTop: 8 }}>
                          {(["learning", "memorising", "polishing", "maintenance"] as RepStatus[]).map((status) => (
                            <button
                              key={status}
                              type="button"
                              className={`chip chip--button${chosen === status ? " chip--on" : ""}`}
                              onClick={() => setStarters((s) => ({ ...s, [starter.title]: status }))}
                            >
                              {status}
                            </button>
                          ))}
                        </span>
                      ) : null}
                    </span>
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() =>
                        setStarters((s) => {
                          const next = { ...s };
                          if (next[starter.title]) delete next[starter.title];
                          else next[starter.title] = "learning";
                          return next;
                        })
                      }
                    >
                      {chosen ? "Remove" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="tiny muted" style={{ marginTop: 10 }}>
              Nothing here? Skip it and add your own pieces later — the plan will fill with technique work until you do.
            </p>
          </div>
        ) : null}

        <div className="btn-row">
          {step > firstStep ? (
            <button type="button" className="btn" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : null}
          {step < lastStep ? (
            <button type="button" className="btn btn--primary" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
              Continue
            </button>
          ) : (
            <button type="button" className="btn btn--primary" onClick={finish}>
              {mode === "first-run" ? "Build my plan" : "Save changes"}
            </button>
          )}
        </div>

        {mode === "first-run" && step > 0 && step < lastStep ? (
          <button type="button" className="btn btn--ghost btn--block" onClick={() => setStep(lastStep)}>
            Skip to the end
          </button>
        ) : null}

        {mode === "edit" ? (
          confirmErase ? (
            <div className="notice notice--warn">
              This erases {state.pieces.length} piece{state.pieces.length === 1 ? "" : "s"}, {state.log.length} logged session
              {state.log.length === 1 ? "" : "s"} and every tempo mark from this device. There is no copy anywhere else.
              <div className="btn-row" style={{ marginTop: 8 }}>
                <button type="button" className="btn btn--small" onClick={() => setConfirmErase(false)}>
                  Keep my data
                </button>
                <button
                  type="button"
                  className="btn btn--small btn--danger"
                  onClick={() => {
                    removeAll();
                    setStep(0);
                    setConfirmErase(false);
                  }}
                >
                  Erase everything
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn--ghost btn--block" onClick={() => setConfirmErase(true)}>
              Erase everything and start again
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
