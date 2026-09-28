'use client';

import {useCallback, useEffect, useRef, useState} from "react";
import {Toaster, toast} from "react-hot-toast";
import {type Course, type CourseRound, type CourseStep} from "./course-types";
import {PYTHON_COURSE} from "./python-course";
import {STATISTICS_COURSE} from "./statistics-course";
import {ML_COURSE} from "./ml-course";
import {DEEP_LEARNING_COURSE} from "./deep-learning-course";
import {EXCEL_COURSE} from "./excel-course";
import {SQL_ANALYTICS_COURSE} from "./sql-analytics-course";
import {POWERBI_COURSE} from "./powerbi-course";
import {TABLEAU_COURSE} from "./tableau-course";

type CategoryKey = "data-science" | "data-analytics";

type TrackKey =
  | "python"
  | "statistics"
  | "ml"
  | "deep-learning"
  | "excel"
  | "sql-analytics"
  | "powerbi"
  | "tableau";

type TrackConfig = {
  id: TrackKey;
  title: string;
  subtitle: string;
  intro: string;
  badge: string;
  gradient: string;
  panel: string;
  border: string;
  chip: string;
  examples: string[];
  course: Course;
};

type CategoryConfig = {
  title: string;
  subtitle: string;
  intro: string;
  badge: string;
  gradient: string;
  panel: string;
  border: string;
  chip: string;
  tracks: TrackConfig[];
};

type FeedbackKind = "correct" | "wrong" | "revealed" | "nailed" | "review";

type FeedbackState = {
  kind: FeedbackKind;
  message: string;
};

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  hue: number;
  shape: "square" | "circle";
};

type CourseProgressSnapshot = {
  roundIndex: number;
  roundStartCredits: number;
  stepOrder: number[];
  optionOrders: Record<string, number[]>;
  courseStepIndex: number;
  revealUsed: boolean;
  credits: number;
  streak: number;
  wrongAttempts: number;
  completed: boolean;
};

function getCourseStorageKey(trackId: TrackKey) {
  return `dsforge-${trackId}-progress-v1`;
}

const LEARNING_TRACKS: Record<CategoryKey, CategoryConfig> = {
  "data-science": {
    title: "Data Science",
    subtitle: "Modeling, statistics, and the math behind predictions",
    intro:
      "Choose a data science specialty and practice the concepts and interview questions real hiring loops ask.",
    badge: "Modeling path",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(16,185,129,0.16)]",
    border: "border-emerald-300/20",
    chip: "border-emerald-300/20 bg-emerald-400/10 text-emerald-50",
    tracks: [
      {
        id: "python",
        title: "Python",
        subtitle: "The core language of modern data work",
        intro:
          "A two-round Python course. Round 1 covers syntax, data structures, and pandas/NumPy basics. Round 2 unlocks real interview questions on performance, pipelines, and design.",
        badge: "Core language",
        gradient: "from-emerald-400 via-teal-500 to-cyan-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(16,185,129,0.16)]",
        border: "border-emerald-300/20",
        chip: "border-emerald-300/20 bg-emerald-400/10 text-emerald-50",
        examples: ["Round 1", "Round 2", "pandas", "NumPy"],
        course: PYTHON_COURSE,
      },
      {
        id: "statistics",
        title: "Statistics & Probability",
        subtitle: "The math every data decision rests on",
        intro:
          "A two-round Statistics course. Round 1 covers distributions, hypothesis testing, and core probability. Round 2 unlocks real interview questions on A/B tests and experiment design.",
        badge: "Foundational math",
        gradient: "from-cyan-400 via-emerald-500 to-teal-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(45,212,191,0.16)]",
        border: "border-teal-300/20",
        chip: "border-teal-300/20 bg-teal-400/10 text-teal-50",
        examples: ["Round 1", "Round 2", "Hypothesis testing", "A/B tests"],
        course: STATISTICS_COURSE,
      },
      {
        id: "ml",
        title: "Machine Learning",
        subtitle: "Models that learn patterns from data",
        intro:
          "A two-round Machine Learning course. Round 1 covers core algorithms and evaluation. Round 2 unlocks real interview questions on model selection and production tradeoffs.",
        badge: "Predictive modeling",
        gradient: "from-teal-400 via-cyan-500 to-indigo-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(20,184,166,0.16)]",
        border: "border-cyan-300/20",
        chip: "border-cyan-300/20 bg-cyan-400/10 text-cyan-50",
        examples: ["Round 1", "Round 2", "Bias-variance", "Cross-validation"],
        course: ML_COURSE,
      },
      {
        id: "deep-learning",
        title: "Deep Learning",
        subtitle: "Neural networks for vision, language, and beyond",
        intro:
          "A two-round Deep Learning course. Round 1 covers neural net fundamentals. Round 2 unlocks real interview questions on architectures and training in practice.",
        badge: "Neural networks",
        gradient: "from-indigo-400 via-violet-500 to-fuchsia-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(129,140,248,0.16)]",
        border: "border-indigo-300/20",
        chip: "border-indigo-300/20 bg-indigo-400/10 text-indigo-50",
        examples: ["Round 1", "Round 2", "CNNs", "Transformers"],
        course: DEEP_LEARNING_COURSE,
      },
    ],
  },
  "data-analytics": {
    title: "Data Analytics",
    subtitle: "Turning raw data into dashboards and decisions",
    intro:
      "Choose a data analytics tool and practice the concepts and interview questions real hiring loops ask.",
    badge: "Insights path",
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(251,191,36,0.14)]",
    border: "border-amber-300/20",
    chip: "border-amber-300/20 bg-amber-400/10 text-amber-50",
    tracks: [
      {
        id: "excel",
        title: "Excel",
        subtitle: "Still the analyst's everyday power tool",
        intro:
          "A two-round Excel course. Round 1 covers formulas, PivotTables, and Power Query. Round 2 unlocks real interview questions on cleaning and reconciling data.",
        badge: "Everyday tool",
        gradient: "from-emerald-400 via-lime-500 to-amber-400",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(132,204,22,0.14)]",
        border: "border-lime-300/20",
        chip: "border-lime-300/20 bg-lime-400/10 text-lime-50",
        examples: ["Round 1", "Round 2", "PivotTables", "Power Query"],
        course: EXCEL_COURSE,
      },
      {
        id: "sql-analytics",
        title: "SQL for Analytics",
        subtitle: "Answering business questions with queries",
        intro:
          "A two-round SQL for Analytics course. Round 1 covers joins, window functions, and CTEs. Round 2 unlocks real interview questions on business-metric queries.",
        badge: "Query the business",
        gradient: "from-amber-400 via-orange-500 to-red-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(249,115,22,0.16)]",
        border: "border-orange-300/20",
        chip: "border-orange-300/20 bg-orange-400/10 text-orange-50",
        examples: ["Round 1", "Round 2", "Window functions", "CTEs"],
        course: SQL_ANALYTICS_COURSE,
      },
      {
        id: "powerbi",
        title: "Power BI",
        subtitle: "Microsoft's modeling and dashboard platform",
        intro:
          "A two-round Power BI course. Round 1 covers the data model and DAX basics. Round 2 unlocks real interview questions on CALCULATE and dashboard design.",
        badge: "DAX & dashboards",
        gradient: "from-yellow-400 via-amber-500 to-orange-500",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(245,158,11,0.16)]",
        border: "border-yellow-300/20",
        chip: "border-yellow-300/20 bg-yellow-400/10 text-yellow-50",
        examples: ["Round 1", "Round 2", "DAX", "Star schema"],
        course: POWERBI_COURSE,
      },
      {
        id: "tableau",
        title: "Tableau",
        subtitle: "Best-in-class interactive visualization",
        intro:
          "A two-round Tableau course. Round 1 covers pills, marks, and LOD expressions. Round 2 unlocks real interview questions on dashboard design and performance.",
        badge: "Visual analytics",
        gradient: "from-rose-400 via-orange-500 to-amber-400",
        panel: "bg-slate-950/75 shadow-[0_30px_140px_rgba(251,113,133,0.16)]",
        border: "border-rose-300/20",
        chip: "border-rose-300/20 bg-rose-400/10 text-rose-50",
        examples: ["Round 1", "Round 2", "LOD expressions", "Dashboards"],
        course: TABLEAU_COURSE,
      },
    ],
  },
};

