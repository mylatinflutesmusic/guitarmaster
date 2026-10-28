import type { Prescription, Technique } from "../types";

/**
 * The technique library.
 *
 * Each entry is deliberately opinionated: what the work is, why it converts into
 * playing, how to do it, the standard material, and two to four prescriptions —
 * concrete exercises the planner can hand to you for tonight's session.
 */
export const TECHNIQUES: Technique[] = [
  {
    id: "tension",
    name: "Tension release & load management",
    category: "tension",
    minLevel: "beginner",
    priority: 3,
    highLoad: false,
    short: "Relaxed minutes are repeatable minutes — this is the cheapest work in the app.",
    why:
      "Excess tension produces buzz, fatigue and injury, and it degrades the control that every other technique is trying to build. Short, repeated release checks (shoulders, jaw, thumb, forearm) plus a minimum-pressure habit keep a session inside what the hands can absorb. This is also why a good schedule is built from frequent sessions with breaks rather than one long grind.",
    how: [
      "Ten seconds before every block: scan shoulders, jaw, right-hand thumb, left forearm. Let each one drop.",
      "Left-hand pressure is the minimum that sounds the note — find it by buzzing, then adding pressure back.",
      "Stand up, drop the arms and shake out every 20–25 minutes without exception.",
      "If a passage hurts, stop it for the day. Aches are information, not weakness.",
    ],
    materials: ["Any open-string pattern", "Your own repertoire, played at half dynamic"],
    focusLabel: "Tension, aches or fatigue",
    focusHint: "Builds release checks and breaks into every session, and caps the hand load.",
    dose: [3, 6],
    prescriptions: [
      {
        id: "tension-scan",
        name: "Presence scan and half-volume test",
        aim: "Catch the grip before it becomes the habit.",
        steps: [
          "Ten seconds: shoulders down, jaw loose, right thumb off the back of the neck if it is gripping.",
          "Play four bars of anything at half your normal volume.",
          "Notice exactly where extra effort appeared, then replay those two seconds at that same half volume.",
        ],
        minutes: 4,
        success: "You can name the one place tension appears, and the passage sounds the same at half volume.",
      },
      {
        id: "tension-release",
        name: "Press, play, release",
        aim: "Teach the hand that pressure is an event, not a state.",
        steps: [
          "Place a four-note chord. Press only as much as it takes to sound clean.",
          "Play it, then release all pressure while keeping the fingers touching the strings.",
          "Repeat eight times, in rhythm, at about 60 bpm, releasing on each half note.",
        ],
        minutes: 4,
        tempo: "One chord per half note at 60 bpm",
        success: "Eight clean chords in a row with a genuinely free hand between them.",
      },
      {
        id: "tension-minimum-pressure",
        name: "Minimum-pressure walk",
        aim: "Calibrate just how little the left hand needs.",
        steps: [
          "Play a one-octave scale, deliberately buzzy.",
          "Add pressure in tiny amounts until each note rings, then no further.",
          "Repeat the scale at that new setting and see whether it feels lighter at the end than at the start.",
        ],
        minutes: 4,
        success: "The scale rings cleanly and your forearm is no warmer at the end than at the start.",
      },
    ],
  },
  {
    id: "tone",
    name: "Tone production & attack",
    category: "tone",
    minLevel: "beginner",
    priority: 3,
    highLoad: false,
    short: "Tone is the first thing heard and the fastest thing to change.",
    why:
      "Classical tone comes from nail shape, the angle of attack and how much the finger gives at the moment of release. Because the causes are fixed physical habits — one nail a fraction longer, an attack that is always perpendicular — a few minutes of deliberate listening, changing one variable at a time, moves further than hours of playing pieces through the same habit.",
    how: [
      "Play the same note five times and try to make all five identical. The ear leads, not the hand.",
      "Change one variable at a time: attack angle, nail contact point, then free versus rest stroke.",
      "Record twenty seconds now and then: tone faults are obvious on playback and invisible while playing.",
    ],
    materials: [
      "Open strings, p / i / m / a",
      "Brouwer, Estudios Sencillos 1 and 6",
      "Sagreras, Lecciones, tone studies",
    ],
    focusLabel: "Thin, uneven or weak tone",
    focusHint: "Adds short listening-based tone blocks to most sessions.",
    dose: [4, 8],
    prescriptions: [
      {
        id: "tone-five-notes",
        name: "Five identical notes",
        aim: "Build a repeatable sound, then trust it.",
        steps: [
          "Pick one open treble string. Play five i-strokes at 60 bpm.",
          "If one is thinner or edgier than the best of the five, stop and repeat that note five times.",
          "Then do the same with m, then with i-m alternation, then on the second string.",
        ],
        minutes: 5,
        tempo: "One note per click at 60 bpm",
        success: "Five strokes in a row you would happily put on a recording.",
      },
      {
        id: "tone-angle",
        name: "Attack angle ladder",
        aim: "Find the angle that gives fullness without edge.",
        steps: [
          "Play one note five times with the hand rotated slightly toward the bridge.",
          "Play it five times rotated slightly toward the neck.",
          "Say out loud what changed, then choose the version with the fullest sound and reproduce it ten times.",
        ],
        minutes: 4,
        success: "You can describe the tone change in words and find the good angle on demand.",
      },
      {
        id: "tone-apoyando",
        name: "Rest stroke, free stroke, same music",
        aim: "Separate the two strokes so each keeps its own colour.",
        steps: [
          "Play a four-note melody line rest stroke (apoyando), freely and with a full sound.",
          "Play the same four notes free stroke (tirando), aiming for the same volume.",
          "Alternate four and four, keeping the fingertip relaxed on the follow-through.",
        ],
        minutes: 5,
        success: "Both versions are clean, and the free stroke is not noticeably softer.",
      },
    ],
  },
  {
    id: "rhythm",
    name: "Rhythm, subdivision & pulse",
    category: "rhythm",
    minLevel: "beginner",
    priority: 3,
    highLoad: false,
    short: "Time is the one thing that cannot be faked, and it protects everything else.",
    why:
      "Rhythm errors hide in solo playing because nothing contradicts them. Counting aloud with subdivision, playing subdivisions on open strings, and moving the metronome's click onto different beats rebuild an internal pulse that no amount of note practice will produce. It also costs almost nothing technically, so it fits any session length — including a five-minute one.",
    how: [
      "Count aloud, subdivided, whenever the rhythm is in question. Even in performance.",
      "Move the click around: on the beat, on 2 and 4, on the offbeat. If the pulse is real, it survives.",
      "Clap or tap a rhythm before playing it. If you cannot clap it, you cannot play it in time.",
    ],
    materials: ["Metronome", "Any open-string pattern", "Sagreras, Lecciones (rhythm studies)"],
    focusLabel: "Timing and rhythmic accuracy",
    focusHint: "Adds a subdivision or metronome block to most sessions.",
    dose: [4, 8],
    prescriptions: [
      {
        id: "rhythm-subdivision-ladder",
        name: "Subdivision ladder on open strings",
        aim: "Make every subdivision feel like the same tempo.",
        steps: [
          "Set the metronome to 60. Play one bar each of quarters, eighths, triplets; then sixteenths on a single open string.",
          "Return to the start of the ladder without stopping.",
          "Repeat three times, then move the click to beat 2 only.",
        ],
        minutes: 6,
        tempo: "60 bpm, straight through, no stops",
        success: "All four subdivisions are even and you can feel where the click will land.",
      },
      {
        id: "rhythm-count-aloud",
        name: "Count aloud through the hard bar",
        aim: "Separate rhythm from fingers.",
        steps: [
          "Find the bar in your piece where time wobbles. Set the metronome slow.",
          "Clap and count it aloud, subdivided, three times, correctly.",
          "Play it on open strings on the written rhythm, four times, still counting aloud.",
          "Play it as written, counting aloud.",
        ],
        minutes: 6,
        success: "The bar arrives in the right place four times running, with you counting out loud.",
      },
      {
        id: "rhythm-displacement",
        name: "Metronome displacement",
        aim: "Prove the pulse is internal, not borrowed from the click.",
        steps: [
          "Play eight bars of anything with the metronome on the beat.",
          "Silence it for eight bars and keep going.",
          "Bring it back in on beat 3 and see how far you had drifted.",
        ],
        minutes: 5,
        success: "You re-enter within a hair of the click after eight silent bars.",
      },
    ],
  },
  {
    id: "memory",
    name: "Memory & mental practice",
    category: "memory",
    minLevel: "beginner",
    priority: 3,
    highLoad: false,
    short: "Memory fails for lack of a plan, not for lack of repetition.",
    why:
      "Secure memorisation runs on several channels at once: aural (how it goes), visual (the shape on the fingerboard and the page), and analytic (the harmony and phrase structure). Retrieval practice — starting from random bars without the score, writing a section out at the table — builds the path back that repetition alone never builds. Mental practice away from the instrument is real practice and adds no hand load at all.",
    how: [
      "Never practise memory by playing from the beginning again. Start from random bars and from the end.",
      "Know the harmony: name the key and the chord of every two bars while playing slowly.",
      "Run memory checks without the instrument: write a section out, sing the line, see the fingerboard.",
    ],
    materials: ["Your repertoire", "Pencil and paper (genuinely)"],
    focusLabel: "Playing from memory / blanks under pressure",
    focusHint: "Schedules retrieval drills and score-writing at the table, not just more repetitions.",
    dose: [5, 10],
    prescriptions: [
      {
        id: "memory-random-starts",
        name: "Random start points",
        aim: "Build a way back in from anywhere.",
        steps: [
          "Write the bar numbers of your piece on slips of paper, or let the app call them out.",
          "Start at the called bar, play four bars, and stop before the easy bit.",
          "Do five of these. If one fails, mark it and revisit it tomorrow rather than tonight.",
        ],
        minutes: 7,
        success: "Five different starts, all clean, with the score closed.",
      },
      {
        id: "memory-score-writing",
        name: "Write it out at the table",
        aim: "Expose which channel is actually missing.",
        steps: [
          "Put the guitar down. Write one section from memory: notes, then fingering, then dynamics.",
          "Check against the score with a different colour pen and correct your errors.",
          "Play the section twice off the instrument in your head before you pick the guitar up again.",
        ],
        minutes: 8,
        success: "Your written version needs fewer than three corrections.",
      },
      {
        id: "memory-harmonic-map",
        name: "Harmonic map at 60% tempo",
        aim: "Replace finger-order memory with structural memory.",
        steps: [
          "Play through one section at 60% tempo, naming the chord and key of each two-bar block out loud.",
          "Mark the four phrase ends. Play again and breathe at those four points.",
          "Close the score and play the section at tempo, using the phrase ends as checkpoints.",
        ],
        minutes: 8,
        success: "You can play the section at tempo and say, afterwards, what the harmony did.",
      },
    ],
  },
  {
    id: "arpeggios",
    name: "Arpeggios & right-hand independence",
    category: "arpeggios",
    minLevel: "beginner",
    priority: 3,
    highLoad: false,
    short: "Fixed right-hand formulas build independence, and almost the whole repertoire is arpeggiated motion.",
    why:
      "Fixed patterns such as p-i-m-a, p-a-m-i and Tárrega's p-i-m-a-m-i train independence, evenness between strong and weak fingers, and separation of the thumb from the fingers. Because the classical repertoire is largely arpeggiated texture, this time transfers directly into pieces — but only when the formula is practised as a loop on a held chord and then applied to real bars.",
    how: [
      "Loop one formula on one chord for twenty repetitions; the aim is evenness, not speed.",
      "Then take the formula straight into the actual bars of a piece and see whether the evenness survives.",
      "Keep the thumb's stroke independent: it is the bass line, not another finger.",
    ],
    materials: [
      "Giuliani, 120 Right-Hand Studies, op. 1a",
      "Tárrega, arpeggio preludes",
      "Villa-Lobos, Etude 1",
      "Carlevaro, Serie didáctica — arpeggio formulas",
    ],
    focusLabel: "Arpeggios and right-hand independence",
    focusHint: "Loops right-hand formulas and ties them to the bars that need them.",
    dose: [5, 10],
    prescriptions: [
      {
        id: "arp-formula-loop",
        name: "Formula as a loop",
        aim: "Evenness first; speed is a later reward.",
        steps: [
          "Hold a left-hand chord (an easy Am or E). Set the metronome to 60.",
          "Loop one formula for twenty repetitions: p-i-m-a, then p-a-m-i, then p-i-m-a-m-i.",
          "Listen for the accent that appears on one particular finger. That finger is the work.",
        ],
        minutes: 6,
        tempo: "60 bpm, one note per click",
        success: "Twenty repetitions with no finger audibly louder than the others.",
      },
      {
        id: "arp-into-the-piece",
        name: "Formula into the piece",
        aim: "Move the evenness from the exercise into the music.",
        steps: [
          "Find a bar in your repertoire that is arpeggiated.",
          "Play only the right hand, on that bar's chord, five times, listening for evenness.",
          "Add the left hand. If the evenness collapses, the left hand is working too hard — reduce pressure.",
        ],
        minutes: 7,
        success: "The bar's arpeggios are as even in the piece as in the exercise.",
      },
      {
        id: "arp-thumb-separation",
        name: "Thumb separation drill",
        aim: "Give the thumb its own job.",
        steps: [
          "Play the formula with a deliberately accented, slightly staccato thumb.",
          "Play it again with the thumb at half volume while the fingers stay normal.",
          "Play a bar of your piece with the bass leading, then with the melody leading.",
        ],
        minutes: 6,
        success: "You can change the balance at will without the tempo moving.",
      },
    ],
  },
  {
    id: "scales",
    name: "Scales & alternation",
    category: "scales",
    minLevel: "beginner",
    priority: 2,
    highLoad: false,
    short: "Scales buy control at speed and even string changes, in a form you can measure.",
    why:
      "Diatonic scales rehearse alternation, string crossing, guide-finger preparation and hand synchronisation in one transportable pattern, and success is objective — clean, even, unaccented. They convert into playing only when worked in tempo ladders and different right-hand fingerings; cycling all twenty-four at a comfortable middle speed mostly rehearses the middle speed.",
    how: [
      "Pick one or two scales per week, not twenty-four. Work them, don't tour them.",
      "Ladder the tempo: +4 bpm after three clean passes, stop at the first error.",
      "Change the fingering (i-m, m-a, i-a) — the awkward pair is the one being trained.",
    ],
    materials: [
      "Segovia, Diatonic Major and Minor Scales",
      "Carcassi, op. 60 (scale passages)",
      "Sor, studies with scalar runs",
    ],
    focusLabel: "Scales, speed and evenness",
    focusHint: "One or two scales a week, worked in tempo ladders rather than toured.",
    dose: [5, 10],
    prescriptions: [
      {
        id: "scales-ladder",
        name: "Two-octave scale, tempo ladder",
        aim: "Raise the tempo only on evidence.",
        steps: [
          "Choose one scale. Set the metronome 25% below your best clean tempo.",
          "Play it four times. If three are clean, add 4 bpm. If any note buzzes or any accent appears, stay put.",
          "Write down the bpm where it first broke. That number is tomorrow's starting point.",
        ],
        minutes: 8,
        tempo: "Start 25% below target; +4 bpm per three clean passes",
        success: "You advanced at least one step and stopped on a clean pass, not a failure.",
      },
      {
        id: "scales-alternation",
        name: "Alternation variations",
        aim: "Train the finger pair you avoid.",
        steps: [
          "Play the scale with i-m at a comfortable tempo.",
          "Repeat with m-a, then with i-a, then with rest strokes on the way up and free on the way down.",
          "Note which pair is weakest and give it the next two minutes.",
        ],
        minutes: 7,
        success: "All three fingerings are even, at the same tempo.",
      },
      {
        id: "scales-bursts",
        name: "Speed bursts",
        aim: "Feel the tempo you cannot yet hold.",
        steps: [
          "Play four notes of the scale fast and clean, then reset and play them slowly.",
          "Extend the burst to eight notes, then to a full octave.",
          "Always finish on a clean slow pass so you leave the pattern accurate.",
        ],
        minutes: 6,
        success: "Bursts are clean, with no tightening in the right hand.",
      },
    ],
  },
  {
    id: "string-crossing",
    name: "String crossing accuracy",
    category: "tone",
    minLevel: "beginner",
    priority: 2,
    highLoad: false,
    short: "Uneven string changes are why clean scales still sound lumpy.",
    why:
      "Crossings between non-adjacent strings, and the inside-out motions over the third string, force the hand to re-time a stroke instead of repeating it — that re-timing is where unwanted accents and dropped notes come from. Practising the crossing itself, isolated and slow but at the passage's real tempo, fixes in minutes what repeating the whole passage fixes in weeks.",
    how: [
      "Play only the two notes either side of every crossing in a passage. Nothing else.",
      "Accent the arrival note, then the departure note, then neither.",
      "Watch the guide finger: crossings get unreliable when it lifts too early.",
    ],
    materials: ["Scales", "Any melody with leaps", "Villa-Lobos, Etude 1 (middle section)"],
    focusLabel: "Melody notes drop out across strings",
    focusHint: "Isolates the crossings in your passages instead of repeating them whole.",
    dose: [4, 8],
    prescriptions: [
      {
        id: "crossing-pairs",
        name: "Crossing pairs",
        aim: "Fix the seam, not the passage.",
        steps: [
          "Play the two notes either side of one crossing, slowly, five times.",
          "Accent the arrival note twice, then the departure note twice, then neither.",
          "Join the crossing to its neighbours one bar at a time.",
        ],
        minutes: 5,
        success: "Every crossing in the passage is even, at the tempo of the passage.",
      },
      {
        id: "crossing-guide-finger",
        name: "Three-string sweep with a guide finger",
        aim: "Keep the map while the strings change.",
        steps: [
          "Play a three-string ascending sweep, keeping one finger in contact as a guide.",
          "Repeat descending, with the thumb and fingers alternating properly.",
          "Speed up only until the guide finger stops being able to stay.",
        ],
        minutes: 5,
        success: "The sweep is even and the guide finger stays in contact throughout.",
      },
    ],
  },
  {
    id: "barre",
    name: "Barre & left-hand economy",
    category: "barre",
    minLevel: "beginner",
    priority: 3,
    highLoad: true,
    short: "Barre buzz is placement, not strength — placement is trainable in minutes.",
    why:
      "The index barre works when it sits close behind the fret with the knuckle slightly rolled onto its bony edge, the elbow drawn slightly back and the thumb low behind the hand, so the arm's weight does the work instead of finger squeeze. Because players default to gripping harder, this needs short deliberate placement repetitions that end the moment tension arrives — otherwise practice bakes in the buzz and the strain together.",
    how: [
      "Place, then press. Never press on the way to placement.",
      "Roll the index finger a fraction onto its bony edge; usually one corner of the barre starts sounding.",
      "Elbow slightly back, thumb low and behind the hand, arm weight rather than grip.",
      "Stop the moment the forearm burns. Barre work in short sets, never to exhaustion.",
    ],
    materials: [
      "Giuliani, studies with barres",
      "Tárrega, Prelude in E (barre passages)",
      "Sor, studies with full barres",
    ],
    focusLabel: "Barre chords buzz or tire the hand",
    focusHint: "Uses short placement repetitions and keeps barre work out of back-to-back days.",
    dose: [4, 8],
    prescriptions: [
      {
        id: "barre-place-release",
        name: "Place, release, place",
        aim: "Make placement — not pressure — the habit.",
        steps: [
          "At the fifth fret, place the barre across the top three strings in four counts, sounding the notes only on count four.",
          "Keep the pressure on for one count, then release it completely, fingers still touching.",
          "Ten repetitions. Each one starts from a relaxed hand, not a hanging grip.",
        ],
        minutes: 5,
        tempo: "Four counts to place, one to sound, one to release",
        success: "Ten barres in a row sound clean on first contact, with a free forearm afterwards.",
      },
      {
        id: "barre-in-the-piece",
        name: "Barre inside the piece",
        aim: "Make the piece's worst chord boring.",
        steps: [
          "Find the two worst barre chords in your repertoire.",
          "Hold each one for ten seconds, checking string by string, adjusting angle and elbow until every string rings.",
          "Then approach each chord in rhythm from the bar before, five times.",
        ],
        minutes: 7,
        success: "Both chords ring on arrival, five times in a row, in tempo.",
      },
      {
        id: "barre-partial",
        name: "Partial barres and the thumb check",
        aim: "Use less finger than you think you need.",
        steps: [
          "Play a three-string partial barre at the third fret, then a two-string one.",
          "After each, lift the thumb off for a beat and see whether the chord still sounds.",
          "If it holds without the thumb, the grip was doing the work, not the arm.",
        ],
        minutes: 4,
        success: "The chord sounds for a beat with the thumb off the neck.",
      },
    ],
  },
  {
    id: "slurs",
    name: "Slurs (ligados)",
    category: "slurs",
    minLevel: "beginner",
    priority: 2,
    highLoad: true,
    short: "Short, regular doses build left-hand strength, release and ornament control.",
    why:
      "Hammer-ons and pull-offs train the exact mechanics used in trills, ornaments and fast passage-work: an independent finger strike, low action, minimal tension, and a pull-off that releases the string rather than dragging it. It is also where a beginner learns that the left hand's job is to arrive, not to squeeze. It is load-bearing work, so keep it short and never stack it against long barre work.",
    how: [
      "Fingers stay close to the strings; the strike comes from the knuckle, not the whole hand.",
      "The pull-off is a sideways release of the string, not a lift.",
      "Thirty to sixty seconds per finger pair, then rest. Stop before the hand tires.",
    ],
    materials: [
      "Sor, studies with slurs",
      "Pumping Nylon, slur section",
      "Giuliani, op. 48 (slur studies)",
    ],
    focusLabel: "Weak hammer-ons and pull-offs",
    focusHint: "Adds brief slur sets and keeps them off back-to-back days.",
    dose: [3, 6],
    prescriptions: [
      {
        id: "slurs-descending-pairs",
        name: "Descending pairs across the strings",
        aim: "Even release from every finger.",
        steps: [
          "On each string, play the pull-off pairs in turn: 4-3, 3-2, 2-1, then 4-2 and 4-1.",
          "Eight repetitions each, relaxed, listening for the second note to be as clear as the first.",
          "Move to the next string set only when the pairs sound even.",
        ],
        minutes: 5,
        success: "Both notes of every pair are equally clear and the hand is no tighter at the end.",
      },
      {
        id: "slurs-ascending-ladder",
        name: "Ascending hammer-on ladder",
        aim: "Independent finger strike with a light hand.",
        steps: [
          "Hold a finger on the second fret and hammer 3, then 4, then back down, on each string.",
          "Set the metronome to 60 and play one slur per click, then two per click.",
          "Check after every string: if the thumb has tightened against the neck, reset and continue.",
        ],
        minutes: 5,
        tempo: "60 bpm, one then two slurs per click",
        success: "Every hammer-on speaks clearly at two per click, with a loose thumb.",
      },
      {
        id: "slurs-trills",
        name: "Trill drills",
        aim: "Speed in the hardest finger pairs.",
        steps: [
          "Thirty seconds of 2-3 trills on a comfortable fret, then thirty seconds of 3-4.",
          "Keep the ornament even and quiet; loud trills usually mean the hand is working too hard.",
          "Finish with one slow, perfectly even eight-note trill before resting.",
        ],
        minutes: 4,
        success: "Thirty seconds of uninterrupted, even trilling in both pairs.",
      },
    ],
  },
  {
    id: "lh-independence",
    name: "Left-hand independence",
    category: "shifts",
    minLevel: "beginner",
    priority: 2,
    highLoad: false,
    short: "Permutation drills fix the finger that never learned to arrive on its own.",
    why:
      "The left hand needs independent arrival of each finger and the ability to hold one finger down while another works. A 3-4 pair that never separates will mis-time everything that needs it. Short daily permutation work targets this directly and is the standard preparation exercise in most methods — it is the cheapest way to make the rest of the left-hand repertoire easier.",
    how: [
      "Keep the fingers hovering a centimetre from the strings; independence dies when fingers fly away.",
      "Hold one finger down while another moves. That is the actual skill.",
      "Slow, even, quiet. This is not a strength exercise.",
    ],
    materials: ["1-2-3-4 permutations", "Held-finger studies", "Pumping Nylon, left-hand section"],
    focusLabel: "Clumsy or slow left-hand fingers",
    focusHint: "Adds permutation work and held-finger patterns as a short daily block.",
    dose: [4, 8],
    prescriptions: [
      {
        id: "lh-permutations",
        name: "Permutation cycle",
        aim: "Make every finger combination equally available.",
        steps: [
          "Play 1-2-3-4 on one string at the fifth fret, eight times, even, at 60 bpm.",
          "Then 1-3-2-4, then 1-4-2-3, then 2-4-1-3.",
          "Move down a fret each cycle, keeping the fingers low.",
        ],
        minutes: 6,
        tempo: "60 bpm, one finger per click",
        success: "All four orderings sound identical — no thin note, no early arrival.",
      },
      {
        id: "lh-held-finger",
        name: "Held finger, moving finger",
        aim: "Stop the whole hand from moving as a block.",
        steps: [
          "Hold the first finger down on the third fret and play 2, 3, 4 in turn on the same string.",
          "Keep the held note sounding throughout; the other fingers must not lift it.",
          "Repeat with the fourth finger holding and 3, 2, 1 moving.",
        ],
        minutes: 5,
        success: "The held note rings continuously for all repetitions.",
      },
    ],
  },
  {
    id: "shifts",
    name: "Shifts & fingerboard geography",
    category: "shifts",
    minLevel: "intermediate",
    priority: 2,
    highLoad: false,
    short: "Most wrong notes are shifts, not scales — train the journey.",
    why:
      "Shifts fail when the arm does not lead, when the guide finger lifts too early, or when the hand loses contact with the strings and with it the map. Practising shifts as their own event — silent slide, then sounding slide, then in tempo with the phrase's rhythm — removes hesitations that repeating the whole piece never touches, because in the piece the shift is only one twentieth of the notes you play.",
    how: [
      "The arm leads and the fingers follow, staying in light contact with the string.",
      "Keep a guide finger down whenever one is available. Shift on the phrase's rhythm, not on a pause.",
      "Learn the map: the same note in five positions, named out loud.",
    ],
    materials: ["Sor, studies", "Carcassi, op. 60", "Position studies in any method"],
    focusLabel: "Shifts and position changes",
    focusHint: "Isolates shifts in your pieces and adds fingerboard-map work.",
    dose: [4, 8],
    prescriptions: [
      {
        id: "shifts-silent-slide",
        name: "Silent slide map",
        aim: "Know where every position is without looking.",
        steps: [
          "Slide up one string from fret 1 to 12 and back, silently, staying in contact.",
          "Stop at frets 1, 3, 5, 7, 9, 12 and name them without looking at the hand.",
          "Repeat on the sixth and third strings, where the map changes.",
        ],
        minutes: 5,
        success: "You land on all six positions by feel, in both directions.",
      },
      {
        id: "shifts-in-the-phrase",
        name: "Shift in the phrase",
        aim: "Take the shift out of the practice room.",
        steps: [
          "Take one shift from your piece. Play only the two notes either side of it, slowly.",
          "Repeat at the phrase's real rhythm, with the arm leading and a guide finger down.",
          "Join it to the bar before and after, three times.",
        ],
        minutes: 6,
        success: "The shift is inaudible in tempo, three times in a row.",
      },
      {
        id: "shifts-same-note",
        name: "One note, five positions",
        aim: "Build the timbre map that lets you choose.",
        steps: [
          "Pick a note that exists in five places, for example E on the first string.",
          "Play it in each position, listening to how the colour changes.",
          "Choose the position you would use at the end of a phrase, and say why.",
        ],
        minutes: 5,
        success: "You can play the note in five positions and describe the difference.",
      },
    ],
  },
  {
    id: "speed",
    name: "Speed development: ladders & bursts",
    category: "scales",
    minLevel: "intermediate",
    priority: 2,
    highLoad: true,
    short: "Speed is accuracy first: raise tempo only after clean repetitions.",
    why:
      "Fast playing is slow playing with fewer errors and less excess motion. Tempo ladders (a small bpm increase only after several clean passes) and bursts (a hard bar played in tempo, preceded and followed by a slow reset) are the two devices that raise the ceiling without training errors. Pushing tempo with mistakes present teaches the mistakes — which is why 'play it faster' so often makes a passage worse.",
    how: [
      "Advance +4 bpm after three clean passes. Stop at the first error, no exceptions.",
      "Bursts: one beat fast, then reset slow. Never let the slow pass become sloppy.",
      "Log the bpm where it first breaks, and retest in three days rather than grinding it today.",
    ],
    materials: ["Any passage", "Pumping Nylon, tempo section", "Metronome with a visible beat"],
    focusLabel: "It falls apart at tempo",
    focusHint: "Ladders your passages to tempo with a stop-at-first-error rule and logs the ceiling.",
    dose: [5, 10],
    prescriptions: [
      {
        id: "speed-ladder",
        name: "Tempo ladder on four bars",
        aim: "Raise tempo on evidence only.",
        steps: [
          "Take four bars. Set the metronome 30% below your target tempo.",
          "Play them three times. All clean? Add 4 bpm. Any error? Stay and fix the error alone.",
          "Stop after three increases or at the first error, whichever comes first, and record the number.",
        ],
        minutes: 8,
        tempo: "Start 30% below target, +4 bpm per three clean passes",
        success: "You finished on a clean pass at a higher tempo than you started, and logged it.",
      },
      {
        id: "speed-bursts",
        name: "Bursts",
        aim: "Give the hand a target bigger than today.",
        steps: [
          "Play one beat at target tempo plus 10%, clean and relaxed.",
          "Reset and play the same beat slowly, checking the hand is loose again.",
          "Extend the burst to two beats, then a full bar, always resetting slowly between.",
        ],
        minutes: 6,
        success: "Every burst is clean, and the hand relaxes completely between bursts.",
      },
      {
        id: "speed-micro-loop",
        name: "Micro-loop, then extend",
        aim: "Fix one beat, then grow it back into the music.",
        steps: [
          "Loop the single hardest beat ten times slowly, then ten times at tempo.",
          "Extend to the bar, then to the phrase, keeping the tempo.",
          "Play the phrase from one bar before, so you enter it as you would in performance.",
        ],
        minutes: 8,
        success: "The hard beat holds its tempo inside the phrase, not only on its own.",
      },
    ],
  },
  {
    id: "tremolo",
    name: "Tremolo (p-a-m-i)",
    category: "tremolo",
    minLevel: "advanced",
    priority: 1,
    highLoad: true,
    short: "Measured, frequent doses. Tired hands cannot tremolo, and grind makes it worse.",
    why:
      "p-a-m-i demands that three fingers produce one smooth line while the thumb acts independently. The standard fix is to practise it as a rhythmic grouping — accenting each finger in turn, or pairing a-m with i-p — slowly, with a metronome, so the accent pattern shows which finger is unstable. It fatigues quickly, so short frequent sessions beat long ones, and it should never be scheduled the day after heavy barre work.",
    how: [
      "Practise it as groups, not as a blur: accents on p, then a, then m, then i, slowly.",
      "Thumb independent and slightly anticipating; the thumb note is the beat.",
      "Two to four minutes, then stop, even if it is going well. Return tomorrow.",
    ],
    materials: [
      "Tárrega, Recuerdos de la Alhambra",
      "Barrios, Sueño en la floresta (for the advanced)",
      "Any p-a-m-i study",
    ],
    focusLabel: "Tremolo",
    focusHint: "Short tremolo sets, one or two days a week, never twice in a row.",
    dose: [3, 6],
    prescriptions: [
      {
        id: "tremolo-accent-rotation",
        name: "Accent rotation",
        aim: "Expose the unstable finger.",
        steps: [
          "On a single string, play p-a-m-i at 60 bpm. Accent a for four bars, then m, then i.",
          "The accent that ruins the line is the finger to work: give it two more passes.",
          "Finish with four bars of no accents, listening for evenness.",
        ],
        minutes: 5,
        tempo: "60 bpm, accent one finger per four bars",
        success: "No accent pattern collapses the pulse, and the unaccented version is even.",
      },
      {
        id: "tremolo-grouped",
        name: "Grouped rhythms",
        aim: "Rebuild the motion as pairs and triplets.",
        steps: [
          "Play the tremolo as a-m twice per click, then a-m-i once per click.",
          "Play the p separately, as a bass note under the groups, slowly.",
          "Return to a plain p-a-m-i loop and notice the improvement.",
        ],
        minutes: 5,
        tempo: "60 bpm in groups of two, then three",
        success: "The groups are even, and the thumb never loses the beat.",
      },
      {
        id: "tremolo-plateau",
        name: "Four-bar chunk from the piece",
        aim: "Move it into real music without grinding the whole piece.",
        steps: [
          "Take four bars of Recuerdos (or a tremolo study). Set a tempo you can hold for eight bars without tension.",
          "Play the four bars six times, stopping if the thumb tightens.",
          "Raise the tempo by 4 bpm only if all six were even; otherwise leave it for tomorrow.",
        ],
        minutes: 6,
        success: "Four bars, six times, even, with the hand still loose at the end.",
      },
    ],
  },
  {
    id: "thumb-independence",
    name: "Thumb independence & texture",
    category: "arpeggios",
    minLevel: "intermediate",
    priority: 2,
    highLoad: false,
    short: "The thumb is the bass section, not another finger.",
    why:
      "In classical texture the thumb supplies the bass and often the pulse while i-m-a carry melody and arpeggiation. That separation is built by giving the thumb its own dynamic and rhythmic assignment — accent it, play it staccato, play it alone while the fingers move quietly — rather than by playing more loudly. Texture problems that sound like 'muddy' or 'the melody doesn't sing' are almost always balance problems, not volume problems.",
    how: [
      "Decide which voice leads in each phrase, then set the balance deliberately.",
      "Play the voices separately first: melody alone, then bass alone, then together.",
      "Balance is relative: quieten the accompaniment rather than pushing the melody.",
    ],
    materials: ["Sor, studies", "Bach, lute suites (transcribed)", "Any two-voice texture"],
    focusLabel: "Melody doesn't sing over the bass",
    focusHint: "Adds voice-separation and balance blocks on two-voice passages.",
    dose: [4, 8],
    prescriptions: [
      {
        id: "thumb-voices-separate",
        name: "Voices apart, then together",
        aim: "Hear both lines before balancing them.",
        steps: [
          "Play only the melody notes of a phrase, singing them.",
          "Play only the bass, as an independent line with its own phrasing.",
          "Play together with the bass at 50% of the melody's volume.",
        ],
        minutes: 6,
        success: "Each voice is separately musical, and the melody leads when they combine.",
      },
      {
        id: "thumb-staccato",
        name: "Thumb identities",
        aim: "Separate the thumb from the fingers by feel.",
        steps: [
          "Play the bass line staccato while the fingers keep playing smoothly.",
          "Then play it legato and full while the fingers drop to a whisper.",
          "Repeat on four bars of your piece, choosing the character the music asks for.",
        ],
        minutes: 5,
        success: "You can change the bass character at will without the melody changing.",
      },
    ],
  },
  {
    id: "phrasing",
    name: "Phrasing, dynamics & articulation",
    category: "phrasing",
    minLevel: "intermediate",
    priority: 2,
    highLoad: false,
    short: "Phrasing is decided, not felt — and deciding it improves memory too.",
    why:
      "Phrasing decisions make technique audible: without them, clean playing still sounds like practice. Choosing breath points, a dynamic shape, and how the melody is articulated against the accompaniment makes the playing reproducible rather than mood-dependent, and it strengthens memory because you learn musical structure instead of finger order.",
    how: [
      "Sing the phrase first, then play it with the shape you just sang.",
      "Mark the score in pencil: phrase ends, dynamic levels, articulation. Decide once, keep it.",
      "Change dynamics by shape, not by volume alone — timbre follows the hand position.",
    ],
    materials: ["Your repertoire", "A pencil", "Any recording of the piece you admire (for contrast, not imitation)"],
    focusLabel: "Playing sounds correct but not musical",
    focusHint: "Adds phrasing decisions and dynamics blocks to repertoire passes.",
    dose: [4, 8],
    prescriptions: [
      {
        id: "phrasing-sing-then-play",
        name: "Sing, then play",
        aim: "Get the shape from the ear into the hands.",
        steps: [
          "Sing one phrase out loud, in any voice, with the shape you want.",
          "Play it on the guitar with the same shape, allowing the tempo to breathe.",
          "Play the phrase again and keep only the parts of the shape you could still hear.",
        ],
        minutes: 5,
        success: "The played phrase has the same contour as the sung one.",
      },
      {
        id: "phrasing-terraced",
        name: "Terraced dynamics",
        aim: "Turn vague 'expression' into three reproducible levels.",
        steps: [
          "Choose a phrase and play it three times: at pp, at mf, at f, whatever that means on your instrument.",
          "Note which level the phrase actually wants, and how the tone changes at each level.",
          "Now use two of the three levels inside the phrase, and mark them in the score.",
        ],
        minutes: 6,
        success: "You can reproduce two distinct dynamic levels in the phrase on demand.",
      },
      {
        id: "phrasing-rubato",
        name: "Rubato sandbox",
        aim: "Choose a timing, then hold it consistent.",
        steps: [
          "Play the phrase three ways: strictly in time, easing at the phrase end, and pressing forward slightly.",
          "Choose one and play it four times identically, with a metronome on to check you did not drift.",
          "Write the choice in the score so tomorrow's practice is the same piece.",
        ],
        minutes: 6,
        success: "Four identical, intentional versions of the phrase.",
      },
    ],
  },
  {
    id: "reading",
    name: "Sight-reading",
    category: "reading",
    minLevel: "beginner",
    priority: 1,
    highLoad: false,
    short: "A separate skill from playing: it grows on easy, unfamiliar pages, read without stopping.",
    why:
      "Sight-reading improves with volume of easy, unfamiliar material read continuously — not with hard pieces. The failure mode is hesitation followed by stopping, so the rule is to keep going no matter what; a slow, uninterrupted reading with wrong notes teaches more than a careful one that stops. Because it needs a settled block of minutes, it belongs in the longer sessions rather than being crammed into a fifteen-minute day.",
    how: [
      "Material two levels below your playing level. If it feels like practice, it is too hard.",
      "Never stop. Count aloud and let wrong notes go past.",
      "Scan first: key signature, position, the bars that look awkward. Fifteen seconds, no more.",
    ],
    materials: [
      "Sagreras, Lecciones I–III",
      "Sor, 20 Studies",
      "Carcassi, op. 60",
      "Guitar duets (the best sight-reading material there is)",
    ],
    focusLabel: "Slow or shaky sight-reading",
    focusHint: "Schedules a read-through block in sessions long enough to hold it.",
    dose: [5, 10],
    prescriptions: [
      {
        id: "reading-one-page",
        name: "One page below level, no stops",
        aim: "Build the habit of continuing.",
        steps: [
          "Choose a page two levels below your playing. Scan it for fifteen seconds: key, position, awkward bars.",
          "Set a tempo you can read at, count aloud, and play from top to bottom without stopping.",
          "Mark the bars that tripped you and read only those once, slowly, at the end.",
        ],
        minutes: 8,
        tempo: "Slow enough to read, fast enough to keep going",
        success: "You reached the end without stopping, and marked the hard bars.",
      },
      {
        id: "reading-rhythm-first",
        name: "Rhythm first, notes after",
        aim: "Stop letting the notes govern the time.",
        steps: [
          "Tap or clap the rhythm of a fresh page against a slow metronome, counting aloud.",
          "Play it on open strings with the written rhythm.",
          "Play it as written. The rhythm should already be secure.",
        ],
        minutes: 7,
        success: "The written rhythm survives even where the notes are wrong.",
      },
    ],
  },
];

