import type { MethodId, Phase, RepMethod, RepStatus } from "../types";

/**
 * How a piece is worked in a session.
 *
 * The rotation matters more than any single method: running a piece from the top
 * is the default, and it is the least effective use of a short session. Cycling
 * through these gives every piece slow, specific, goal-directed work in turn.
 */
export const REP_METHODS: RepMethod[] = [
  {
    id: "slow",
    name: "Slow pass, no stops",
    verb: "Slow pass",
    intent: "Find the hesitations. At this tempo there is nowhere for them to hide.",
    steps: [
      "Set the metronome at 50–60% of your working tempo.",
      "Play the section without stopping, however badly it goes.",
      "Mark every hesitation in pencil. Do not fix anything yet — collect the evidence first.",
      "Play it again at the same tempo, and fix only the worst two marks.",
    ],
    minutes: [6, 10],
    tempo: "50–60% of working tempo, metronome on",
    success: "You finished without stopping and have a marked list of the real problems.",
    goodFor: ["new", "learning", "memorising", "polishing"],
    order: 1,
  },
  {
    id: "fix",
    name: "Isolate the hard bars",
    verb: "Isolate",
    intent: "Fix the two bars that cause ninety per cent of the trouble.",
    steps: [
      "Name the hardest two bars in the section. Not the whole section — two bars.",
      "Loop bar one: five slow clean repetitions, then five in tempo.",
      "Do the same for bar two, then join the two bars together, five times.",
      "Play from one bar before the pair, so you enter it as you would in the piece.",
    ],
    minutes: [6, 12],
    tempo: "Slow first, then the passage's real tempo",
    success: "The two bars are clean at tempo, five times running.",
    goodFor: ["new", "learning", "memorising", "polishing"],
    order: 2,
  },
  {
    id: "join",
    name: "Join the seams",
    verb: "Join seams",
    intent: "Most mistakes live in the joins, not in the sections.",
    steps: [
      "Divide the section into chunks of two to four bars.",
      "Practise only the joins: start one beat before each seam and play through it, four times.",
      "Then chain two chunks together, then three, then the whole section.",
    ],
    minutes: [5, 10],
    tempo: "Slow enough to be deliberate, then up to tempo",
    success: "Every seam is as clean as the passages either side of it.",
    goodFor: ["new", "learning", "memorising", "polishing"],
    order: 3,
  },
  {
    id: "memory",
    name: "Memory checkpoints",
    verb: "Memory check",
    intent: "Test the memory instead of feeding it. Retrieval is what makes it hold.",
    steps: [
      "With the score closed, start from a bar number you choose at random, in the middle.",
      "Play four bars and stop before the easy part.",
      "Five starts. Any blank is marked and worked tomorrow — tonight you stop before it becomes a habit of guessing.",
      "Then one pass of the section in tempo, using the phrase ends as checkpoints.",
    ],
    minutes: [6, 10],
    success: "Five different random starts, all clean, score closed.",
    goodFor: ["learning", "memorising", "polishing"],
    order: 4,
  },
  {
    id: "ladder",
    name: "Tempo ladder",
    verb: "Ladder",
    intent: "Raise the tempo on evidence, not on hope.",
    steps: [
      "Start 20–30% below your target tempo for this section.",
      "Play it three times. Three clean? Add 4 bpm. Any error? Stay and fix the error alone.",
      "Stop after three increases, or at the first error that survives two attempts.",
      "Write the number down — that is tomorrow's starting point.",
    ],
    minutes: [7, 12],
    tempo: "+4 bpm after three consecutive clean passes",
    success: "You finished on a clean pass at a higher tempo, and logged the number.",
    goodFor: ["learning", "memorising", "polishing"],
    order: 5,
    longOnly: true,
  },
  {
    id: "run",
    name: "Run-through, no stopping",
    verb: "Run-through",
    intent: "Playing it through is a different skill from practising it. Train it separately.",
    steps: [
      "Play the piece from start to finish. No stopping, no fixing, no restarting — even if it collapses.",
      "Imagine a listener, or better, record it.",
      "Afterwards, write down exactly one thing that went wrong and one that worked.",
      "If you went wrong twice in the same bar, that bar goes into tomorrow's plan as a fix, not tonight's.",
    ],
    minutes: [6, 15],
    success: "You reached the end without stopping and named one thing to fix.",
    goodFor: ["memorising", "polishing"],
    order: 6,
    longOnly: true,
  },
  {
    id: "record",
    name: "Record and review",
    verb: "Record",
    intent: "Your ear on playback hears what you cannot hear while playing.",
    steps: [
      "Record one pass — a section at most, phone recording is fine.",
      "Listen back with the score in hand, pencil ready, making three marks at most.",
      "Play the two worst moments once each, slowly. Do not re-record tonight.",
    ],
    minutes: [8, 14],
    tempo: "Working tempo — a recording of a slowed-down version tells you less",
    success: "Three specific marks in the score, and one of them fixed.",
    goodFor: ["memorising", "polishing"],
    order: 7,
    longOnly: true,
  },
  {
    id: "maintain",
    name: "Maintenance pass",
    verb: "Maintain",
    intent: "Keep it alive cheaply, so it is not relearned from scratch in two months.",
    steps: [
      "One slow accurate pass, listening.",
      "One pass at tempo.",
      "That is the whole job. Stop before it becomes an unpaid rehearsal of everything you know.",
    ],
    minutes: [4, 8],
    success: "Two clean passes. Nothing more required.",
    goodFor: ["maintenance"],
    order: 8,
  },
];

