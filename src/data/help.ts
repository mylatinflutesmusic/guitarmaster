export type HelpTopic = "today" | "week" | "pieces" | "progress" | "library";

export interface SectionHelp {
  /** Heading shown above the section. */
  name: string;
  /** One line under the heading. */
  tagline: string;
  /** What the section is for. */
  purpose: string;
  /** How to use it, in order. */
  steps: string[];
  /** Things worth knowing once you have used it a few times. */
  tips: string[];
}

export const HELP: Record<HelpTopic, SectionHelp> = {
  today: {
    name: "Practice",
    tagline: "Your session. Everything else in Cuerda feeds this screen.",
    purpose:
      "This is the section you actually play from. The plan has already decided what deserves your minutes today; you decide how many minutes you really have.",
    steps: [
      "Pick the time you actually have. The session is rebuilt for that length — a short day drops the least valuable work first instead of just cutting the end off.",
      "Read the blocks in order: warm-up, the technique your plan says is holding you back, one or two passes at repertoire, then a short close.",
      "Tap Start to run the session. Each block gets its own countdown and a metronome, and the runner tells you what to do inside the block.",
      "Finish the session to log it. If you practised without the timer, “Log it as planned” writes the same entry.",
    ],
    tips: [
      "The order is the method, not a suggestion. The technique block comes before the piece it is meant to fix, while the hands are still fresh.",
      "The first block is deliberately cheap. Cold hands on the hardest passage is how players practise their mistakes.",
      "One session, one idea. If a block says isolate two bars, resist tidying the rest of the piece afterwards.",
    ],
  },
  week: {
    name: "Week",
    tagline: "The seven days the plan built, and the reasons behind them.",
    purpose:
      "A view of the whole week rather than one night. This is where the planner's judgement becomes visible: how much technique, how much repertoire, which piece gets the passes.",
    steps: [
      "Start with the top card: the current phase, total minutes, and the technique / repertoire / reading split.",
      "Tap any day to open its blocks minute by minute, in the order you would play them.",
      "Read “Watch out” before you change anything — it flags accumulated hand load, a priority that has no block, a piece going stale, or a week with no sight-reading.",
      "Check “Technique coverage” and “Repertoire this week” to confirm every priority still gets at least one pass.",
    ],
    tips: [
      "Loaded days are flagged on purpose. Two heavy days back to back is how a small twinge becomes a fortnight off.",
      "Every fourth week is lighter. The gains consolidate there, so resist filling it.",
      "You do not practise from this screen — it is the map. Practice happens in the Practice section.",
    ],
  },
  pieces: {
    name: "Pieces",
    tagline: "The repertoire the plan is built from.",
    purpose:
      "Everything here is what you can play or want to play. The planner decides how to work each piece from its state, its priority and whether it has a deadline.",
    steps: [
      "Tap “+ Add” to open the music stand: pieces that suit your level, or “Suggest your own song” for anything else. A title is enough; the composer is optional.",
      "Set the state honestly. A piece you are learning gets slow passes and isolation; one you are polishing gets ladders and run-throughs; maintenance keeps it alive without eating the week.",
      "Say what the piece needs — tick its technical demands so the technique blocks point at the thing that is actually difficult.",
      "Tap “Build around this” on the one piece that matters most now. It leads every session it appears in, is scheduled most often, and gives up minutes last.",
    ],
    tips: [
      "The state is the single biggest lever. Mark a piece as polishing too early and the plan stops doing the slow work it still needs.",
      "A date under “needs to be ready by” switches the plan to a countdown: the closer it gets, the more of the week that piece takes.",
      "Deleting a piece keeps the sessions you already logged, so your history is not rewritten.",
    ],
  },
  progress: {
    name: "Progress",
    tagline: "What the minutes added up to.",
    purpose:
      "Practice you can see. Every finished session is stored with the blocks it contained, so progress is evidence rather than memory.",
    steps: [
      "Read the three figures first: current streak, minutes this week, sessions in the last 28 days.",
      "The bars are the last fourteen days and the meter shows where the minutes went — technique, repertoire or reading.",
      "After a ladder or a run-through, add a tempo mark: the bpm you actually reached, not the one you aimed for.",
      "Scroll the session log to see each entry's blocks and note. The × removes an entry you logged by mistake.",
    ],
    tips: [
      "Consistency beats length. Four short sessions in a row do more for a piece than one long one, because the hands consolidate between attempts.",
      "If almost every minute is repertoire, the technique budget is the thing to fix — not the piece.",
      "A rising bpm line is the honest measure. Minutes only prove you were in the room.",
    ],
  },
  library: {
    name: "Library",
    tagline: "The technique reference the plan draws on.",
    purpose:
      "The material behind the plan: classical guitar techniques with how to work each one, plus the warm-ups the session starts with and the principles the planner applies.",
    steps: [
      "Search or scroll the techniques available at your level. Each one opens to why it matters, how to approach it, and the material that trains it.",
      "Tap “This limits me — put it on the plan” to make a technique a priority. The first priority gets the most minutes.",
      "Open “Warm-ups” to see what the first block of a session is drawn from and why.",
      "Open “Principles” to read the practice findings the plan is built on, and exactly where each one shows up in your week.",
    ],
    tips: [
      "Priorities are ordered. Six is the practical ceiling — more than that and nothing gets enough minutes to change.",
      "A technique you have not prioritised is not forbidden. It simply does not get its own block; you meet it inside the repertoire instead.",
      "If a passage keeps collapsing, find the technique behind it here, read the prescription, and put it on the plan for a few weeks.",
    ],
  },
};
