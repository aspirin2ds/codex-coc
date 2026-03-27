#!/usr/bin/env bun
import { Command } from "commander";
import { registerGreetCommand } from "./commands/greet";

type CliOutput = {
  writeOut?: (str: string) => void;
  writeErr?: (str: string) => void;
  writeLine?: (str: string) => void;
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
  return program;
}

export async function run(argv: string[]): Promise<void> {
  const program = createProgram();
  await program.parseAsync(argv);
}

if (import.meta.main) {
  run(process.argv).catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
