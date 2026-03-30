#!/usr/bin/env node

function die(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function randomInt(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function parseFormula(formula) {
  const match = String(formula || "").trim().match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) {
    die("Usage: node skills/coc-keeper/scripts/roll-dice.js <XdY[+/-Z]>");
  }

  return {
    count: Number(match[1]),
    sides: Number(match[2]),
    modifier: match[3] ? Number(match[3]) : 0,
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
  const formula = process.argv[2];
  if (!formula) {
    die("Usage: node skills/coc-keeper/scripts/roll-dice.js <XdY[+/-Z]>");
  }

  const { count, sides, modifier } = parseFormula(formula);
  const result = count === 1 && sides === 100
    ? rollD100()
    : rollStandard(count, sides, modifier);

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
