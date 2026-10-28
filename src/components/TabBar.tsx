import { Icon } from "./Icon";

export type TabId = "today" | "week" | "pieces" | "progress" | "library";

const TABS: { id: TabId; label: string; icon: "today" | "week" | "pieces" | "progress" | "library"; main?: boolean }[] = [
  { id: "today", label: "Practice", icon: "today", main: true },
  { id: "week", label: "Week", icon: "week" },
  { id: "pieces", label: "Pieces", icon: "pieces" },
  { id: "progress", label: "Progress", icon: "progress" },
  { id: "library", label: "Library", icon: "library" },
];

export function TabBar({ active, onChange }: { active: TabId; onChange: (tab: TabId) => void }) {
  return (
    <nav className="tabbar" aria-label="Sections">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab${tab.main ? " tab--main" : ""}${active === tab.id ? " tab--on" : ""}`}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
          aria-label={tab.main ? "Practice — your session" : tab.label}
        >
          <span className="tab__icon">
            <Icon name={tab.icon} size={tab.main ? 23 : 21} />
          </span>
          <span className="tab__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
