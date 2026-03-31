#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function parseArgs(argv) {
  const args = {
    state: null,
    output: null,
    title: "场景结算",
    result: "mixed",
    events: [],
    discoveries: [],
    hooks: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--state") args.state = argv[++i];
    else if (arg === "--output") args.output = argv[++i];
    else if (arg === "--title") args.title = argv[++i];
    else if (arg === "--result") args.result = argv[++i];
    else if (arg === "--event") args.events.push(argv[++i]);
    else if (arg === "--discovery") args.discoveries.push(argv[++i]);
    else if (arg === "--hook") args.hooks.push(argv[++i]);
    else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        [
          "Usage:",
          "  node skills/coc-keeper/scripts/scene-summary.js [--state <session.json>] [--title 标题] [--result setback|mixed|strong_success] [--event 文本] [--discovery 文本] [--hook 文本] [--output file.json]",
          "",
          "Example:",
          "  node skills/coc-keeper/scripts/scene-summary.js --state tmp/coc-session.json --title 黑水湖夜袭 --result strong_success --event 救出简 --discovery 黑水湖有转运装置 --hook 天亮后回镇汇报 --output tmp/scene-summary.json",
        ].join("\n"),
      );
      process.exit(0);
    } else {
      die(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function readState(filePath) {
  if (!filePath) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function labelResult(result) {
  if (result === "setback") return "受挫";
  if (result === "strong_success") return "强成功";
  return "混合成功";
}

function renderSummary(args, state) {
  const current = state?.current || {};
  const discoveries = args.discoveries.length ? args.discoveries : state?.clues || [];
  const hooks = args.hooks.length ? args.hooks : state?.hooks || [];

  return {
    title: args.title,
    result: {
      code: args.result,
      label: labelResult(args.result),
    },
    state: {
      scenario: state?.scenario || null,
      day: current.day ?? null,
      timeOfDay: current.timeOfDay || null,
      location: current.location || null,
      objective: current.objective || null,
    },
    events: args.events,
    discoveries,
    hooks,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const state = readState(args.state);
  const summary = renderSummary(args, state);

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, `${JSON.stringify(summary, null, 2)}\n`);
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main();
