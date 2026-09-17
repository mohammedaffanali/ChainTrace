# CHAINTRACE — UI/UX DESIGN SYSTEM SPECIFICATION

**Document ID**: CT-UX-DESIGN-SYSTEM-2026-01  
**Version**: 2.0.0  
**Date**: September 14, 2026  
**Status**: Phase 5 Deliverable — Approved for Implementation Review  

---

## 1. Design Philosophy & Forensic Principles

CHAINTRACE is a mission-critical tool for sworn law enforcement officers, forensic accountants, and intelligence analysts. The interface prioritizes **clarity, speed, evidentiary transparency, and cognitive focus**.

### Core Tenets:
1. **Zero Decorative Distraction**: Eliminate superfluous animations, aggressive blur/glassmorphism, and low-contrast decorative accents.
2. **High Information Utility**: Ensure high information density without visual clutter; use clear borders, structured tables, and consistent typography.
3. **Forensic Distinction**: Distinctly separate raw on-chain data (hashes, addresses, gas) from analytical inferences (cluster confidence, risk bands).
4. **Evidentiary Integrity**: Always display statutory disclaimers and visible telemetry modes (Production vs. Fallback Demo).
5. **Universal Accessibility**: Maintain WCAG 2.2 AA compliance across both Light (institutional default) and Dark (tactical enclave) themes.

---

## 2. Color Palette & Semantic Tokens

All colors are implemented as semantic CSS variables in `:root` and `.dark`, ensuring high contrast and seamless theme toggling.

| Semantic Token | Light Mode (Default Institutional) | Dark Mode (Tactical Enclave) | Usage / Semantics | Minimum Contrast (WCAG AA) |
|---|---|---|---|---|
| `--bg` | `#F8FAFC` (Slate 50) | `#0B1120` (Obsidian Navy) | Primary canvas background | Base |
| `--surface` | `#FFFFFF` (Pure White) | `#111C31` (Elevated Slate) | Cards, modals, drawers, panels | ≥ 12:1 against text |
| `--surface-subtle` | `#F1F5F9` (Slate 100) | `#192642` (Subtle Navy) | Table headers, chip backgrounds | ≥ 9:1 against text |
| `--surface-active` | `#E2E8F0` (Slate 200) | `#23355B` (Active Navy) | Selected tabs, hover states | Contrast demarcation |
| `--border` | `#CBD5E1` (Slate 300) | `#293B61` (Steel Stroke) | Container borders, structural dividers | ≥ 3:1 against background |
| `--border-subtle` | `#E2E8F0` (Slate 200) | `#1E2D4A` (Muted Stroke) | Gridlines, secondary outlines | Subtle division |
| `--text` | `#0F172A` (Slate 900) | `#E2E8F0` (Slate 200) | Primary body copy, table cell content | **≥ 12:1 (Passes AAA)** |
| `--text-muted` | `#475569` (Slate 600) | `#94A3B8` (Slate 400) | Secondary metadata, labels, timestamps | **≥ 4.8:1 (Passes AA)** |
| `--heading` | `#020617` (Deep Ink) | `#FFFFFF` (Crisp White) | H1/H2 page titles, modal headers, KPIs | **≥ 15:1 (Passes AAA)** |
| `--primary` | `#1D4ED8` (Cobalt Blue 700) | `#3B82F6` (Vibrant Blue 500) | Primary CTA buttons, active route tabs | ≥ 4.5:1 against surface |
| `--accent` | `#0E7490` (Deep Cyan 700) | `#06B6D4` (Neon Cyan 500) | Cross-chain bridges, network hops | Specialized telemetry |
| `--gold` | `#B45309` (Aged Brass 700) | `#F59E0B` (Amber Gold 500) | Nearest VASP candidate, attribution path | Critical forensic focus |
| `--danger` | `#B91C1C` (Crimson 700) | `#EF4444` (Red 500) | Critical risk scores, OFAC sanctions, mixers | ≥ 4.5:1 |
| `--warning` | `#C2410C` (Rust Orange 700)| `#F97316` (Orange 500) | Unverified hops, fallback warnings | ≥ 4.5:1 |
| `--success` | `#15803D` (Forest Green 700)| `#10B981` (Emerald 500) | FIU-IND registered entities, verified sweep | ≥ 4.5:1 |
| `--focus-ring` | `#2563EB` (Blue 600) | `#60A5FA` (Blue 400) | Visible keyboard focus outlines | High-visibility 2px ring |

---

## 3. Typography Scale & Fonts

The system utilizes a dual-font strategy:
- **Headings & Structural UI**: `Space Grotesk` (authoritative, institutional, geometric).
- **Cryptographic Telemetry, Addresses & Code**: `JetBrains Mono` (tabular numbers, distinct zero `0` vs `O`, clear hash readability).
- **Body Copy & Long-Form Dossiers**: `Inter` / System Sans.

