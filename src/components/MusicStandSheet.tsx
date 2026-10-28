import { useStore } from "../store";
import { STARTERS } from "../data/starters";
import { Sheet } from "./Sheet";
import { Icon } from "./Icon";

/**
 * The music stand: the repertoire-building screen from first run, available
 * again from Pieces. Suggested pieces for the player's level, plus their own.
 */
export function MusicStandSheet({ onClose, onSuggest }: { onClose: () => void; onSuggest: () => void }) {
  const { state, addPiece } = useStore();
  const onStand = new Set(state.pieces.map((piece) => piece.title.trim().toLowerCase()));

  return (
    <Sheet
      title="What's on the music stand?"
      subtitle="Pick what you are actually playing, or suggest your own. Everything can be edited or deleted later."
      onClose={onClose}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {STARTERS[state.profile.level].map((starter) => {
          const added = onStand.has(starter.title.trim().toLowerCase());
          return (
            <div key={starter.title} className={`option${added ? " option--on" : ""}`}>
              <span className="option__mark">{added ? "✓" : ""}</span>
              <span style={{ flex: 1 }}>
                <span className="option__title">{starter.title}</span>
                <span className="option__blurb" style={{ display: "block" }}>
                  {starter.composer} · {starter.note}
                </span>
              </span>
              {added ? (
                <span className="chip chip--accent">on the stand</span>
              ) : (
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => addPiece({ title: starter.title, composer: starter.composer, status: "learning", priority: 2 })}
                >
                  Add
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button type="button" className="btn btn--block" style={{ marginTop: 12 }} onClick={onSuggest}>
        <Icon name="plus" size={16} /> Suggest your own song
      </button>
      <p className="tiny muted" style={{ marginTop: 8 }}>
        Your own suggestion is enough — a title will do. It joins the pieces already on the stand, and the plan works from there.
      </p>

      <div className="btn-row" style={{ marginTop: 12 }}>
        <span className="spacer" />
        <button type="button" className="btn btn--primary" onClick={onClose}>
          Done
        </button>
      </div>
    </Sheet>
  );
}