function getTrack(category: CategoryKey | null, trackId: TrackKey | null) {
  if (!category || !trackId) {
    return null;
  }
  return LEARNING_TRACKS[category].tracks.find((track) => track.id === trackId) ?? null;
}

function shuffleArray<T>(items: T[]) {
  const nextItems = [...items];
  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }
  return nextItems;
}

function buildOptionOrder(optionCount: number) {
  return shuffleArray(Array.from({length: optionCount}, (_, index) => index));
}

function buildStepOrder(round: CourseRound) {
  return shuffleArray(round.steps.map((_, index) => index));
}

function buildOptionOrders(round: CourseRound, stepOrder: number[]) {
  return stepOrder.reduce<Record<string, number[]>>((orders, stepIndex) => {
    const step = round.steps[stepIndex];
    if (step.kind === "mcq") {
      orders[String(stepIndex)] = buildOptionOrder(step.options.length);
    }
    return orders;
  }, {});
}

function buildRoundSnapshot(
  course: Course,
  roundIndex: number,
  carry: {credits: number; streak: number},
): CourseProgressSnapshot {
  const round = course.rounds[roundIndex];
  const stepOrder = buildStepOrder(round);
  return {
    roundIndex,
    roundStartCredits: carry.credits,
    stepOrder,
    optionOrders: buildOptionOrders(round, stepOrder),
    courseStepIndex: 0,
    revealUsed: false,
    credits: carry.credits,
    streak: carry.streak,
    wrongAttempts: 0,
    completed: false,
  };
}

