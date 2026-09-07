# Plan: Carta de Control (interactive control chart tool)

Branch: `feat/carta-control` (created, currently checked out)

## Confirmed decisions (user-answered)

- Tool id / slug: `carta-control`, Spanish name "Carta de Control", status `ready`
- Limit lines: LCS/LCI only, each with value + enable/disable toggle
- Center line: auto (mean) with manual override toggle
- Point editing: table + click point on chart (dialog/popover), no dragging
- Out-of-control points auto-highlighted red
- CSV paste import in addition to XML upload/download
- Display and Edit views (toggle in header); default Edit when chart is empty, otherwise Display
- Export: svg/png/pdf via hidden export area + `exportAsSvg/exportAsPng/exportAsPdf` (ishikawa/ctq pattern)
- Tooltips: `carta-control-tooltips.ts` (Info icon next to each param label) + HelpDialog

## Files

### Commit 1 — `feat(carta-control): add types, chart helpers, store and XML serialization`

- `src/tools/carta-control/types.ts`
  - `ControlChartPoint { id, label, value, comment? }`
  - `ChartLimit { enabled, value }`, `ChartLimits { upper, lower }`
  - `CenterLineMode = "auto" | "manual"`, `ChartCenterLine { mode, value }`
  - `ChartAxes { xTickStep, yTickCount, yMin: number|null, yMax: number|null }`
  - `ControlChart { id, title, unit, points, limits, centerLine, axes }`
  - `cartaControlExportLayouts`: `grafica`, `grafica-tabla`
  - `cartaControlExportFields`: `title`, `date`, `limits`, `stats`
- `src/tools/carta-control/chart.ts` (pure helpers, role of tree.ts)
  - `uid(prefix)` (same scheme as sipoc tree.ts), `createChart(title)`, `createPoint(label, value, comment?)`
  - `computeCenterLine(chart)` — mean in auto mode, manual value otherwise
  - `isPointOutOfControl(point, chart)` — outside enabled LCS/LCI
  - `computeYRange(chart)` — data + center line + enabled limits, 10% padding, `yMin`/`yMax` manual overrides
  - `getPointXLabel(point, index)` — label or 1-based index fallback
  - `formatValue(value)` — trimmed decimal formatting
- `src/tools/carta-control/store.ts` — Zustand store modeled on `useProcessMapStore`:
  `root`, `setTitle`, `setUnit`, `addPoint`, `updatePoint`, `removePoint`, `movePointUp/Down`, `setPoints`, `setUpperLimit`, `setLowerLimit`, `setCenterLineMode`, `setCenterLineValue`, `setAxes`, `replaceRoot`, `reset`
- `src/tools/carta-control/xml.ts` — fast-xml-parser + zod, root tag `<carta-control>`:
  - Attributes: `id`, `title`, `unit`; `<limits><upper enabled value/><lower enabled value/></limits>`
  - `<centerLine mode value/>`, `<axes xTickStep yTickCount [yMin] [yMax]/>`
  - `<points><point id label value [comment]/></points>` (omit node when empty)
  - Permissive unions (`z.union([z.string(), z.number()])`, same for booleans) since fxp auto-converts attribute values

### Commit 2 — `feat(carta-control): add registry entry, routes and editor with display view`

- `src/tools/registry.ts` — add `"carta-control"` to `ToolId` + descriptor (nameEs "Carta de Control", hrefBase `/carta-control`, status `ready`)
- `src/app/(platform)/carta-control/page.tsx` — landing card (sipoc pattern: create doc + push)
- `src/app/(platform)/carta-control/[docId]/page.tsx` — renders `CartaControlEditor`
- `src/tools/carta-control/carta-control-tooltips.ts` — Spanish label/tip entries: title, unit, limits_upper, limits_lower, center_line, center_line_mode, x_tick, y_tick, y_range, point_label, point_value, point_comment, import_csv, view_display, view_edit
- `src/tools/carta-control/components/control-chart-svg.tsx` — pure SVG renderer (no chart library):
  - Props: `chart`, `width`, `height`, `colors: ChartColors` (required; interactive caller passes `hsl(var(--foreground))`-based tokens, export passes explicit hex from ExportOptions)
  - Layout: margins (top 24, right 72 for limit labels, bottom 40, left 64), viewBox, `w-full h-auto`
  - Y ticks from `yTickCount`, grid lines, x labels every `xTickStep`-th point
  - Center line (solid) + label `LC`, LCS/LCI dashed lines + right-side labels, polyline, point circles
  - Out-of-control points red; comment halo (subtle ring) on points with comments
  - Optional `renderPointExtras(point, x, y, index)` overlay callback for interactive hit areas
