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
          "  node skills/coc-keeper/scripts/scene-summary.js [--state <session.json>] [--title 标题] [--result setback|mixed|strong_success] [--event 文本] [--discovery 文本] [--hook 文本] [--output file.md]",
          "",
          "Example:",
          "  node skills/coc-keeper/scripts/scene-summary.js --state tmp/coc-session.json --title 黑水湖夜袭 --result strong_success --event 救出简 --discovery 黑水湖有转运装置 --hook 天亮后回镇汇报",
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

function bulletList(items) {
  if (!items || !items.length) return "- 无";
  return items.map((item) => `- ${item}`).join("\n");
}

function renderSummary(args, state) {
  const current = state?.current || {};
  const sceneState = [
    `- 模组：${state?.scenario || "—"}`,
    `- 当前日程：第 ${current.day ?? "—"} 日 / ${current.timeOfDay || "—"}`,
    `- 当前地点：${current.location || "—"}`,
    `- 当前目标：${current.objective || "—"}`,
    `- 阶段结果：${labelResult(args.result)}`,
  ].join("\n");

  const discoveries = args.discoveries.length ? args.discoveries : state?.clues || [];
  const hooks = args.hooks.length ? args.hooks : state?.hooks || [];

  return [
    `# ${args.title}`,
    "",
    "## 当前状态",
    sceneState,
    "",
    "## 本段发生了什么",
    bulletList(args.events),
    "",
    "## 新获得的线索",
    bulletList(discoveries),
    "",
    "## 下次可接续的钩子",
    bulletList(hooks),
    "",
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const state = readState(args.state);
  const summary = renderSummary(args, state);

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, summary);
  }

  process.stdout.write(summary);
}

main();
