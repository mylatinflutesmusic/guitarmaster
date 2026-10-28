interface IconProps {
  name:
    | "today"
    | "week"
    | "pieces"
    | "progress"
    | "library"
    | "gear"
    | "play"
    | "close"
    | "check"
    | "plus"
    | "minus"
    | "help";
  size?: number;
}

const PATHS: Record<IconProps["name"], string> = {
  today: "M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10-1.4l-1.4 1.4M5.6 18.4l1.4-1.4m10 1.4l-1.4-1.4M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  week: "M4 6h16M4 12h16M4 18h16",
  pieces: "M9 18V6l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zm10-2a3 3 0 11-6 0 3 3 0 016 0z",
  progress: "M4 20V10m5 10V4m5 16v-7m5 7V8",
  library: "M4 5h6a2 2 0 012 2v12a2 2 0 00-2-2H4V5zm16 0h-6a2 2 0 00-2 2v12a2 2 0 012-2h6V5z",
  gear: "M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.1l2-1.5-2-3.4-2.3 1a7.6 7.6 0 00-1.9-1.1L14.8 3H9.2l-.3 2.4a7.6 7.6 0 00-1.9 1.1l-2.3-1-2 3.4 2 1.5a7.4 7.4 0 000 2.2l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 001.9 1.1l.3 2.4h5.6l.3-2.4a7.6 7.6 0 001.9-1.1l2.3 1 2-3.4-2-1.5c.06-.36.1-.73.1-1.1z",
  play: "M8 5l11 7-11 7V5z",
  close: "M6 6l12 12M18 6L6 18",
  check: "M5 13l4 4L19 7",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  help: "M12 21a9 9 0 100-18 9 9 0 000 18zM9.4 9.2a2.7 2.7 0 015.2.9c0 1.8-2.6 2.1-2.6 4M12 17.2h.01",
};

export function Icon({ name, size = 22 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === "play" ? 2 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
