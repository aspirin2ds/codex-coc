#!/usr/bin/env node

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function randomInt(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function usage() {
  return "Usage: node skills/coc-keeper/scripts/roll-dice.js <XdY[+/-Z]> or natural text containing one dice expression";
}

function normalizeInput(input) {
  return String(input || "")
    .trim()
    .replace(/[（）]/g, (char) => (char === "（" ? "(" : ")"))
    .replace(/[＋﹢]/g, "+")
    .replace(/[－﹣−–—]/g, "-")
    .replace(/[Ｄｄ]/g, "d")
    .replace(/\s+/g, " ");
}

function extractFormula(input) {
  const normalized = normalizeInput(input);
  const compact = normalized
    .replace(/\s*d\s*/gi, "d")
    .replace(/\s*([+-])\s*/g, "$1");
  const match = compact.match(/(?:^|[^\dd])(\d*)d(\d+)([+-]\d+)?(?=$|[^\d])/i);

  if (!match) {
    die(usage());
  }

  return {
    formula: `${match[1] || "1"}d${match[2]}${match[3] || ""}`,
    count: Number(match[1] || 1),
    sides: Number(match[2]),
    modifier: match[3] ? Number(match[3]) : 0,
  };
}

function parseFormula(formula) {
  const match = extractFormula(formula);
  if (!match) {
    die(usage());
  }

  return {
    formula: match.formula,
    count: match.count,
    sides: match.sides,
    modifier: match.modifier,
  };
}

function rollStandard(count, sides, modifier) {
  const rolls = [];
  for (let i = 0; i < count; i += 1) {
    rolls.push(randomInt(sides));
  }

  const subtotal = rolls.reduce((sum, value) => sum + value, 0);
  return {
    formula: `${count}d${sides}${modifier ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
    rolls,
    subtotal,
    total: subtotal + modifier,
  };
}

function rollD100() {
  const tensDie = randomInt(10) - 1;
  const onesDie = randomInt(10) - 1;
  const total = tensDie === 0 && onesDie === 0 ? 100 : tensDie * 10 + onesDie;

  return {
    formula: "1d100",
    rolls: [total],
    subtotal: total,
    total,
    detail: {
      tens: tensDie * 10,
      ones: onesDie,
    },
  };
}

function main() {
  const formula = process.argv.slice(2).join(" ");
  if (!formula) {
    die(usage());
  }

  const { formula: parsedFormula, count, sides, modifier } = parseFormula(formula);
  const result = count === 1 && sides === 100
    ? rollD100()
    : rollStandard(count, sides, modifier);

  result.input = formula;
  result.parsedFormula = parsedFormula;

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
