import { useMemo, useState } from "react";
import { useStore } from "../store";
import { addDaysKey, formatMinutes, shortDate, startOfWeek, toKey, todayKey } from "../engine/dates";
import { lastNDays, logStreak, splitMinutes, tempoChange } from "../engine/stats";
import { TECHNIQUES } from "../data/library";
import { backupAgeLabel, downloadBackup } from "../store/backup";
import { Icon } from "../components/Icon";
import { SectionHelp } from "../components/SectionHelp";

export function Progress() {
  const { state, addTempo, deleteTempo, deleteLog, updateProfile } = useStore();
  const today = todayKey();
  const days = useMemo(() => lastNDays(state.log, 14, today), [state.log, today]);
  const max = Math.max(15, ...days.map((d) => d.minutes));
  const streak = logStreak(state.log, today);
  const weekKey = toKey(startOfWeek(new Date()));
  const weekEnd = addDaysKey(weekKey, 6);
  const weekTotal = state.log.filter((e) => e.date >= weekKey && e.date <= weekEnd).reduce((sum, e) => sum + e.minutes, 0);
  const split = splitMinutes(state.log);
  const base = Math.max(1, split.technique + split.repertoire + split.reading);
  const last28 = splitMinutes(state.log, dayKeyMinus(28));
  const [bpm, setBpm] = useState("72");
  const [subjectId, setSubjectId] = useState("");
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  const subjects = [
    ...TECHNIQUES.map((t) => ({ id: t.id, name: t.name })),
    ...state.pieces.map((p) => ({ id: p.id, name: p.title })),
  ];

  const marks = [...state.tempos].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12);

  return (
    <div className="view">
      <SectionHelp topic="progress" />

      <div className="stat-grid">
        <div className="stat">
          <div className="stat__value">{streak}</div>
          <div className="stat__label">day streak</div>
        </div>
        <div className="stat">
          <div className="stat__value">{weekTotal}</div>
          <div className="stat__label">minutes this week</div>
        </div>
        <div className="stat">
          <div className="stat__value">{last28.sessions}</div>
          <div className="stat__label">sessions in 28 days</div>
        </div>
      </div>

      <div className="card">
        <div className="row row--between">
          <h3 className="section-title">Last fourteen days</h3>
          <span className="tiny muted">peak {max}′</span>
        </div>
        <div className="bars" style={{ marginTop: 12 }}>
          {days.map((day) => (
            <div key={day.key} className="bars__col" title={`${day.key}: ${day.minutes} minutes`}>
              <div
                className={`bars__bar${day.minutes ? "" : " bars__bar--empty"}`}
                style={{ height: `${Math.max(4, (day.minutes / max) * 100)}%` }}
              />
              <div className="bars__label">{shortDate(day.key).split(" ")[1]}</div>
            </div>
          ))}
        </div>
        <p className="tiny muted" style={{ marginTop: 8 }}>
          Consistency beats length. Four short sessions in a row do more for a piece than one long one, because of how the hands (and the
          memory) consolidate between attempts.
        </p>
      </div>

      <div className="card">
        <h3 className="section-title">Where the minutes went</h3>
        <div className="meter" style={{ marginTop: 10 }}>
          <span style={{ width: `${(split.technique / base) * 100}%`, background: "#d8a44a" }} />
          <span style={{ width: `${(split.repertoire / base) * 100}%`, background: "#6fb3a0" }} />
          <span style={{ width: `${(split.reading / base) * 100}%`, background: "#8f8fd0" }} />
        </div>
        <div className="row row--wrap tiny muted" style={{ marginTop: 10, gap: 12 }}>
          <span>● {split.technique}′ technique</span>
          <span style={{ color: "#6fb3a0" }}>● {split.repertoire}′ repertoire</span>
          <span style={{ color: "#8f8fd0" }}>● {split.reading}′ reading</span>
          <span>· {formatMinutes(split.minutes)} logged in total</span>
        </div>
        {split.minutes > 0 && split.technique / base < 0.15 ? (
          <div className="notice notice--warn" style={{ marginTop: 10 }}>
            Almost everything you log is repertoire. If something keeps collapsing under your hands, that is the technique budget talking.
          </div>
        ) : null}
        {split.technique / base > 0.7 && split.minutes > 120 ? (
          <div className="notice notice--warn" style={{ marginTop: 10 }}>
            Over seventy per cent of your logged minutes are technique. Exercises only count once they are landing in pieces.
          </div>
        ) : null}
      </div>

      <div className="card">
        <h3 className="section-title">Tempo marks</h3>
        <p className="tiny muted">
          The honest measure of technical progress: the bpm you reached, not the minutes you sat there. Log the number each ladder ends on.
        </p>

        <div className="row" style={{ marginTop: 10, gap: 8, alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 2 }}>
            <label className="label" htmlFor="tempo-subject">
              What
            </label>
            <select id="tempo-subject" className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">choose a technique or piece</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ width: 92 }}>
            <label className="label" htmlFor="tempo-bpm">
              bpm
            </label>
            <input
              id="tempo-bpm"
              className="input"
              inputMode="numeric"
              value={bpm}
              onChange={(e) => setBpm(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <button
            type="button"
            className="btn btn--primary"
            style={{ minWidth: 52 }}
            disabled={!subjectId || !bpm}
            onClick={() => {
              const subject = subjects.find((s) => s.id === subjectId);
              if (!subject) return;
              addTempo({ date: today, subjectId, subjectName: subject.name, bpm: Number(bpm) });
              setBpm("72");
            }}
            aria-label="Add tempo mark"
          >
            <Icon name="plus" size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {marks.length ? (
            marks.map((mark) => {
              const change = tempoChange(state.tempos, mark.subjectId);
              return (
                <div key={mark.id} className="row row--between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="small" style={{ fontWeight: 600 }}>
                      {mark.subjectName}
                    </div>
                    <div className="tiny muted">{shortDate(mark.date)}</div>
                  </div>
                  <span className="chip chip--on mono">♩= {mark.bpm}</span>
                  {change !== undefined ? (
                    <span className="chip mono" style={{ color: change >= 0 ? "var(--ok)" : "var(--danger)" }}>
                      {change >= 0 ? "+" : ""}
                      {change}
                    </span>
                  ) : null}
                  <button type="button" className="icon-btn" onClick={() => deleteTempo(mark.id)} aria-label="Delete tempo mark">
                    <Icon name="close" size={14} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="empty">
              No tempo marks yet. Next time a ladder ends, put the number in here — a graph of bpm is worth more than a graph of minutes.
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="row row--between">
          <h3 className="section-title">Session log</h3>
          <span className="tiny muted">{state.log.length} entries</span>
        </div>
        <div className="row row--between" style={{ marginTop: 4, gap: 10 }}>
          <span className="tiny muted" style={{ flex: 1, minWidth: 0 }}>
            {backupAgeLabel(state.profile.lastBackupAt)}
          </span>
          <button
            type="button"
            className="btn btn--small"
            onClick={() => {
              const filename = downloadBackup(state);
              updateProfile({ lastBackupAt: today, backupSnoozedUntil: undefined });
              setBackupMsg(`Saved ${filename} — ${state.log.length} session${state.log.length === 1 ? "" : "s"}, ${state.pieces.length} piece${state.pieces.length === 1 ? "" : "s"}.`);
            }}
          >
            Back up now
          </button>
        </div>
        {backupMsg ? (
          <p className="tiny" style={{ marginTop: 4, color: "var(--ok)" }} role="status">
            {backupMsg}
          </p>
        ) : null}
        {state.log.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {[...state.log]
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .slice(0, 12)
              .map((entry) => (
                <div key={entry.id} className="row row--between" style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="small">
                      <strong>{shortDate(entry.date)}</strong> · {formatMinutes(entry.minutes)} · {entry.blocks.length} blocks
                    </div>
                    {entry.note ? <div className="tiny muted">“{entry.note}”</div> : null}
                    <div className="tiny muted">
                      {entry.blocks
                        .filter((b) => b.kind === "technique")
                        .map((b) => b.title)
                        .join(" · ") || "no technique blocks"}
                    </div>
                  </div>
                  <button type="button" className="icon-btn" onClick={() => deleteLog(entry.id)} aria-label="Delete entry">
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <div className="empty">Nothing logged yet. A session logged with a tempo number is worth three that are only remembered.</div>
        )}
      </div>
    </div>
  );
}

function dayKeyMinus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toKey(d);
}
