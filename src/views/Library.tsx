import { useMemo, useState } from "react";
import { TECHNIQUES, WARMUPS } from "../data/library";
import { PRINCIPLES } from "../data/methods";
import { useStore } from "../store";
import type { Technique } from "../types";

type Tab = "techniques" | "warmups" | "principles";

export function Library() {
  const { state, updateProfile } = useStore();
  const [tab, setTab] = useState<Tab>("techniques");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const order = { beginner: 0, intermediate: 1, advanced: 2, conservatoire: 3 };
  const available = useMemo(
    () =>
      TECHNIQUES.filter((t) => order[state.profile.level] >= order[t.minLevel]).filter((t) => {
        if (!query.trim()) return true;
        const haystack = `${t.name} ${t.category} ${t.short} ${t.materials.join(" ")}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      }),
    [query, state.profile.level],
  );

  const toggleFocus = (id: string) => {
    const current = state.profile.focuses;
    updateProfile({
      focuses: current.includes(id) ? current.filter((f) => f !== id) : [...current, id].slice(0, 6),
    });
  };

  return (
    <div className="view">
      <div className="segmented">
        <button type="button" className={`seg${tab === "techniques" ? " seg--on" : ""}`} onClick={() => setTab("techniques")}>
          Techniques
        </button>
        <button type="button" className={`seg${tab === "warmups" ? " seg--on" : ""}`} onClick={() => setTab("warmups")}>
          Warm-ups
        </button>
        <button type="button" className={`seg${tab === "principles" ? " seg--on" : ""}`} onClick={() => setTab("principles")}>
          Principles
        </button>
      </div>

      {tab === "techniques" ? (
        <>
          <input
            className="input"
            placeholder="Search techniques and material"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className="tiny muted">
            {available.length} techniques at your level. Tap any that limit you to put it on the plan — order matters, the first gets the
            most minutes.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {available.map((technique) => (
              <TechniqueCard
                key={technique.id}
                technique={technique}
                open={openId === technique.id}
                onToggle={() => setOpenId((id) => (id === technique.id ? null : technique.id))}
                focusPosition={state.profile.focuses.indexOf(technique.id)}
                onFocus={() => toggleFocus(technique.id)}
              />
            ))}
          </div>
        </>
      ) : null}

      {tab === "warmups" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p className="tiny muted">
            The plan picks a warm-up from these by level and by how long the day is: its job is to bring the hands up to temperature without
            becoming the session.
          </p>
          {WARMUPS.map((warmup) => (
            <div key={warmup.id} className="card">
              <div className="row row--between">
                <span style={{ fontSize: 15.5, fontWeight: 600 }}>{warmup.name}</span>
                <span className="chip">{warmup.minutes}′</span>
              </div>
              <p className="small muted" style={{ marginTop: 6 }}>
                {warmup.why}
              </p>
              <ol className="steps" style={{ marginTop: 8 }}>
                {warmup.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "principles" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p className="tiny muted">
            Nine long-standing findings from practice research, and exactly where each one shows up in your plan.
          </p>
          {PRINCIPLES.map((principle) => (
            <div key={principle.id} className="card">
              <div style={{ fontSize: 15.5, fontWeight: 600 }}>{principle.name}</div>
              <p className="small muted" style={{ marginTop: 6 }}>
                {principle.what}
              </p>
              <div className="pill" style={{ marginTop: 8 }}>
                In your plan · {principle.inPlan}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TechniqueCard({
  technique,
  open,
  onToggle,
  focusPosition,
  onFocus,
}: {
  technique: Technique;
  open: boolean;
  onToggle: () => void;
  focusPosition: number;
  onFocus: () => void;
}) {
  return (
    <div className="card">
      <button type="button" className="day__head" style={{ padding: 0, width: "100%" }} onClick={onToggle} aria-expanded={open}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600 }}>{technique.name}</div>
          <div className="tiny muted" style={{ marginTop: 2 }}>
            {technique.short}
          </div>
        </div>
        <span className="chip">{open ? "close" : "open"}</span>
      </button>

      <div className="chip-row" style={{ marginTop: 10 }}>
        <span className="chip">{technique.dose[0]}–{technique.dose[1]}′ a session</span>
        <span className="chip">from {technique.minLevel}</span>
        {technique.highLoad ? <span className="chip chip--danger">loaded work</span> : null}
        {focusPosition >= 0 ? <span className="chip chip--accent">priority {focusPosition + 1}</span> : null}
      </div>

      {open ? (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div className="label">Why it works</div>
            <p className="small muted" style={{ marginTop: 4 }}>
              {technique.why}
            </p>
          </div>
          <div>
            <div className="label">How to approach it</div>
            <ol className="steps" style={{ marginTop: 6 }}>
              {technique.how.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div>
            <div className="label">Material that trains it</div>
            <div className="chip-row" style={{ marginTop: 6 }}>
              {technique.materials.map((material) => (
                <span key={material} className="chip">
                  {material}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="label">Prescriptions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              {technique.prescriptions.map((prescription) => (
                <div key={prescription.id} className="card card--tight">
                  <div className="row row--between">
                    <span className="small" style={{ fontWeight: 600 }}>
                      {prescription.name}
                    </span>
                    <span className="chip">{prescription.minutes}′</span>
                  </div>
                  <p className="tiny muted" style={{ marginTop: 4 }}>
                    {prescription.aim}
                  </p>
                  <ol className="steps" style={{ marginTop: 6 }}>
                    {prescription.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  {prescription.tempo ? <div className="pill" style={{ marginTop: 8 }}>Tempo · {prescription.tempo}</div> : null}
                  <div className="pill pill--ok" style={{ marginTop: 6 }}>
                    Done when · {prescription.success}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {technique.focusLabel ? (
            <button type="button" className={`btn btn--block${focusPosition >= 0 ? "" : " btn--primary"}`} onClick={onFocus}>
              {focusPosition >= 0 ? `Remove from my priorities (now #${focusPosition + 1})` : `This limits me — put it on the plan`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
