import type { Command } from "commander";

type GreetOptions = {
  upper?: boolean;
};

type GreetDeps = {
  writeLine?: (value: string) => void;
};

export function registerGreetCommand(program: Command, deps?: GreetDeps): void {
  const writeLine = deps?.writeLine ?? console.log;

  program
    .command("greet")
    .description("Print a greeting message")
    .argument("<name>", "name to greet")
    .option("-u, --upper", "print in uppercase")
    .action((name: string, options: GreetOptions) => {
      const message = `Hello, ${name}!`;
      writeLine(options.upper ? message.toUpperCase() : message);
    });
}
