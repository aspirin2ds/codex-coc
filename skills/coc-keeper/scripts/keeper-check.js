#!/usr/bin/env node

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function parseArgs(argv) {
  const args = {
    skill: null,
    roll: null,
    difficulty: "regular",
    label: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--skill") args.skill = Number(argv[++i]);
    else if (arg === "--roll") args.roll = Number(argv[++i]);
    else if (arg === "--difficulty") args.difficulty = String(argv[++i]).toLowerCase();
    else if (arg === "--label") args.label = String(argv[++i]);
    else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage:",
          "  node skills/coc-keeper/scripts/keeper-check.js --skill <value> --roll <1-100> [--difficulty regular|hard|extreme] [--label 技能名]",
          "",
          "Examples:",
          "  node skills/coc-keeper/scripts/keeper-check.js --skill 70 --roll 32 --label 追踪",
          "  node skills/coc-keeper/scripts/keeper-check.js --skill 45 --roll 21 --difficulty hard --label 潜行",
        ].join("\n"),
      );
      process.exit(0);
    } else {
      die(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isFinite(args.skill) || !Number.isFinite(args.roll)) {
    die("Both --skill and --roll are required and must be numeric.");
  }

  return args;
}

function validateRange(name, value, min, max) {
  if (value < min || value > max) {
    die(`${name} must be between ${min} and ${max}.`);
  }
}

function normalizeDifficulty(input) {
  const map = {
    regular: "regular",
    normal: "regular",
    common: "regular",
    常规: "regular",
    普通: "regular",
    hard: "hard",
    困难: "hard",
    extreme: "extreme",
    极难: "extreme",
  };

  const value = map[input];
  if (!value) {
    die("difficulty must be one of: regular, hard, extreme.");
  }

  return value;
}

function computeThresholds(skill) {
  return {
    regular: skill,
    hard: Math.floor(skill / 2),
    extreme: Math.floor(skill / 5),
  };
}

function computeOutcome(skill, roll) {
  const thresholds = computeThresholds(skill);
  const criticalSuccess = roll === 1;
  const fumble = roll === 100 || (skill < 50 && roll >= 96);

  let successRank = 0;
  let successLevel = "failure";
  let successLabel = "失败";

  if (criticalSuccess) {
    successRank = 4;
    successLevel = "critical";
    successLabel = "大成功";
  } else if (fumble) {
    successRank = -1;
    successLevel = "fumble";
    successLabel = "大失败";
  } else if (roll <= thresholds.extreme) {
    successRank = 3;
    successLevel = "extreme";
    successLabel = "极难成功";
  } else if (roll <= thresholds.hard) {
    successRank = 2;
    successLevel = "hard";
    successLabel = "困难成功";
  } else if (roll <= thresholds.regular) {
    successRank = 1;
    successLevel = "regular";
    successLabel = "常规成功";
  }

  return {
    thresholds,
    successRank,
    successLevel,
    successLabel,
    criticalSuccess,
    fumble,
  };
}

function difficultyToRank(difficulty) {
  if (difficulty === "regular") return 1;
  if (difficulty === "hard") return 2;
  return 3;
}

function difficultyToLabel(difficulty) {
  if (difficulty === "regular") return "常规";
  if (difficulty === "hard") return "困难";
  return "极难";
}

function resultSummary(check, difficulty) {
  if (check.fumble) return "检定失败，且属于大失败。";
  if (check.criticalSuccess) return "检定成功，且属于大成功。";

  const passed = check.successRank >= difficultyToRank(difficulty);
  if (passed) {
    return `检定成功，达到${check.successLabel}。`;
  }

  if (check.successRank > 0) {
    return `有成功等级，但未达到要求的${difficultyToLabel(difficulty)}难度。`;
  }

  return "检定失败。";
}

function keeperPrompt(passed, check) {
  if (check.fumble) return "建议直接引入严重代价，且不要让孤注一骰抵消这次后果。";
  if (check.criticalSuccess) return "建议给出额外信息、优势位置，或让后续风险显著下降。";
  if (passed && check.successLevel === "extreme") return "建议让行动高质量完成，并附带额外收益或更快推进。";
  if (passed && check.successLevel === "hard") return "建议让行动稳稳推进，并减少后续压力。";
  if (passed) return "建议正常推进场景，并明确玩家具体获得了什么。";
  return "建议使用 fail-forward：前进，但付出时间、位置、资源或安全上的代价。";
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  validateRange("skill", args.skill, 1, 99);
  validateRange("roll", args.roll, 1, 100);

  const difficulty = normalizeDifficulty(args.difficulty);
  const check = computeOutcome(args.skill, args.roll);
  const passed = check.successRank >= difficultyToRank(difficulty);

  const output = {
    label: args.label || null,
    skill: args.skill,
    roll: args.roll,
    difficulty: {
      code: difficulty,
      label: difficultyToLabel(difficulty),
      target: check.thresholds[difficulty],
    },
    thresholds: check.thresholds,
    outcome: {
      passed,
      successLevel: check.successLevel,
      successLabel: check.successLabel,
      criticalSuccess: check.criticalSuccess,
      fumble: check.fumble,
    },
    summary: resultSummary(check, difficulty),
    keeperPrompt: keeperPrompt(passed, check),
  };

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

main();
