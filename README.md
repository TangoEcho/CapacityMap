# TF Capacity Management

A tool for evaluating and optimizing bank credit capacity allocations across global projects. Users enter project requirements (country, capacity, tenor, sensitive subjects) and the app ranks eligible banks by fit, supports multi-project optimization, and provides interactive dashboards for data-driven decision-making.

## Features

- **Bank Management** — Sortable/filterable bank table with credit ratings, capacity, pricing, tenor, and country coverage. Excel import/export with template download.
- **Project Management** — Track planned and issued projects with instrument amounts, tenor requirements, and minimum credit ratings. Card and table views with search, status, and country filters.
- **Bank Recommendations** — Per-project ranked bank list with scoring (capacity headroom, price competitiveness, credit rating). Card and sortable list views. One-click bank allocation.
- **Multi-Project Optimizer** — Greedy optimization across all planned projects. Manual bank selection with expandable eligible bank lists. Accept/reject individual allocations before committing.
- **Interactive Dashboard** — Summary cards, choropleth world map (Leaflet), capacity by region charts, bank utilization donut, and sensitive subject distribution. PDF and PowerPoint export.
- **Countries & Regions** — Browse banks and projects by region/country with sortable tables and detail pane. Filter to countries with active projects.
- **Confidential Mode** — Hides capacity dollar amounts across the entire UI, replacing them with color-coded health indicators (Ample/Moderate/Limited) so teams can make decisions without seeing sensitive business figures. Pricing data remains visible.
- **Customizable Ranking** — Adjustable weight sliders for capacity headroom, price competitiveness, and credit rating. Settings auto-save.
- **Dark Mode** — Full light/dark theme support.

## Tech Stack

### Client (`/client`)
- React 19, Vite, TypeScript
- Material UI 7 (MUI)
- React Router 7
- Recharts (charts)
- React-Leaflet + Leaflet (world map)
- SheetJS/xlsx (Excel parsing)
- jsPDF + html2canvas (PDF export)
- pptxgenjs (PowerPoint export)

### Server (`/server`)
- Express.js, TypeScript
- JSON file persistence (no database)
- Multer (file uploads — logos, Excel)
- SheetJS/xlsx (server-side Excel processing)

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running

Start both the server and client in separate terminals:

```bash
# Terminal 1 — API server (port 3001)
cd server
npm run dev

# Terminal 2 — React app (port 5173)
cd client
npm run dev
```

Open http://localhost:5173 in your browser.

### Quick Start

1. Download the Excel template from the Banks page
2. Fill in bank data and import it
3. Add projects with country, capacity, and tenor requirements
4. View bank recommendations per project or run the multi-project optimizer
5. Mark projects as Issued once allocations are finalized

## Project Structure

```
/client
  /public/geo              # GeoJSON world map data
  /src
    /components
      /common              # Navbar, export buttons
      /dashboard           # Map, charts, summary cards
      /projects            # Project forms, table, ranking, optimizer
      /banks               # Bank table, form, Excel import
      /countries           # Region accordion, country detail
      /settings            # Weight sliders, sensitive subjects, theme
    /hooks                 # useApi, useExport, useSettings
    /services              # API client (banksApi, projectsApi, etc.)
    /utils                 # Ranking algorithm, credit rating utils, country mappings
    /types                 # TypeScript interfaces
    /theme                 # MUI theme configuration

/server
  /src
    /routes                # Express route handlers
    /data                  # JSON data files (banks, projects, settings)
    /uploads               # Logo images
    /templates             # Excel template
    /utils                 # Excel parsing, validation, country data
    /types                 # TypeScript interfaces
```

## Ranking Algorithm

### Hard Filters (bank eliminated if any fail)
- Bank operates in the project's country (or is GLOBAL)
- No sensitive subject conflicts with project type
- Bank's max tenor >= project's tenor requirement
- Bank's credit rating >= project's minimum rating
- Bank has available capacity > 0

### Soft Scoring (weighted, customizable in Settings)
- **Capacity headroom** — (available - needed) / total
- **Price competitiveness** — inverse of average price (lower bps = better)
- **Credit rating** — mapped to numeric scale (AAA=10 down to CCC=1)

### Multi-Project Optimization
- Only Planned projects are included (Issued are locked)
- Projects sorted by most constrained (fewest eligible banks) first
- Greedy assignment: best bank per project, capacity deducted, repeated
- Users can pre-select banks for specific projects before optimizing

## Color Scheme
- Primary green: `#00875A` (GE Vernova)
- Teal accent: `#00A3A1`
- Green accent: `#7AB648`

## License

Private — internal use only.
