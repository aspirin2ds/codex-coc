import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createProgram } from "../src/cli";

describe("CLI", () => {
  test("registers core commands", () => {
    const program = createProgram();
    const commandNames = program.commands.map((command) => command.name());
    expect(commandNames).toContain("greet");
    expect(commandNames).toContain("roll");
    expect(commandNames).toContain("investigator");
  });

  test("runs greet command", async () => {
    let output = "";
    const program = createProgram({
      writeLine: (str) => {
        output += `${str}\n`;
      },
      writeErr: () => {},
    });

    await program.parseAsync(["greet", "Ada"], { from: "user" });
    expect(output).toContain("Hello, Ada!");
  });

  test("rolls a standard dice expression", async () => {
    let output = "";
    const values = [4, 7, 2];
    const program = createProgram({
      writeLine: (str) => {
        output += str;
      },
      randomInt: () => values.shift() ?? 1,
    });

    await program.parseAsync(["roll", "check", "--target", "60", "--bonus", "1"], { from: "user" });
    expect(output).toContain("ROLL_RESULT: COC_CHECK");
    expect(output).toContain("target: 60");
    expect(output).toContain("result: 24");
    expect(output).toContain("outcome: HARD_SUCCESS");
  });

  test("rolls opposed check", async () => {
    let output = "";
    const values = [33, 84];
    const program = createProgram({
      writeLine: (str) => {
        output += str;
      },
      randomInt: () => values.shift() ?? 1,
    });

    await program.parseAsync(["roll", "opposed", "--a", "60", "--b", "50"], { from: "user" });
    expect(output).toContain("ROLL_RESULT: COC_OPPOSED");
    expect(output).toContain("a_roll: 33");
    expect(output).toContain("b_roll: 84");
    expect(output).toContain("winner: a");
  });

  test("rolls luck check", async () => {
    let output = "";
    const values = [25];
    const program = createProgram({
      writeLine: (str) => {
        output += str;
      },
      randomInt: () => values.shift() ?? 0,
    });

    await program.parseAsync(["roll", "luck", "--value", "40"], { from: "user" });
    expect(output).toContain("ROLL_RESULT: COC_LUCK");
    expect(output).toContain("roll: 25");
    expect(output).toContain("passed: true");
  });

  test("rolls normal dice expression for character building", async () => {
    let output = "";
    const values = [3, 4];
    const program = createProgram({
      writeLine: (str) => {
        output += str;
      },
      randomInt: () => values.shift() ?? 1,
    });

    await program.parseAsync(["roll", "dice", "2d6*5"], { from: "user" });
    expect(output).toContain("ROLL_RESULT: COC_DICE");
    expect(output).toContain("2d6: [3, 4] => 7");
    expect(output).toContain("result: 35");
  });

  test("creates investigator from rulebook formulas", async () => {
    let output = "";
    const values = [
      2,
      3,
      4, // str = 45
      1,
      1,
      1, // con = 15
      1,
      1, // siz = 40
      2,
      2,
      2, // dex = 30
      3,
      3,
      3, // app = 45
      4,
      4, // int = 70
      5,
      5,
      5, // pow = 75
      6,
      6, // edu = 90
      2,
      2,
      2, // luck roll #1 = 30
      3,
      3,
      3, // luck roll #2 = 45 (age 15-19 takes best)
    ];

    const program = createProgram({
      writeLine: (str) => {
        output += str;
      },
      randomInt: () => values.shift() ?? 1,
    });

    await program.parseAsync(["investigator", "create", "--age", "18"], { from: "user" });
    expect(output).toContain("result_type: COC_INVESTIGATOR_CREATE");
    expect(output).toContain("status: ok");
    expect(output).toContain("format: key_value_text");
    expect(output).toContain("str: 40");
    expect(output).toContain("edu: 85");
    expect(output).toContain("luck: 45");
    expect(output).toContain("hp: 5");
    expect(output).toContain("mov: 8");
    expect(output).toContain("db: -1");
  });

  test("calculates investigator derived values", async () => {
    let output = "";
    const program = createProgram({
      writeLine: (str) => {
        output += str;
      },
    });

    await program.parseAsync(
      [
        "investigator",
        "derived",
        "--str",
        "70",
        "--con",
        "60",
        "--siz",
        "80",
        "--dex",
        "55",
        "--pow",
        "65",
      ],
      { from: "user" },
    );

    expect(output).toContain("result_type: COC_INVESTIGATOR_DERIVED");
    expect(output).toContain("hp: 14");
    expect(output).toContain("san: 65");
    expect(output).toContain("mp: 13");
    expect(output).toContain("mov: 7");
    expect(output).toContain("build: 1");
    expect(output).toContain("db: +1d4");
  });

  test("runs EDU improvement helper", async () => {
    let output = "";
    const values = [90, 5, 50];
    const program = createProgram({
      writeLine: (str) => {
        output += str;
      },
      randomInt: () => values.shift() ?? 1,
    });

    await program.parseAsync(["investigator", "edu-improve", "--edu", "80", "--times", "2"], {
      from: "user",
    });
    expect(output).toContain("result_type: COC_INVESTIGATOR_EDU_IMPROVE");
    expect(output).toContain("edu_after: 85");
    expect(output).toContain("times: 2");
  });

  test("runs age-adjust helper with manual losses", async () => {
    let output = "";
    const program = createProgram({
      writeLine: (str) => {
        output += str;
      },
    });

    await program.parseAsync(
      [
        "investigator",
        "age-adjust",
        "--age",
        "50",
        "--str",
        "60",
        "--con",
        "60",
        "--siz",
        "60",
        "--dex",
        "60",
        "--app",
        "60",
        "--int",
        "60",
        "--pow",
        "60",
        "--edu",
        "60",
        "--luck",
        "60",
        "--str-loss",
        "5",
        "--con-loss",
        "5",
        "--no-edu-improve",
      ],
      { from: "user" },
    );
    expect(output).toContain("result_type: COC_INVESTIGATOR_AGE_ADJUST");
    expect(output).toContain("str: 55");
    expect(output).toContain("con: 55");
    expect(output).toContain("app: 50");
  });

  test("calculates points helper", async () => {
    let output = "";
    const program = createProgram({
      writeLine: (str) => {
        output += str;
      },
    });

    await program.parseAsync(
      [
        "investigator",
        "points",
        "--int",
        "70",
        "--edu",
        "60",
        "--dex",
        "50",
        "--formula",
        "edu*2+dex*2",
      ],
      { from: "user" },
    );
    expect(output).toContain("result_type: COC_INVESTIGATOR_POINTS");
    expect(output).toContain("occupation_points: 220");
    expect(output).toContain("interest_points: 140");
  });

  test("validates investigator mismatch", async () => {
    let output = "";
    const program = createProgram({
      writeLine: (str) => {
        output += str;
      },
    });

    await program.parseAsync(
      [
        "investigator",
        "validate",
        "--age",
        "25",
        "--str",
        "70",
        "--con",
        "60",
        "--siz",
        "80",
        "--dex",
        "55",
        "--pow",
        "65",
        "--hp",
        "12",
      ],
      { from: "user" },
    );
    expect(output).toContain("result_type: COC_INVESTIGATOR_VALIDATE");
    expect(output).toContain("valid: false");
    expect(output).toContain("hp mismatch");
  });

  test("runs build-table and mov helpers", async () => {
    let output = "";
    const program = createProgram({
      writeLine: (str) => {
        output += `${str}\n---\n`;
      },
    });

    await program.parseAsync(["investigator", "build-table", "--str", "70", "--siz", "80"], {
      from: "user",
    });
    await program.parseAsync(
      ["investigator", "mov", "--str", "70", "--dex", "55", "--siz", "80", "--age", "25"],
      {
        from: "user",
      },
    );
    expect(output).toContain("result_type: COC_INVESTIGATOR_BUILD_TABLE");
    expect(output).toContain("db: +1d4");
    expect(output).toContain("result_type: COC_INVESTIGATOR_MOV");
    expect(output).toContain("mov: 7");
  });

  test("exports investigator snapshot", async () => {
    let output = "";
    const program = createProgram({
      writeLine: (str) => {
        output += str;
      },
    });

    await program.parseAsync(
      [
        "investigator",
        "export",
        "--format",
        "json",
        "--age",
        "25",
        "--str",
        "70",
        "--con",
        "60",
        "--siz",
        "80",
        "--dex",
        "55",
        "--app",
        "50",
        "--int",
        "65",
        "--pow",
        "65",
        "--edu",
        "60",
        "--luck",
        "40",
        "--formula",
        "edu*4",
      ],
      { from: "user" },
    );
    expect(output).toContain('"type": "coc_investigator_export"');
    expect(output).toContain('"occupation_points": 240');
    expect(output).toContain('"interest_points": 130');
  });

  test("creates and updates markdown character sheet", async () => {
    const file = join(
      tmpdir(),
      `coc-sheet-${Date.now()}-${Math.random().toString(36).slice(2)}.md`,
    );
    let output = "";
    const program = createProgram({
      writeLine: (str) => {
        output += `${str}\n`;
      },
    });

    await program.parseAsync(
      [
        "investigator",
        "markdown",
        "create",
        "--output",
        file,
        "--age",
        "25",
        "--name",
        "Ada",
        "--occupation",
        "Detective",
      ],
      { from: "user" },
    );

    let content = await readFile(file, "utf8");
    expect(output).toContain("result_type: COC_INVESTIGATOR_MARKDOWN_CREATE");
    expect(content).toContain("# Investigator Character Sheet");
    expect(content).toContain("Ada");
    expect(content).toContain("<!-- COC_SHEET_JSON_START -->");

    await program.parseAsync(
      [
        "investigator",
        "markdown",
        "update",
        "--file",
        file,
        "--set",
        "identity.occupation=Professor",
        "--set",
        "attributes.str=80",
      ],
      { from: "user" },
    );
    content = await readFile(file, "utf8");
    expect(content).toContain("Professor");
    expect(content).toContain('"str": 80');
  });

  test("runs skills catalog and allocation workflow", async () => {
    const file = join(
      tmpdir(),
      `coc-skills-${Date.now()}-${Math.random().toString(36).slice(2)}.md`,
    );
    let output = "";
    const values = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    const program = createProgram({
      writeLine: (str) => {
        output += `${str}\n`;
      },
      randomInt: () => values.shift() ?? 1,
    });

    await program.parseAsync(
      [
        "investigator",
        "markdown",
        "create",
        "--output",
        file,
        "--age",
        "25",
        "--name",
        "SkillsTester",
      ],
      { from: "user" },
    );
    await program.parseAsync(["investigator", "skills", "catalog", "--format", "json"], {
      from: "user",
    });
    await program.parseAsync(
      [
        "investigator",
        "skills",
        "allocate",
        "--file",
        file,
        "--occupation-points",
        "200",
        "--interest-points",
        "120",
        "--set-occ",
        "library_use=60",
        "--set-occ",
        "spot_hidden=50",
        "--set-int",
        "psychology=30",
      ],
      { from: "user" },
    );
    await program.parseAsync(
      [
        "investigator",
        "skills",
        "validate",
        "--file",
        file,
        "--occupation-points",
        "200",
        "--interest-points",
        "120",
      ],
      { from: "user" },
    );
    await program.parseAsync(
      [
        "investigator",
        "skills",
        "mark",
        "--file",
        file,
        "--skill",
        "library_use",
        "--skill",
        "spot_hidden",
      ],
      { from: "user" },
    );
    await program.parseAsync(
      [
        "investigator",
        "skills",
        "growth-check",
        "--file",
        file,
        "--roll",
        "library_use=99",
        "--roll",
        "spot_hidden=20",
      ],
      { from: "user" },
    );

    const content = await readFile(file, "utf8");
    expect(output).toContain("result_type: COC_SKILLS_ALLOCATE");
    expect(output).toContain("left_occupation: 90");
    expect(output).toContain("left_interest: 90");
    expect(output).toContain("result_type: COC_SKILLS_VALIDATE");
    expect(output).toContain("valid: true");
    expect(output).toContain("result_type: COC_SKILLS_GROWTH_CHECK");
    expect(content).toContain('"library_use"');
    expect(content).toContain('"spot_hidden"');
  });
});
