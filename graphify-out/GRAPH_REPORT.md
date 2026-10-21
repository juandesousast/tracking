# Graph Report - tracking  (2026-10-21)

## Corpus Check
- 132 files · ~79,835 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 647 nodes · 2030 edges · 30 communities (24 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bb51e158`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- rules/graphify.md
- workflows/graphify.md
- README.md
- dependencies
- devDependencies
- compilerOptions
- components.json
- drawer.tsx
- button.tsx
- app/page.tsx
- header.tsx
- cn
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- retiros/page.tsx
- copier/page.tsx
- src/middleware.ts
- PropFirm
- database.ts
- 2. Contratos de Datos y APIs Institucionales
- calendario/page.tsx
- economic-events.ts
- utils.ts
- analytics/page.tsx
- trading-calculators.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 103 edges
2. `formatCurrency()` - 49 edges
3. `PropFirm` - 43 edges
4. `Account` - 40 edges
5. `createClient()` - 39 edges
6. `Button()` - 37 edges
7. `Expense` - 28 edges
8. `Withdrawal` - 28 edges
9. `getFirms()` - 25 edges
10. `getAccounts()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `scanReceiptAction()` --references--> `@google/generative-ai`  [EXTRACTED]
  src/lib/actions/scan-receipt.ts → package.json
- `Drawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `useDrawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `AccountsDueWidget()` --calls--> `formatCurrency()`  [EXTRACTED]
  src/components/dashboard/accounts-due-widget.tsx → src/lib/formatters.ts
- `CumulativeProfitChart()` --calls--> `formatCurrency()`  [EXTRACTED]
  src/components/dashboard/charts/cumulative-profit-chart.tsx → src/lib/formatters.ts

## Import Cycles
- None detected.

## Communities (30 total, 6 thin omitted)

### Community 2 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 3 - "dependencies"
Cohesion: 0.06
Nodes (31): @base-ui/react, class-variance-authority, clsx, @google/generative-ai, lightweight-charts, lucide-react, next, dependencies (+23 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, tailwindcss (+26 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "drawer.tsx"
Cohesion: 0.13
Nodes (13): react, react, Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter() (+5 more)

### Community 8 - "button.tsx"
Cohesion: 0.09
Nodes (39): LoginPage(), SettingsPage(), StrategiesPageContent(), EmptyStateProps, AddFirmModalProps, EditExpenseModal(), EditWithdrawalModal(), ResponsiveModal() (+31 more)

### Community 9 - "app/page.tsx"
Cohesion: 0.13
Nodes (43): AnalyticsPageContent(), CalendarioContent(), CuentasPage(), EmpresasPage(), GastosPage(), HomePageContent(), FIRM_COLORS, PortfolioPageContent() (+35 more)

### Community 10 - "header.tsx"
Cohesion: 0.17
Nodes (12): DashboardLayout(), metadata, plusJakartaSans, Header(), MobileNav(), menuItems, navigationItems, navSections (+4 more)

### Community 11 - "cn"
Cohesion: 0.14
Nodes (18): AlertDialogMedia(), AlertDialogOverlay(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+10 more)

### Community 16 - "retiros/page.tsx"
Cohesion: 0.09
Nodes (28): DashboardFilters(), TransactionTable(), TransactionType, AddAccountModal(), EditAccountModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel() (+20 more)

### Community 19 - "copier/page.tsx"
Cohesion: 0.20
Nodes (20): CopierPage(), AddTradovateConnectionModal(), AddTradovateConnectionModalProps, CopierRuleModal(), CopierRuleModalProps, Switch, SwitchProps, deleteCopierRule() (+12 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "PropFirm"
Cohesion: 0.06
Nodes (62): FirmFinancialMetric, UnifiedTradeRow, AccountsDueWidget(), AccountsDueWidgetProps, ChartPoint, CumulativeProfitChart(), CumulativeProfitChartProps, NetProfitSparkline() (+54 more)

### Community 22 - "database.ts"
Cohesion: 0.05
Nodes (66): SimulatorWorkspacePage(), SimulatorDashboardPage(), FirmPerformanceChart(), FirmPerformanceChartProps, CreateSimulatorSessionModal(), CreateSimulatorSessionModalProps, LightweightChartView(), LightweightChartViewProps (+58 more)

### Community 23 - "2. Contratos de Datos y APIs Institucionales"
Cohesion: 0.14
Nodes (13): 1. Arquitectura de Pantallas y Módulos Institucionales, 2. Contratos de Datos y APIs Institucionales, 3. Matriz de Estado & Plan de Trabajo por Pantalla, 4. Tareas Específicas a Ejecutar de Inmediato, A. Dashboard Ejecutivo (`GET /api/v1/accounts/{id}/metrics/dashboard`), B. Calendario PnL por Cuenta (`GET /api/v1/accounts/{id}/metrics/calendar?view_type=money|percent`), C. Calendario Económico de Noticias en Vivo (`GET https://chartevents-reuters.tradingview.com/events`), D. Fondeo Global (`GET /api/v2/funding/dashboard`) (+5 more)

### Community 24 - "calendario/page.tsx"
Cohesion: 0.17
Nodes (11): CATEGORY_LABELS, MONTH_NAMES, WEEKDAY_NAMES, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+3 more)

### Community 25 - "economic-events.ts"
Cohesion: 0.28
Nodes (11): EconomicCalendarContent(), EconomicEvent, EconomicEventsFilter, filterEconomicEvents(), getEconomicEvents(), getFallbackEconomicEvents(), getImpactedAssets(), ImpactedAsset (+3 more)

### Community 26 - "utils.ts"
Cohesion: 0.25
Nodes (6): Skeleton(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 28 - "analytics/page.tsx"
Cohesion: 0.23
Nodes (9): SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger() (+1 more)

### Community 29 - "trading-calculators.ts"
Cohesion: 0.35
Nodes (9): TradingToolsPage(), calculateConsistencyRule(), calculateDrawdownBuffer(), calculatePositionSize(), ConsistencyResult, DrawdownBufferResult, INSTRUMENT_SPECS, InstrumentSpec (+1 more)

## Knowledge Gaps
- **147 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+142 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `drawer.tsx`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `drawer.tsx`, `button.tsx`, `app/page.tsx`, `header.tsx`, `retiros/page.tsx`, `copier/page.tsx`, `calendario/page.tsx`, `utils.ts`, `analytics/page.tsx`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `react` connect `drawer.tsx` to `dependencies`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _147 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._