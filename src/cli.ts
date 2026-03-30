#!/usr/bin/env bun
import process from "node:process";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { registerGreetCommand } from "./commands/greet";
import { registerInvestigatorCommand } from "./commands/investigator";
import { registerRollCommand } from "./commands/roll";

type CliOutput = {
  writeOut?: (str: string) => void;
  writeErr?: (str: string) => void;
  writeLine?: (str: string) => void;
  randomInt?: (min: number, max: number) => number;
};

export function createProgram(output?: CliOutput): Command {
  const program = new Command();

  program
    .name("coc")
    .description("A Commander.js CLI scaffold running on Bun")
    .version("0.1.0")
    .showHelpAfterError("(run with --help for usage)");

  if (output) {
    program.configureOutput({
      writeOut: output.writeOut,
      writeErr: output.writeErr,
    });
  }

  registerGreetCommand(program, { writeLine: output?.writeLine });
  registerRollCommand(program, {
    writeLine: output?.writeLine,
    randomInt: output?.randomInt,
  });
  registerInvestigatorCommand(program, {
    writeLine: output?.writeLine,
    randomInt: output?.randomInt,
  });
  return program;
}

export async function run(argv: string[]): Promise<void> {
  const program = createProgram();
  await program.parseAsync(argv);
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  run(process.argv).catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
