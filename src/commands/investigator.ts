import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { Command } from "commander";
import {
  type InvestigatorAttributes as Attributes,
  createEmptyInvestigatorSheet,
  type InvestigatorDerived as Derived,
  type InvestigatorSheet,
  validateInvestigatorSheet,
} from "../models/investigator-sheet";

type InvestigatorDeps = {
  writeLine?: (value: string) => void;
  randomInt?: (min: number, max: number) => number;
};

type EduImproveStep = {
  check: number;
  before: number;
  after: number;
  gain: number;
  applied: boolean;
};

type AgeLoss = {
  strLoss?: number;
  conLoss?: number;
  dexLoss?: number;
  sizLoss?: number;
};

type CreateOptions = {
  age?: number;
};

type DerivedOptions = {
  str: number;
  con: number;
  siz: number;
  dex: number;
  pow: number;
  age: number;
};

type EduImproveOptions = {
  edu: number;
  times?: number;
};

type AgeAdjustOptions = {
  age: number;
  str: number;
  con: number;
  siz: number;
  dex: number;
  app: number;
  int: number;
  pow: number;
  edu: number;
  luck: number;
  strLoss?: number;
  conLoss?: number;
  dexLoss?: number;
  sizLoss?: number;
  rerollLuck: boolean;
  eduImprove: boolean;
};

type PointsOptions = {
  int: number;
  formula: string;
  str?: number;
  con?: number;
  siz?: number;
  dex?: number;
  app?: number;
  pow?: number;
  edu?: number;
  luck?: number;
};

type QuickstartOptions = {
  age?: number;
  formula?: string;
};

type ValidateOptions = {
  age: number;
  str: number;
  con: number;
  siz: number;
  dex: number;
  app?: number;
  int?: number;
  pow: number;
  edu?: number;
  luck?: number;
  hp?: number;
  san?: number;
  mp?: number;
  mov?: number;
  build?: number;
  db?: string;
};

type BuildTableOptions = {
  str: number;
  siz: number;
};

type MovOptions = {
  str: number;
  dex: number;
  siz: number;
  age: number;
};

type ExportOptions = {
  format?: "json" | "yaml";
  age?: number;
  formula?: string;
  str?: number;
  con?: number;
  siz?: number;
  dex?: number;
  app?: number;
  int?: number;
  pow?: number;
  edu?: number;
  luck?: number;
};

type MarkdownCreateOptions = {
  output: string;
  age?: number;
  formula?: string;
  name?: string;
  occupation?: string;
};

type MarkdownUpdateOptions = {
  file: string;
  set: string[];
};

type MarkdownSaveOptions = {
  file: string;
};

type MarkdownExportOptions = {
  file: string;
  format?: "json" | "yaml";
};

type SkillsCatalogOptions = {
  format?: "json" | "markdown";
};

type SkillsAllocateOptions = {
  file: string;
  occupationPoints?: number;
  interestPoints?: number;
  setOcc: string[];
  occ: string[];
  setInt: string[];
  int: string[];
  allowMythosInterest: boolean;
};

type SkillsValidateOptions = {
  file: string;
  occupationPoints?: number;
  interestPoints?: number;
};

type SkillsMarkOptions = {
  file: string;
  skill: string[];
};

type SkillsGrowthOptions = {
  file: string;
  skill: string[];
  roll: string[];
  fixedRoll: string[];
};

const DEFAULT_MAX_TARGET = 200;
const SHEET_START_MARKER = "<!-- COC_SHEET_JSON_START -->";
const SHEET_END_MARKER = "<!-- COC_SHEET_JSON_END -->";

type SkillCatalogEntry = {
  key: string;
  name: string;
  base: number;
  category: "general" | "combat" | "knowledge" | "social" | "specialized";
};

const SKILL_CATALOG: Record<string, SkillCatalogEntry> = {
  accounting: { key: "accounting", name: "Accounting", base: 5, category: "knowledge" },
  anthropology: { key: "anthropology", name: "Anthropology", base: 1, category: "knowledge" },
  appraise: { key: "appraise", name: "Appraise", base: 5, category: "knowledge" },
  archaeology: { key: "archaeology", name: "Archaeology", base: 1, category: "knowledge" },
  art_craft: {
    key: "art_craft",
    name: "Art/Craft (Specialization)",
    base: 5,
    category: "specialized",
  },
  charm: { key: "charm", name: "Charm", base: 15, category: "social" },
  climb: { key: "climb", name: "Climb", base: 20, category: "general" },
  computer_use: { key: "computer_use", name: "Computer Use", base: 5, category: "knowledge" },
  credit_rating: { key: "credit_rating", name: "Credit Rating", base: 0, category: "social" },
  cthulhu_mythos: { key: "cthulhu_mythos", name: "Cthulhu Mythos", base: 0, category: "knowledge" },
  disguise: { key: "disguise", name: "Disguise", base: 5, category: "general" },
  fast_talk: { key: "fast_talk", name: "Fast Talk", base: 5, category: "social" },
  fighting_brawl: { key: "fighting_brawl", name: "Fighting (Brawl)", base: 25, category: "combat" },
  firearms_handgun: {
    key: "firearms_handgun",
    name: "Firearms (Handgun)",
    base: 20,
    category: "combat",
  },
  firearms_rifle_shotgun: {
    key: "firearms_rifle_shotgun",
    name: "Firearms (Rifle/Shotgun)",
    base: 25,
    category: "combat",
  },
  first_aid: { key: "first_aid", name: "First Aid", base: 30, category: "general" },
  history: { key: "history", name: "History", base: 5, category: "knowledge" },
  intimidate: { key: "intimidate", name: "Intimidate", base: 15, category: "social" },
  jump: { key: "jump", name: "Jump", base: 20, category: "general" },
  language_other: {
    key: "language_other",
    name: "Language (Other)",
    base: 1,
    category: "knowledge",
  },
  law: { key: "law", name: "Law", base: 5, category: "knowledge" },
  library_use: { key: "library_use", name: "Library Use", base: 20, category: "knowledge" },
  listen: { key: "listen", name: "Listen", base: 20, category: "general" },
  locksmith: { key: "locksmith", name: "Locksmith", base: 1, category: "general" },
  medicine: { key: "medicine", name: "Medicine", base: 1, category: "knowledge" },
  natural_world: { key: "natural_world", name: "Natural World", base: 10, category: "knowledge" },
  navigate: { key: "navigate", name: "Navigate", base: 10, category: "general" },
  occult: { key: "occult", name: "Occult", base: 5, category: "knowledge" },
  persuade: { key: "persuade", name: "Persuade", base: 10, category: "social" },
  psychoanalysis: {
    key: "psychoanalysis",
    name: "Psychoanalysis",
    base: 1,
    category: "specialized",
  },
  psychology: { key: "psychology", name: "Psychology", base: 10, category: "knowledge" },
  ride: { key: "ride", name: "Ride", base: 5, category: "general" },
  science: { key: "science", name: "Science (Specialization)", base: 1, category: "specialized" },
  sleight_of_hand: {
    key: "sleight_of_hand",
    name: "Sleight of Hand",
    base: 10,
    category: "general",
  },
  spot_hidden: { key: "spot_hidden", name: "Spot Hidden", base: 25, category: "general" },
  stealth: { key: "stealth", name: "Stealth", base: 20, category: "general" },
  survival: {
    key: "survival",
    name: "Survival (Specialization)",
    base: 10,
    category: "specialized",
  },
  swim: { key: "swim", name: "Swim", base: 20, category: "general" },
  throw: { key: "throw", name: "Throw", base: 20, category: "general" },
  track: { key: "track", name: "Track", base: 10, category: "general" },
};

function defaultRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parsePositiveInt(value: string, optionName: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${optionName} must be a positive integer.`);
  }
  return parsed;
}

function rollDice(
  count: number,
  sides: number,
  randomInt: (min: number, max: number) => number,
): number {
  let sum = 0;
  for (let i = 0; i < count; i += 1) {
    sum += randomInt(1, sides);
  }
  return sum;
}

function roll3d6x5(randomInt: (min: number, max: number) => number): number {
  return rollDice(3, 6, randomInt) * 5;
}

function roll2d6plus6x5(randomInt: (min: number, max: number) => number): number {
  return (rollDice(2, 6, randomInt) + 6) * 5;
}

function validateAge(age: number): void {
  if (!Number.isFinite(age) || age < 15 || age > 89) {
    throw new Error("--age must be between 15 and 89.");
  }
}

function validateAttr(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 1 || value > DEFAULT_MAX_TARGET) {
    throw new Error(`${name} must be between 1 and ${DEFAULT_MAX_TARGET}.`);
  }
}

function eduImprovementStep(
  currentEdu: number,
  randomInt: (min: number, max: number) => number,
): EduImproveStep {
  const check = randomInt(1, 100);
  if (check > currentEdu) {
    const gain = randomInt(1, 10);
    return {
      check,
      before: currentEdu,
      after: Math.min(99, currentEdu + gain),
      gain,
      applied: true,
    };
  }
  return {
    check,
    before: currentEdu,
    after: currentEdu,
    gain: 0,
    applied: false,
  };
}

function eduImproveTimes(
  currentEdu: number,
  times: number,
  randomInt: (min: number, max: number) => number,
): { edu: number; steps: EduImproveStep[] } {
  let edu = currentEdu;
  const steps: EduImproveStep[] = [];
  for (let i = 0; i < times; i += 1) {
    const step = eduImprovementStep(edu, randomInt);
    steps.push(step);
    edu = step.after;
  }
  return { edu, steps };
}

function computeDbAndBuild(str: number, siz: number): { db: string; build: number } {
  const total = str + siz;
  if (total <= 64) return { db: "-2", build: -2 };
  if (total <= 84) return { db: "-1", build: -1 };
  if (total <= 124) return { db: "0", build: 0 };
  if (total <= 164) return { db: "+1d4", build: 1 };
  if (total <= 204) return { db: "+1d6", build: 2 };
  if (total <= 284) return { db: "+2d6", build: 3 };

  const extra = Math.ceil((total - 284) / 80);
  return { db: `+${2 + extra}d6`, build: 3 + extra };
}

function computeMov(str: number, dex: number, siz: number, age: number): number {
  let mov = 8;
  if (str < siz && dex < siz) {
    mov = 7;
  } else if (str > siz && dex > siz) {
    mov = 9;
  }

  if (age >= 40 && age <= 49) mov -= 1;
  if (age >= 50 && age <= 59) mov -= 2;
  if (age >= 60 && age <= 69) mov -= 3;
  if (age >= 70 && age <= 79) mov -= 4;
  if (age >= 80 && age <= 89) mov -= 5;
  return mov;
}

function computeDerived(attrs: Attributes, age: number): Derived {
  const hp = Math.floor((attrs.con + attrs.siz) / 10);
  const san = attrs.pow;
  const mp = Math.floor(attrs.pow / 5);
  const mov = computeMov(attrs.str, attrs.dex, attrs.siz, age);
  const { db, build } = computeDbAndBuild(attrs.str, attrs.siz);
  return { hp, san, mp, mov, build, db };
}

function toCoreRecord(attrs: Attributes): Record<string, number> {
  return {
    str: attrs.str,
    con: attrs.con,
    siz: attrs.siz,
    dex: attrs.dex,
    app: attrs.app,
    int: attrs.int,
    pow: attrs.pow,
    edu: attrs.edu,
    luck: attrs.luck,
  };
}

function parsePointsFormula(formula: string, vars: Record<string, number>): number {
  const normalized = formula.replaceAll(/\s+/g, "").toLowerCase();
  if (!normalized) throw new Error("Formula cannot be empty.");

  const tokenPattern = /[a-z_][a-z0-9_]*|\d+|[()+\-*]/g;
  const tokens = normalized.match(tokenPattern);
  if (!tokens || tokens.join("") !== normalized) {
    throw new Error("Invalid formula. Use names like edu, str, dex with +, -, *, and parentheses.");
  }

  let index = 0;
  const peek = () => tokens[index];
  const consume = () => {
    const token = tokens[index];
    if (!token) throw new Error("Unexpected end of formula.");
    index += 1;
    return token;
  };

  const parseExpression = (): number => {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = consume();
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  };

  const parseTerm = (): number => {
    let value = parseFactor();
    while (peek() === "*") {
      consume();
      value *= parseFactor();
    }
    return value;
  };

  const parseFactor = (): number => {
    const token = peek();
    if (!token) throw new Error("Unexpected end of formula.");
    if (token === "(") {
      consume();
      const inner = parseExpression();
      if (consume() !== ")") throw new Error("Mismatched parentheses.");
      return inner;
    }
    if (token === "+") {
      consume();
      return parseFactor();
    }
    if (token === "-") {
      consume();
      return -parseFactor();
    }
    consume();
    if (/^\d+$/.test(token)) return Number.parseInt(token, 10);
    if (!(token in vars)) throw new Error(`Unknown variable "${token}" in formula.`);
    const variable = vars[token];
    if (typeof variable !== "number") {
      throw new Error(`Unknown variable "${token}" in formula.`);
    }
    return variable;
  };

  const value = parseExpression();
  if (index !== tokens.length) throw new Error(`Unexpected token "${tokens[index]}".`);
  return Math.floor(value);
}

function applyLossMap(
  attrs: Attributes,
  requiredTotal: number,
  allowed: Array<"str" | "con" | "dex" | "siz">,
  manual: AgeLoss,
): Array<string> {
  const losses: Record<string, number> = {
    str: manual.strLoss ?? 0,
    con: manual.conLoss ?? 0,
    dex: manual.dexLoss ?? 0,
    siz: manual.sizLoss ?? 0,
  };

  const sum = Object.values(losses).reduce((a, b) => a + b, 0);
  if (sum > 0) {
    for (const key of Object.keys(losses)) {
      const loss = losses[key] ?? 0;
      if (loss > 0 && !allowed.includes(key as "str" | "con" | "dex" | "siz")) {
        throw new Error(`Cannot apply ${key} loss for this age bracket.`);
      }
    }
    if (sum !== requiredTotal) {
      throw new Error(`Manual losses must sum to ${requiredTotal}.`);
    }
    for (const key of Object.keys(losses) as Array<keyof Attributes>) {
      attrs[key] -= losses[key] ?? 0;
    }
    return [
      `manual_loss_applied: str=${losses.str}, con=${losses.con}, dex=${losses.dex}, siz=${losses.siz}`,
    ];
  }

  // Default deterministic split: round-robin by allowed keys, in steps of 5.
  const applied: Record<string, number> = { str: 0, con: 0, dex: 0, siz: 0 };
  let left = requiredTotal;
  let cursor = 0;
  if (allowed.length === 0) {
    throw new Error("No valid attributes available for age-loss application.");
  }
  while (left > 0) {
    const key = allowed[cursor % allowed.length];
    if (!key) {
      throw new Error("Age-loss allocation failed due to invalid key selection.");
    }
    attrs[key] -= 5;
    applied[key] = (applied[key] ?? 0) + 5;
    left -= 5;
    cursor += 1;
  }
  return [
    `auto_loss_applied: str=${applied.str}, con=${applied.con}, dex=${applied.dex}, siz=${applied.siz}`,
  ];
}

function applyAgeAdjustments(
  attrs: Attributes,
  age: number,
  randomInt: (min: number, max: number) => number,
  manualLoss: AgeLoss = {},
  rerollLuck = true,
  doEduImprove = true,
): { attributes: Attributes; notes: string[]; eduSteps: EduImproveStep[] } {
  validateAge(age);
  const updated = { ...attrs };
  const notes: string[] = [];
  const eduSteps: EduImproveStep[] = [];

  if (age >= 15 && age <= 19) {
    notes.push(...applyLossMap(updated, 5, ["str", "siz"], manualLoss));
    updated.edu -= 5;
    notes.push("age_15_19: edu-5");
    if (rerollLuck) {
      const secondLuck = roll3d6x5(randomInt);
      const oldLuck = updated.luck;
      updated.luck = Math.max(updated.luck, secondLuck);
      notes.push(`age_15_19: luck reroll applied (old=${oldLuck}, reroll=${secondLuck})`);
    }
    return { attributes: updated, notes, eduSteps };
  }

  let eduTimes = 0;
  if (age >= 20 && age <= 39) {
    eduTimes = 1;
  } else if (age >= 40 && age <= 49) {
    notes.push(...applyLossMap(updated, 5, ["str", "con", "dex"], manualLoss));
    updated.app -= 5;
    eduTimes = 2;
  } else if (age >= 50 && age <= 59) {
    notes.push(...applyLossMap(updated, 10, ["str", "con", "dex"], manualLoss));
    updated.app -= 10;
    eduTimes = 3;
  } else if (age >= 60 && age <= 69) {
    notes.push(...applyLossMap(updated, 20, ["str", "con", "dex"], manualLoss));
    updated.app -= 15;
    eduTimes = 4;
  } else if (age >= 70 && age <= 79) {
    notes.push(...applyLossMap(updated, 40, ["str", "con", "dex"], manualLoss));
    updated.app -= 20;
    eduTimes = 4;
  } else if (age >= 80 && age <= 89) {
    notes.push(...applyLossMap(updated, 80, ["str", "con", "dex"], manualLoss));
    updated.app -= 25;
    eduTimes = 4;
  }

  if (eduTimes > 0 && doEduImprove) {
    const improved = eduImproveTimes(updated.edu, eduTimes, randomInt);
    updated.edu = improved.edu;
    eduSteps.push(...improved.steps);
    notes.push(`edu_improvement_times: ${eduTimes}`);
  } else if (eduTimes > 0) {
    notes.push(`edu_improvement_skipped: ${eduTimes}`);
  }

  return { attributes: updated, notes, eduSteps };
}

function createInvestigator(
  age: number,
  randomInt: (min: number, max: number) => number,
): {
  age: number;
  attributes: Attributes;
  derived: Derived;
  notes: string[];
  eduSteps: EduImproveStep[];
} {
  validateAge(age);
  const base: Attributes = {
    str: roll3d6x5(randomInt),
    con: roll3d6x5(randomInt),
    siz: roll2d6plus6x5(randomInt),
    dex: roll3d6x5(randomInt),
    app: roll3d6x5(randomInt),
    int: roll2d6plus6x5(randomInt),
    pow: roll3d6x5(randomInt),
    edu: roll2d6plus6x5(randomInt),
    luck: roll3d6x5(randomInt),
  };

  const adjusted = applyAgeAdjustments(base, age, randomInt, {}, true, true);
  const derived = computeDerived(adjusted.attributes, age);
  return {
    age,
    attributes: adjusted.attributes,
    derived,
    notes: adjusted.notes,
    eduSteps: adjusted.eduSteps,
  };
}

function mustHaveAllStats(options: ExportOptions): options is ExportOptions & Attributes {
  return (
    typeof options.str === "number" &&
    typeof options.con === "number" &&
    typeof options.siz === "number" &&
    typeof options.dex === "number" &&
    typeof options.app === "number" &&
    typeof options.int === "number" &&
    typeof options.pow === "number" &&
    typeof options.edu === "number" &&
    typeof options.luck === "number"
  );
}

function toYaml(value: unknown, indent = 0): string {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return `${pad}-\n${toYaml(item, indent + 2)}`;
        }
        return `${pad}- ${String(item)}`;
      })
      .join("\n");
  }
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    return entries
      .map(([key, item]) => {
        if (typeof item === "object" && item !== null) {
          return `${pad}${key}:\n${toYaml(item, indent + 2)}`;
        }
        return `${pad}${key}: ${String(item)}`;
      })
      .join("\n");
  }
  return `${pad}${String(value)}`;
}

function formatCreateResult(result: {
  age: number;
  attributes: Attributes;
  derived: Derived;
  notes: string[];
  eduSteps: EduImproveStep[];
}): string {
  return [
    "ROLL_RESULT: COC_INVESTIGATOR_CREATE",
    `age: ${result.age}`,
    `str: ${result.attributes.str}`,
    `con: ${result.attributes.con}`,
    `siz: ${result.attributes.siz}`,
    `dex: ${result.attributes.dex}`,
    `app: ${result.attributes.app}`,
    `int: ${result.attributes.int}`,
    `pow: ${result.attributes.pow}`,
    `edu: ${result.attributes.edu}`,
    `luck: ${result.attributes.luck}`,
    `hp: ${result.derived.hp}`,
    `san: ${result.derived.san}`,
    `mp: ${result.derived.mp}`,
    `mov: ${result.derived.mov}`,
    `build: ${result.derived.build}`,
    `db: ${result.derived.db}`,
    "notes:",
    ...result.notes.map((note) => `- ${note}`),
    "edu_steps:",
    ...result.eduSteps.map(
      (step, i) =>
        `- #${i + 1} check=${step.check} before=${step.before} after=${step.after} gain=${step.gain} applied=${step.applied}`,
    ),
  ].join("\n");
}

