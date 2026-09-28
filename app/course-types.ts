// Shared shape for every two-round tech track (Python, Statistics, Excel, Power BI, ...).
// Each course file (python-course.ts, excel-course.ts, ...) builds its own steps
// with these types and exports a `Course`; page.tsx only knows this generic shape.
//
// Round 1 ("Foundations") is always multiple choice, auto-graded, with unlimited
// retries and a reveal-after-many-tries safety valve.
// Round 2 ("Interview Prep") is always open-ended: the learner reads a real
// interview-style question, thinks through an answer, then reveals a model answer
// and explanation and self-marks whether they got it. There is no way to
// auto-grade a spoken/written interview answer, so credits are awarded for
// working through the question rather than for typing an exact match.

export type CourseBasicStep = {
  kind: "mcq";
  section: "basics";
  sectionTitle: string;
  stepNumber: number;
  stepTotal: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
};

export type CourseInterviewStep = {
  kind: "interview";
  section: "interview";
  topicKey: string;
  topicTitle: string;
  stepNumber: number;
  stepTotal: number;
  prompt: string;
  modelAnswer: string;
  explanation: string;
  hint: string;
};

export type CourseStep = CourseBasicStep | CourseInterviewStep;

export type CourseRound = {
  number: number;
  title: string;
  summary: string;
  topics: string[];
  steps: CourseStep[];
};

export type Course = {
  rounds: CourseRound[];
};

export function makeMcqBuilder(sectionTitle: string) {
  return (
    stepNumber: number,
    stepTotal: number,
    prompt: string,
    options: string[],
    correctIndex: number,
    explanation: string,
    hint: string,
  ): CourseBasicStep => ({
    kind: "mcq",
    section: "basics",
    sectionTitle,
    stepNumber,
    stepTotal,
    prompt,
    options,
    correctIndex,
    explanation,
    hint,
  });
}

export function makeInterviewBuilder(topicKey: string, topicTitle: string) {
  return (
    stepNumber: number,
    stepTotal: number,
    prompt: string,
    modelAnswer: string,
    explanation: string,
    hint: string,
  ): CourseInterviewStep => ({
    kind: "interview",
    section: "interview",
    topicKey,
    topicTitle,
    stepNumber,
    stepTotal,
    prompt,
    modelAnswer,
    explanation,
    hint,
  });
}
