# AeroQuality Analytics

**Aerospace Quality Control Dashboard**

A professional, data-driven web dashboard demonstrating core Supplier Quality Engineering (SQE) competencies applied to aviation safety data. Built to showcase skills in Statistical Process Control (SPC), Root Cause Corrective Action (RCCA), defect dispositioning, and supplier performance monitoring within the aerospace industry.

---

## Live Dashboard

> Open `index.html` in any modern browser, or deploy to GitHub Pages.

---

## Features

### 1. Executive Summary
- Total incident KPIs with year-over-year trend analysis
- Severity distribution (Fatal / Serious / Minor / None)
- Pareto analysis of top defect categories by ATA system code
- Phase of flight distribution
- Top manufacturer performance summary table

### 2. Statistical Process Control (SPC)
- **Individuals Chart (I-Chart)** with 3-sigma UCL/LCL
- **Moving Range (MR) Chart** for consecutive-period variation
- **Attribute Chart (p-Chart)** monitoring high-severity event proportions
- Process Capability metrics (Cp, Cpk)
- Western Electric rule violation detection
- Out-of-control point summary with stability scoring

### 3. Root Cause Corrective Action (RCCA)
- Interactive **Ishikawa (Fishbone) Diagram** with 5 root cause categories
- **5-Why Analysis** drill-down using real aerospace case studies
- **Pareto Analysis** of contributing factors with cumulative percentage line
- Root cause category distribution by ATA system code

### 4. Supplier / Manufacturer Scorecards
- Sortable manufacturer performance table with risk ratings
- Year-over-year trend comparison for top manufacturers
- Risk rating distribution (Low / Medium / High / Critical)
- Drill-down analysis by ATA defect type and root cause category per manufacturer

### 5. NCR 8D Problem Solving Simulator
- Interactive walkthrough of the complete **8 Disciplines** methodology
- Pre-populated with realistic aerospace case studies:
  - Landing gear actuator hydrogen embrittlement failure
  - HPT blade casting porosity / HIP process deviation
- Step-by-step navigation: D1 (Team) through D8 (Closure)
- References AS9145 PPAP and aerospace quality management standards

### 6. Defect Trend Analysis
- Monthly defect trend with 3-period moving average overlay
- Severity-weighted defect scoring (Fatal=10, Serious=5, Minor=2, None=0.5)
- Stacked ATA category heatmap by year
- Aircraft damage distribution trend
- Defect dispositioning summary (UAI, Repair, Rework, Scrap, MRB Review)
- Interactive filters by ATA category and severity level

---

## Data

The dashboard uses a deterministic dataset of **800 aviation safety events** modeled on real NTSB (National Transportation Safety Board) data patterns. The dataset includes:

- Events spanning 2019-2026 across all 50 U.S. states
- 15 aircraft/engine manufacturers with realistic fleet distributions
- 25 ATA system codes covering airframe, powerplant, and avionics systems
- 5 root cause categories (Material, Process, Design, Human, Environmental)
- Detailed 8D case studies based on actual aerospace failure modes

All data is generated using a seeded pseudo-random number generator for reproducibility.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 (semantic) |
| Styling | Vanilla CSS (custom properties, responsive grid) |
| Logic | Vanilla JavaScript (ES6+, no build step) |
| Charts | Chart.js 4.x (CDN) |
| Typography | Inter, JetBrains Mono (Google Fonts) |

No build tools, no frameworks, no dependencies to install. Open `index.html` and go.

---

## Deployment

### GitHub Pages
1. Push this directory to a GitHub repository
2. Go to **Settings > Pages**
3. Set Source to **Deploy from a branch** and select `main` / root
4. The dashboard will be live at `https://<username>.github.io/<repo-name>/`

---

## Quality Engineering Competencies Demonstrated

- **Statistical Process Control (SPC)**: X-bar, R-chart, p-chart, Western Electric rules, Cp/Cpk
- **Root Cause Analysis**: Ishikawa diagram, 5-Why methodology, Pareto analysis
- **8D Problem Solving**: Full AS9145-aligned corrective action workflow
- **Supplier Quality Management**: Risk-based supplier rating, performance trending, drill-down analysis
- **Defect Dispositioning**: UAI/Repair/Rework/Scrap classification per AS9102 FAIR guidelines
- **ATA/JASC System Coding**: Industry-standard component categorization
- **Data-Driven Decision Making**: KPI dashboards, trend analysis, severity weighting

---

## Author

**Jose D.**
Industrial Engineering and Operations Research (IEOR)

---

## License

This project is for portfolio and educational purposes. Data is synthetically generated and does not represent actual NTSB investigation outcomes.