export const TECHNIQUE_BY_ID: Record<string, Technique> = Object.fromEntries(
  TECHNIQUES.map((t) => [t.id, t]),
);

export function technique(id: string): Technique | undefined {
  return TECHNIQUE_BY_ID[id];
}

export function focusChoices(level: Technique["minLevel"]): Technique[] {
  const order: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2, conservatoire: 3 };
  return TECHNIQUES.filter((t) => t.focusLabel && order[level] >= order[t.minLevel]);
}

export function findPrescription(techniqueId: string, prescriptionId: string): Prescription | undefined {
  return technique(techniqueId)?.prescriptions.find((p) => p.id === prescriptionId);
}

/** Warm-up routines. Chosen by level and by how much time the day has. */
export interface Warmup {
  id: string;
  name: string;
  why: string;
  steps: string[];
  minutes: number;
  minLevel: Technique["minLevel"];
  highLoad: boolean;
}

export const WARMUPS: Warmup[] = [
  {
    id: "warm-walking",
    name: "Right-hand walking p-i-m-a",
    why:
      "Wakes the fingers with motion rather than load: open strings, so the left hand stays free while the right hand recalibrates alternation and tone at low volume.",
    steps: [
      "Open strings, at 60 bpm, one stroke per click: p on 6, then i, m, a across the trebles.",
      "Rise from pp to mf over eight bars, listening for the tone staying even as the volume grows.",
      "Change the pattern once: p-i-m-a-m-i, then stop.",
    ],
    minutes: 4,
    minLevel: "beginner",
    highLoad: false,
  },
  {
    id: "warm-chromatic",
    name: "Chromatic 1-2-3-4 with the metronome",
    why:
      "Gets blood into the left hand at a tempo that cannot hurt: every finger plays every fret, slow enough to keep the hand loose and the pressure minimal.",
    steps: [
      "Frets 1-2-3-4 on the sixth string, 60 bpm, one finger per click, four times.",
      "Move up one fret each cycle: 2-3-4-5, 3-4-5-6, to the eighth fret.",
      "Keep each finger hovering a centimetre above the string.",
    ],
    minutes: 4,
    minLevel: "beginner",
    highLoad: false,
  },
  {
    id: "warm-tone-ladder",
    name: "Free-stroke tone ladder",
    why:
      "Establishes the sound of the session before any hard work: five identical notes per string is a listening task and a physical one at the same time, so the ear is calibrated first.",
    steps: [
      "On each of strings 1-3, play five i-strokes and five m-strokes at 60 bpm, making all ten as alike as possible.",
      "Note aloud which string sounds weakest.",
      "Finish with four i-m alternations on that string.",
    ],
    minutes: 5,
    minLevel: "beginner",
    highLoad: false,
  },
  {
    id: "warm-slur-wake",
    name: "Slur wake-up",
    why:
      "Prepares the left hand for the session with a short, low-dose slur set — descending pairs only, since they are the gentler direction — so nothing later in the session starts from cold fingers.",
    steps: [
      "Descending pull-offs 4-3-2-1 on each string, four times each, quiet and even.",
      "Then 2-1 pairs only, eight times, slow.",
      "Stop at the first sign of forearm fatigue; this is a warm-up, not the work.",
    ],
    minutes: 4,
    minLevel: "intermediate",
    highLoad: true,
  },
  {
    id: "warm-release",
    name: "Release and reset away from the strings",
    why:
      "Before loading the hands, check what you are bringing to the instrument: posture, shoulders, breathing. Ten minutes of practise with a braced shoulder is worth less than five without.",
    steps: [
      "Sit as you will play. Feet flat, right leg as you use it, spine long, arms hanging.",
      "Roll the shoulders back and let them drop; unclench the jaw.",
      "Play one open chord, release all pressure, and repeat three times.",
    ],
    minutes: 3,
    minLevel: "beginner",
    highLoad: false,
  },
  {
    id: "warm-arpeggio",
    name: "Arpeggio wake-up",
    why:
      "For players whose session leads with arpeggios or tremolo: one formula, slowly, warms the exact motion the session will load, and shows the state of the hand before the real work starts.",
    steps: [
      "Hold a simple chord and loop p-i-m-a-m-i at 60 bpm for sixteen repetitions.",
      "Then p-a-m-i for eight, very light.",
      "Stop while it still feels easy.",
    ],
    minutes: 5,
    minLevel: "intermediate",
    highLoad: false,
  },
];