function readProgressSnapshot(trackId: TrackKey, course: Course) {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(getCourseStorageKey(trackId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<CourseProgressSnapshot>;
    if (!Array.isArray(parsed.stepOrder) || typeof parsed.courseStepIndex !== "number") {
      return null;
    }
    const roundIndex = parsed.roundIndex ?? 0;
    const round = Number.isInteger(roundIndex) ? course.rounds[roundIndex] : undefined;
    if (!round) {
      return null;
    }
    const stepOrder = parsed.stepOrder.filter((item): item is number => Number.isInteger(item));
    const isValidStepOrder =
      stepOrder.length === round.steps.length &&
      new Set(stepOrder).size === round.steps.length &&
      stepOrder.every((item) => item >= 0 && item < round.steps.length);
    if (!isValidStepOrder) {
      return null;
    }
    const optionOrders =
      parsed.optionOrders && typeof parsed.optionOrders === "object"
        ? Object.entries(parsed.optionOrders).reduce<Record<string, number[]>>((orders, [key, value]) => {
            if (Array.isArray(value) && value.every((item) => Number.isInteger(item))) {
              orders[key] = value;
            }
            return orders;
          }, {})
        : {};
    return {
      roundIndex,
      roundStartCredits: typeof parsed.roundStartCredits === "number" ? parsed.roundStartCredits : 0,
      stepOrder,
      optionOrders,
      courseStepIndex: Math.max(0, parsed.courseStepIndex),
      revealUsed: Boolean(parsed.revealUsed),
      credits: typeof parsed.credits === "number" ? parsed.credits : 0,
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      wrongAttempts: typeof parsed.wrongAttempts === "number" ? parsed.wrongAttempts : 0,
      completed: Boolean(parsed.completed),
    } satisfies CourseProgressSnapshot;
  } catch {
    return null;
  }
}

function saveProgressSnapshot(trackId: TrackKey, snapshot: CourseProgressSnapshot) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(getCourseStorageKey(trackId), JSON.stringify(snapshot));
}

function clearProgressSnapshot(trackId: TrackKey) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(getCourseStorageKey(trackId));
}

function describeStep(step: CourseStep | null, round?: CourseRound | null) {
  if (!step) {
    return round?.title ?? "Course";
  }
  const label =
    step.kind === "mcq"
      ? `${step.sectionTitle} ${step.stepNumber} of ${step.stepTotal}`
      : `${step.topicTitle} ${step.stepNumber} of ${step.stepTotal}`;
  return round ? `${round.title} · ${label}` : label;
}

function getSnapshotStep(course: Course, snapshot: CourseProgressSnapshot) {
  const round = course.rounds[snapshot.roundIndex] ?? null;
  const step = round?.steps[snapshot.stepOrder[snapshot.courseStepIndex] ?? -1] ?? null;
  return {round, step};
}

function calculateMcqCredits(wrongAttempts: number, revealUsed: boolean) {
  if (revealUsed) {
    return 0;
  }
  const multipliers = [1, 0.85, 0.7, 0.55, 0.4];
  const multiplier = multipliers[Math.min(wrongAttempts, multipliers.length - 1)];
  return Math.max(Math.round(10 * multiplier), 1);
}

function getCreditMedal(credits: number) {
  if (credits >= 180) {
    return {
      tier: "Gold",
      description: "Outstanding work. You earned a gold medal.",
      color: "from-amber-300 via-yellow-400 to-orange-400",
      border: "border-amber-300/40",
    };
  }
  if (credits >= 120) {
    return {
      tier: "Silver",
      description: "Strong progress. You earned a silver medal.",
      color: "from-slate-200 via-slate-300 to-slate-400",
      border: "border-slate-300/40",
    };
  }
  if (credits >= 70) {
    return {
      tier: "Bronze",
      description: "Good effort. You earned a bronze medal.",
      color: "from-orange-300 via-amber-400 to-yellow-500",
      border: "border-orange-300/40",
    };
  }
  return {
    tier: "Training",
    description: "Keep earning credits to enter the medal board.",
    color: "from-emerald-300 via-teal-400 to-cyan-500",
    border: "border-emerald-300/30",
  };
}

const JOB_ROLES = ["Data Analyst", "Data Scientist", "ML Engineer", "BI Developer", "Data Engineer"];

const JOB_RANKS = [
  {min: 0, label: "Intern", icon: "🌱"},
  {min: 50, label: "Junior Analyst", icon: "💻"},
  {min: 150, label: "Data Analyst", icon: "📊"},
  {min: 300, label: "Senior Analyst", icon: "🚀"},
  {min: 450, label: "Lead Data Scientist", icon: "🏆"},
];

function getJobRank(credits: number) {
  const index = JOB_RANKS.reduce((best, rank, i) => (credits >= rank.min ? i : best), 0);
  return {current: JOB_RANKS[index], next: JOB_RANKS[index + 1] ?? null};
}

