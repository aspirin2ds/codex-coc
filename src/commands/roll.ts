import type { Command } from "commander";

type Outcome =
  | "CRITICAL_SUCCESS"
  | "EXTREME_SUCCESS"
  | "HARD_SUCCESS"
  | "SUCCESS"
  | "FAILURE"
  | "FUMBLE";

type CheckResult = {
  type: "coc_check";
  mode: "normal" | "bonus" | "penalty";
  target: number;
  ones: number;
  tens: number[];
  candidates: number[];
  result: number;
  outcome: Outcome;
};

type OpposedSide = {
  name: string;
  target: number;
  roll: number;
  outcome: Outcome;
};

type OpposedResult = {
  type: "coc_opposed";
  a: OpposedSide;
  b: OpposedSide;
  winner: "a" | "b" | "tie";
  reason: "higher_success_level" | "higher_target_on_tie" | "same_level_and_target";
};

type LuckResult = {
  type: "coc_luck";
  value: number;
  roll: number;
  passed: boolean;
};

type DiceRollResult = {
  type: "coc_dice";
  expression: string;
  normalized: string;
  dice: string[];
  result: number;
};

type RollDeps = {
  writeLine?: (value: string) => void;
  randomInt?: (min: number, max: number) => number;
};

type CheckOptions = {
  target: number;
  bonus?: number;
  penalty?: number;
};

const DEFAULT_MAX_TARGET = 200;

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

function validateTarget(target: number, optionName: string): void {
  if (!Number.isFinite(target) || target < 1 || target > DEFAULT_MAX_TARGET) {
    throw new Error(`${optionName} must be between 1 and ${DEFAULT_MAX_TARGET}.`);
  }
}

function percentileFromTensAndOnes(tensDigit: number, onesDigit: number): number {
  const value = tensDigit * 10 + onesDigit;
  return value === 0 ? 100 : value;
}

function classifyOutcome(roll: number, target: number): Outcome {
  if (roll === 1) return "CRITICAL_SUCCESS";
  if (roll === 100 || (target < 50 && roll >= 96)) return "FUMBLE";
  if (roll <= Math.floor(target / 5)) return "EXTREME_SUCCESS";
  if (roll <= Math.floor(target / 2)) return "HARD_SUCCESS";
  if (roll <= target) return "SUCCESS";
  return "FAILURE";
}

function outcomeRank(outcome: Outcome): number {
  switch (outcome) {
    case "CRITICAL_SUCCESS":
      return 5;
    case "EXTREME_SUCCESS":
      return 4;
    case "HARD_SUCCESS":
      return 3;
    case "SUCCESS":
      return 2;
    case "FAILURE":
      return 1;
    case "FUMBLE":
      return 0;
  }
}

function evaluateCheck(
  options: CheckOptions,
  randomInt: (min: number, max: number) => number,
): CheckResult {
  validateTarget(options.target, "--target");
  const bonus = options.bonus ?? 0;
  const penalty = options.penalty ?? 0;

  if (bonus > 0 && penalty > 0) {
    throw new Error("Choose either --bonus or --penalty.");
  }

  const extraTens = Math.max(bonus, penalty);
  const mode = bonus > 0 ? "bonus" : penalty > 0 ? "penalty" : "normal";
  const ones = randomInt(0, 9);

  const tensDigits: number[] = [];
  const candidates: number[] = [];
  for (let i = 0; i < extraTens + 1; i += 1) {
    const tensDigit = randomInt(0, 9);
    tensDigits.push(tensDigit);
    candidates.push(percentileFromTensAndOnes(tensDigit, ones));
  }

  const result =
    mode === "bonus"
      ? Math.min(...candidates)
      : mode === "penalty"
        ? Math.max(...candidates)
        : candidates[0];
  if (typeof result !== "number") {
    throw new Error("Failed to compute roll result.");
  }

  return {
    type: "coc_check",
    mode,
    target: options.target,
    ones,
    tens: tensDigits.map((v) => v * 10),
    candidates,
    result,
    outcome: classifyOutcome(result, options.target),
  };
}

