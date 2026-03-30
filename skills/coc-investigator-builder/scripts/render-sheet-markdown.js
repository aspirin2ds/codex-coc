#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function parseArgs(argv) {
  const args = {
    input: null,
    template: null,
    output: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--input") args.input = argv[++i];
    else if (arg === "--template") args.template = argv[++i];
    else if (arg === "--output") args.output = argv[++i];
    else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        "Usage: node skills/coc-investigator-builder/scripts/render-sheet-markdown.js --input <sheet.json> [--template <template.md>] [--output <file.md>]\n",
      );
      process.exit(0);
    } else {
      die(`Unknown argument: ${arg}`);
    }
  }

  if (!args.input) die("The --input argument is required.");
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function get(obj, sourcePath) {
  if (!sourcePath) return "";
  return sourcePath.split(".").reduce((acc, part) => {
    if (acc == null) return "";
    return acc[part];
  }, obj);
}

function asText(value, fallback = "—") {
  if (value == null || value === "") return fallback;
  if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
  return String(value);
}

function formatBreakdown(label, breakdown) {
  if (!breakdown) return [label, "—", "—", "—"];
  return [label, String(breakdown.full), String(breakdown.half), String(breakdown.fifth)];
}

function formatSkill(skill) {
  const label = skill.specialization ? `${skill.name}(${skill.specialization})` : skill.name;
  const tags = [skill.category].filter(Boolean).join(" / ");
  const suffix = tags ? ` [${tags}]` : "";
  return `${label}: ${skill.value.full}（半值 ${skill.value.half} / 五分之一 ${skill.value.fifth}）${suffix}`;
}

function formatAttack(attack) {
  return [
    asText(attack.name),
    asText(attack.skillName),
    asText(attack.skillValue?.full),
    asText(attack.damage),
    asText(attack.range),
    asText(attack.ammo),
    asText(attack.notes),
  ];
}

function formatNamedNote(item) {
  if (!item) return "—";
  if (typeof item === "string") return item;
  if (!item.notes) return item.name || "—";
  return `${item.name}：${item.notes}`;
}

function bulletList(items, fallback = "- —") {
  if (!items || !items.length) return fallback;
  return items.map((item) => `- ${item}`).join("\n");
}

function block(lines, fallback = "- —") {
  if (!lines || !lines.length) return fallback;
  return lines.join("\n");
}