function formatDerivedResult(derived: Derived): string {
  return [
    "ROLL_RESULT: COC_INVESTIGATOR_DERIVED",
    `hp: ${derived.hp}`,
    `san: ${derived.san}`,
    `mp: ${derived.mp}`,
    `mov: ${derived.mov}`,
    `build: ${derived.build}`,
    `db: ${derived.db}`,
  ].join("\n");
}

function formatEduImproveResult(before: number, after: number, steps: EduImproveStep[]): string {
  return [
    "ROLL_RESULT: COC_INVESTIGATOR_EDU_IMPROVE",
    `edu_before: ${before}`,
    `edu_after: ${after}`,
    `times: ${steps.length}`,
    "steps:",
    ...steps.map(
      (step, i) =>
        `- #${i + 1} check=${step.check} before=${step.before} after=${step.after} gain=${step.gain} applied=${step.applied}`,
    ),
  ].join("\n");
}

function formatAgeAdjustResult(
  age: number,
  attrs: Attributes,
  derived: Derived,
  notes: string[],
  steps: EduImproveStep[],
): string {
  return [
    "ROLL_RESULT: COC_INVESTIGATOR_AGE_ADJUST",
    `age: ${age}`,
    `str: ${attrs.str}`,
    `con: ${attrs.con}`,
    `siz: ${attrs.siz}`,
    `dex: ${attrs.dex}`,
    `app: ${attrs.app}`,
    `int: ${attrs.int}`,
    `pow: ${attrs.pow}`,
    `edu: ${attrs.edu}`,
    `luck: ${attrs.luck}`,
    `hp: ${derived.hp}`,
    `san: ${derived.san}`,
    `mp: ${derived.mp}`,
    `mov: ${derived.mov}`,
    `build: ${derived.build}`,
    `db: ${derived.db}`,
    "notes:",
    ...notes.map((n) => `- ${n}`),
    "edu_steps:",
    ...steps.map(
      (step, i) =>
        `- #${i + 1} check=${step.check} before=${step.before} after=${step.after} gain=${step.gain} applied=${step.applied}`,
    ),
  ].join("\n");
}

function formatPointsResult(occupation: number, interest: number, formula: string): string {
  return [
    "ROLL_RESULT: COC_INVESTIGATOR_POINTS",
    `occupation_formula: ${formula}`,
    `occupation_points: ${occupation}`,
    `interest_formula: int*2`,
    `interest_points: ${interest}`,
  ].join("\n");
}

