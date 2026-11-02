# Contributing

Thanks for considering a contribution! This project is intentionally small —
please keep changes focused and aligned with the MVP spirit (no ads, no bloat).

## Reporting issues

Open a GitHub issue describing:

- What you expected to happen
- What actually happened
- Steps to reproduce (input, URL, etc.)

## Development

```bash
npm install
cp .env.local.example .env.local   # optional, only if you have an ipinfo token
npm run dev
```

The app runs at `http://localhost:3000`.

## Pull requests

1. Fork the repository and create a branch:
   - `feat/<short-description>` for new features
   - `fix/<short-description>` for bug fixes
   - `refactor/<short-description>` for refactoring
2. Run checks before pushing:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
   CI (`.github/workflows/ci.yml`) runs the same steps on every push and pull
   request against `main` — PRs must be green before merge.
3. Follow [Conventional Commits](https://www.conventionalcommits.org/) for
   commit messages (e.g. `feat: add ipv6 reverse lookup`).
4. Open a PR targeting `main` with a short summary of the change.

## Scope

Changes that keep the tool minimal and ad-free are welcome:

- Better input validation / error messages
- Accessibility and keyboard-first UX
- Portable deployment configs (Vercel, Netlify, self-host)

Please discuss larger changes (new data providers, UI redesigns, analytics)
in an issue first.