function escapeCell(value) {
  return asText(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function table(headers, rows, fallback = "- —") {
  if (!rows || !rows.length) return fallback;
  const head = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`).join("\n");
  return [head, divider, body].join("\n");
}

function buildContext(sheet) {
  const era = [sheet.identity?.era, sheet.identity?.setting].filter(Boolean).join(" / ");
  const attributesOrder = ["STR", "CON", "SIZ", "DEX", "APP", "INT", "POW", "EDU", "LUCK"];

  const attributesList = attributesOrder.map((key) =>
    formatBreakdown(key, sheet.attributes?.[key]),
  );

  const derivedList = [
    sheet.derived?.SAN ? formatBreakdown("SAN", sheet.derived.SAN) : ["SAN", "—", "—", "—"],
    ["HP", asText(sheet.derived?.HP), "", ""],
    ["MP", asText(sheet.derived?.MP), "", ""],
    ["MOV", asText(sheet.derived?.MOV), "", ""],
    ["DB", asText(sheet.derived?.DB), "", ""],
    ["Build", asText(sheet.derived?.Build), "", ""],
    ["最大 SAN", asText(sheet.derived?.maxSanity), "", ""],
  ];

  const creditRange = sheet.occupation?.creditRatingRange
    ? `${sheet.occupation.creditRatingRange.min}-${sheet.occupation.creditRatingRange.max}`
    : "—";

  const occupationList = [
    ["职业技能点公式", asText(sheet.occupation?.pointsFormula)],
    ["职业技能点", asText(sheet.occupation?.occupationPoints)],
    ["兴趣技能点", asText(sheet.occupation?.interestPoints)],
    ["信用评级", asText(sheet.occupation?.creditRating)],
    ["信用评级范围", creditRange],
    ["生活水平概述", asText(sheet.occupation?.lifestyle)],
    ["职业描述", asText(sheet.occupation?.description)],
    ["现金", asText(sheet.economics?.cash)],
    ["消费水平", asText(sheet.economics?.spendingLevel)],
    ["其他资产", asText(sheet.economics?.assets)],
  ];

  const combatList = [
    sheet.combat?.brawl ? formatBreakdown("斗殴", sheet.combat.brawl) : ["斗殴", "—", "—", "—"],
    sheet.combat?.dodge ? formatBreakdown("闪避", sheet.combat.dodge) : ["闪避", "—", "—", "—"],
    ...(sheet.combat?.attacks || []).map(formatAttack),
  ];

  const equipmentList = (sheet.equipment || []).map(formatNamedNote);
  const backgroundList = [
    `- 个人描述：${asText(sheet.background?.personalDescription)}`,
    `- 思想/信念：${asText(sheet.background?.ideologyBeliefs)}`,
    `- 重要之人：${asText(sheet.background?.significantPeople)}`,
    `- 意义非凡之地：${asText(sheet.background?.meaningfulLocations)}`,
    `- 宝贵之物：${asText(sheet.background?.treasuredPossessions)}`,
    `- 特点：${asText(sheet.background?.traits)}`,
    `- 背景故事：${asText(sheet.background?.backstory)}`,
    `- 关键连接：${asText(sheet.background?.keyConnection)}`,
  ];

  const developmentsList = [
    `- 损伤/伤痕：${asText(sheet.developments?.woundsScars)}`,
    `- 恐惧/狂躁：${asText(sheet.developments?.phobiasManias)}`,
    `- 神话典籍：${asText((sheet.developments?.mythosTomes || []).map(formatNamedNote))}`,
    `- 法术：${asText((sheet.developments?.spells || []).map(formatNamedNote))}`,
    `- 重要遭遇：${asText(sheet.developments?.mythosEncounters)}`,
  ];

  const notesList = [
    ...((sheet.notes || []).map((note) => `备注：${note}`)),
    ...((sheet.assumptions || []).map((note) => `假设：${note}`)),
    ...((sheet.validation?.warnings || []).map((note) => `警告：${note}`)),
  ];

  return {
    "identity.name": asText(sheet.identity?.name),
    "identity.age": asText(sheet.identity?.age),
    "identity.sex": asText(sheet.identity?.sex),
    "occupation.name": asText(sheet.occupation?.name),
    "identity.era_setting": asText(era),
    "identity.residence": asText(sheet.identity?.residence),
    "identity.birthplace": asText(sheet.identity?.birthplace),
    attributes_table: table(["属性", "当前值", "半值", "五分之一"], attributesList),
    derived_table: table(["项目", "数值", "半值", "五分之一"], derivedList),
    occupation_table: table(["项目", "内容"], occupationList),
    skills_table: table(
      ["技能", "当前值", "半值", "五分之一", "类别"],
      (sheet.skills || []).map((skill) => [
        skill.specialization ? `${skill.name}(${skill.specialization})` : skill.name,
        asText(skill.value?.full),
        asText(skill.value?.half),
        asText(skill.value?.fifth),
        asText(skill.category),
      ]),
    ),
    combat_table: table(
      ["项目", "当前值", "半值", "五分之一"],
      combatList.slice(0, 2),
    ),
    attacks_table: table(
      ["武器/攻击", "技能", "成功率", "伤害", "射程", "弹药", "备注"],
      combatList.slice(2),
    ),
    equipment_list: bulletList(equipmentList),
    background_list: block(backgroundList),
    developments_list: block(developmentsList),
    notes_list: bulletList(notesList),
  };
}

function renderTemplate(template, sheet) {
  const context = buildContext(sheet);
  return template.replace(/\{\{([^}]+)\}\}/g, (_, rawKey) => {
    const key = rawKey.trim();
    if (Object.prototype.hasOwnProperty.call(context, key)) return context[key];
    return asText(get(sheet, key));
  });
}

function defaultOutputPath(inputPath) {
  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}.md`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const rootDir = process.cwd();
  const inputPath = path.resolve(rootDir, args.input);
  const templatePath = path.resolve(
    rootDir,
    args.template || "skills/coc-investigator-builder/templates/investigator-sheet.template.md",
  );
  const outputPath = path.resolve(rootDir, args.output || defaultOutputPath(args.input));

  const sheet = readJson(inputPath);
  const template = readText(templatePath);
  const rendered = renderTemplate(template, sheet);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${rendered.trim()}\n`);
  console.log(`Rendered Markdown to ${outputPath}`);
}

main();