export const METHOD_BY_ID: Record<MethodId, RepMethod> = Object.fromEntries(
  REP_METHODS.map((m) => [m.id, m]),
) as Record<MethodId, RepMethod>;

const CYCLE: Record<RepStatus, MethodId[]> = {
  new: ["slow", "fix", "join", "slow", "fix"],
  learning: ["fix", "slow", "join", "ladder", "fix", "memory"],
  memorising: ["memory", "fix", "slow", "join", "memory", "run"],
  polishing: ["ladder", "run", "memory", "record", "fix", "join"],
  maintenance: ["maintain", "maintain", "run"],
};

const PERFORMANCE_CYCLE: Record<RepStatus, MethodId[]> = {
  new: ["slow", "fix", "join"],
  learning: ["fix", "join", "memory"],
  memorising: ["memory", "run", "memory", "join"],
  polishing: ["run", "memory", "fix", "record", "run"],
  maintenance: ["maintain", "run"],
};

/** Which method this piece gets on its Nth pass, given its state and the phase. */
export function methodFor(status: RepStatus, passIndex: number, phase: Phase): RepMethod {
  const cycle = phase === "performance" ? PERFORMANCE_CYCLE[status] : CYCLE[status];
  return METHOD_BY_ID[cycle[passIndex % cycle.length]];
}

/** Hands-on minutes a piece is worth in one pass, by state. */
export const PASS_MINUTES: Record<RepStatus, number> = {
  new: 7,
  learning: 9,
  memorising: 10,
  polishing: 12,
  maintenance: 5,
};

export interface Principle {
  id: string;
  name: string;
  what: string;
  inPlan: string;
}

/**
 * The practice-design principles the planner is built on. These are long-standing
 * findings from motor-learning and practice research, applied to the guitar.
 */
export const PRINCIPLES: Principle[] = [
  {
    id: "spacing",
    name: "Spread it out (distributed practice)",
    what:
      "Short sessions on consecutive days build more than one long session a week, and a piece touched twice with a day between holds better than the same total time in one sitting.",
    inPlan: "The week spread passes of each piece across your practice days with gaps rather than piling them into one day.",
  },
  {
    id: "interleaving",
    name: "Interleave, don't block (interleaved practice)",
    what:
      "Rotating between different tasks in short blocks produces better retention and transfer than spending a long unbroken stretch on one thing, even though it feels harder and less fluent while you do it.",
    inPlan: "No block in your session runs long. Technique and repertoire alternate, and each technique is worked in a short specific dose.",
  },
  {
    id: "chunking",
    name: "Work in chunks (chunking and isolation)",
    what:
      "Practice on the smallest unit that contains the difficulty — a bar, a beat, a transition — transfers far better than repeating a whole piece and hoping the hard part improves.",
    inPlan: "Repertoire blocks are written as specific tasks on named bars or sections, not 'work on the piece'.",
  },
  {
    id: "slow",
    name: "Slow first, then ladder tempo (slow practice, tempo laddering)",
    what:
      "Slow playing with a metronome exposes errors that normal tempo conceals, and raising the tempo in small steps only after clean repetitions prevents practising the mistakes.",
    inPlan: "Tempo ladders with a +4 bpm step and a stop-at-first-error rule, and the bpm you reached gets logged.",
  },
  {
    id: "retrieval",
    name: "Test rather than repeat (retrieval practice)",
    what:
      "Trying to recall something before checking improves memory far more than reading or playing it again. Random starts, writing a section out from memory, and mental play all count as practice.",
    inPlan: "Memory checkpoints with random bar numbers, and score-writing at the table that costs no hand load.",
  },
  {
    id: "recording",
    name: "Record and review (feedback loops)",
    what:
      "You cannot hear your own playing while playing it. Recorded playback is the cheapest accurate feedback available, and reviewing with a pencil converts it into tomorrow's plan.",
    inPlan: "Longer sessions include a record-and-review pass, with a rule of three marks and one fix.",
  },
  {
    id: "load",
    name: "Manage the load (load management and injury prevention)",
    what:
      "Barre, tremolo, slurs and speed work load the hands. Stacking them on consecutive days is how players end up with tendinitis and lose months, not minutes.",
    inPlan: "High-load work is dosed in short blocks, never on consecutive days, breaks are built into the session, and the weekly plan warns you when the load goes over the ceiling.",
  },
  {
    id: "specificity",
    name: "Always land the exercise in the music (specificity and transfer)",
    what:
      "An exercise improves the passage it is applied to, not the repertoire in general. Technique work only converts when it is taken straight into the bars that need it.",
    inPlan: "Technique blocks end with the prescription applied to a specific bar of one of your pieces.",
  },
  {
    id: "autonomy",
    name: "Decide once, then keep it (reduce decision load)",
    what:
      "Spending the first ten minutes of practice deciding what to practise is a real cost, and the decisions people make at that moment are usually the comfortable ones, not the useful ones.",
    inPlan: "The plan is written before you pick up the guitar: named blocks, named bars, named criteria for being done.",
  },
];
