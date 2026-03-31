#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const TEMPLATE_DIR = path.resolve(__dirname, "../templates");

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function parseArgs(argv) {
  const args = {
    input: null,
    output: null,
    title: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--input") args.input = argv[++i];
    else if (arg === "--output") args.output = argv[++i];
    else if (arg === "--title") args.title = argv[++i];
    else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage:",
          "  node skills/coc-keeper/scripts/render-markdown.js --input <file.json> [--output <file.md>] [--title <title>]",
          "  cat data.json | node skills/coc-keeper/scripts/render-markdown.js [--title <title>]",
          "",
          "Templates:",
          "  - investigator.md.mustache",
          "  - scene-summary.md.mustache",
          "  - generic.md.mustache",
        ].join("\n"),
      );
      process.exit(0);
    } else {
      die(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function readInput(inputPath) {
  if (inputPath) return fs.readFileSync(inputPath, "utf8");
  if (!process.stdin.isTTY) return fs.readFileSync(0, "utf8");
  die("Provide --input <file.json> or pipe JSON to stdin.");
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    die(`Invalid JSON input: ${error.message}`);
  }
}

function isPrimitive(value) {
  return value == null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function asText(value, fallback = "—") {
  if (value == null || value === "") return fallback;
  if (Array.isArray(value)) return value.length ? value.join("、") : fallback;
  return String(value);
}

function boolText(value) {
  if (value == null) return "—";
  return value ? "是" : "否";
}

function formatKey(key) {
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function markdownTable(headers, rows) {
  if (!rows.length) return "- —";
  const normalized = rows.map((row) =>
    row.map((cell) => asText(cell).replace(/\|/g, "\\|")),
  );
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...normalized.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function bulletBlock(items, fallback = "- —") {
  if (!items || !items.length) return fallback;
  return items.map((item) => `- ${item}`).join("\n");
}

function namedNotes(items) {
  if (!items || !items.length) return "- —";
  return items.map((item) => {
    if (typeof item === "string") return `- ${item}`;
    if (!item) return "- —";
    if (item.notes) return `- ${item.name}: ${item.notes}`;
    return `- ${item.name}`;
  }).join("\n");
}

function inferType(data) {
  if (data && data.schemaVersion === "1.0.0" && data.identity && data.attributes && data.derived) {
    return "investigator";
  }
  if (data && data.result && data.state && Array.isArray(data.events) && Array.isArray(data.discoveries)) {
    return "scene-summary";
  }
  return "generic";
}

function inferTitle(args, inputPath, data, type) {
  if (args.title) return args.title;
  if (type === "investigator") return data.identity?.name || "调查员卡";
  if (type === "scene-summary") return data.title || "场景回顾";
  if (isPlainObject(data)) {
    if (typeof data.title === "string" && data.title) return data.title;
    if (typeof data.name === "string" && data.name) return data.name;
  }
  if (inputPath) return path.parse(inputPath).name;
  return "JSON View";
}

function genericBody(value, level = 0) {
  if (isPrimitive(value)) {
    if (value == null) return "`null`";
    if (typeof value === "boolean") return value ? "`true`" : "`false`";
    if (typeof value === "number") return `\`${value}\``;
    return String(value);
  }

  if (Array.isArray(value)) {
    if (!value.length) return "- _Empty_";
    if (value.every(isPrimitive)) {
      return value.map((item) => `- ${genericBody(item, level + 1)}`).join("\n");
    }
    return value.map((item, index) => {
      const label = isPlainObject(item)
        ? item.title || item.name || item.label || item.id || `Item ${index + 1}`
        : `Item ${index + 1}`;
      return [
        `${"#".repeat(Math.min(level + 2, 6))} ${label}`,
        "",
        genericBody(item, level + 1),
      ].join("\n");
    }).join("\n\n");
  }

  const primitives = [];
  const complex = [];
  for (const [key, entry] of Object.entries(value)) {
    if (isPrimitive(entry)) primitives.push([key, entry]);
    else complex.push([key, entry]);
  }

  const lines = [];
  primitives.forEach(([key, entry]) => {
    lines.push(`- **${formatKey(key)}**: ${genericBody(entry, level + 1)}`);
  });
  if (primitives.length && complex.length) lines.push("");
  complex.forEach(([key, entry], index) => {
    lines.push(`${"#".repeat(Math.min(level + 2, 6))} ${formatKey(key)}`);
    lines.push("");
    lines.push(genericBody(entry, level + 1));
    if (index < complex.length - 1) lines.push("");
  });
  return lines.join("\n");
}

function buildInvestigatorView(data, title) {
  const identity = data.identity || {};
  const occupation = data.occupation || {};
  const derived = data.derived || {};
  const trackers = data.trackers || {};
  const background = data.background || {};
  const developments = data.developments || {};
  const economics = data.economics || {};
  const combat = data.combat || {};
  const attributes = data.attributes || {};
  const skills = Array.isArray(data.skills) ? data.skills : [];

  return {
    title,
    name: asText(identity.name),
    player: asText(identity.player),
    age: asText(identity.age),
    sex: asText(identity.sex || identity.gender),
    era_setting: asText([identity.era, identity.setting].filter(Boolean)),
    residence: asText(identity.residence),
    birthplace: asText(identity.birthplace),
    attributes_table: markdownTable(
      ["属性", "当前值", "半值", "五分之一"],
      ["STR", "CON", "SIZ", "DEX", "APP", "INT", "POW", "EDU", "LUCK"].map((key) => [
        key,
        attributes[key]?.full,
        attributes[key]?.half,
        attributes[key]?.fifth,
      ]),
    ),
    derived_table: markdownTable(
      ["项目", "数值", "半值", "五分之一"],
      [
        ["SAN", derived.SAN?.full, derived.SAN?.half, derived.SAN?.fifth],
        ["HP", derived.HP, "", ""],
        ["MP", derived.MP, "", ""],
        ["MOV", derived.MOV, "", ""],
        ["DB", derived.DB, "", ""],
        ["Build", derived.Build, "", ""],
        ["Max SAN", derived.maxSanity, "", ""],
      ],
    ),
    trackers_table: markdownTable(
      ["项目", "内容"],
      [
        ["Current SAN", trackers.currentSAN],
        ["Starting SAN", trackers.startingSAN],
        ["Current HP / Max HP", trackers.currentHP != null || trackers.maxHP != null ? `${asText(trackers.currentHP)}/${asText(trackers.maxHP)}` : "—"],
        ["Current MP / Max MP", trackers.currentMP != null || trackers.maxMP != null ? `${asText(trackers.currentMP)}/${asText(trackers.maxMP)}` : "—"],
        ["Current Luck", trackers.currentLuck],
        ["Major Wound", boolText(trackers.majorWound)],
        ["Unconscious", boolText(trackers.unconscious)],
        ["Dying", boolText(trackers.dying)],
        ["Temporary Insanity", boolText(trackers.temporaryInsanity)],
        ["Indefinite Insanity", boolText(trackers.indefiniteInsanity)],
      ],
    ),
    occupation_table: markdownTable(
      ["项目", "内容"],
      [
        ["职业", occupation.name],
        ["职业技能点公式", occupation.pointsFormula],
        ["职业技能点", occupation.occupationPoints],
        ["兴趣技能点", occupation.interestPoints],
        ["信用评级", occupation.creditRating],
        ["信用评级范围", occupation.creditRatingRange ? `${occupation.creditRatingRange.min}-${occupation.creditRatingRange.max}` : "—"],
        ["生活水平", occupation.lifestyle],
        ["职业描述", occupation.description],
        ["现金", economics.cash],
        ["消费水平", economics.spendingLevel],
        ["其他资产", economics.assets],
      ],
    ),
    skills_table: markdownTable(
      ["技能", "当前值", "半值", "五分之一", "类别"],
      skills.map((skill) => [
        skill.specialization ? `${skill.name}(${skill.specialization})` : skill.name,
        skill.value?.full,
        skill.value?.half,
        skill.value?.fifth,
        skill.category,
      ]),
    ),
    combat_table: markdownTable(
      ["项目", "当前值", "半值", "五分之一"],
      [
        ["斗殴", combat.brawl?.full, combat.brawl?.half, combat.brawl?.fifth],
        ["闪避", combat.dodge?.full, combat.dodge?.half, combat.dodge?.fifth],
      ],
    ),
    attacks_table: markdownTable(
      ["武器/攻击", "技能", "成功率", "伤害", "射程", "弹药", "备注"],
      (combat.attacks || []).map((attack) => [
        attack.name,
        attack.skillName,
        attack.skillValue?.full,
        attack.damage,
        attack.range,
        attack.ammo,
        attack.notes,
      ]),
    ),
    background_block: [
      `- 个人描述: ${asText(background.personalDescription)}`,
      `- 思想/信念: ${asText(background.ideologyBeliefs)}`,
      `- 重要之人: ${asText(background.significantPeople)}`,
      `- 意义非凡之地: ${asText(background.meaningfulLocations)}`,
      `- 宝贵之物: ${asText(background.treasuredPossessions)}`,
      `- 特点: ${asText(background.traits)}`,
      `- 背景故事: ${asText(background.backstory)}`,
      `- 关键连接: ${asText(background.keyConnection)}`,
    ].join("\n"),
    developments_block: [
      `- 损伤/伤痕: ${asText(developments.woundsScars)}`,
      `- 恐惧/狂躁: ${asText(developments.phobiasManias)}`,
      `- 神话典籍: ${asText((developments.mythosTomes || []).map((item) => item.notes ? `${item.name}: ${item.notes}` : item.name))}`,
      `- 法术: ${asText((developments.spells || []).map((item) => item.notes ? `${item.name}: ${item.notes}` : item.name))}`,
      `- 重要遭遇: ${asText(developments.mythosEncounters)}`,
    ].join("\n"),
    equipment_block: namedNotes(data.equipment || []),
    notes_block: bulletBlock([
      ...((data.assumptions || []).map((item) => `假设: ${item}`)),
      ...((data.validation?.warnings || []).map((item) => `警告: ${item}`)),
      ...((data.notes || []).map((item) => `备注: ${item}`)),
    ]),
  };
}

function buildSceneSummaryView(data, title) {
  const result = data.result || {};
  const state = data.state || {};
  return {
    title,
    scenario: asText(state.scenario),
    day: asText(state.day),
    time_of_day: asText(state.timeOfDay),
    location: asText(state.location),
    objective: asText(state.objective),
    result: asText(result.label || result.code),
    events_block: bulletBlock(data.events || []),
    discoveries_block: bulletBlock(data.discoveries || []),
    hooks_block: bulletBlock(data.hooks || []),
  };
}

function buildGenericView(data, title) {
  return {
    title,
    body: genericBody(data),
  };
}

function resolvePath(targetPath) {
  return targetPath.split(".").reduce((acc, key) => (acc == null ? "" : acc[key]), this);
}

function getValue(view, key) {
  return key.split(".").reduce((acc, part) => {
    if (acc == null) return "";
    return acc[part];
  }, view);
}

function renderTemplate(template, view) {
  let output = template;

  output = output.replace(/{{#([\w.]+)}}([\s\S]*?){{\/\1}}/g, (_, key, inner) => {
    const value = getValue(view, key);
    if (Array.isArray(value)) {
      return value.map((item) => renderTemplate(inner, isPlainObject(item) ? item : { ".": item })).join("");
    }
    if (value) {
      return renderTemplate(inner, isPlainObject(value) ? { ...view, ...value } : view);
    }
    return "";
  });

  output = output.replace(/{{\^([\w.]+)}}([\s\S]*?){{\/\1}}/g, (_, key, inner) => {
    const value = getValue(view, key);
    const empty = value == null || value === false || value === "" || (Array.isArray(value) && value.length === 0);
    return empty ? inner : "";
  });

  output = output.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => asText(getValue(view, key), ""));
  return output;
}

function loadTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATE_DIR, `${name}.md.mustache`), "utf8");
}

function buildView(data, title, type) {
  if (type === "investigator") return buildInvestigatorView(data, title);
  if (type === "scene-summary") return buildSceneSummaryView(data, title);
  return buildGenericView(data, title);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputText = readInput(args.input);
  const data = parseJson(inputText);
  const type = inferType(data);
  const title = inferTitle(args, args.input, data, type);
  const view = buildView(data, title, type);
  const template = loadTemplate(type);
  const markdown = `${renderTemplate(template, view).trim()}\n`;

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, markdown);
  } else {
    process.stdout.write(markdown);
  }
}

main();
