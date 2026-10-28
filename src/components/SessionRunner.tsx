import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Block, LoggedBlock, Session } from "../types";
import type { SessionLogInput } from "../store/model";
import { Icon } from "./Icon";

function mmss(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export function SessionRunner({
  session,
  dateKey,
  onSave,
  onClose,
}: {
  session: Session;
  dateKey: string;
  onSave: (input: SessionLogInput) => void;
  onClose: () => void;
}) {
  const blocks = useMemo(() => session.blocks, [session.blocks]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(() => (blocks[0]?.minutes ?? 1) * 60);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState<number[]>(() => blocks.map(() => 0));
  const [metroOn, setMetroOn] = useState(false);
  const [bpm, setBpm] = useState(60);
  const [beat, setBeat] = useState(0);
  const [note, setNote] = useState("");
  const current = blocks[index];
  const elapsedRef = useRef(elapsed);
  elapsedRef.current = elapsed;

  // Countdown
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsed((prev) => {
        const next = [...prev];
        next[index] = (next[index] ?? 0) + 1;
        return next;
      });
      setRemaining((prev) => {
        if (prev > 1) return prev - 1;
        // Move to the next block automatically.
        setIndex((i) => {
          const nextIndex = Math.min(i + 1, blocks.length - 1);
          if (nextIndex === i) setRunning(false);
          return nextIndex;
        });
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, index, blocks.length]);

  // When the block changes, reset the countdown.
  useEffect(() => {
    setRemaining((blocks[index]?.minutes ?? 1) * 60);
  }, [index, blocks]);

  // Keep the screen awake while a session runs.
  useEffect(() => {
    if (!running) return;
    const nav = navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> } };
    if (!nav.wakeLock) return;
    let sentinel: { release: () => Promise<void> } | undefined;
    nav.wakeLock
      .request("screen")
      .then((s) => {
        sentinel = s;
      })
      .catch(() => undefined);
    return () => {
      sentinel?.release().catch(() => undefined);
    };
  }, [running]);

  // Metronome: a look-ahead scheduler, so the click stays steady.
  useEffect(() => {
    if (!metroOn) return;
    const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const playClick = (time: number, beatIndex: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = beatIndex % 4 === 0 ? 1560 : 1080;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.14, time + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.06);
    };
    let nextTime = ctx.currentTime + 0.08;
    let beats = 0;
    let visualTimer: number | undefined;
    const scheduler = window.setInterval(() => {
      while (nextTime < ctx.currentTime + 0.15) {
        const beatIndex = beats;
        playClick(nextTime, beatIndex);
        nextTime += 60 / bpm;
        beats += 1;
        const delay = Math.max(0, (nextTime - ctx.currentTime - 60 / bpm) * 1000 - 30);
        if (visualTimer) window.clearTimeout(visualTimer);
        visualTimer = window.setTimeout(() => setBeat(beatIndex % 4), delay);
      }
    }, 25);
    return () => {
      window.clearInterval(scheduler);
      if (visualTimer) window.clearTimeout(visualTimer);
      void ctx.close();
    };
  }, [metroOn, bpm]);

  const save = useCallback(
    (finishAll: boolean) => {
      const seconds = elapsedRef.current.map((s, i) => (finishAll && i > index ? blocks[i].minutes * 60 : s));
      const logged: LoggedBlock[] = blocks.map((b, i) => ({
        blockId: b.id,
        kind: b.kind,
        title: b.title,
        minutes: Math.round((seconds[i] ?? 0) / 60),
        techniqueId: b.techniqueId,
        pieceId: b.pieceId,
        methodId: b.methodId,
      }));
      const total = logged.reduce((sum, b) => sum + b.minutes, 0);
      const planned = countedMinutes(blocks);
      onSave({
        date: dateKey,
        minutes: total > 0 ? total : planned,
        plannedMinutes: planned,
        phase: session.phase,
        blocks: logged,
        note: note.trim() || undefined,
      });
    },
    [blocks, dateKey, note, onSave, index, session.phase],
  );

  if (!current) return null;
  const progress = blocks.reduce((sum, b, i) => sum + (i < index ? b.minutes : 0), 0) + (blocks[index].minutes - remaining / 60);

  return (
    <div className="runner">
      <div className="row row--between">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close session">
          <Icon name="close" size={18} />
        </button>
        <div className="tiny muted">
          {index + 1} of {blocks.length}
        </div>
        <button
          type="button"
          className="btn btn--small"
          onClick={() => save(false)}
          disabled={elapsedRef.current.every((s) => s === 0)}
        >
          Save &amp; stop
        </button>
      </div>

      <div className="meter" aria-hidden="true">
        <span style={{ width: `${Math.min(100, (progress / Math.max(1, countedMinutes(blocks))) * 100)}%`, background: "linear-gradient(90deg,#c9923a,#e0ae56)" }} />
      </div>

      <div className="runner__step">
        {current.kind} · {current.minutes}′ planned
      </div>
      <div className="runner__timer">{mmss(remaining)}</div>
      <div className="center" style={{ fontSize: 19, fontWeight: 600 }}>
        {current.title}
      </div>
      <div className="center small muted" style={{ maxWidth: 480, margin: "0 auto" }}>
        {current.intent}
      </div>

      <div className="card card--tight">
        <div className="label">Do this</div>
        <ol className="steps" style={{ marginTop: 6 }}>
          {current.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        {current.tempo ? <div className="pill" style={{ marginTop: 8 }}>Tempo · {current.tempo}</div> : null}
        <div className="pill pill--ok" style={{ marginTop: 6 }}>Done when · {current.success}</div>
      </div>

      <div className="btn-row">
        <button type="button" className="btn" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          Back
        </button>
        <button type="button" className="btn btn--primary" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : remaining === current.minutes * 60 ? "Start" : "Resume"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => setIndex((i) => Math.min(blocks.length - 1, i + 1))}
          disabled={index === blocks.length - 1}
        >
          Next
        </button>
      </div>

      <div className="card card--tight">
        <div className="row row--between">
          <button
            type="button"
            className={`btn btn--small${metroOn ? " btn--primary" : ""}`}
            onClick={() => setMetroOn((v) => !v)}
          >
            {metroOn ? "Metronome on" : "Metronome"}
          </button>
          <div className="row" style={{ gap: 6 }}>
            <div className="metro-beat" data-on={beat === 0} style={{ background: metroOn && beat === 0 ? "var(--accent)" : undefined }} />
            <div className="metro-beat" style={{ background: metroOn && beat === 1 ? "var(--accent)" : undefined }} />
            <div className="metro-beat" style={{ background: metroOn && beat === 2 ? "var(--accent)" : undefined }} />
            <div className="metro-beat" style={{ background: metroOn && beat === 3 ? "var(--accent)" : undefined }} />
          </div>
        </div>
        <div className="row row--between" style={{ marginTop: 10 }}>
          <button type="button" className="icon-btn" onClick={() => setBpm((b) => Math.max(40, b - 4))} aria-label="Slower">
            <Icon name="minus" size={18} />
          </button>
          <div className="center">
            <div style={{ fontSize: 26, fontFamily: '"Iowan Old Style", Georgia, serif' }}>{bpm}</div>
            <div className="tiny muted">bpm</div>
          </div>
          <button type="button" className="icon-btn" onClick={() => setBpm((b) => Math.min(208, b + 4))} aria-label="Faster">
            <Icon name="plus" size={18} />
          </button>
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="session-note">
          One line for tomorrow
        </label>
        <input
          id="session-note"
          className="input"
          placeholder="e.g. ladder broke at 92 bpm in bar 17"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button type="button" className="btn btn--primary btn--block" onClick={() => save(true)}>
        <Icon name="check" size={18} /> Finish and log session
      </button>
    </div>
  );
}

function countedMinutes(blocks: Block[]): number {
  return blocks.reduce((sum, b) => sum + b.minutes, 0);
}