function formatValidateResult(valid: boolean, issues: string[]): string {
  return [
    "ROLL_RESULT: COC_INVESTIGATOR_VALIDATE",
    `valid: ${valid ? "true" : "false"}`,
    "issues:",
    ...issues.map((issue) => `- ${issue}`),
  ].join("\n");
}

function wrapAgentResult(resultType: string, body: string): string {
  const normalizedBody = body.replace(/^ROLL_RESULT:[^\n]*\n?/m, "");
  return [
    `result_type: ${resultType}`,
    "status: ok",
    "format: key_value_text",
    "---",
    normalizedBody,
  ].join("\n");
}

function collectMulti(value: string, previous: string[]): string[] {
  return [...previous, value];
}

function normalizeSkillKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replaceAll(/[^\w]+/g, "_")
    .replaceAll(/^_+|_+$/g, "");
}

function parseAllocationPairs(pairs: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const pair of pairs) {
    const eq = pair.indexOf("=");
    if (eq === -1) {
      throw new Error(`Invalid allocation "${pair}". Use skill=points.`);
    }
    const key = normalizeSkillKey(pair.slice(0, eq));
    const pointsRaw = pair.slice(eq + 1).trim();
    const points = Number.parseInt(pointsRaw, 10);
    if (!Number.isFinite(points) || points < 0) {
      throw new Error(`Invalid points in "${pair}".`);
    }
    result[key] = (result[key] ?? 0) + points;
  }
  return result;
}

function ensureSkillEntry(sheet: InvestigatorSheet, skillKey: string): void {
  if (sheet.skills[skillKey]) return;
  const catalog = SKILL_CATALOG[skillKey];
  if (!catalog) {
    throw new Error(`Unknown skill "${skillKey}". Add it to catalog first.`);
  }
  sheet.skills[skillKey] = {
    name: catalog.name,
    base: catalog.base,
    occupation: 0,
    interest: 0,
    value: catalog.base,
    half: Math.floor(catalog.base / 2),
    fifth: Math.floor(catalog.base / 5),
    growthChecked: false,
  };
}

function recomputeSkill(entry: InvestigatorSheet["skills"][string]): void {
  entry.value = entry.base + entry.occupation + entry.interest;
  entry.half = Math.floor(entry.value / 2);
  entry.fifth = Math.floor(entry.value / 5);
}

function applySkillAllocation(
  sheet: InvestigatorSheet,
  occAlloc: Record<string, number>,
  intAlloc: Record<string, number>,
  allowMythosInterest: boolean,
): { usedOcc: number; usedInt: number } {
  for (const skillKey of Object.keys(occAlloc)) {
    ensureSkillEntry(sheet, skillKey);
    const entry = sheet.skills[skillKey];
    if (!entry) continue;
    entry.occupation += occAlloc[skillKey] ?? 0;
    recomputeSkill(entry);
  }
  for (const skillKey of Object.keys(intAlloc)) {
    if (!allowMythosInterest && skillKey === "cthulhu_mythos") {
      throw new Error("Interest points cannot be allocated to cthulhu_mythos by default.");
    }
    ensureSkillEntry(sheet, skillKey);
    const entry = sheet.skills[skillKey];
    if (!entry) continue;
    entry.interest += intAlloc[skillKey] ?? 0;
    recomputeSkill(entry);
  }
  const usedOcc = Object.values(occAlloc).reduce((a, b) => a + b, 0);
  const usedInt = Object.values(intAlloc).reduce((a, b) => a + b, 0);
  return { usedOcc, usedInt };
}

function validateSkillsInternal(
  sheet: InvestigatorSheet,
  occupationPoints?: number,
  interestPoints?: number,
): string[] {
  const issues: string[] = [];
  let usedOcc = 0;
  let usedInt = 0;
  for (const [key, skill] of Object.entries(sheet.skills)) {
    usedOcc += skill.occupation;
    usedInt += skill.interest;
    const expectedValue = skill.base + skill.occupation + skill.interest;
    if (skill.value !== expectedValue)
      issues.push(`${key}: value mismatch (expected ${expectedValue})`);
    if (skill.half !== Math.floor(skill.value / 2)) issues.push(`${key}: half mismatch`);
    if (skill.fifth !== Math.floor(skill.value / 5)) issues.push(`${key}: fifth mismatch`);
    if (skill.base < 0 || skill.value < 0) issues.push(`${key}: negative skill value`);
  }
  if (typeof occupationPoints === "number" && usedOcc > occupationPoints) {
    issues.push(`occupation points exceeded: used=${usedOcc}, available=${occupationPoints}`);
  }
  if (typeof interestPoints === "number" && usedInt > interestPoints) {
    issues.push(`interest points exceeded: used=${usedInt}, available=${interestPoints}`);
  }
  return issues;
}

function computeSkillSpend(sheet: InvestigatorSheet): { usedOcc: number; usedInt: number } {
  let usedOcc = 0;
  let usedInt = 0;
  for (const skill of Object.values(sheet.skills)) {
    usedOcc += skill.occupation;
    usedInt += skill.interest;
  }
  return { usedOcc, usedInt };
}

function renderSkillsTable(sheet: InvestigatorSheet): string {
  const entries = Object.values(sheet.skills);
  if (entries.length === 0) return "_No skills recorded yet._";
  const lines = [
    "| Skill | Base | Occ | Int | Value | Half | Fifth |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];
  for (const skill of entries) {
    lines.push(
      `| ${skill.name} | ${skill.base} | ${skill.occupation} | ${skill.interest} | ${skill.value} | ${skill.half} | ${skill.fifth} |`,
    );
  }
  return lines.join("\n");
}

function renderWeaponsTable(sheet: InvestigatorSheet): string {
  if (sheet.combat.weapons.length === 0) return "_No weapons recorded yet._";
  const lines = [
    "| Weapon | Skill | Damage | Range | Attacks | Ammo | Malf |",
    "| --- | --- | --- | --- | ---: | ---: | ---: |",
  ];
  for (const weapon of sheet.combat.weapons) {
    lines.push(
      `| ${weapon.name} | ${weapon.skill} | ${weapon.damage} | ${weapon.range ?? "-"} | ${weapon.attacks ?? "-"} | ${weapon.ammo ?? "-"} | ${weapon.malfunction ?? "-"} |`,
    );
  }
  return lines.join("\n");
}

function renderInvestigatorMarkdown(sheet: InvestigatorSheet): string {
  return [
    "# Investigator Character Sheet",
    "",
    "## Identity",
    `- Name: ${sheet.identity.name ?? ""}`,
    `- Player: ${sheet.identity.playerName ?? ""}`,
    `- Occupation: ${sheet.identity.occupation ?? ""}`,
    `- Age: ${sheet.identity.age ?? ""}`,
    `- Sex: ${sheet.identity.sex ?? ""}`,
    `- Residence: ${sheet.identity.residence ?? ""}`,
    `- Birthplace: ${sheet.identity.birthplace ?? ""}`,
    `- Era: ${sheet.identity.era ?? ""}`,
    "",
    "## Attributes",
    "| STR | CON | SIZ | DEX | APP | INT | POW | EDU | LUCK |",
    "| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    `| ${sheet.attributes.str} | ${sheet.attributes.con} | ${sheet.attributes.siz} | ${sheet.attributes.dex} | ${sheet.attributes.app} | ${sheet.attributes.int} | ${sheet.attributes.pow} | ${sheet.attributes.edu} | ${sheet.attributes.luck} |`,
    "",
    "## Derived",
    `- HP: ${sheet.derived.hp}`,
    `- SAN: ${sheet.derived.san}`,
    `- MP: ${sheet.derived.mp}`,
    `- MOV: ${sheet.derived.mov}`,
    `- BUILD: ${sheet.derived.build}`,
    `- DB: ${sheet.derived.db}`,
    "",
    "## Skills",
    renderSkillsTable(sheet),
    "",
    "## Combat",
    renderWeaponsTable(sheet),
    "",
    "## Status",
    `- Current HP: ${sheet.status.currentHp}`,
    `- Current SAN: ${sheet.status.currentSan}`,
    `- Current MP: ${sheet.status.currentMp}`,
    `- Major Wound: ${sheet.status.majorWound}`,
    `- Temporary Insanity: ${sheet.status.temporaryInsanity}`,
    `- Indefinite Insanity: ${sheet.status.indefiniteInsanity}`,
    `- Conditions: ${sheet.status.conditions.join(", ")}`,
    "",
    "## Notes",
    ...sheet.notes.map((note) => `- ${note}`),
    sheet.notes.length === 0 ? "- " : "",
    "",
    "## Agent Data",
    SHEET_START_MARKER,
    "```json",
    JSON.stringify(sheet, null, 2),
    "```",
    SHEET_END_MARKER,
    "",
  ].join("\n");
}

function extractSheetFromMarkdown(markdown: string): InvestigatorSheet {
  const start = markdown.indexOf(SHEET_START_MARKER);
  const end = markdown.indexOf(SHEET_END_MARKER);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Could not find embedded sheet JSON markers in markdown.");
  }

  const block = markdown.slice(start + SHEET_START_MARKER.length, end);
  const jsonMatch = block.match(/```json\s*([\s\S]*?)\s*```/i);
  if (!jsonMatch?.[1]) {
    throw new Error("Could not find embedded JSON block inside markers.");
  }
  const parsed = JSON.parse(jsonMatch[1]);
  return validateInvestigatorSheet(parsed);
}

