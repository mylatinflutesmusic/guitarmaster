import { Icon } from "./Icon";

export type TabId = "today" | "week" | "pieces" | "progress" | "library";

const TABS: { id: TabId; label: string; icon: "today" | "week" | "pieces" | "progress" | "library" }[] = [
  { id: "today", label: "Today", icon: "today" },
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
          className={`tab${active === tab.id ? " tab--on" : ""}`}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
        >
          <Icon name={tab.icon} size={21} />
          <span className="tab__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