| Typography Style | Font Family | Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| **Display H1** | Space Grotesk | 28px (1.75rem) | Bold (700) | 36px | -0.02em | Main page headers (Command Dashboard, VASP Suite). |
| **Section H2** | Space Grotesk | 20px (1.25rem) | Bold (700) | 28px | -0.01em | Card container headers, drawer titles. |
| **Subsection H3**| Space Grotesk | 16px (1.00rem) | SemiBold (600) | 24px | 0 | Modal titles, widget headers. |
| **Body Primary** | Inter / Sans | 14px (0.875rem) | Regular (400) | 20px | 0 | Explanatory text, notes, evidentiary descriptions. |
| **Body Bold** | Inter / Sans | 14px (0.875rem) | SemiBold (600) | 20px | 0 | Table column titles, active tab text, field labels. |
| **Caption / Meta**| Inter / Sans | 12px (0.75rem) | Medium (500) | 16px | 0.01em | Timestamps, secondary helper copy. |
| **Hash / Address**| JetBrains Mono| 13px (0.8125rem)| Medium (500) | 18px | 0 | Wallet addresses (`0x...`), transaction hashes, hashes. |
| **Telemetry Pill**| JetBrains Mono| 11px (0.6875rem)| Bold (700) | 14px | 0.05em | Network badges (`ETHEREUM`, `TRON`), status pills. |

---

## 4. Spacing Scale & Layout Grid

- **Base Unit**: 4px. Standard scale: `4px (1)`, `8px (2)`, `12px (3)`, `16px (4)`, `20px (5)`, `24px (6)`, `32px (8)`, `48px (12)`.
- **Containers**:
  - Max Width: `1600px` (fluid with 24px padding on desktop).
  - Tablet Viewport (`768px – 1024px`): 16px padding.
  - Mobile Viewport (`< 768px`): 12px padding, full single-column stacking.
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px (Sidebar collapses to slide-out drawer)
  - `lg`: 1024px (Desktop layout enabled)
  - `xl`: 1280px (Standard multi-column forensic studio)
  - `2xl`: 1536px (Ultrawide forensic command view)

---

## 5. UI Component Catalog Specifications

### 5.1 Buttons & Action Controls
- **Primary Action**: Solid background (`--primary`), white text, 8px rounded corners, subtle shadow.
- **Secondary Action**: Bordered (`--border`), surface background, high-contrast text.
- **Evidentiary Highlight Action**: Aged brass / gold border and text (`--gold`) for "Highlight Attribution Path" or "Attach to Docket".
- **Destructive Action**: Crimson border and background (`--danger`) with explicit double-confirmation modal.
- **States**: Default, Hover (`brightness-95`), Active, Focus-Visible (`ring-2 ring-primary ring-offset-2`), Disabled (`opacity-50 cursor-not-allowed`).

### 5.2 Form Inputs & Address Controls
- **Address Search Bar**: Includes clean paste icon, automatic chain detection pill, clear button (`×`), and inline checksum status icon.
- **Validation Feedback**:
  - Valid: Green checkmark with normalized EIP-55 format preview.
  - Invalid: High-contrast red outline with immediate error text: *"Address checksum failed for Ethereum network."*
- **Chain Selector**: Dropdown showing chain icon (ETH, TRX, POL, BTC), network status dot, and shortcut keystroke.

### 5.3 Tables & Data Lists
- Sticky header row with `--surface-subtle` background.
- Zebra striping on rows for dense data scanning.
- Truncated hash display with 1-click `<CopyBadge />` and link to block explorer.
- Sortable column headers with aria-sort indicators (`ascending`, `descending`, `none`).

### 5.4 Feedback & Overlays
- **Modal Dialogs**: Centered backdrop (`bg-black/60` with background scroll locked), escape key listener, and autofocus on primary action.
- **Side Drawers**: Right-side drawer (420px wide on desktop; 100vw on mobile) for node inspection and evidence details.
- **Skeleton Loaders**: Subtle pulse placeholders replicating exact card and table dimensions to prevent Cumulative Layout Shift (CLS < 0.05).
- **Empty States**: Explicit illustration or icon, plain English explanation, and actionable primary CTA (e.g. *"No active investigations found. Click 'Initiate New Investigation' to start."*).

---

## 6. Cytoscape.js Graph Design Specification

The interactive graph canvas replaces the legacy static SVG layout:

```
+---------------------------------------------------------------------------------------+
|                                CYTOSCAPE GRAPH SPECIFICATION                          |
+---------------------------------------------------------------------------------------+
| Node Categories & Styles:                                                             |
|   - Suspect Seed Node: Red circle (#EF4444) with pulsing outer halo, 48px diameter.  |
|   - Intermediary Mule: Amber square (#F59E0B) with chain badge, 40px diameter.        |
|   - Mixer / Obfuscation: Hexagon (#DC2626) with skull/lock icon.                      |
|   - Cross-Chain Bridge: Octagon (#8B5CF6) with relay badge.                           |
|   - Nearest Candidate VASP: Gold star/shield motif (#F59E0B) with double gold border.|
|   - Standard VASP: Emerald circle (#10B981) with exchange brand initial.             |
|                                                                                       |
| Directed Edge Styles:                                                                 |
|   - Standard Transfer: Steel gray stroke (2px), directional arrowhead.                |
|   - Attribution Path: Bright gold stroke (4px), dashed flow animation, high priority.|
|   - Bridge Hop: Cyan stroke (3px), dotted line pattern.                               |
|                                                                                       |
| Layouts:                                                                              |
|   - Breadthfirst (DAG): Default layered view (Hop 0 -> Hop 1 -> Hop 2 -> VASP).      |
|   - Dagre: Hierarchical tree layout for complex syndicates.                           |
|   - CoSE-Bilkent: Physics-based force-directed clustering for multi-party laundering.|
+---------------------------------------------------------------------------------------+
```

---

*Design System specification approved for Phase 5 review.*