function evaluateOpposed(
  aTarget: number,
  bTarget: number,
  randomInt: (min: number, max: number) => number,
): OpposedResult {
  validateTarget(aTarget, "--a");
  validateTarget(bTarget, "--b");

  const aRoll = randomInt(1, 100);
  const bRoll = randomInt(1, 100);
  const aOutcome = classifyOutcome(aRoll, aTarget);
  const bOutcome = classifyOutcome(bRoll, bTarget);
  const aRank = outcomeRank(aOutcome);
  const bRank = outcomeRank(bOutcome);

  if (aRank > bRank) {
    return {
      type: "coc_opposed",
      a: { name: "a", target: aTarget, roll: aRoll, outcome: aOutcome },
      b: { name: "b", target: bTarget, roll: bRoll, outcome: bOutcome },
      winner: "a",
      reason: "higher_success_level",
    };
  }

  if (bRank > aRank) {
    return {
      type: "coc_opposed",
      a: { name: "a", target: aTarget, roll: aRoll, outcome: aOutcome },
      b: { name: "b", target: bTarget, roll: bRoll, outcome: bOutcome },
      winner: "b",
      reason: "higher_success_level",
    };
  }

  if (aTarget > bTarget) {
    return {
      type: "coc_opposed",
      a: { name: "a", target: aTarget, roll: aRoll, outcome: aOutcome },
      b: { name: "b", target: bTarget, roll: bRoll, outcome: bOutcome },
      winner: "a",
      reason: "higher_target_on_tie",
    };
  }

  if (bTarget > aTarget) {
    return {
      type: "coc_opposed",
      a: { name: "a", target: aTarget, roll: aRoll, outcome: aOutcome },
      b: { name: "b", target: bTarget, roll: bRoll, outcome: bOutcome },
      winner: "b",
      reason: "higher_target_on_tie",
    };
  }

  return {
    type: "coc_opposed",
    a: { name: "a", target: aTarget, roll: aRoll, outcome: aOutcome },
    b: { name: "b", target: bTarget, roll: bRoll, outcome: bOutcome },
    winner: "tie",
    reason: "same_level_and_target",
  };
}

function evaluateLuck(value: number, randomInt: (min: number, max: number) => number): LuckResult {
  validateTarget(value, "--value");
  const roll = randomInt(1, 100);
  return {
    type: "coc_luck",
    value,
    roll,
    passed: roll <= value,
  };
}

