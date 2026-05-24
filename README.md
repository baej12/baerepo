# Brandon Bae Portfolio

A responsive React + TypeScript portfolio site with route-based pages, mobile-friendly resume viewing, animated transitions, a world work-history map, and a live GitHub repository feed.

## Features

- Route-based experience with pages for Home, About, Services, Contact, and History
- Animated route transitions between the Home and History experiences
- Work history map with zoom/pan interactions and marker detail panels
- Protected resume access using Cloudflare Turnstile and an Azure-backed resume URL endpoint
- GitHub repository feed powered by the public GitHub API
- Curated profile/about/jobs/projects content stored as typed TypeScript data modules
- Responsive layout with accessibility-minded markup and labels

## Tech Stack

- React 19
- TypeScript 6
- React Router 7
- Vite 8
- Axios
- D3 Geo + TopoJSON (map rendering)
- Cloudflare Turnstile
- Azure Functions / Azure Blob Storage for protected resume delivery

## Getting Started

```bash
git clone https://github.com/baej12/baerepo.git
cd baerepo
npm install
npm run dev
```

Default local URL: [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy or create a local environment file and set:

```env
VITE_GITHUB_USERNAME=your_github_username
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

If not set, the app falls back to `baej12`.

`VITE_TURNSTILE_SITE_KEY` enables the CAPTCHA challenge before the resume URL is requested.
The resume endpoint is configured in `src/data/profile.ts` and returns the current Azure-hosted resume URL after CAPTCHA verification.

The example file is available at `.env.example`.

## Data Sources

Portfolio content is stored in TypeScript modules under `src/data/`. These modules are the source of truth; stale JSON mirrors are intentionally not kept in the repository.

- `about.ts`
- `jobs.ts`
- `projects.ts`
- `profile.ts`
- `mapPlaces.ts`

To add custom non-job map pins, edit `src/data/mapPlaces.ts`.

## Scripts

- `npm run dev` or `npm start`: Start the Vite dev server
- `npm run build`: Type-check with TypeScript and create production build in `build/`
- `npm run preview`: Preview the production build locally
- `npm test`: Run tests with Vitest

## Build and Deployment

The project builds static assets into `build/` and can be deployed to any static host that supports SPA fallback routing.

A Dockerfile is included for containerized deployment with Nginx:

```bash
docker build -t baerepo:local .
docker run --rm -p 8080:80 baerepo:local
```

Then open [http://localhost:8080](http://localhost:8080).

## CI

The workflow in `.github/workflows/build.yml` currently runs:

- Install dependencies (`npm ci`)
- Type check (`npx tsc --noEmit`)
- Production build (`npm run build`)
- Dependency audit (`npm audit --audit-level=high`)

## Author

Jung Hwan (Brandon) Bae

- GitHub: [@baej12](https://github.com/baej12)
- LinkedIn: [Jung Hwan Bae](https://www.linkedin.com/in/jhbbae/)

## License

Open source for personal and educational use.
