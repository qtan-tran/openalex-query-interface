# OpenAlex Explorer

A clean, open-source web interface for querying the [OpenAlex](https://openalex.org/) research catalog — search millions of academic works, authors, institutions, journals, and concepts.

**No sign-up. No API key required.** OpenAlex is free and fully open.

---

## Features

- **5 entity types** — Works, Authors, Institutions, Sources, Concepts
- **Rich filters** — year range, open access status, minimum citations, sort order, results per page
- **Cursor pagination** — fast navigation through large result sets
- **CSV export** — download the current page of results with one click
- **Shareable URLs** — search state is preserved in the URL; refresh or share any query
- **Typed throughout** — full TypeScript from API route to UI components

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (included with Node.js)

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/openalex-query-interface.git
cd openalex-query-interface
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Configure environment variables

```bash
cp .env.example .env.local
```

All variables are optional — skip this step if you just want to try the app.

### 4 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENALEX_API_KEY` | No | Grants access to the OpenAlex premium polite pool for higher rate limits. The app works without it. |

See `.env.example` for the full template with comments.

---

## Usage

1. **Pick an entity type** using the tab bar — Works, Authors, Institutions, Sources, or Concepts
2. **Enter a search query** and press Search (or hit Enter)
3. **Apply filters** using the row below the search bar:
   - Works: year range, open access, minimum citations
   - Sources: open access
   - All entities: sort order, results per page
4. **Navigate pages** with Previous / Next — the cursor-based API returns results fast
5. **Export** the current page to CSV using the button in the results toolbar
6. **Share or bookmark** any search — the URL updates automatically with every query

---

## Project Structure

```
app/
  api/openalex/route.ts    Server-side proxy to the OpenAlex API
  layout.tsx               Root HTML layout and metadata
  page.tsx                 Entry point — mounts the search page inside Suspense

components/
  layout/
    Header.tsx             Sticky top bar with brand and nav links
  search/
    QueryPanel.tsx         Entity tabs + search input + filter row
    ResultsArea.tsx        State router: idle / loading / error / empty / results
    ResultsTable.tsx       Data table with per-entity columns and skeleton rows
    ResultsToolbar.tsx     Result count summary and CSV export button
  ui/
    Button.tsx             Reusable button (primary, outline, ghost, danger)
    Input.tsx              Reusable text input
    Select.tsx             Reusable select dropdown
    Badge.tsx              Reusable status pill
  SearchPage.tsx           Client component: all search state + URL sync

lib/
  api-types.ts             Shared TypeScript types (entities, filters, API response)
  cn.ts                    Tiny className join helper
  export.ts                CSV serialization logic
```

---

## API Route

The app proxies all requests through a single internal route to keep your API key server-side and avoid CORS issues.

**`GET /api/openalex`**

| Parameter | Type | Description |
|---|---|---|
| `entity` | string | One of `works`, `authors`, `institutions`, `sources`, `concepts` (default: `works`) |
| `search` | string | Keyword search query |
| `yearFrom` | number | Filter works published from this year |
| `yearTo` | number | Filter works published up to this year |
| `isOA` | boolean | `true` or `false` — filter by open access status |
| `minCitations` | number | Minimum citation count |
| `sort` | string | e.g. `cited_by_count:desc`, `publication_year:asc` |
| `perPage` | number | Results per page, max 100 (default: 25) |
| `cursor` | string | Cursor for pagination (use `*` for the first page) |

---

## Known Limitations

- **Concepts entity** — OpenAlex has deprecated Concepts in favour of Topics. The tab is included but results may be sparse.
- **Export scope** — CSV export covers only the current page of results, not all pages.
- **Cursor pagination** — jumping to a specific page is not supported; the OpenAlex API only provides a next-cursor token.
- **Author affiliation** — the `institution` field reflects the most recent known affiliation, which may be out of date.

---

## Future Improvements

- [ ] Full multi-page CSV export
- [ ] Work detail view with abstract and full author list
- [ ] Saved searches (localStorage)
- [ ] Citation and publication trend charts
- [ ] Dark mode
- [ ] Topics entity to replace deprecated Concepts

---

## Contributing

Pull requests are welcome. For significant changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
