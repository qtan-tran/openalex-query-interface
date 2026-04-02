# OpenAlex Query Interface

A simple web app for querying the [OpenAlex API](https://openalex.org/) — an open catalog of global research.

Built with Next.js and TypeScript. Designed to be beginner-friendly and easy to fork.

## Features

- Search Works, Authors, Institutions, Sources, and Concepts
- Filter by year, open-access status, and more
- Paginated results
- No API key required

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- [OpenAlex API](https://docs.openalex.org/)

## Project Structure

```
app/
  page.tsx              # Home — search form + results
  layout.tsx            # Root layout
  api/search/route.ts   # Server-side proxy to OpenAlex API
components/
  SearchForm.tsx        # Entity selector + query input
  ResultsTable.tsx      # Paginated results display
  FilterPanel.tsx       # Filters (year, open access, sort)
lib/
  openalex.ts           # Typed fetch helpers
  types.ts              # TypeScript types for OpenAlex responses
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your details:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `OPENALEX_EMAIL` | Your email (used for the [polite pool](https://docs.openalex.org/how-to-use-the-api/rate-limits-and-authentication)) |

## License

MIT
