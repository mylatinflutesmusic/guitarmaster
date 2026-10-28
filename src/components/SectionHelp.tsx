import { useState } from "react";
import { HELP } from "../data/help";
import type { HelpTopic } from "../data/help";
import { Sheet } from "./Sheet";
import { Icon } from "./Icon";

/**
 * Heading for a section with a help button beside it. The same control in the
 * same place on every screen, so "how does this work?" is always one tap away.
 */
export function SectionHelp({ topic }: { topic: HelpTopic }) {
  const help = HELP[topic];
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="section-head">
        <div className="section-head__text">
          <div className="section-head__title">
            <span>{help.name}</span>
            {topic === "today" ? <span className="chip chip--accent">main session</span> : null}
          </div>
          <div className="tiny muted">{help.tagline}</div>
        </div>
        <button
          type="button"
          className="icon-btn icon-btn--help"
          onClick={() => setOpen(true)}
          aria-label={`How ${help.name} works`}
        >
          <Icon name="help" size={18} />
        </button>
      </div>

      {open ? (
        <Sheet
          title={`How ${help.name} works`}
          subtitle="A minute here saves a month of drifting"
          onClose={() => setOpen(false)}
        >
          <p className="small">{help.purpose}</p>

          <div className="label" style={{ marginTop: 4 }}>
            What you do here
          </div>
          <ol className="steps" style={{ marginTop: 4 }}>
            {help.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <div className="label" style={{ marginTop: 4 }}>
            Good to know
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {help.tips.map((tip) => (
              <div key={tip} className="pill">
                {tip}
              </div>
            ))}
          </div>

          <button type="button" className="btn btn--block btn--primary" style={{ marginTop: 6 }} onClick={() => setOpen(false)}>
            Got it
          </button>
        </Sheet>
      ) : null}
    </>
  );
}
