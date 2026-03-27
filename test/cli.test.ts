import { describe, expect, test } from "bun:test";
import { createProgram } from "../src/cli";

describe("CLI", () => {
  test("registers the greet command", () => {
    const program = createProgram();
    const commandNames = program.commands.map((command) => command.name());
    expect(commandNames).toContain("greet");
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
});