function parsePrimitive(value: string): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function setByPath(target: Record<string, unknown>, path: string, rawValue: string): void {
  const segments = path.split(".").filter(Boolean);
  if (segments.length === 0) throw new Error(`Invalid path "${path}"`);
  let cursor: Record<string, unknown> = target;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const key = segments[i];
    if (!key) throw new Error(`Invalid path "${path}"`);
    const existing = cursor[key];
    if (typeof existing !== "object" || existing === null || Array.isArray(existing)) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  const leaf = segments[segments.length - 1];
  if (!leaf) throw new Error(`Invalid path "${path}"`);
  cursor[leaf] = parsePrimitive(rawValue);
}

async function writeSheetMarkdown(filePath: string, sheet: InvestigatorSheet): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, renderInvestigatorMarkdown(sheet), "utf8");
}

function buildSheet(
  attrs: Attributes,
  derived: Derived,
  notes: string[],
  identity: InvestigatorSheet["identity"] = {},
): InvestigatorSheet {
  const sheet = createEmptyInvestigatorSheet(attrs, derived);
  sheet.identity = identity;
  sheet.notes = [...notes];
  return validateInvestigatorSheet(sheet);
}

export function registerInvestigatorCommand(program: Command, deps?: InvestigatorDeps): void {
  const writeLine = deps?.writeLine ?? console.log;
  const randomInt = deps?.randomInt ?? defaultRandomInt;

  const investigator = program
    .command("investigator")
    .description("Helpers for CoC investigator building.");

  investigator
    .command("create")
    .description("Generate investigator attributes and derived values from rulebook formulas.")
    .option(
      "-a, --age <value>",
      "investigator age (15-89)",
      (v) => parsePositiveInt(v, "--age"),
      25,
    )
    .action((options: CreateOptions) => {
      const age = options.age ?? 25;
      const result = createInvestigator(age, randomInt);
      writeLine(wrapAgentResult("COC_INVESTIGATOR_CREATE", formatCreateResult(result)));
    });

  investigator
    .command("derived")
    .description("Calculate derived values from provided core attributes.")
    .requiredOption("--str <value>", "STR", (v) => parsePositiveInt(v, "--str"))
    .requiredOption("--con <value>", "CON", (v) => parsePositiveInt(v, "--con"))
    .requiredOption("--siz <value>", "SIZ", (v) => parsePositiveInt(v, "--siz"))
    .requiredOption("--dex <value>", "DEX", (v) => parsePositiveInt(v, "--dex"))
    .requiredOption("--pow <value>", "POW", (v) => parsePositiveInt(v, "--pow"))
    .option("-a, --age <value>", "age for MOV adjustment", (v) => parsePositiveInt(v, "--age"), 25)
    .action((options: DerivedOptions) => {
      validateAge(options.age);
      const attrs: Attributes = {
        str: options.str,
        con: options.con,
        siz: options.siz,
        dex: options.dex,
        app: 50,
        int: 50,
        pow: options.pow,
        edu: 50,
        luck: 50,
      };
      const derived = computeDerived(attrs, options.age);
      writeLine(wrapAgentResult("COC_INVESTIGATOR_DERIVED", formatDerivedResult(derived)));
    });

  investigator
    .command("edu-improve")
    .description("Run EDU improvement checks.")
    .requiredOption("--edu <value>", "current EDU", (v) => parsePositiveInt(v, "--edu"))
    .option(
      "-n, --times <value>",
      "number of EDU improvements",
      (v) => parsePositiveInt(v, "--times"),
      1,
    )
    .action((options: EduImproveOptions) => {
      const before = options.edu;
      const times = options.times ?? 1;
      const improved = eduImproveTimes(before, times, randomInt);
      writeLine(
        wrapAgentResult(
          "COC_INVESTIGATOR_EDU_IMPROVE",
          formatEduImproveResult(before, improved.edu, improved.steps),
        ),
      );
    });

  investigator
    .command("age-adjust")
    .description("Apply age adjustments to an existing stat block.")
    .requiredOption("--age <value>", "age (15-89)", (v) => parsePositiveInt(v, "--age"))
    .requiredOption("--str <value>", "STR", (v) => parsePositiveInt(v, "--str"))
    .requiredOption("--con <value>", "CON", (v) => parsePositiveInt(v, "--con"))
    .requiredOption("--siz <value>", "SIZ", (v) => parsePositiveInt(v, "--siz"))
    .requiredOption("--dex <value>", "DEX", (v) => parsePositiveInt(v, "--dex"))
    .requiredOption("--app <value>", "APP", (v) => parsePositiveInt(v, "--app"))
    .requiredOption("--int <value>", "INT", (v) => parsePositiveInt(v, "--int"))
    .requiredOption("--pow <value>", "POW", (v) => parsePositiveInt(v, "--pow"))
    .requiredOption("--edu <value>", "EDU", (v) => parsePositiveInt(v, "--edu"))
    .requiredOption("--luck <value>", "LUCK", (v) => parsePositiveInt(v, "--luck"))
    .option("--str-loss <value>", "manual STR loss in points", (v) =>
      parsePositiveInt(v, "--str-loss"),
    )
    .option("--con-loss <value>", "manual CON loss in points", (v) =>
      parsePositiveInt(v, "--con-loss"),
    )
    .option("--dex-loss <value>", "manual DEX loss in points", (v) =>
      parsePositiveInt(v, "--dex-loss"),
    )
    .option("--siz-loss <value>", "manual SIZ loss in points", (v) =>
      parsePositiveInt(v, "--siz-loss"),
    )
    .option("--no-reroll-luck", "disable teenage luck reroll")
    .option("--no-edu-improve", "disable EDU improvement checks")
    .action((options: AgeAdjustOptions) => {
      const attrs: Attributes = {
        str: options.str,
        con: options.con,
        siz: options.siz,
        dex: options.dex,
        app: options.app,
        int: options.int,
        pow: options.pow,
        edu: options.edu,
        luck: options.luck,
      };
      const adjusted = applyAgeAdjustments(
        attrs,
        options.age,
        randomInt,
        {
          strLoss: options.strLoss,
          conLoss: options.conLoss,
          dexLoss: options.dexLoss,
          sizLoss: options.sizLoss,
        },
        options.rerollLuck,
        options.eduImprove,
      );
      const derived = computeDerived(adjusted.attributes, options.age);
      writeLine(
        wrapAgentResult(
          "COC_INVESTIGATOR_AGE_ADJUST",
          formatAgeAdjustResult(
            options.age,
            adjusted.attributes,
            derived,
            adjusted.notes,
            adjusted.eduSteps,
          ),
        ),
      );
    });

  investigator
    .command("points")
    .description("Calculate occupation and interest points.")
    .requiredOption("--int <value>", "INT", (v) => parsePositiveInt(v, "--int"))
    .requiredOption("--formula <value>", "occupation formula, e.g. edu*4 or edu*2+dex*2")
    .option("--str <value>", "STR", (v) => parsePositiveInt(v, "--str"))
    .option("--con <value>", "CON", (v) => parsePositiveInt(v, "--con"))
    .option("--siz <value>", "SIZ", (v) => parsePositiveInt(v, "--siz"))
    .option("--dex <value>", "DEX", (v) => parsePositiveInt(v, "--dex"))
    .option("--app <value>", "APP", (v) => parsePositiveInt(v, "--app"))
    .option("--pow <value>", "POW", (v) => parsePositiveInt(v, "--pow"))
    .option("--edu <value>", "EDU", (v) => parsePositiveInt(v, "--edu"))
    .option("--luck <value>", "LUCK", (v) => parsePositiveInt(v, "--luck"))
    .action((options: PointsOptions) => {
      const vars = {
        str: options.str ?? 0,
        con: options.con ?? 0,
        siz: options.siz ?? 0,
        dex: options.dex ?? 0,
        app: options.app ?? 0,
        int: options.int,
        pow: options.pow ?? 0,
        edu: options.edu ?? 0,
        luck: options.luck ?? 0,
      };
      const occupation = parsePointsFormula(options.formula, vars);
      const interest = options.int * 2;
      writeLine(
        wrapAgentResult(
          "COC_INVESTIGATOR_POINTS",
          formatPointsResult(occupation, interest, options.formula),
        ),
      );
    });

  investigator
    .command("quickstart")
    .description("Create a ready-to-use investigator snapshot with points.")
    .option("--age <value>", "age (15-89)", (v) => parsePositiveInt(v, "--age"), 25)
    .option("--formula <value>", "occupation formula", "edu*4")
    .action((options: QuickstartOptions) => {
      const age = options.age ?? 25;
      const formula = options.formula ?? "edu*4";
      const created = createInvestigator(age, randomInt);
      const vars = toCoreRecord(created.attributes);
      const occupation = parsePointsFormula(formula, vars);
      const interest = created.attributes.int * 2;
      const sheet = buildSheet(created.attributes, created.derived, created.notes, { age });
      writeLine(
        wrapAgentResult(
          "COC_INVESTIGATOR_QUICKSTART",
          [
            `age: ${age}`,
            `occupation_formula: ${formula}`,
            `occupation_points: ${occupation}`,
            `interest_points: ${interest}`,
            `sheet_schema: ${sheet.schema}`,
            "",
            "attributes:",
            `- str: ${created.attributes.str}`,
            `- con: ${created.attributes.con}`,
            `- siz: ${created.attributes.siz}`,
            `- dex: ${created.attributes.dex}`,
            `- app: ${created.attributes.app}`,
            `- int: ${created.attributes.int}`,
            `- pow: ${created.attributes.pow}`,
            `- edu: ${created.attributes.edu}`,
            `- luck: ${created.attributes.luck}`,
            "derived:",
            `- hp: ${created.derived.hp}`,
            `- san: ${created.derived.san}`,
            `- mp: ${created.derived.mp}`,
            `- mov: ${created.derived.mov}`,
            `- build: ${created.derived.build}`,
            `- db: ${created.derived.db}`,
            "notes:",
            ...created.notes.map((note) => `- ${note}`),
          ].join("\n"),
        ),
      );
    });

  investigator
    .command("validate")
    .description("Validate a stat block and optional derived values.")
    .requiredOption("--age <value>", "age", (v) => parsePositiveInt(v, "--age"))
    .requiredOption("--str <value>", "STR", (v) => parsePositiveInt(v, "--str"))
    .requiredOption("--con <value>", "CON", (v) => parsePositiveInt(v, "--con"))
    .requiredOption("--siz <value>", "SIZ", (v) => parsePositiveInt(v, "--siz"))
    .requiredOption("--dex <value>", "DEX", (v) => parsePositiveInt(v, "--dex"))
    .requiredOption("--pow <value>", "POW", (v) => parsePositiveInt(v, "--pow"))
    .option("--app <value>", "APP", (v) => parsePositiveInt(v, "--app"))
    .option("--int <value>", "INT", (v) => parsePositiveInt(v, "--int"))
    .option("--edu <value>", "EDU", (v) => parsePositiveInt(v, "--edu"))
    .option("--luck <value>", "LUCK", (v) => parsePositiveInt(v, "--luck"))
    .option("--hp <value>", "expected HP", (v) => parsePositiveInt(v, "--hp"))
    .option("--san <value>", "expected SAN", (v) => parsePositiveInt(v, "--san"))
    .option("--mp <value>", "expected MP", (v) => parsePositiveInt(v, "--mp"))
    .option("--mov <value>", "expected MOV", (v) => parsePositiveInt(v, "--mov"))
    .option("--build <value>", "expected BUILD", (v) => Number.parseInt(v, 10))
    .option("--db <value>", "expected DB")
    .action((options: ValidateOptions) => {
      const issues: string[] = [];
      validateAge(options.age);
      for (const [name, value] of Object.entries({
        str: options.str,
        con: options.con,
        siz: options.siz,
        dex: options.dex,
        pow: options.pow,
      })) {
        try {
          validateAttr(name, value);
        } catch (error) {
          issues.push(error instanceof Error ? error.message : `${name} invalid`);
        }
      }

      const attrs: Attributes = {
        str: options.str,
        con: options.con,
        siz: options.siz,
        dex: options.dex,
        app: options.app ?? 50,
        int: options.int ?? 50,
        pow: options.pow,
        edu: options.edu ?? 50,
        luck: options.luck ?? 50,
      };
      const expected = computeDerived(attrs, options.age);

      if (typeof options.hp === "number" && options.hp !== expected.hp) {
        issues.push(`hp mismatch: expected ${expected.hp}, got ${options.hp}`);
      }
      if (typeof options.san === "number" && options.san !== expected.san) {
        issues.push(`san mismatch: expected ${expected.san}, got ${options.san}`);
      }
      if (typeof options.mp === "number" && options.mp !== expected.mp) {
        issues.push(`mp mismatch: expected ${expected.mp}, got ${options.mp}`);
      }
      if (typeof options.mov === "number" && options.mov !== expected.mov) {
        issues.push(`mov mismatch: expected ${expected.mov}, got ${options.mov}`);
      }
      if (typeof options.build === "number" && options.build !== expected.build) {
        issues.push(`build mismatch: expected ${expected.build}, got ${options.build}`);
      }
      if (typeof options.db === "string" && options.db !== expected.db) {
        issues.push(`db mismatch: expected ${expected.db}, got ${options.db}`);
      }

      if (issues.length === 0) {
        issues.push("none");
      }
      writeLine(
        wrapAgentResult(
          "COC_INVESTIGATOR_VALIDATE",
          formatValidateResult(issues[0] === "none", issues),
        ),
      );
    });

  investigator
    .command("build-table")
    .description("Lookup DB and BUILD from STR + SIZ.")
    .requiredOption("--str <value>", "STR", (v) => parsePositiveInt(v, "--str"))
    .requiredOption("--siz <value>", "SIZ", (v) => parsePositiveInt(v, "--siz"))
    .action((options: BuildTableOptions) => {
      const result = computeDbAndBuild(options.str, options.siz);
      writeLine(
        wrapAgentResult(
          "COC_INVESTIGATOR_BUILD_TABLE",
          [
            `str: ${options.str}`,
            `siz: ${options.siz}`,
            `sum: ${options.str + options.siz}`,
            `build: ${result.build}`,
            `db: ${result.db}`,
          ].join("\n"),
        ),
      );
    });

  investigator
    .command("mov")
    .description("Calculate MOV from STR/DEX/SIZ and age.")
    .requiredOption("--str <value>", "STR", (v) => parsePositiveInt(v, "--str"))
    .requiredOption("--dex <value>", "DEX", (v) => parsePositiveInt(v, "--dex"))
    .requiredOption("--siz <value>", "SIZ", (v) => parsePositiveInt(v, "--siz"))
    .option("--age <value>", "age", (v) => parsePositiveInt(v, "--age"), 25)
    .action((options: MovOptions) => {
      validateAge(options.age);
      const mov = computeMov(options.str, options.dex, options.siz, options.age);
      writeLine(
        wrapAgentResult(
          "COC_INVESTIGATOR_MOV",
          [
            `str: ${options.str}`,
            `dex: ${options.dex}`,
            `siz: ${options.siz}`,
            `age: ${options.age}`,
            `mov: ${mov}`,
          ].join("\n"),
        ),
      );
    });

  investigator
    .command("export")
    .description("Export an investigator snapshot as JSON or YAML.")
    .option("--format <value>", "json or yaml", "json")
    .option("--age <value>", "age", (v) => parsePositiveInt(v, "--age"), 25)
    .option("--formula <value>", "occupation formula for points")
    .option("--str <value>", "STR", (v) => parsePositiveInt(v, "--str"))
    .option("--con <value>", "CON", (v) => parsePositiveInt(v, "--con"))
    .option("--siz <value>", "SIZ", (v) => parsePositiveInt(v, "--siz"))
    .option("--dex <value>", "DEX", (v) => parsePositiveInt(v, "--dex"))
    .option("--app <value>", "APP", (v) => parsePositiveInt(v, "--app"))
    .option("--int <value>", "INT", (v) => parsePositiveInt(v, "--int"))
    .option("--pow <value>", "POW", (v) => parsePositiveInt(v, "--pow"))
    .option("--edu <value>", "EDU", (v) => parsePositiveInt(v, "--edu"))
    .option("--luck <value>", "LUCK", (v) => parsePositiveInt(v, "--luck"))
    .action((options: ExportOptions) => {
      const age = options.age ?? 25;
      validateAge(age);

      let attrs: Attributes;
      let notes: string[] = [];
      const identity: InvestigatorSheet["identity"] = { age };
      if (mustHaveAllStats(options)) {
        attrs = {
          str: options.str,
          con: options.con,
          siz: options.siz,
          dex: options.dex,
          app: options.app,
          int: options.int,
          pow: options.pow,
          edu: options.edu,
          luck: options.luck,
        };
      } else {
        const created = createInvestigator(age, randomInt);
        attrs = created.attributes;
        notes = created.notes;
      }

      const derived = computeDerived(attrs, age);
      const sheet = buildSheet(attrs, derived, notes, identity);
      const payload: Record<string, unknown> = {
        type: "coc_investigator_export",
        sheet,
      };

      if (options.formula) {
        payload.points = {
          occupation_formula: options.formula,
          occupation_points: parsePointsFormula(options.formula, toCoreRecord(attrs)),
          interest_formula: "int*2",
          interest_points: attrs.int * 2,
        };
      }

      const format = options.format?.toLowerCase();
      if (format === "yaml") {
        writeLine(toYaml(payload));
        return;
      }
      writeLine(JSON.stringify(payload, null, 2));
    });

  const markdown = investigator
    .command("markdown")
    .description(
      "Create/update/save investigator markdown character sheets for AI agent workflows.",
    );

  markdown
    .command("create")
    .description("Create a markdown character sheet with embedded validated JSON.")
    .requiredOption("-o, --output <file>", "markdown output file path")
    .option("--age <value>", "age (15-89)", (v) => parsePositiveInt(v, "--age"), 25)
    .option("--formula <value>", "occupation formula", "edu*4")
    .option("--name <value>", "investigator name")
    .option("--occupation <value>", "occupation")
    .action(async (options: MarkdownCreateOptions) => {
      const age = options.age ?? 25;
      const formula = options.formula ?? "edu*4";
      const created = createInvestigator(age, randomInt);
      const occupationPoints = parsePointsFormula(formula, toCoreRecord(created.attributes));
      const interestPoints = created.attributes.int * 2;
      const identity: InvestigatorSheet["identity"] = {
        age,
        name: options.name,
        occupation: options.occupation,
      };
      const sheet = buildSheet(created.attributes, created.derived, created.notes, identity);
      sheet.notes.push(`occupation_formula=${formula}`);
      sheet.notes.push(`occupation_points=${occupationPoints}`);
      sheet.notes.push(`interest_points=${interestPoints}`);
      await writeSheetMarkdown(options.output, sheet);
      writeLine(
        wrapAgentResult(
          "COC_INVESTIGATOR_MARKDOWN_CREATE",
          [
            `file: ${options.output}`,
            `schema: ${sheet.schema}`,
            `name: ${sheet.identity.name ?? ""}`,
            `occupation: ${sheet.identity.occupation ?? ""}`,
          ].join("\n"),
        ),
      );
    });

  markdown
    .command("update")
    .description("Update embedded sheet JSON by key paths, then re-render markdown.")
    .requiredOption("-f, --file <file>", "markdown file path")
    .option("--set <path=value>", "set one field, repeatable", collectMulti, [])
    .action(async (options: MarkdownUpdateOptions) => {
      const content = await readFile(options.file, "utf8");
      const current = extractSheetFromMarkdown(content);
      const mutable = structuredClone(current) as Record<string, unknown>;
      for (const pair of options.set ?? []) {
        const eq = pair.indexOf("=");
        if (eq === -1) {
          throw new Error(`Invalid --set "${pair}". Use path=value.`);
        }
        const path = pair.slice(0, eq).trim();
        const value = pair.slice(eq + 1).trim();
        setByPath(mutable, path, value);
      }
      const updated = validateInvestigatorSheet(mutable);
      await writeSheetMarkdown(options.file, updated);
      writeLine(
        wrapAgentResult(
          "COC_INVESTIGATOR_MARKDOWN_UPDATE",
          [`file: ${options.file}`, `updated_fields: ${(options.set ?? []).length}`].join("\n"),
        ),
      );
    });

  markdown
    .command("save")
    .description("Validate and normalize an existing markdown sheet by rewriting canonical format.")
    .requiredOption("-f, --file <file>", "markdown file path")
    .action(async (options: MarkdownSaveOptions) => {
      const content = await readFile(options.file, "utf8");
      const sheet = extractSheetFromMarkdown(content);
      await writeSheetMarkdown(options.file, sheet);
      writeLine(
        wrapAgentResult(
          "COC_INVESTIGATOR_MARKDOWN_SAVE",
          [`file: ${options.file}`, `schema: ${sheet.schema}`].join("\n"),
        ),
      );
    });

  markdown
    .command("export")
    .description("Export embedded sheet JSON from markdown file.")
    .requiredOption("-f, --file <file>", "markdown file path")
    .option("--format <value>", "json or yaml", "json")
    .action(async (options: MarkdownExportOptions) => {
      const content = await readFile(options.file, "utf8");
      const sheet = extractSheetFromMarkdown(content);
      if (options.format === "yaml") {
        writeLine(toYaml(sheet));
        return;
      }
      writeLine(JSON.stringify(sheet, null, 2));
    });

  const skills = investigator
    .command("skills")
    .description("Rule-aware skill helpers for sheet allocation/validation/growth.");

  skills
    .command("catalog")
    .description("Show built-in skill catalog with base values.")
    .option("--format <value>", "json or markdown", "markdown")
    .action((options: SkillsCatalogOptions) => {
      const values = Object.values(SKILL_CATALOG).sort((a, b) => a.key.localeCompare(b.key));
      if (options.format === "json") {
        writeLine(JSON.stringify(values, null, 2));
        return;
      }
      const lines = [
        "| key | name | base | category |",
        "| --- | --- | ---: | --- |",
        ...values.map(
          (skill) => `| ${skill.key} | ${skill.name} | ${skill.base} | ${skill.category} |`,
        ),
      ];
      writeLine(wrapAgentResult("COC_SKILLS_CATALOG", lines.join("\n")));
    });

  skills
    .command("allocate")
    .description("Allocate occupation/interest points into sheet.skills.")
    .requiredOption("--file <file>", "markdown file path")
    .option("--occupation-points <value>", "available occupation points", (v) =>
      parsePositiveInt(v, "--occupation-points"),
    )
    .option("--interest-points <value>", "available interest points", (v) =>
      parsePositiveInt(v, "--interest-points"),
    )
    .option("--set-occ <skill=points>", "occupation allocation pair", collectMulti, [])
    .option("--occ <skill=points>", "alias of --set-occ", collectMulti, [])
    .option("--set-int <skill=points>", "interest allocation pair", collectMulti, [])
    .option("--int <skill=points>", "alias of --set-int", collectMulti, [])
    .option("--allow-mythos-interest", "allow interest allocation into cthulhu_mythos")
    .action(async (options: SkillsAllocateOptions) => {
      const content = await readFile(options.file, "utf8");
      const sheet = extractSheetFromMarkdown(content);
      const occAlloc = parseAllocationPairs([...(options.setOcc ?? []), ...(options.occ ?? [])]);
      const intAlloc = parseAllocationPairs([...(options.setInt ?? []), ...(options.int ?? [])]);
      const usage = applySkillAllocation(sheet, occAlloc, intAlloc, options.allowMythosInterest);
      const issues = validateSkillsInternal(
        sheet,
        options.occupationPoints,
        options.interestPoints,
      );
      if (issues.length > 0) {
        throw new Error(`Skill allocation validation failed: ${issues.join("; ")}`);
      }
      const validated = validateInvestigatorSheet(sheet);
      await writeSheetMarkdown(options.file, validated);
      const leftOcc =
        typeof options.occupationPoints === "number"
          ? options.occupationPoints - usage.usedOcc
          : undefined;
      const leftInt =
        typeof options.interestPoints === "number"
          ? options.interestPoints - usage.usedInt
          : undefined;
      writeLine(
        wrapAgentResult(
          "COC_SKILLS_ALLOCATE",
          [
            `file: ${options.file}`,
            `available_occupation: ${options.occupationPoints ?? "n/a"}`,
            `used_occupation: ${usage.usedOcc}`,
            `left_occupation: ${leftOcc ?? "n/a"}`,
            `available_interest: ${options.interestPoints ?? "n/a"}`,
            `used_interest: ${usage.usedInt}`,
            `left_interest: ${leftInt ?? "n/a"}`,
            `skills_count: ${Object.keys(validated.skills).length}`,
          ].join("\n"),
        ),
      );
    });

  skills
    .command("validate")
    .description("Validate sheet.skills consistency and point budgets.")
    .requiredOption("--file <file>", "markdown file path")
    .option("--occupation-points <value>", "available occupation points", (v) =>
      parsePositiveInt(v, "--occupation-points"),
    )
    .option("--interest-points <value>", "available interest points", (v) =>
      parsePositiveInt(v, "--interest-points"),
    )
    .action(async (options: SkillsValidateOptions) => {
      const content = await readFile(options.file, "utf8");
      const sheet = extractSheetFromMarkdown(content);
      const usage = computeSkillSpend(sheet);
      const issues = validateSkillsInternal(
        sheet,
        options.occupationPoints,
        options.interestPoints,
      );
      const leftOcc =
        typeof options.occupationPoints === "number"
          ? options.occupationPoints - usage.usedOcc
          : undefined;
      const leftInt =
        typeof options.interestPoints === "number"
          ? options.interestPoints - usage.usedInt
          : undefined;
      writeLine(
        wrapAgentResult(
          "COC_SKILLS_VALIDATE",
          [
            `valid: ${issues.length === 0 ? "true" : "false"}`,
            `available_occupation: ${options.occupationPoints ?? "n/a"}`,
            `used_occupation: ${usage.usedOcc}`,
            `left_occupation: ${leftOcc ?? "n/a"}`,
            `available_interest: ${options.interestPoints ?? "n/a"}`,
            `used_interest: ${usage.usedInt}`,
            `left_interest: ${leftInt ?? "n/a"}`,
            "issues:",
            ...(issues.length === 0 ? ["- none"] : issues.map((issue) => `- ${issue}`)),
          ].join("\n"),
        ),
      );
    });

  skills
    .command("mark")
    .description("Mark skills for growth check (sets growthChecked=true).")
    .requiredOption("--file <file>", "markdown file path")
    .option("--skill <key>", "skill key to mark", collectMulti, [])
    .action(async (options: SkillsMarkOptions) => {
      const content = await readFile(options.file, "utf8");
      const sheet = extractSheetFromMarkdown(content);
      for (const keyRaw of options.skill ?? []) {
        const key = normalizeSkillKey(keyRaw);
        ensureSkillEntry(sheet, key);
        const entry = sheet.skills[key];
        if (entry) entry.growthChecked = true;
      }
      const validated = validateInvestigatorSheet(sheet);
      await writeSheetMarkdown(options.file, validated);
      writeLine(
        wrapAgentResult(
          "COC_SKILLS_MARK",
          [`file: ${options.file}`, `marked: ${(options.skill ?? []).length}`].join("\n"),
        ),
      );
    });

  skills
    .command("growth-check")
    .description("Run chapter-5 growth checks for marked skills or explicit --skill list.")
    .requiredOption("--file <file>", "markdown file path")
    .option("--skill <key>", "specific skills to process", collectMulti, [])
    .option("--roll <key=value>", "fixed d100 roll per skill", collectMulti, [])
    .option("--fixed-roll <key=value>", "alias of --roll", collectMulti, [])
    .action(async (options: SkillsGrowthOptions) => {
      const content = await readFile(options.file, "utf8");
      const sheet = extractSheetFromMarkdown(content);
      const fixedRolls = parseAllocationPairs([
        ...(options.roll ?? []),
        ...(options.fixedRoll ?? []),
      ]);

      const explicit = (options.skill ?? []).map((value) => normalizeSkillKey(value));
      const targetKeys =
        explicit.length > 0
          ? explicit
          : Object.entries(sheet.skills)
              .filter(([, skill]) => skill.growthChecked)
              .map(([key]) => key);

      const report: string[] = [];
      for (const key of targetKeys) {
        const entry = sheet.skills[key];
        if (!entry) {
          report.push(`${key}: skipped (missing)`);
          continue;
        }
        if (key === "credit_rating" || key === "cthulhu_mythos") {
          entry.growthChecked = false;
          report.push(`${key}: skipped (no growth checks by rule)`);
          continue;
        }
        const roll = fixedRolls[key] ?? randomInt(1, 100);
        let gain = 0;
        if (roll > entry.value || roll > 95) {
          gain = randomInt(1, 10);
          entry.occupation += gain;
        }
        recomputeSkill(entry);
        entry.growthChecked = false;
        report.push(`${key}: roll=${roll}, gain=${gain}, new_value=${entry.value}`);
      }

      const validated = validateInvestigatorSheet(sheet);
      await writeSheetMarkdown(options.file, validated);
      writeLine(
        wrapAgentResult(
          "COC_SKILLS_GROWTH_CHECK",
          [
            `file: ${options.file}`,
            `processed: ${targetKeys.length}`,
            "report:",
            ...(report.length === 0 ? ["- none"] : report.map((line) => `- ${line}`)),
          ].join("\n"),
        ),
      );
    });
}
