# geoip-site

Minimal, terminal-styled GeoIP lookup. No ads, no popups — just a search box
and the raw data.

Live demo: [geoip.felipebatista.dev](https://geoip.felipebatista.dev)

Based on the Python CLI at
[BatistaFelipe/geoip](https://github.com/BatistaFelipe/geoip), reimagined as a
single-page web tool.

## Features

- Lookup by IPv4, IPv6, or hostname/DDNS
- Server-side DNS resolution (keeps the browser out of DNS)
- SSRF-safe: rejects private, loopback, link-local, multicast and reserved ranges
- Basic in-memory rate limit (20 req/min per IP)
- Zero runtime dependencies beyond Next.js + Tailwind
- Dark terminal UI, monospace, zero animations

## Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4

Data source: [ipinfo.io](https://ipinfo.io) (free tier works tokenless).

## Local development

```bash
npm install
cp .env.local.example .env.local   # optional
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
- `npm test` — run the Jest suite
- `npm run test:coverage` — Jest with coverage report

### CI

Every push and pull request against `main` runs lint, tests and build via
GitHub Actions (`.github/workflows/ci.yml`). To block merges on failing checks,
enable *Settings → Branches → Branch protection rules* for `main` and require
the `lint + test` status check.

## Environment variables

| Name           | Required | Description                                                      |
| -------------- | -------- | ---------------------------------------------------------------- |
| `IPINFO_TOKEN` | No       | ipinfo.io API token. Leave blank to use the tokenless free tier. |

## Deploy on Vercel

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. (Optional) Add `IPINFO_TOKEN` under Project Settings → Environment Variables.
4. Add your custom domain and point a `CNAME` to `cname.vercel-dns.com`.

The default Node.js runtime is used — no extra configuration required.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © 2026 Felipe Batista
