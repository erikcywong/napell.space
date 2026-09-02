# napell.space

**Aeroponic Coffee Cultivation System — Commercial Business Model & Value Chain Analysis**

Tri-lingual (English / Mandarin / Arabic) data-driven analysis of an aeroponic coffee seedling cultivation facility.

## Overview

This project presents a transparent, data-backed commercial model for industrial-scale aeroponic coffee seedling production. All data is derived from operational cost analysis of the Longgang Aeroponic Cultivation Facility (81 systems, 615,000 seedlings/year).

## Key Metrics

| Metric | Value |
|--------|-------|
| Initial Investment | US$414K (¥2.82M) |
| Annual Output | 615,000 seedlings |
| Projected Revenue | US$2.26M/year (¥15.4M) |
| Gross Margin | 73.5% |
| Cost per Seedling | US$0.97 (¥6.61) |
| Sale Price per Seedling | US$3.68 (¥25) |
| Growth Cycle | 4 months |
| Batches per Year | 3 |
| Greenhouse Area | 10.8 acres |

> FX reference: US$1 = ¥6.80. RMB figures shown as reference only.

## Pages

1. **Home** — Landing page with KPI dashboard
2. **Overview** — System architecture & commercial model
3. **Costs** — Detailed cost breakdown (equipment, materials, consumables, utilities, per-seedling). Admin login required.
4. **Riyadh Deployment** — Cost-estimate subpage under Costs: equipment shipped from Guangzhou to Riyadh (SAR) + converted services & unit-economics forecast. Admin login required. Accessible from the Costs page.
5. **Efficiency** — Cultivation density, cycles, yield projections, traditional vs. aeroponic comparison
6. **Value Chain** — Value creation across upstream, midstream, downstream coffee supply chain
7. **Climate Response** — Climate crisis context, partnership framework, implementation roadmap
8. **Contact** — WhatsApp / WeChat / Email channels

> Protected pages (`costs.html`, `riyadh.html`) are gated by an administrator login (SHA-256 hashed, session-scoped). Client-side auth on a static site deters casual inspection; server-side auth is required for production-grade protection.

## Languages

- 🇬🇧 English
- 🇨🇳 简体中文 (Mandarin)
- 🇸🇦 العربية (Arabic, with full RTL support)

All UI strings, error messages, tooltips, and dynamic content are fully translated. A language selection modal appears on first visit.

## Tech Stack

- Pure HTML/CSS/JS — no build tools, no dependencies
- Custom i18n system with localStorage persistence
- RTL support for Arabic
- Responsive design (mobile-friendly)
- Dark theme (#000 + #1d9bf0 accent)

## Data Source

All figures extracted from: `副本育苗系统 费用和产出计划 0812.xlsx` — operational cost analysis for Longgang Greenhouse 5 & 6.

## License

MIT
