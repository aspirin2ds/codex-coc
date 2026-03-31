#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const REQUIRED_ATTRS = ["STR", "CON", "SIZ", "DEX", "APP", "INT", "POW", "EDU"];
const OPTIONAL_ATTRS = ["LUCK"];
const DEFAULT_PLAY_DIR = "play-data";
const DEFAULT_INVESTIGATOR_DIR = path.join(DEFAULT_PLAY_DIR, "investigators");
const CALCULATOR_VERSION = "1.1.0";

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
    outputPath: null,
    compact: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--compact") args.compact = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg === "--output") args.outputPath = argv[++i];
    else if (arg.startsWith("--output=")) args.outputPath = arg.slice("--output=".length);
    else if (!args.inputPath) args.inputPath = arg;
    else die(`Unknown argument: ${arg}`);
  }

  return args;
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function slugify(value, fallback = "investigator") {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function defaultOutputPath(args, input) {
  if (args.outputPath) return args.outputPath;
  if (args.inputPath) {
    const parsed = path.parse(args.inputPath);
    return path.join(DEFAULT_INVESTIGATOR_DIR, `${parsed.name}.json`);
  }
  const identityName = input?.identity?.name || input?.name;
  return path.join(DEFAULT_INVESTIGATOR_DIR, `${slugify(identityName)}.json`);
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

function toBreakdown(value) {
  if (!Number.isFinite(value)) return null;
  return {
    full: value,
    half: floorDiv(value, 2),
    fifth: floorDiv(value, 5),
  };
}

function toStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

function normalizeIdentity(input, age) {
  const raw = input.identity && typeof input.identity === "object" ? input.identity : {};
  const identity = {};

  if (raw.name != null) identity.name = String(raw.name);
  else if (input.name != null) identity.name = String(input.name);
  else identity.name = "未命名调查员";

  if (age != null) identity.age = age;
  if (raw.player != null) identity.player = String(raw.player);
  if (raw.sex != null) identity.sex = String(raw.sex);
  if (raw.gender != null) identity.gender = String(raw.gender);
  if (raw.era != null) identity.era = String(raw.era);
  if (raw.setting != null) identity.setting = String(raw.setting);
  if (raw.residence != null) identity.residence = String(raw.residence);
  if (raw.birthplace != null) identity.birthplace = String(raw.birthplace);
  if (raw.portrait != null) identity.portrait = String(raw.portrait);

  return identity;
}

function normalizeSkillEntries(rawSkills, fallbackBreakdowns) {
  if (Array.isArray(rawSkills)) {
    return rawSkills
      .filter((skill) => skill && typeof skill === "object" && skill.name)
      .map((skill) => {
        const numeric = Number(skill.value?.full ?? skill.value ?? skill.full ?? skill.base);
        const breakdown = skill.value && typeof skill.value === "object"
          ? skill.value
          : fallbackBreakdowns?.[skill.name] || toBreakdown(numeric);
        if (!breakdown) return null;

        const normalized = {
          name: String(skill.name),
          value: breakdown,
        };
        if (skill.specialization != null) normalized.specialization = String(skill.specialization);
        if (skill.category != null) normalized.category = String(skill.category);
        if (skill.base != null && Number.isFinite(Number(skill.base))) normalized.base = Number(skill.base);
        if (skill.checked != null) normalized.checked = Boolean(skill.checked);
        if (skill.occupationPoints != null && Number.isFinite(Number(skill.occupationPoints))) {
          normalized.occupationPoints = Number(skill.occupationPoints);
        }
        if (skill.interestPoints != null && Number.isFinite(Number(skill.interestPoints))) {
          normalized.interestPoints = Number(skill.interestPoints);
        }
        if (skill.notes != null) normalized.notes = String(skill.notes);
        return normalized;
      })
      .filter(Boolean);
  }

  if (!rawSkills || typeof rawSkills !== "object") return [];

  return Object.entries(rawSkills).flatMap(([name, rawValue]) => {
    const numeric = Number(rawValue);
    const breakdown = fallbackBreakdowns?.[name] || toBreakdown(numeric);
    if (!breakdown) return [];
    return [{
      name,
      value: breakdown,
    }];
  });
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
        "  node scripts/calc-sheet.js [input.json] [--output=path/to/sheet.json] [--compact]",
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
        "",
        "Default output:",
        `  ${DEFAULT_INVESTIGATOR_DIR}/<input-file-stem>.json`,
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

  const rawSkills = input.skills && typeof input.skills === "object" ? input.skills : [];
  const normalizedSkillValues = {};
  if (!Array.isArray(rawSkills) && rawSkills && typeof rawSkills === "object") {
    for (const [key, value] of Object.entries(rawSkills)) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        warnings.push(`Skill ${key} is not numeric and was skipped.`);
        continue;
      }
      normalizedSkillValues[key] = numeric;
    }
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

  const attributesHalfFifth = computeHalfFifthMap(attrs);
  const skillsHalfFifth = computeHalfFifthMap(normalizedSkillValues);
  const normalizedSkills = normalizeSkillEntries(input.skills, skillsHalfFifth);
  const normalizedIdentity = normalizeIdentity(input, age);
  const occupationRange = occupation?.creditRating != null ? parseCreditRange(occupation.creditRating) : null;

  const result = {
    schemaVersion: "1.0.0",
    status: "playable",
    identity: normalizedIdentity,
    attributes: attributesHalfFifth,
    derived: {
      SAN: toBreakdown(derived.SAN),
      HP: derived.HP,
      MP: derived.MP,
      MOV: derived.MOV,
      DB: derived.DB,
      Build: derived.Build,
      maxSanity: 99,
    },
    occupation: occupation
      ? {
          name: occupation.name || "未定职业",
          pointsFormula: occupation.pointsFormula || null,
          occupationPoints,
          interestPoints,
          ...(input.creditRating != null ? { creditRating } : {}),
          ...(occupationRange ? { creditRatingRange: occupationRange } : {}),
          ...(creditSummary?.lifestyle ? { lifestyle: creditSummary.lifestyle } : {}),
          ...(occupation.description ? { description: String(occupation.description) } : {}),
        }
      : {
          name: "未定职业",
          interestPoints,
        },
    skills: normalizedSkills,
    background: input.background && typeof input.background === "object" ? input.background : {},
    source: {
      generatedAt: new Date().toISOString(),
      generatedBy: "skills/coc-keeper/scripts/calc-sheet.js",
    },
    builder: {
      ageAdjustmentsApplied: input.ageAdjustmentsApplied === true,
      eduImprovementsApplied: input.eduImprovementsApplied === true,
      calculatorVersion: CALCULATOR_VERSION,
      inputSnapshot: input,
    },
    validation: {
      ok: warnings.length === 0,
      warnings,
    },
    assumptions: [
      "attributesAreFinal",
      "noRandomRollingPerformed",
      "noAutomaticAgeAdjustmentsApplied",
      `ownLanguageBase=${ownLanguage}`,
    ],
  };

  const outputPath = path.resolve(process.cwd(), defaultOutputPath(args, input));
  ensureParentDir(outputPath);
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, args.compact ? 0 : 2)}\n`);

  process.stdout.write(JSON.stringify(result, null, args.compact ? 0 : 2));
  process.stdout.write("\n");
}

main();
