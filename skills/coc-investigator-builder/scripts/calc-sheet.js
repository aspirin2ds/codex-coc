#!/usr/bin/env node

const fs = require("node:fs");

const REQUIRED_ATTRS = ["STR", "CON", "SIZ", "DEX", "APP", "INT", "POW", "EDU"];
const OPTIONAL_ATTRS = ["LUCK"];

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function floorDiv(value, divisor) {
  return Math.floor(value / divisor);
}

function parseArgs(argv) {
  const args = {
    inputPath: null,
    compact: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === "--compact") args.compact = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (!args.inputPath) args.inputPath = arg;
    else die(`Unknown argument: ${arg}`);
  }

  return args;
}

function readInput(inputPath) {
  if (inputPath) return fs.readFileSync(inputPath, "utf8");
  if (!process.stdin.isTTY) return fs.readFileSync(0, "utf8");
  die("Provide an input JSON file path or pipe JSON to stdin.");
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    die(`Invalid JSON input: ${error.message}`);
  }
}

function normalizeAttributes(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    die("Input must include an 'attributes' object.");
  }

  const attrs = {};
  for (const key of [...REQUIRED_ATTRS, ...OPTIONAL_ATTRS]) {
    if (raw[key] == null) continue;
    const value = Number(raw[key]);
    if (!Number.isFinite(value)) die(`Attribute ${key} must be numeric.`);
    attrs[key] = value;
  }

  for (const key of REQUIRED_ATTRS) {
    if (attrs[key] == null) die(`Missing required attribute: ${key}`);
  }

  return attrs;
}

function parseFormula(formula, attrs) {
  if (!formula) return null;
  if (Array.isArray(formula)) {
    return formula.reduce((sum, term) => sum + formulaTermValue(term, attrs), 0);
  }
  if (typeof formula === "object") {
    return formulaTermValue(formula, attrs);
  }
  if (typeof formula !== "string") {
    die("occupation.pointsFormula must be a string, object, or array.");
  }

  const compact = formula.replace(/\s+/g, "");
  if (!compact) return null;

  const parts = compact.split("+");
  return parts.reduce((sum, part) => {
    const match = part.match(/^([A-Z]+)(?:x|\*)(\d+)$/i);
    if (!match) die(`Unsupported occupation points formula segment: ${part}`);
    const attr = match[1].toUpperCase();
    const mult = Number(match[2]);
    if (!(attr in attrs)) die(`Unknown attribute in points formula: ${attr}`);
    return sum + attrs[attr] * mult;
  }, 0);
}

function formulaTermValue(term, attrs) {
  if (!term || typeof term !== "object") die("Invalid occupation formula term.");
  const attr = String(term.attr || "").toUpperCase();
  const mult = Number(term.mult);
  if (!(attr in attrs)) die(`Unknown attribute in formula term: ${attr}`);
  if (!Number.isFinite(mult)) die(`Invalid multiplier for ${attr}`);
  return attrs[attr] * mult;
}

function parseCreditRange(value) {
  if (value == null) return null;
  if (typeof value === "string") {
    const match = value.trim().match(/^(-?\d+)\s*-\s*(\d+)$/);
    if (!match) die(`Invalid credit rating range: ${value}`);
    return { min: Number(match[1]), max: Number(match[2]) };
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    const min = Number(value.min);
    const max = Number(value.max);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      die("creditRating range object must include numeric min/max.");
    }
    return { min, max };
  }
  die("creditRating range must be a string like '30-70' or an object with min/max.");
}

function computeDbBuild(total) {
  if (total <= 64) return { db: "-2", build: -2 };
  if (total <= 84) return { db: "-1", build: -1 };
  if (total <= 124) return { db: "0", build: 0 };
  if (total <= 164) return { db: "+1d4", build: 1 };
  if (total <= 204) return { db: "+1d6", build: 2 };
  if (total <= 284) return { db: "+2d6", build: 3 };

  const extraSteps = Math.ceil((total - 284) / 80);
  return { db: `+${2 + extraSteps}d6`, build: 3 + extraSteps };
}

function computeMov(attrs, age) {
  let mov = 8;
  if (attrs.STR < attrs.SIZ && attrs.DEX < attrs.SIZ) mov = 7;
  else if (attrs.STR > attrs.SIZ && attrs.DEX > attrs.SIZ) mov = 9;

  if (age >= 40 && age <= 49) mov -= 1;
  else if (age >= 50 && age <= 59) mov -= 2;
  else if (age >= 60 && age <= 69) mov -= 3;
  else if (age >= 70 && age <= 79) mov -= 4;
  else if (age >= 80 && age <= 89) mov -= 5;

  return mov;
}

function lifestyleForCreditRating(cr) {
  if (cr <= 0) return "身无分文";
  if (cr <= 9) return "贫穷";
  if (cr <= 49) return "标准";
  if (cr <= 89) return "小康";
  if (cr <= 98) return "富裕";
  return "豪富";
}

function computeHalfFifthMap(record) {
  const out = {};
  for (const [key, value] of Object.entries(record || {})) {
    if (!Number.isFinite(value)) continue;
    out[key] = {
      full: value,
      half: floorDiv(value, 2),
      fifth: floorDiv(value, 5),
    };
  }
  return out;
}

