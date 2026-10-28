import { useState } from "react";
import { REP_STATUSES } from "../types";
import type { Piece, RepStatus } from "../types";
import { useStore } from "../store";
import { daysSinceTouched } from "../engine/stats";
import { technique as getTechnique } from "../data/library";
import { PieceSheet } from "../components/PieceSheet";
import { MusicStandSheet } from "../components/MusicStandSheet";
import { Icon } from "../components/Icon";
import { SectionHelp } from "../components/SectionHelp";

const STATUS_LABEL: Record<RepStatus, string> = Object.fromEntries(REP_STATUSES.map((s) => [s.id, s.label])) as Record<RepStatus, string>;
const BLURB: Record<RepStatus, string> = Object.fromEntries(REP_STATUSES.map((s) => [s.id, s.blurb])) as Record<RepStatus, string>;

export function Pieces() {
  const { state, week, updatePiece, removePiece, setFocusPiece } = useStore();
  const [editing, setEditing] = useState<Piece | "new" | null>(null);
  const [stand, setStand] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const passes = new Map(week.pieces.map((p) => [p.pieceId, p]));
  const focusId = state.profile.focusPieceId;
  const focusPiece = state.pieces.find((p) => p.id === focusId);

  return (
    <div className="view">
      <SectionHelp topic="pieces" />

      <div className="card">
        <div className="row row--between">
          <h2 className="section-title">Repertoire</h2>
          <button type="button" className="btn btn--small btn--primary" onClick={() => setStand(true)}>
            <Icon name="plus" size={16} /> Add
          </button>
        </div>
        <p className="tiny muted" style={{ marginTop: 6 }}>
          Add opens the music stand: pieces that suit your level, plus anything you suggest yourself. The state of a piece decides how it
          is worked — one you are still learning gets slow passes and isolation, one you are polishing gets ladders and run-throughs.
        </p>
      </div>

      {focusPiece ? (
        <div className="card card--accent">
          <div className="row row--between">
            <span className="chip chip--accent">building the plan around</span>
            <button type="button" className="chip chip--button" onClick={() => setFocusPiece(null)}>
              stop
            </button>
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 8 }}>{focusPiece.title}</div>
          <p className="tiny muted" style={{ marginTop: 4 }}>
            Leads every session it appears in, is scheduled more often than anything else, and is the last to give up minutes. Technique
            blocks are drawn towards what it needs.
          </p>
          {focusPiece.demands?.length ? (
            <div className="chip-row" style={{ marginTop: 8 }}>
              {focusPiece.demands.map((id) => (
                <span key={id} className="chip">
                  {getTechnique(id)?.name.split(" (")[0] ?? id}
                </span>
              ))}
            </div>
          ) : (
            <button type="button" className="btn btn--small" style={{ marginTop: 8 }} onClick={() => setEditing(focusPiece)}>
              Say what this piece needs
            </button>
          )}
        </div>
      ) : state.pieces.length ? (
        <div className="notice notice--info">
          Working towards something specific? Open a piece and tick <strong>Build my plan around this piece</strong> — the week then
          reorganises itself around it.
        </div>
      ) : null}

      {state.pieces.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {state.pieces.map((piece) => {
            const entry = passes.get(piece.id);
            const days = daysSinceTouched(piece, state.log);
            const isFocus = piece.id === focusId;
            return (
              <div key={piece.id} className="card">
                <div className="row row--between" style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{piece.title}</div>
                    <div className="tiny muted">{piece.composer || "composer unknown"}</div>
                  </div>
                  <span className={`chip${isFocus ? " chip--accent" : piece.priority === 1 ? " chip--accent" : ""}`}>
                    {isFocus ? "the plan is built around this" : piece.priority === 1 ? "top priority" : piece.priority === 2 ? "priority 2" : "when there is time"}
                  </span>
                </div>

                <div className="chip-row" style={{ marginTop: 10 }}>
                  <span className="chip chip--teal">{STATUS_LABEL[piece.status]}</span>
                  {entry ? (
                    <span className="chip">
                      {entry.passes} pass{entry.passes === 1 ? "" : "es"} over {entry.days} day{entry.days === 1 ? "" : "s"} · {entry.minutes}′
                    </span>
                  ) : (
                    <span className="chip chip--danger">nothing scheduled</span>
                  )}
                  {piece.target ? <span className="chip">needed {piece.target}</span> : null}
                  <span className="chip">
                    {days === undefined ? "never practised" : days === 0 ? "touched today" : `last touched ${days}d ago`}
                  </span>
                  {piece.demands?.length ? <span className="chip">{piece.demands.length} technical demands</span> : null}
                </div>
                <p className="tiny muted" style={{ marginTop: 8 }}>
                  {BLURB[piece.status]}
                </p>

                <div className="btn-row" style={{ marginTop: 10 }}>
                  <button type="button" className="btn btn--small" onClick={() => setEditing(piece)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn--small" onClick={() => setFocusPiece(isFocus ? null : piece.id)}>
                    {isFocus ? "Stop building around" : "Build around this"}
                  </button>
                  {piece.status !== "maintenance" ? (
                    <button type="button" className="btn btn--small" onClick={() => updatePiece(piece.id, { status: "maintenance" })}>
                      Learned
                    </button>
                  ) : null}
                  <button type="button" className="btn btn--small btn--danger" onClick={() => setConfirmDelete(piece.id)}>
                    Delete
                  </button>
                </div>

                {confirmDelete === piece.id ? (
                  <div className="notice notice--warn" style={{ marginTop: 10 }}>
                    Remove {piece.title} from the repertoire? Its practice history stays in the log.
                    <div className="btn-row" style={{ marginTop: 8 }}>
                      <button type="button" className="btn btn--small" onClick={() => setConfirmDelete(null)}>
                        Keep it
                      </button>
                      <button
                        type="button"
                        className="btn btn--small btn--danger"
                        onClick={() => {
                          removePiece(piece.id);
                          setConfirmDelete(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="empty">
            Nothing on the music stand yet. Add the piece you actually want to play — a suggestion from your teacher, something you heard,
            anything — and the plan will be built around it.
          </div>
          <button type="button" className="btn btn--block" style={{ marginTop: 8 }} onClick={() => setStand(true)}>
            <Icon name="plus" size={16} /> What's on the music stand?
          </button>
        </div>
      )}

      {stand ? (
        <MusicStandSheet
          onClose={() => setStand(false)}
          onSuggest={() => {
            setStand(false);
            setEditing("new");
          }}
        />
      ) : null}

      {editing ? (
        <PieceSheet
          piece={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
