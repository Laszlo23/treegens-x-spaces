# Contributing

1. Use **Node.js** version in [`.nvmrc`](.nvmrc) (`nvm use` or `fnm use`).
2. Copy [`.env.example`](.env.example) to `.env` and fill values for local development.
3. Before opening a PR, run:

   ```bash
   npm run check
   ```

   This runs ESLint, TypeScript (`tsc --noEmit`), and a production `next build`.

4. Contract changes: run `npm run compile` and update [`src/lib/abis/VoiceSeed.json`](src/lib/abis/VoiceSeed.json) if the ABI changes.

CI on push/PR runs the same checks plus `hardhat compile`. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
