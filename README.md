# coc CLI Scaffold

This repository includes a Bun + TypeScript CLI scaffold built with Commander.js and Biome.

## Quick Start

```bash
bun install
bun run dev
```

Try the command:

```bash
bun run start -- greet world
```

## Scripts

- `bun run dev`: run CLI in watch mode (`--help`)
- `bun run start -- <args>`: run CLI with arguments
- `bun run build`: bundle CLI to `dist/coc`
- `bun test`: run tests
- `bun run test:watch`: run tests in watch mode
- `bun run lint`: lint via Biome
- `bun run format`: format via Biome
- `bun run check`: lint + format checks (no writes)
- `bun run check:fix`: apply safe Biome fixes
- `bun run ci`: test + Biome CI checks

## Structure

- `src/`: app source code
- `src/cli.ts`: CLI entrypoint and parser setup
- `src/commands/`: command modules
- `test/`: Bun tests and preload setup
- `bunfig.toml`: Bun test preload configuration
- `biome.json`: formatter/linter config