function compareProvidedDerived(expected, provided) {
  const mismatches = [];
  if (!provided || typeof provided !== "object") return mismatches;

  for (const [key, value] of Object.entries(provided)) {
    if (!(key in expected)) continue;
    if (String(expected[key]) !== String(value)) {
      mismatches.push({
        field: key,
        provided: value,
        expected: expected[key],
      });
    }
  }
  return mismatches;
}

function validateAttributeRanges(attrs, warnings) {
  for (const key of REQUIRED_ATTRS) {
    const value = attrs[key];
    if (value < 0 || value > 99) {
      warnings.push(`${key}=${value} is outside the normal 0-99 investigator range.`);
    }
  }
  if (attrs.LUCK != null && attrs.LUCK < 0) {
    warnings.push(`LUCK=${attrs.LUCK} is below 0.`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(
      [
        "Usage:",
        "  node scripts/calc-sheet.js [input.json] [--compact]",
        "",
        "Input JSON schema:",
        "  {",
        '    "age": 32,',
        '    "attributes": {"STR":50,"CON":60,"SIZ":65,"DEX":55,"APP":50,"INT":70,"POW":60,"EDU":80,"LUCK":55},',
        '    "occupation": {"name":"教授","pointsFormula":"EDUx4","creditRating":"40-80"},',
        '    "creditRating": 55,',
        '    "skills": {"图书馆使用":70,"心理学":40},',
        '    "derived": {"HP":12,"MOV":8}',
        "  }",
      ].join("\n"),
    );
    process.exit(0);
  }

  const input = parseJson(readInput(args.inputPath));
  const attrs = normalizeAttributes(input.attributes);
  const warnings = [];
  validateAttributeRanges(attrs, warnings);

  const age = input.age == null ? null : Number(input.age);
  if (input.age != null && !Number.isFinite(age)) die("age must be numeric.");
  if (age != null && (age < 15 || age > 90)) {
    warnings.push(`age=${age} is outside the usual 15-90 investigator range.`);
  }

  const occupation = input.occupation && typeof input.occupation === "object" ? input.occupation : null;
  const occupationPoints = occupation ? parseFormula(occupation.pointsFormula, attrs) : null;
  const interestPoints = attrs.INT * 2;
  const ownLanguage = attrs.EDU;
  const hp = floorDiv(attrs.CON + attrs.SIZ, 10);
  const mp = floorDiv(attrs.POW, 5);
  const san = attrs.POW;
  const mov = computeMov(attrs, age);
  const dbBuild = computeDbBuild(attrs.STR + attrs.SIZ);

  const derived = {
    SAN: san,
    HP: hp,
    MP: mp,
    MOV: mov,
    DB: dbBuild.db,
    Build: dbBuild.build,
  };

  const creditRating = input.creditRating == null ? null : Number(input.creditRating);
  let creditSummary = null;
  if (input.creditRating != null) {
    if (!Number.isFinite(creditRating)) die("creditRating must be numeric.");
    creditSummary = {
      value: creditRating,
      lifestyle: lifestyleForCreditRating(creditRating),
      inOccupationRange: null,
      range: null,
    };

    if (occupation?.creditRating != null) {
      const range = parseCreditRange(occupation.creditRating);
      creditSummary.range = range;
      creditSummary.inOccupationRange = creditRating >= range.min && creditRating <= range.max;
      if (!creditSummary.inOccupationRange) {
        warnings.push(
          `creditRating=${creditRating} falls outside occupation range ${range.min}-${range.max}.`,
        );
      }
    }
  }

  const skillValues = input.skills && typeof input.skills === "object" ? input.skills : {};
  const normalizedSkills = {};
  for (const [key, value] of Object.entries(skillValues)) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      warnings.push(`Skill ${key} is not numeric and was skipped.`);
      continue;
    }
    normalizedSkills[key] = numeric;
  }

  const mismatches = compareProvidedDerived(derived, input.derived);
  for (const mismatch of mismatches) {
    warnings.push(
      `Provided derived field ${mismatch.field}=${mismatch.provided} does not match computed ${mismatch.expected}.`,
    );
  }

  if (age != null && age >= 40 && input.ageAdjustmentsApplied !== true) {
    warnings.push(
      "Age is 40+ and ageAdjustmentsApplied is not true; verify STR/CON/DEX/APP and MOV already include age adjustments.",
    );
  }
  if (age != null && age >= 20 && input.eduImprovementsApplied !== true) {
    warnings.push(
      "Age is 20+ and eduImprovementsApplied is not true; verify EDU improvement checks were already resolved if needed.",
    );
  }
  if (attrs.LUCK == null) {
    warnings.push("LUCK is missing; the script cannot validate luck-dependent fields.");
  }

  const result = {
    ok: warnings.length === 0,
    assumptions: {
      attributesAreFinal: true,
      noRandomRollingPerformed: true,
      noAutomaticAgeAdjustmentsApplied: true,
    },
    occupation: occupation
      ? {
          name: occupation.name || null,
          pointsFormula: occupation.pointsFormula || null,
          points: occupationPoints,
          creditRatingRange: occupation.creditRating || null,
        }
      : null,
    attributes: attrs,
    attributesHalfFifth: computeHalfFifthMap(attrs),
    derived,
    budgets: {
      occupationPoints,
      interestPoints,
      ownLanguage,
    },
    creditRating: creditSummary,
    skills: normalizedSkills,
    skillsHalfFifth: computeHalfFifthMap(normalizedSkills),
    warnings,
  };

  process.stdout.write(JSON.stringify(result, null, args.compact ? 0 : 2));
  process.stdout.write("\n");
}

main();
