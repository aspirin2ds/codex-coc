#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const DEFAULT_PLAY_DIR = "play-data";
const DEFAULT_SESSION_DIR = path.join(DEFAULT_PLAY_DIR, "sessions");
const DEFAULT_SESSION_FILE = path.join(DEFAULT_SESSION_DIR, "current-session.json");

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function parseArgs(argv) {
  if (!argv.length) {
    die("Usage: node skills/coc-keeper/scripts/session-state.js <init|show|update> [...]");
  }

  const [command, ...rest] = argv;
  const args = {
    command,
    input: null,
    output: null,
    scenario: null,
    sets: [],
    pushes: [],
  };

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === "--input") args.input = rest[++i];
    else if (arg === "--output") args.output = rest[++i];
    else if (arg === "--scenario") args.scenario = rest[++i];
    else if (arg === "--set") args.sets.push(rest[++i]);
    else if (arg === "--push") args.pushes.push(rest[++i]);
    else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage:",
          "  node skills/coc-keeper/scripts/session-state.js init --output <file> [--scenario 名称]",
          "  node skills/coc-keeper/scripts/session-state.js show --input <file>",
          "  node skills/coc-keeper/scripts/session-state.js update --input <file> [--output <file>] [--set a.b=value] [--push clues=value]",
          "",
          `Default session file: ${DEFAULT_SESSION_FILE}`,
          "",
          "Important investigator fields:",
          "  investigators.<id>.name",
          "  investigators.<id>.hp.current",
          "  investigators.<id>.hp.max",
          "  investigators.<id>.san.current",
          "  investigators.<id>.san.max",
          "  investigators.<id>.mp.current",
          "  investigators.<id>.mp.max",
          "  investigators.<id>.luck",
          "  investigators.<id>.mov",
          "  investigators.<id>.status.conscious",
          "  investigators.<id>.status.dying",
          "  investigators.<id>.status.majorWound",
          "  investigators.<id>.status.tempInsanity",
          "  investigators.<id>.status.indefInsanity",
          "  investigators.<id>.status.location",
          "  investigators.<id>.status.summary",
          "  investigators.<id>.injuries",
          "  investigators.<id>.conditions",
          "  investigators.<id>.inventory",
          "  investigators.<id>.notes",
          "",
          "Examples:",
          `  node skills/coc-keeper/scripts/session-state.js init --output ${DEFAULT_SESSION_FILE} --scenario 古茂密林之中`,
          `  node skills/coc-keeper/scripts/session-state.js update --input ${DEFAULT_SESSION_FILE} --set current.day=1 --set current.timeOfDay=night --set current.location=黑水湖外圈`,
          `  node skills/coc-keeper/scripts/session-state.js update --input ${DEFAULT_SESSION_FILE} --push clues=简被带往黑水湖 --push npcs.safe=简`,
          `  node skills/coc-keeper/scripts/session-state.js update --input ${DEFAULT_SESSION_FILE} --set investigators.harvey.name='Harvey Walters' --set investigators.harvey.hp.current=8 --set investigators.harvey.san.current=41 --set investigators.harvey.status.majorWound=true`,
          `  node skills/coc-keeper/scripts/session-state.js update --input ${DEFAULT_SESSION_FILE} --push investigators.harvey.injuries=右臂撕裂伤 --push investigators.harvey.conditions=疼痛 --push investigators.harvey.inventory=左轮手枪`,
        ].join("\n"),
      );
      process.exit(0);
    } else {
      die(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function parseValue(raw) {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "null") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
}

function splitAssignment(raw) {
  const idx = raw.indexOf("=");
  if (idx === -1) die(`Invalid assignment: ${raw}`);
  return {
    key: raw.slice(0, idx),
    value: parseValue(raw.slice(idx + 1)),
  };
}

function setPath(target, dottedPath, value) {
  const parts = dottedPath.split(".");
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!cursor[part] || typeof cursor[part] !== "object" || Array.isArray(cursor[part])) {
      cursor[part] = {};
    }
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
}

function pushPath(target, dottedPath, value) {
  const parts = dottedPath.split(".");
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (!cursor[part] || typeof cursor[part] !== "object" || Array.isArray(cursor[part])) {
      cursor[part] = {};
    }
    cursor = cursor[part];
  }
  const leaf = parts[parts.length - 1];
  if (!Array.isArray(cursor[leaf])) cursor[leaf] = [];
  cursor[leaf].push(value);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function makeInitialState(scenario) {
  return {
    schemaVersion: "1.1.0",
    scenario: scenario || "古茂密林之中",
    current: {
      day: 0,
      date: null,
      timeOfDay: null,
      location: null,
      objective: null,
    },
    countdown: {
      label: null,
      status: "active",
      notes: [],
    },
    investigators: {},
    npcs: {
      safe: [],
      missing: [],
      hostile: [],
      unknown: [],
    },
    clues: [],
    scenes: [],
    hooks: [],
    notes: [],
    updatedAt: new Date().toISOString(),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.command === "init") {
    const output = args.output || DEFAULT_SESSION_FILE;
    const state = makeInitialState(args.scenario);
    writeJson(output, state);
    process.stdout.write(`${JSON.stringify({ ok: true, output, state }, null, 2)}\n`);
    return;
  }

  if (args.command === "show") {
    if (!args.input) die("--input is required for show.");
    const state = readJson(args.input);
    process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
    return;
  }

  if (args.command === "update") {
    if (!args.input) die("--input is required for update.");
    const output = args.output || args.input;
    const state = readJson(args.input);

    for (const raw of args.sets) {
      const { key, value } = splitAssignment(raw);
      setPath(state, key, value);
    }

    for (const raw of args.pushes) {
      const { key, value } = splitAssignment(raw);
      pushPath(state, key, value);
    }

    state.updatedAt = new Date().toISOString();
    writeJson(output, state);
    process.stdout.write(`${JSON.stringify({ ok: true, output, state }, null, 2)}\n`);
    return;
  }

  die(`Unknown command: ${args.command}`);
}

main();
