# CHAINTRACE Design System & Visual Specification Guide

## 1. Brand Identity & Positioning

- **Product Name**: CHAINTRACE
- **Tagline**: *TRACE THE CHAIN. FIND THE VASP.*
- **Problem Statement (SIH 2026)**:
  > Automated attribution of unknown cryptocurrency wallets to their nearest Virtual Asset Service Providers (VASPs) through blockchain intelligence.
- **Visual Aesthetic**:
  - Institutional, forensic, analytical, authoritative.
  - High-clarity typography with dual Space Grotesk (headings) and JetBrains Mono (cryptographic hashes, telemetry, metadata).
  - Light mode is the primary institutional default with warm editorial tones; Dark mode is fully preserved for tactical security enclaves.

---

## 2. Color Palette & Semantic Tokens

CHAINTRACE utilizes semantic CSS variables defined in `:root` (light default) and `.dark` (tactical dark mode) so that components remain fully coherent across both themes.

| Token | Light Value | Dark Value | Usage / Semantics |
|---|---|---|---|
| `--bg` | `#F7F5F0` (warm alabaster) | `#0A1626` (deep obsidian navy) | Page canvas background |
| `--surface` | `#FFFFFF` (pure white) | `#0E1E33` (tactical slate) | Main card containers, modals, panels |
| `--surface-secondary` | `#F0ECE1` (stone beige) | `#142842` (elevated navy) | Secondary headers, inner pills, inputs |
| `--surface-subtle` | `#EBE6D8` (warm neutral) | `#1C3252` (subtle border/hover) | Hover fills, table headers, breadcrumbs |
| `--border` | `#D9D2C2` (parchment line) | `#223A5E` (steel stroke) | Card borders, dividers, subtle outlines |
| `--border-subtle` | `#E8E2D5` | `#1A2D4A` | Table gridlines, soft boundaries |
| `--text` | `#1E293B` (charcoal slate) | `#C2C6D6` (pale cold gray) | Primary body copy, description text |
| `--text-muted` | `#64748B` (slate gray) | `#8C909F` (dim cool gray) | Metadata labels, timestamps, field titles |
| `--heading` | `#0F172A` (deep ink) | `#FFFFFF` (crisp white) | H1/H2 titles, KPI values, primary labels |
| `--primary` | `#155EEF` (cobalt blue) | `#3B82F6` (vibrant blue) | Primary action CTAs, active route states |
| `--accent` | `#087F8C` (deep cyan/teal) | `#06B6D4` (neon cyan) | Cross-chain telemetry, live pulse indicators |
| `--gold` | `#A67C32` (aged brass/gold) | `#D4B978` (bright brass gold) | VASP attribution badges, forensic highlights |
| `--danger` | `#DC2626` | `#EF4444` | High risk scores, sanctions, mule flags |
| `--warning` | `#D97706` | `#F59E0B` | Unverified mixers, hops warning |
| `--success` | `#059669` | `#10B981` | FIU-IND registered VASPs, 65B verification |

---

## 3. Typography Hierarchy

1. **Space Grotesk** (`font-space`):
   - Used for: Brand headers, hero titles, KPI numbers, section titles, modal headings.
   - Weights: `font-bold` (700), `font-extrabold` (800).
2. **JetBrains Mono** (`font-mono`):
   - Used for: Cryptocurrency wallet addresses (`0x...`, `bc1...`, `T...`), transaction hashes, Section 65B checksums, CLI commands, telemetry badges.
   - Tracking: `tracking-wider`, `tracking-widest` for status pills.
3. **Inter / System Sans** (`font-sans`):
   - Used for: Long-form analytical dossiers, legal text, methodology descriptions, general inputs.

---

## 4. Theme System & Zero-FOUC Implementation

- **Storage Key**: `localStorage.getItem('chaintrace-theme')`
- **Supported Modes**: `'light'`, `'dark'`, `'system'`
- **Anti-FOUC Head Script** (`src/app/layout.tsx`):
  ```js
  (function() {
    try {
      var saved = localStorage.getItem('chaintrace-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch(e) {}
  })();
  ```
- **Component**: `<ThemeToggle />` renders a 3-state switcher (Sun / Moon / Monitor) and emits a `'chaintrace-theme-change'` window event so reactive canvases adapt their node colors instantly.

---

## 5. Living Intelligence Canvas (GSAP Animation)

- **Component**: `src/components/common/ChainTraceBackground.tsx`
- **Engine**: Powered by `gsap.ticker.add(render)` with time delta calculations.
- **Behaviors**:
  - **Node Generation**: Generates 22–45 responsive network nodes (scaled by screen width: `< 768px` vs `> 1200px`).
  - **Pulse Traversals**: Simulates transaction pulses traveling along network paths between nodes, reflecting blockchain transactions.
  - **Theme Adaptability**:
    - In Light Mode: Soft slate connections (`rgba(30, 41, 59, 0.08)`), blue nodes (`#155EEF`), brass highlights (`#A67C32`).
    - In Dark Mode: Luminescent cyan/blue links (`rgba(56, 189, 248, 0.15)`), glowing pulses (`#38BDF8`).
  - **Safety & Performance**:
    - Strictly non-interactive: `pointer-events-none fixed inset-0 -z-10`.
    - Honors `@media (prefers-reduced-motion)` by checking `window.matchMedia('(prefers-reduced-motion: reduce)')` and rendering a single static frame without ticking.
    - GSAP ticker listeners are cleanly removed on unmount (`gsap.ticker.remove(tick)`).

---

## 6. Component Guidelines

### Brand Monogram (`ChainTraceLogo`)
- Geometric octagon motif representing distributed ledger blocks.
- T-bar centroid representing attribution tracing.
- Dual-color gradient border (`#155EEF` to `#A67C32`).
- Responsive sizes: `'sm'`, `'md'`, `'lg'`.

### VASP Attribution Badges
- High-confidence VASP matches (90%+): Accent gold badge (`bg-theme-gold/15 text-theme-gold border border-theme-gold/40`).
- FIU-IND Registration: Emerald badge (`bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30`).
- Unknown / Darknet Mule: Danger badge (`bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30`).

### Court Admissibility & Section 65B Notice
- Must always identify the environment as a **Controlled Demonstration Environment** / **Simulated Intelligence Prototype** for hackathon evaluation purposes.
- Checksums are rendered in `font-mono text-xs break-all`.