- `src/tools/carta-control/components/chart-canvas.tsx` — interactive wrapper:
  - Per-point transparent hit circle inside Tooltip (base-ui) — hover/focus shows label, value (+unit) and comment only while focused; keyboard-focusable points
- `src/tools/carta-control/components/carta-control-editor.tsx` — modeled on ishikawa-editor:
  - Load doc data on mount (`loadedRef`), sync to `useDocsStore`, title rename sync
  - Feedback toast (same tones/classes)
  - Header: title input, unit input, Vista/Edicion toggle buttons, Info tooltips
  - Display view: ChartCanvas card; Edit view: chart + params + table (added in commit 3)
  - XML save/load via `FileDescriptor` registration (same download/upload code as ishikawa)
  - View default via effect: empty points -> "edit", else "display"

### Commit 3 — `feat(carta-control): add edit view with points table and chart parameters`

- `src/tools/carta-control/components/chart-params.tsx` — parameters card:
  - Limites: LCS/LCI rows with Switch + number Input (disabled when off)
  - Linea central: RadioGroup auto/manual + manual value Input
  - Ejes: xTickStep, yTickCount, optional yMin/yMax (empty = auto, store number|null)
  - Info tooltips next to every label
- `src/tools/carta-control/components/points-table.tsx` — table: #, Etiqueta (inline Input), Valor (inline Input), Comentario (truncated preview + edit), actions (up/down/delete)
  - Add row: label + value inputs + Agregar button
  - Out-of-control values marked red in table
- `src/tools/carta-control/components/point-edit-dialog.tsx` — small Dialog to edit a point (label, value, comment textarea); opened by table edit button and by clicking a point on the chart in edit mode
- Editor: edit view = grid with ChartCanvas (click point -> PointEditDialog) + ChartParams; PointsTable below

### Commit 4 — `feat(carta-control): add CSV paste import`

- `src/tools/carta-control/csv.ts` — `parseCsvToPoints(text)`: one point per line; separators `,` `;` tab; 1 token = value; 2 tokens = label,value (or value,comment if both numeric); 3 tokens = label,value,comment; returns points + error count
- `src/tools/carta-control/components/import-csv-dialog.tsx` — Dialog with Textarea, hint text, Anexar/Reemplazar radio, import button; feedback toast with imported/failed counts

### Commit 5 — `feat(carta-control): add export support`

- `src/tools/carta-control/components/export-chart.tsx` — modeled on ishikawa ExportDiagram:
  - Header (title/date fields), stats strip (mean, min, max, out-of-control count) when `stats` field on, limits info when `limits` field on
  - Layout `grafica` = chart only; `grafica-tabla` = chart + data table (points, values, comments, out-of-control marks)
  - Explicit colors mapped from `options.colors` (limits/out-of-control use fixed red `#ef4444`), watermark, footer
- Editor: hidden export area + `ExportDescriptor` registration (formats svg/png/pdf), same export callback structure as ishikawa

### Commit 6 — `feat(carta-control): add help dialog`

- `src/tools/carta-control/components/help-dialog.tsx` — "Documentacion" button in footer (ishikawa pattern): Que es, Cuando usarla, Como construirla, Interpretacion (punto fuera de limites, rachas, tendencias), Buenas practicas — all Spanish

### Final — verification

- `pnpm lint && pnpm typecheck` after each commit; `pnpm build` at the end
- All user-facing text Spanish; code/commits in English; no code comments

## Blocker

Session edit permissions currently deny all file writes except `.opencode/plans/*.md` (plan mode). Implementation cannot start until plan mode is exited / write permissions granted.
