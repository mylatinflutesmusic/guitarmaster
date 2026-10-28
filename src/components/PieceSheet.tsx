import { useState } from "react";
import { REP_STATUSES } from "../types";
import type { Piece, RepStatus } from "../types";
import { useStore } from "../store";
import { TECHNIQUES } from "../data/library";
import { Sheet } from "../components/Sheet";

/**
 * Add or edit a piece — including the player's own suggestion, and whether the
 * whole plan should be built around it. Shared by the repertoire and today views.
 */
export function PieceSheet({ piece, onClose }: { piece?: Piece; onClose: () => void }) {
  const { state, addPiece, updatePiece, setFocusPiece } = useStore();
  const [title, setTitle] = useState(piece?.title ?? "");
  const [composer, setComposer] = useState(piece?.composer ?? "");
  const [status, setStatus] = useState<RepStatus>(piece?.status ?? "learning");
  const [priority, setPriority] = useState<1 | 2 | 3>(piece?.priority ?? 2);
  const [target, setTarget] = useState(piece?.target ?? "");
  const [demands, setDemands] = useState<string[]>(piece?.demands ?? []);
  const [focus, setFocus] = useState(Boolean(piece && state.profile.focusPieceId === piece.id));

  const levelOrder = { beginner: 0, intermediate: 1, advanced: 2, conservatoire: 3 };
  const techniqueChoices = TECHNIQUES.filter((t) => levelOrder[state.profile.level] >= levelOrder[t.minLevel]);

  const toggleDemand = (id: string) => {
    setDemands((current) => (current.includes(id) ? current.filter((d) => d !== id) : [...current, id]));
  };

  const save = () => {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      composer: composer.trim(),
      status,
      priority,
      target: target || undefined,
      demands: demands.length ? demands : undefined,
    };
    const id = piece ? piece.id : addPiece(payload);
    if (piece) updatePiece(piece.id, payload);
    if (focus) setFocusPiece(id);
    else if (piece && state.profile.focusPieceId === piece.id) setFocusPiece(null);
    onClose();
  };

  return (
    <Sheet
      title={piece ? "Edit piece" : "Suggest a piece"}
      subtitle="Anything you want to play — the plan can be built around it."
      onClose={onClose}
    >
      <div className="field">
        <label className="label" htmlFor="piece-title">
          Piece
        </label>
        <input
          id="piece-title"
          className="input"
          value={title}
          placeholder="e.g. Romance, or that Villa-Lobos study your teacher gave you"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="piece-composer">
          Composer
        </label>
        <input
          id="piece-composer"
          className="input"
          value={composer}
          placeholder="optional"
          onChange={(e) => setComposer(e.target.value)}
        />
      </div>

      <button type="button" className={`option${focus ? " option--on" : ""}`} onClick={() => setFocus((v) => !v)} aria-pressed={focus}>
        <span className="option__mark">{focus ? "✓" : ""}</span>
        <span>
          <span className="option__title">Build my plan around this piece</span>
          <span className="option__blurb" style={{ display: "block" }}>
            It leads every session it appears in, is scheduled most often in the week, and the technique blocks are chosen to serve it.
          </span>
        </span>
      </button>

      <div className="field">
        <span className="label">State</span>
        {REP_STATUSES.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`option${status === option.id ? " option--on" : ""}`}
            onClick={() => setStatus(option.id)}
          >
            <span className="option__mark">{status === option.id ? "✓" : ""}</span>
            <span>
              <span className="option__title">{option.label}</span>
              <span className="option__blurb" style={{ display: "block" }}>
                {option.blurb} · {option.passes} pass{option.passes === 1 ? "" : "es"} a week
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="field">
        <span className="label">Priority</span>
        <div className="segmented">
          {([1, 2, 3] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={`seg${priority === option ? " seg--on" : ""}`}
              onClick={() => setPriority(option)}
            >
              {option === 1 ? "Most important" : option === 2 ? "Normal" : "Background"}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="piece-target">
          Needs to be ready by (optional)
        </label>
        <input id="piece-target" className="input" type="date" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>

      <div className="field">
        <span className="label">What does this piece need? (optional)</span>
        <p className="tiny muted" style={{ marginTop: -2 }}>
          Name the techniques it demands — tremolo, barre, slurred ornaments — and the plan will put blocks of that work behind it, even
          if you have not listed it as a weakness.
        </p>
        <div className="chip-row" style={{ marginTop: 6 }}>
          {techniqueChoices.map((technique) => (
            <button
              key={technique.id}
              type="button"
              className={`chip chip--button${demands.includes(technique.id) ? " chip--on" : ""}`}
              onClick={() => toggleDemand(technique.id)}
              aria-pressed={demands.includes(technique.id)}
            >
              {technique.name.split(" (")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="btn-row">
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn--primary" onClick={save} disabled={!title.trim()}>
          {piece ? "Save piece" : "Add to the plan"}
        </button>
      </div>
    </Sheet>
  );
}
