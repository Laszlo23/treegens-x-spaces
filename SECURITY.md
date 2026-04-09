# Security policy

## Supported versions

We track **Node.js LTS** (see [`.nvmrc`](.nvmrc)) and the **Next.js** / **Hardhat** versions pinned in [`package.json`](package.json). Deploy production apps on a current host image and apply vendor security updates for the OS and runtime.

## Reporting a vulnerability

Please report sensitive issues **privately** (do not open a public issue with exploit details):

1. Open a **private security advisory** on GitHub if the repository supports it, or  
2. Contact the maintainers with a clear description, affected version, and reproduction steps.

We aim to acknowledge reports within a few business days.

## Dependency audits

- Run `npm audit` regularly. This project uses **`npm overrides`** in `package.json` to pull patched versions of nested dependencies (e.g. `glob`, `lodash`) where safe.
- **Hardhat** and **@nomicfoundation/hardhat-toolbox** pull a large dev-time tree. Remaining `npm audit` findings are often in **test / compile tooling**, not in the production Next.js bundle. Resolving them fully may require **Hardhat 3** and toolbox major upgrades (tracked separately).
- **Privy** may install **optional** Solana / Farcaster-related peers for wallet features; the app does not import those modules directly. Keep `@privy-io/react-auth` updated via semver-compatible releases.

## Secrets

Never commit `.env`, deployer keys, **Pinata JWT**, or **X API** bearer tokens. Use host-provided secrets (e.g. Vercel environment variables) and restrict API keys to minimum required scopes.

## Production deployment

- Prefer **managed hosting** (e.g. Vercel) so HTTP edge and framework patches are applied by the platform.  
- Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS origin.  
- Keep `PINATA_JWT` server-only (no `NEXT_PUBLIC_` prefix).
