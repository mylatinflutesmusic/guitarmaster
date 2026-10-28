import { useState } from "react";
import { useStore } from "./store";
import { TabBar } from "./components/TabBar";
import type { TabId } from "./components/TabBar";
import { Today } from "./views/Today";
import { Week } from "./views/Week";
import { Pieces } from "./views/Pieces";
import { Progress } from "./views/Progress";
import { Library } from "./views/Library";
import { Setup } from "./views/Setup";
import { Icon } from "./components/Icon";
import { TOUR_VERSION, Walkthrough } from "./components/Walkthrough";
import { longDate } from "./engine/dates";

export function App() {
  const { state, ready, updateProfile } = useStore();
  const [tab, setTab] = useState<TabId>("today");
  const [editing, setEditing] = useState(false);

  if (!ready) {
    return (
      <div className="app">
        <div className="empty">Opening your practice book…</div>
      </div>
    );
  }

  if (!state.profile.onboarded) {
    return <Setup mode="first-run" />;
  }

  if (editing) {
    return <Setup mode="edit" onDone={() => setEditing(false)} />;
  }

  return (
    <>
      <div className="app">
        <header className="app-header">
          <div className="app-header__row">
            <div style={{ flex: 1 }}>
              <h1 className="app-title">Cuerda</h1>
              <div className="app-sub">{longDate()}</div>
            </div>
            <button type="button" className="icon-btn" onClick={() => setEditing(true)} aria-label="Practice settings">
              <Icon name="gear" size={19} />
            </button>
          </div>
        </header>

        {tab === "today" ? <Today /> : null}
        {tab === "week" ? <Week /> : null}
        {tab === "pieces" ? <Pieces /> : null}
        {tab === "progress" ? <Progress /> : null}
        {tab === "library" ? <Library /> : null}
      </div>
      <TabBar active={tab} onChange={setTab} />
      {(state.profile.tourVersion ?? 0) < TOUR_VERSION ? (
        <Walkthrough
          onNavigate={setTab}
          onDone={() => {
            updateProfile({ tourVersion: TOUR_VERSION });
            setTab("today");
          }}
        />
      ) : null}
    </>
  );
}
