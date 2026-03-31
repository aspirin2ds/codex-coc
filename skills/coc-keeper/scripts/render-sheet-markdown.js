#!/usr/bin/env node

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    process.stdout.write(
      "Markdown investigator output has been removed. Use calc-sheet.js and keep the canonical investigator artifact as JSON under play-data/investigators/.\n",
    );
    process.exit(0);
  }

  die(
    "Markdown investigator output has been removed. This skill is JSON-only now; persist and consume the normalized .json sheet directly.",
  );
}

main();