function evaluateDiceExpression(
  expression: string,
  randomInt: (min: number, max: number) => number,
): DiceRollResult {
  const normalized = expression.replaceAll(/\s+/g, "");
  if (!normalized) {
    throw new Error("Expression cannot be empty.");
  }

  const tokenPattern = /\d*d\d+|\d+|[()+\-*/]/gi;
  const tokens = normalized.match(tokenPattern);
  if (!tokens || tokens.join("") !== normalized) {
    throw new Error("Invalid dice expression. Use forms like 3d6*5 or (2d6+6)*5.");
  }

  let index = 0;
  const diceDetails: string[] = [];

  const peek = (): string | undefined => tokens[index];
  const consume = (): string => {
    const token = tokens[index];
    if (!token) throw new Error("Unexpected end of expression.");
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
    while (peek() === "*" || peek() === "/") {
      const op = consume();
      const rhs = parseFactor();
      if (op === "/" && rhs === 0) {
        throw new Error("Division by zero is not allowed.");
      }
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  };

  const parseFactor = (): number => {
    const token = peek();
    if (!token) throw new Error("Unexpected end of expression.");

    if (token === "(") {
      consume();
      const inner = parseExpression();
      if (consume() !== ")") {
        throw new Error("Mismatched parentheses.");
      }
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
    const diceMatch = token.match(/^(\d*)d(\d+)$/i);
    if (diceMatch) {
      const count = diceMatch[1] ? Number.parseInt(diceMatch[1], 10) : 1;
      const sidesToken = diceMatch[2];
      if (!sidesToken) {
        throw new Error(`Invalid dice token "${token}".`);
      }
      const sides = Number.parseInt(sidesToken, 10);
      if (count < 1 || count > 200) {
        throw new Error("Dice count must be between 1 and 200.");
      }
      if (sides < 2 || sides > 1000) {
        throw new Error("Dice sides must be between 2 and 1000.");
      }
      const rolls: number[] = [];
      let subtotal = 0;
      for (let i = 0; i < count; i += 1) {
        const roll = randomInt(1, sides);
        rolls.push(roll);
        subtotal += roll;
      }
      diceDetails.push(`${count}d${sides}: [${rolls.join(", ")}] => ${subtotal}`);
      return subtotal;
    }

    const parsed = Number.parseInt(token, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid token "${token}".`);
    }
    return parsed;
  };

  const result = parseExpression();
  if (index !== tokens.length) {
    throw new Error(`Unexpected token "${tokens[index]}".`);
  }

  return {
    type: "coc_dice",
    expression,
    normalized,
    dice: diceDetails,
    result,
  };
}

function formatCheck(result: CheckResult): string {
  return [
    "ROLL_RESULT: COC_CHECK",
    `mode: ${result.mode}`,
    `target: ${result.target}`,
    `ones: ${result.ones}`,
    `tens: [${result.tens.join(", ")}]`,
    `candidates: [${result.candidates.join(", ")}]`,
    `result: ${result.result}`,
    `outcome: ${result.outcome}`,
  ].join("\n");
}

function formatOpposed(result: OpposedResult): string {
  return [
    "ROLL_RESULT: COC_OPPOSED",
    `a_target: ${result.a.target}`,
    `a_roll: ${result.a.roll}`,
    `a_outcome: ${result.a.outcome}`,
    `b_target: ${result.b.target}`,
    `b_roll: ${result.b.roll}`,
    `b_outcome: ${result.b.outcome}`,
    `winner: ${result.winner}`,
    `reason: ${result.reason}`,
  ].join("\n");
}

function formatLuck(result: LuckResult): string {
  return [
    "ROLL_RESULT: COC_LUCK",
    `value: ${result.value}`,
    `roll: ${result.roll}`,
    `passed: ${result.passed ? "true" : "false"}`,
  ].join("\n");
}

function formatDice(result: DiceRollResult): string {
  return [
    "ROLL_RESULT: COC_DICE",
    `expression: ${result.expression}`,
    `normalized: ${result.normalized}`,
    "dice:",
    ...result.dice.map((line) => `- ${line}`),
    `result: ${result.result}`,
  ].join("\n");
}

export function registerRollCommand(program: Command, deps?: RollDeps): void {
  const writeLine = deps?.writeLine ?? console.log;
  const randomInt = deps?.randomInt ?? defaultRandomInt;

  const roll = program
    .command("roll")
    .description("CoC-only dice command. Subcommands: check, opposed, luck, dice.");

  roll
    .command("check")
    .description("Percentile skill/attribute check.")
    .requiredOption("-t, --target <value>", "skill/attribute target value", (v) =>
      parsePositiveInt(v, "--target"),
    )
    .option("--bonus <count>", "bonus dice count", (v) => parsePositiveInt(v, "--bonus"))
    .option("--penalty <count>", "penalty dice count", (v) => parsePositiveInt(v, "--penalty"))
    .action((options: CheckOptions) => {
      const result = evaluateCheck(options, randomInt);
      writeLine(formatCheck(result));
    });

  roll
    .command("opposed")
    .description("Opposed check between side A and side B.")
    .requiredOption("--a <target>", "side A target", (v) => parsePositiveInt(v, "--a"))
    .requiredOption("--b <target>", "side B target", (v) => parsePositiveInt(v, "--b"))
    .action((options: { a: number; b: number }) => {
      const result = evaluateOpposed(options.a, options.b, randomInt);
      writeLine(formatOpposed(result));
    });

  roll
    .command("luck")
    .description("Luck check.")
    .requiredOption("-v, --value <target>", "luck value", (v) => parsePositiveInt(v, "--value"))
    .action((options: { value: number }) => {
      const result = evaluateLuck(options.value, randomInt);
      writeLine(formatLuck(result));
    });

  roll
    .command("dice")
    .description("Normal dice expression roll, useful for CoC character building.")
    .argument("<expression>", "example: 3d6*5 or (2d6+6)*5")
    .action((expression: string) => {
      const result = evaluateDiceExpression(expression, randomInt);
      writeLine(formatDice(result));
    });
}