function RoleTypewriter() {
  const [text, setText] = useState("");

  useEffect(() => {
    let role = 0;
    let chars = 0;
    let deleting = false;
    let timer: number;
    const tick = () => {
      const word = JOB_ROLES[role];
      chars += deleting ? -1 : 1;
      setText(word.slice(0, chars));
      let delay = deleting ? 40 : 90;
      if (!deleting && chars === word.length) {
        deleting = true;
        delay = 1400;
      } else if (deleting && chars === 0) {
        deleting = false;
        role = (role + 1) % JOB_ROLES.length;
        delay = 300;
      }
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, 400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <span className="grid bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500 bg-clip-text text-transparent">
      <span aria-hidden className="invisible col-start-1 row-start-1">
        Lead Data Scientist|
      </span>
      <span className="col-start-1 row-start-1">
        {text}
        <span className="caret-blink">|</span>
      </span>
    </span>
  );
}

function ConfettiBurst({burst, onDone}: {burst: {id: number; pieces: ConfettiPiece[]} | null; onDone: () => void}) {
  useEffect(() => {
    if (!burst) {
      return;
    }
    const timer = window.setTimeout(onDone, 1300);
    return () => window.clearTimeout(timer);
  }, [burst, onDone]);

  if (!burst) {
    return null;
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {burst.pieces.map((piece) => (
        <span
          key={piece.id}
          className={`confetti-piece ${piece.shape === "circle" ? "rounded-full" : "rounded-sm"}`}
          style={{
            left: `${piece.left}%`,
            width: piece.shape === "circle" ? "8px" : "9px",
            height: piece.shape === "circle" ? "8px" : "14px",
            background: `hsl(${piece.hue}, 85%, 60%)`,
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${piece.duration}ms`,
            // @ts-expect-error custom property consumed by the confetti-fall keyframes
            "--drift": `${piece.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

function buildConfettiBurst(): {id: number; pieces: ConfettiPiece[]} {
  const pieceCount = 36;
  return {
    id: Date.now(),
    pieces: Array.from({length: pieceCount}, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: Math.random() * 200,
      duration: 1100 + Math.random() * 700,
      drift: (Math.random() - 0.5) * 160,
      hue: Math.floor(Math.random() * 360),
      shape: Math.random() > 0.5 ? "circle" : "square",
    })),
  };
}

function CategoryCard({category, onChoose}: {category: CategoryKey; onChoose: (category: CategoryKey) => void}) {
  const config = LEARNING_TRACKS[category];
  return (
    <button
      type="button"
      onClick={() => onChoose(category)}
      className={`group relative overflow-hidden rounded-[2rem] border ${config.border} ${config.panel} p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-white/20`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${config.gradient}`} />
      <div className="flex items-center justify-between gap-4">
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${config.chip}`}>
          {config.badge}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80">Start</span>
      </div>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-white">{config.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300/90">{config.subtitle}</p>
        <p className="mt-4 text-sm leading-6 text-slate-400">{config.intro}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {config.tracks.map((track) => (
          <span key={track.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80">
            {track.title}
          </span>
        ))}
      </div>
      <div className="mt-6 text-sm font-medium text-slate-100 transition group-hover:text-white">
        Pick this lane and then choose a specific tech.
      </div>
    </button>
  );
}

function TrackCard({track, onChoose}: {track: TrackConfig; onChoose: (trackId: TrackKey) => void}) {
  return (
    <button
      type="button"
      onClick={() => onChoose(track.id)}
      className={`group relative overflow-hidden rounded-[1.75rem] border ${track.border} ${track.panel} p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-white/20`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${track.gradient}`} />
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${track.chip}`}>
          {track.badge}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80">Select</span>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{track.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{track.subtitle}</p>
      <p className="mt-4 text-sm leading-6 text-slate-400">{track.intro}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {track.examples.map((item) => (
          <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/80">
            {item}
          </span>
        ))}
      </div>
    </button>
  );
}

function ChoiceButton({
  label,
  index,
  selectedChoice,
  feedback,
  onChoose,
}: {
  label: string;
  index: number;
  selectedChoice: number | null;
  feedback: FeedbackState | null;
  onChoose: (index: number) => void;
}) {
  const isSelected = selectedChoice === index;
  const isCorrect = feedback?.kind === "correct" && isSelected;
  const isWrong = feedback?.kind === "wrong" && isSelected;
  const isRevealed = feedback?.kind === "revealed" && isSelected;
  const isLocked = feedback?.kind === "correct";

  return (
    <button
      type="button"
      onClick={() => onChoose(index)}
      disabled={isLocked && !isSelected}
      className={`min-h-[4.5rem] rounded-2xl border px-4 py-4 text-left text-sm font-medium transition duration-200 ${
        isCorrect
          ? "border-emerald-300/60 bg-emerald-400/15 text-emerald-50 shadow-[0_12px_40px_rgba(16,185,129,0.18)]"
          : isWrong
            ? "border-rose-300/60 bg-rose-400/15 text-rose-50"
            : isRevealed
              ? "border-amber-300/60 bg-amber-400/15 text-amber-50 shadow-[0_12px_40px_rgba(251,191,36,0.18)]"
              : isLocked
                ? "border-white/10 bg-white/5 text-slate-400 opacity-70"
                : "border-white/10 bg-white/5 text-slate-100 hover:border-emerald-300/50 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<TrackKey | null>(null);
  const [courseStepIndex, setCourseStepIndex] = useState(0);
  const [courseStepOrder, setCourseStepOrder] = useState<number[]>([]);
  const [courseOptionOrders, setCourseOptionOrders] = useState<Record<string, number[]>>({});
  const [courseResumeSnapshot, setCourseResumeSnapshot] = useState<CourseProgressSnapshot | null>(null);
  const [courseSessionReady, setCourseSessionReady] = useState(false);
  const [courseRoundIndex, setCourseRoundIndex] = useState(0);
  const [courseRoundStartCredits, setCourseRoundStartCredits] = useState(0);
  const [revealUsed, setRevealUsed] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [interviewRevealed, setInterviewRevealed] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [confettiBurst, setConfettiBurst] = useState<{id: number; pieces: ConfettiPiece[]} | null>(null);
  const [credits, setCredits] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [roundJustCompleted, setRoundJustCompleted] = useState<CourseRound | null>(null);
  const advanceTimerRef = useRef<number | null>(null);

  const clearAdvanceTimer = () => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  };

  useEffect(() => () => clearAdvanceTimer(), []);

  const clearConfetti = useCallback(() => setConfettiBurst(null), []);
  const triggerConfetti = () => setConfettiBurst(buildConfettiBurst());

  const resetCourseRounds = () => {
    setCourseRoundIndex(0);
    setCourseRoundStartCredits(0);
    setRoundJustCompleted(null);
  };

  const resetProgress = () => {
    clearAdvanceTimer();
    resetCourseRounds();
    setConfettiBurst(null);
    setCourseStepIndex(0);
    setCourseStepOrder([]);
    setCourseOptionOrders({});
    setCourseSessionReady(false);
    setRevealUsed(false);
    setSelectedChoice(null);
    setInterviewRevealed(false);
    setFeedback(null);
    setCredits(0);
    setStreak(0);
    setWrongAttempts(0);
    setCompleted(false);
  };

  const continueSession = (snapshot: CourseProgressSnapshot) => {
    clearAdvanceTimer();
    setConfettiBurst(null);
    setRoundJustCompleted(null);
    setCourseStepOrder(snapshot.stepOrder);
    setCourseOptionOrders(snapshot.optionOrders);
    setCourseStepIndex(Math.min(snapshot.courseStepIndex, snapshot.stepOrder.length - 1));
    setSelectedChoice(null);
    setInterviewRevealed(false);
    setFeedback(null);
    setCredits(snapshot.credits);
    setStreak(snapshot.streak);
    setWrongAttempts(snapshot.wrongAttempts);
    setCompleted(false);
    setCourseSessionReady(true);
    setRevealUsed(Boolean(snapshot.revealUsed));
    setCourseResumeSnapshot(null);
    setCourseRoundIndex(snapshot.roundIndex);
    setCourseRoundStartCredits(snapshot.roundStartCredits);
  };

  const startRound = (course: Course, roundIndex: number) => {
    continueSession(buildRoundSnapshot(course, roundIndex, {credits: 0, streak: 0}));
  };

  const createFreshSession = (trackId: TrackKey, course: Course) => {
    startRound(course, 0);
    clearProgressSnapshot(trackId);
  };

  const handleCategorySelect = (category: CategoryKey) => {
    resetProgress();
    setSelectedCategory(category);
    setSelectedTrack(null);
    toast.success(`You chose ${LEARNING_TRACKS[category].title}. Now pick a technology.`);
  };

  const handleTrackSelect = (trackId: TrackKey) => {
    if (!selectedCategory) {
      return;
    }
    resetProgress();
    setSelectedTrack(trackId);

    const track = getTrack(selectedCategory, trackId);
    if (!track) {
      return;
    }

    const savedSnapshot = readProgressSnapshot(trackId, track.course);
    if (savedSnapshot && !savedSnapshot.completed) {
      const {round, step} = getSnapshotStep(track.course, savedSnapshot);
      setCourseResumeSnapshot(savedSnapshot);
      toast.success(`You left off at ${describeStep(step, round)}. Continue or start fresh.`);
      return;
    }

    createFreshSession(trackId, track.course);
    toast.success(`Great choice. Let's practice ${track.title}.`);
  };

  const goBackToCategories = () => {
    resetProgress();
    setSelectedCategory(null);
    setSelectedTrack(null);
    setCourseResumeSnapshot(null);
  };

  const goBackToTracks = () => {
    resetProgress();
    setSelectedTrack(null);
    setCourseResumeSnapshot(null);
  };

  const currentTrack = getTrack(selectedCategory, selectedTrack);
  const currentCourse = currentTrack?.course ?? null;
  const currentStepIndex = currentTrack && courseSessionReady ? courseStepOrder[courseStepIndex] ?? null : null;
  const currentRound = currentCourse?.rounds[courseRoundIndex] ?? null;
  const lastRoundIndex = (currentCourse?.rounds.length ?? 1) - 1;
  const currentStep = currentStepIndex !== null ? currentRound?.steps[currentStepIndex] ?? null : null;
  const totalSteps = currentRound?.steps.length ?? 0;
  const hasCourse = Boolean(currentTrack);
  const progress = hasCourse ? ((courseStepIndex + (completed ? 1 : 0)) / Math.max(totalSteps, 1)) * 100 : 0;
  const currentOptionOrder =
    currentStep?.kind === "mcq"
      ? courseOptionOrders[String(currentStepIndex ?? -1)] ?? currentStep.options.map((_, index) => index)
      : [];
  const canRevealMcq = !completed && wrongAttempts >= 5 && !revealUsed;
  const courseResumePoint = courseResumeSnapshot && currentCourse ? getSnapshotStep(currentCourse, courseResumeSnapshot) : null;
  const showResumePrompt = Boolean(currentTrack) && Boolean(courseResumeSnapshot) && !courseSessionReady && !completed;
  const resumeStepLabel = describeStep(courseResumePoint?.step ?? null, courseResumePoint?.round);
  const roundCredits = hasCourse ? credits - courseRoundStartCredits : credits;
  const currentMedal = getCreditMedal(roundCredits);
  const jobRank = getJobRank(credits);

  useEffect(() => {
    if (!hasCourse || !selectedTrack || !currentRound || !courseSessionReady || !currentStep || completed) {
      return;
    }
    const stepOrder = courseStepOrder.length ? courseStepOrder : currentRound.steps.map((_, index) => index);
    saveProgressSnapshot(selectedTrack, {
      roundIndex: courseRoundIndex,
      roundStartCredits: courseRoundStartCredits,
      stepOrder,
      optionOrders: courseOptionOrders,
      courseStepIndex,
      revealUsed,
      credits,
      streak,
      wrongAttempts,
      completed,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCourse, selectedTrack, courseSessionReady, currentStep, completed, credits, streak, wrongAttempts, revealUsed, courseStepIndex]);

  const finishCourse = (message: string) => {
    setCompleted(true);
    setSelectedChoice(null);
    setInterviewRevealed(false);
    setFeedback({kind: "correct", message});
    if (selectedTrack) {
      clearProgressSnapshot(selectedTrack);
    }
    setCourseSessionReady(false);
    setCourseResumeSnapshot(null);
  };

  const advanceStep = (nextCredits: number, nextStreak: number, delay: number) => {
    clearAdvanceTimer();
    advanceTimerRef.current = window.setTimeout(() => {
      advanceTimerRef.current = null;
      setSelectedChoice(null);
      setInterviewRevealed(false);
      setWrongAttempts(0);
      setRevealUsed(false);

      const isFinalStep = courseStepIndex === totalSteps - 1;
      if (!isFinalStep) {
        setCourseStepIndex((value) => value + 1);
        setFeedback(null);
        return;
      }

      const nextRoundIndex = courseRoundIndex + 1;
      if (nextRoundIndex <= lastRoundIndex && currentCourse && selectedTrack) {
        const nextRoundSnapshot = buildRoundSnapshot(currentCourse, nextRoundIndex, {
          credits: nextCredits,
          streak: nextStreak,
        });
        saveProgressSnapshot(selectedTrack, nextRoundSnapshot);
        setRoundJustCompleted(currentRound);
        setCourseSessionReady(false);
        setFeedback(null);
        toast.success(`${currentRound?.title ?? "Round"} complete!`);
        return;
      }

      finishCourse(`${currentTrack?.title ?? "Course"} complete. You finished every round of practice.`);
    }, delay);
  };

  const beginNextRound = () => {
    if (!currentCourse || !selectedTrack) {
      return;
    }
    const nextRoundIndex = courseRoundIndex + 1;
    const snapshot = readProgressSnapshot(selectedTrack, currentCourse);
    if (snapshot && snapshot.roundIndex === nextRoundIndex) {
      continueSession(snapshot);
    } else {
      startRound(currentCourse, nextRoundIndex);
    }
    toast.success(`${currentCourse.rounds[nextRoundIndex].title} unlocked. Good luck!`);
  };

  const handleRevealMcq = () => {
    if (completed || !canRevealMcq || currentStep?.kind !== "mcq") {
      return;
    }
    setRevealUsed(true);
    const correctDisplayIndex = currentOptionOrder.findIndex((optionIndex) => optionIndex === currentStep.correctIndex);
    setSelectedChoice(correctDisplayIndex >= 0 ? correctDisplayIndex : null);
    setFeedback({
      kind: "revealed",
      message: `Revealed answer: ${currentStep.options[currentStep.correctIndex]}. Select that option to continue, but this question earns no credits now.`,
    });
    toast("Answer revealed. No credits will be awarded for this question.");
  };

  const handleChoice = (choiceIndex: number) => {
    if (completed || feedback?.kind === "correct" || currentStep?.kind !== "mcq") {
      return;
    }
    setSelectedChoice(choiceIndex);
    const actualChoiceIndex = currentOptionOrder[choiceIndex];
    const correctAnswer = currentStep.options[currentStep.correctIndex];
    const reward = calculateMcqCredits(wrongAttempts, revealUsed);

    if (actualChoiceIndex === currentStep.correctIndex) {
      const nextStreak = revealUsed ? streak : streak + 1;
      const bonus = !revealUsed && nextStreak % 3 === 0 && reward > 0 ? 5 : 0;
      const earned = reward + bonus;

      setCredits((value) => value + earned);
      setStreak(nextStreak);
      setWrongAttempts(0);
      setFeedback({
        kind: revealUsed ? "revealed" : "correct",
        message: revealUsed
          ? "Revealed answer accepted. No credits were awarded for this question."
          : bonus
            ? `Correct. +${earned} credits with a streak bonus.`
            : `Correct. +${earned} credits.`,
      });
      if (!revealUsed) {
        toast.success(bonus ? `Correct. +${earned} credits and a streak bonus.` : `Correct. +${earned} credits.`);
        triggerConfetti();
      } else {
        toast("Answer revealed. No credits earned for this question.");
      }
      advanceStep(credits + earned, nextStreak, 950);
      return;
    }

    if (revealUsed) {
      const correctDisplayIndex = currentOptionOrder.findIndex((optionIndex) => optionIndex === currentStep.correctIndex);
      setSelectedChoice(correctDisplayIndex >= 0 ? correctDisplayIndex : null);
      setFeedback({
        kind: "revealed",
        message: `The revealed answer is ${correctAnswer}. Select that option to continue, but this question does not earn credits now.`,
      });
      toast("The answer is already revealed.");
      return;
    }

    setStreak(0);
    setWrongAttempts((value) => value + 1);
    setFeedback({kind: "wrong", message: "Not quite. Try again and think about the concept."});
    toast.error("Not quite. Try again.");
  };

  const handleRevealInterview = () => {
    if (completed || currentStep?.kind !== "interview" || interviewRevealed) {
      return;
    }
    setInterviewRevealed(true);
  };

  const handleInterviewRating = (rating: "nailed" | "review") => {
    if (completed || currentStep?.kind !== "interview" || !interviewRevealed) {
      return;
    }
    const earned = rating === "nailed" ? 15 : 5;
    const nextStreak = rating === "nailed" ? streak + 1 : 0;

    setCredits((value) => value + earned);
    setStreak(nextStreak);
    setFeedback({
      kind: rating,
      message:
        rating === "nailed"
          ? `Nice. +${earned} credits for a solid answer.`
          : `+${earned} credits for working through it. Revisit this topic later.`,
    });

    if (rating === "nailed") {
      toast.success(`+${earned} credits.`);
      triggerConfetti();
    } else {
      toast(`+${earned} credits. Keep this one on your review list.`);
    }
    advanceStep(credits + earned, nextStreak, 900);
  };

  return (
    <>
      <ConfettiBurst burst={confettiBurst} onDone={clearConfetti} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(11, 15, 26, 0.96)",
            color: "#e2e8f0",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            borderRadius: "16px",
            boxShadow: "0 24px 80px rgba(2, 8, 23, 0.35)",
          },
        }}
      />

      <main className="relative min-h-screen overflow-hidden bg-[#0b0f1a] px-4 py-6 text-slate-100 sm:px-6 lg:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute orb-float left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="absolute orb-float orb-float-slow right-[-6rem] top-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-[-7rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
          {!selectedCategory ? (
            <section className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100">
                  Interactive data trainer
                </span>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Practice real questions. Land a job as a <RoleTypewriter />
                </h1>
                <p className="mt-4 text-lg font-medium text-slate-200">
                  Pick Data Science or Data Analytics, choose your tech, and level up from Intern to Lead Data Scientist.
                </p>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  First choose the domain, then the specific technology.
                  Round 1 is a 20-question MCQ warm-up; Round 2 unlocks 15
                  real interview-style questions with model answers to reveal.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200/85">
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Step 1: choose a domain</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Step 2: choose a tech</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Step 3: answer and earn credits</span>
                  <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-amber-100">
                    🎯 Interview-style questions
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Other area to study
                  </span>
                  <a
                    href="https://dataforge-db.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:brightness-110"
                  >
                    SQL / NoSQL
                  </a>
                </div>
              </div>

              <div className="grid gap-4">
                <CategoryCard category="data-science" onChoose={handleCategorySelect} />
                <CategoryCard category="data-analytics" onChoose={handleCategorySelect} />
              </div>
            </section>
          ) : !selectedTrack ? (
            <section
              className={`relative w-full overflow-hidden rounded-[2rem] border ${LEARNING_TRACKS[selectedCategory].border} ${LEARNING_TRACKS[selectedCategory].panel} p-6 shadow-2xl sm:p-8 lg:p-10`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${LEARNING_TRACKS[selectedCategory].gradient}`} />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${LEARNING_TRACKS[selectedCategory].chip}`}
                  >
                    Step 2 of 2
                  </span>
                  <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
                    Choose your {LEARNING_TRACKS[selectedCategory].title} technology.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    Pick the specific tech you want to practice. We will tailor
                    the questions and interview prep to it.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goBackToCategories}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Back to domains
                </button>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {LEARNING_TRACKS[selectedCategory].tracks.map((track) => (
                  <TrackCard key={track.id} track={track} onChoose={handleTrackSelect} />
                ))}
              </div>
            </section>
          ) : completed && currentTrack ? (
            <section className={`relative w-full overflow-hidden rounded-[2rem] border ${currentTrack.border} ${currentTrack.panel} p-6 shadow-2xl sm:p-8 lg:p-10`}>
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${currentTrack.gradient}`} />
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${currentTrack.chip}`}>
                    Completed
                  </span>
                  <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
                    Great work. You completed the full {currentTrack.title} course.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    You finished all {currentTrack.course.rounds.length} rounds of {currentTrack.title} practice,
                    from foundations through real interview-style questions. That is a real win.
                  </p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Credits</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{credits}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Final streak</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{streak}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Path</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {selectedCategory === "data-science" ? "Data Science" : "Data Analytics"} / {currentTrack.title}
                      </p>
                    </div>
                  </div>
                  <div className={`mt-6 rounded-3xl border ${currentMedal.border} bg-gradient-to-br ${currentMedal.color} p-[1px]`}>
                    <div className="rounded-[1.45rem] bg-slate-950/90 p-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Medal board</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                          {currentMedal.tier}
                        </span>
                        <p className="text-sm leading-6 text-slate-200">{currentMedal.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedTrack) {
                          createFreshSession(selectedTrack, currentTrack.course);
                          setCompleted(false);
                          toast.success(`Restarted ${currentTrack.title}.`);
                        }
                      }}
                      className={`rounded-full bg-gradient-to-r ${currentTrack.gradient} px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110`}
                    >
                      Play again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        startRound(currentTrack.course, lastRoundIndex);
                        toast.success(`Replaying ${currentTrack.course.rounds[lastRoundIndex].title}.`);
                      }}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Replay {currentTrack.course.rounds[lastRoundIndex].title}
                    </button>
                    <button
                      type="button"
                      onClick={goBackToTracks}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Choose another tech
                    </button>
                    <button
                      type="button"
                      onClick={goBackToCategories}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      Choose another domain
                    </button>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Career rank</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="rank-chip flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/40 bg-amber-400/10 text-2xl">
                      {jobRank.current.icon}
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-white">{jobRank.current.label}</p>
                      {jobRank.next && <p className="text-xs text-slate-400">{jobRank.next.min - credits} credits to {jobRank.next.label}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : roundJustCompleted && currentTrack && currentCourse ? (
            <section className={`relative w-full overflow-hidden rounded-[2rem] border ${currentTrack.border} ${currentTrack.panel} p-6 shadow-2xl sm:p-8 lg:p-10`}>
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${currentTrack.gradient}`} />
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${currentTrack.chip}`}>
                Round complete
              </span>
              <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
                {roundJustCompleted.title} done. {currentCourse.rounds[courseRoundIndex + 1]?.title} is unlocked.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                {currentCourse.rounds[courseRoundIndex + 1]?.summary}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={beginNextRound}
                  className={`rounded-full bg-gradient-to-r ${currentTrack.gradient} px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110`}
                >
                  Start {currentCourse.rounds[courseRoundIndex + 1]?.title}
                </button>
                <button
                  type="button"
                  onClick={goBackToTracks}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Choose another tech
                </button>
              </div>
            </section>
          ) : showResumePrompt && currentTrack && currentCourse ? (
            <section className={`relative w-full overflow-hidden rounded-[2rem] border ${currentTrack.border} ${currentTrack.panel} p-6 shadow-2xl sm:p-8 lg:p-10`}>
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${currentTrack.gradient}`} />
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Welcome back to {currentTrack.title}.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                You left off at <span className="font-semibold text-white">{resumeStepLabel}</span>. Continue where you left off, or start fresh.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => courseResumeSnapshot && continueSession(courseResumeSnapshot)}
                  className={`rounded-full bg-gradient-to-r ${currentTrack.gradient} px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110`}
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedTrack) {
                      createFreshSession(selectedTrack, currentCourse);
                      toast.success("Started a fresh run.");
                    }
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Start fresh
                </button>
                <button
                  type="button"
                  onClick={goBackToTracks}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                >
                  Choose another tech
                </button>
              </div>
            </section>
          ) : currentTrack && currentStep && currentRound ? (
            <section className={`relative w-full overflow-hidden rounded-[2rem] border ${currentTrack.border} ${currentTrack.panel} p-6 shadow-2xl sm:p-8 lg:p-10`}>
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${currentTrack.gradient}`} />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${currentTrack.chip}`}>
                    {currentRound.title}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-300">{describeStep(currentStep)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
                    💰 {credits} credits
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
                    🔥 Streak {streak}
                  </span>
                  <button
                    type="button"
                    onClick={goBackToTracks}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-100 transition hover:bg-white/10"
                  >
                    Exit
                  </button>
                </div>
              </div>

              <div className="progress-shimmer mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${currentTrack.gradient} transition-all duration-500`}
                  style={{width: `${Math.max(progress, 4)}%`}}
                />
              </div>

              <h2 className="mt-8 text-2xl font-semibold text-white sm:text-3xl">{currentStep.prompt}</h2>

              {currentStep.kind === "mcq" ? (
                <>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {currentOptionOrder.map((optionIndex, displayIndex) => (
                      <ChoiceButton
                        key={optionIndex}
                        label={currentStep.options[optionIndex]}
                        index={displayIndex}
                        selectedChoice={selectedChoice}
                        feedback={feedback}
                        onChoose={handleChoice}
                      />
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {canRevealMcq && (
                      <button
                        type="button"
                        onClick={handleRevealMcq}
                        className="rounded-full border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20"
                      >
                        Reveal answer
                      </button>
                    )}
                    {wrongAttempts > 0 && !canRevealMcq && !revealUsed && (
                      <span className="text-xs text-slate-400">
                        Answer reveals after {5 - wrongAttempts} more wrong attempt{5 - wrongAttempts === 1 ? "" : "s"}.
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-6 space-y-4">
                  {!interviewRevealed ? (
                    <button
                      type="button"
                      onClick={handleRevealInterview}
                      className={`rounded-full bg-gradient-to-r ${currentTrack.gradient} px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110`}
                    >
                      Think it through, then reveal the model answer
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">Model answer</p>
                        <p className="mt-3 text-sm leading-6 text-slate-100">{currentStep.modelAnswer}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">What the interviewer is testing</p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">{currentStep.explanation}</p>
                      </div>
                      {feedback?.kind !== "nailed" && feedback?.kind !== "review" && (
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleInterviewRating("nailed")}
                            className="rounded-full border border-emerald-300/50 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-400/25"
                          >
                            I nailed it (+15)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInterviewRating("review")}
                            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                          >
                            Need more practice (+5)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {!interviewRevealed && (
                    <p className="text-xs text-slate-400">
                      Hint: {currentStep.hint}
                    </p>
                  )}
                </div>
              )}

              {feedback && (
                <div
                  className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${
                    feedback.kind === "correct" || feedback.kind === "nailed"
                      ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-50"
                      : feedback.kind === "wrong"
                        ? "border-rose-300/40 bg-rose-400/10 text-rose-50"
                        : feedback.kind === "review"
                          ? "border-white/10 bg-white/5 text-slate-200"
                          : "border-amber-300/40 bg-amber-400/10 text-amber-50"
                  }`}
                >
                  {feedback.message}
                  {currentStep.kind === "mcq" && (feedback.kind === "correct" || feedback.kind === "revealed") && (
                    <p className="mt-2 text-slate-300">{currentStep.explanation}</p>
                  )}
                </div>
              )}
            </section>
          ) : (
            <section className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center text-slate-300">
              Loading course...
            </section>
          )}
        </div>
      </main>
    </>
  );
}
