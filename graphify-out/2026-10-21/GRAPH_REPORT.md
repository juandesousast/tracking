# Graph Report - tracking  (2026-10-21)

## Corpus Check
- 132 files · ~80,785 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 649 nodes · 2038 edges · 32 communities (26 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dc857537`
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
- PropFirm
- app/page.tsx
- utils.ts
- cn
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- retiros/page.tsx
- copier/page.tsx
- src/middleware.ts
- database.ts
- [id]/page.tsx
- 2. Contratos de Datos y APIs Institucionales
- calendario/page.tsx
- economic-events.ts
- tabs.tsx
- analytics/page.tsx
- trading-calculators.ts
- login/page.tsx
- header.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 103 edges
2. `formatCurrency()` - 49 edges
3. `PropFirm` - 43 edges
4. `createClient()` - 40 edges
5. `Account` - 40 edges
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

## Communities (32 total, 6 thin omitted)

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

### Community 8 - "PropFirm"
Cohesion: 0.09
Nodes (44): FirmFinancialMetric, StrategiesPageContent(), AccountsDueWidget(), AccountsDueWidgetProps, DashboardFiltersProps, AddAccountModalProps, AddExpenseModalProps, AddFirmModal() (+36 more)

### Community 9 - "app/page.tsx"
Cohesion: 0.15
Nodes (40): AnalyticsPageContent(), CalendarioContent(), CuentasPage(), EmpresasPage(), GastosPage(), HomePageContent(), FIRM_COLORS, PortfolioPageContent() (+32 more)

### Community 10 - "utils.ts"
Cohesion: 0.16
Nodes (10): DashboardLayout(), metadata, plusJakartaSans, MobileNav(), mobileNavItems, menuItems, navigationItems, navSections (+2 more)

### Community 11 - "cn"
Cohesion: 0.14
Nodes (14): AlertDialogMedia(), AlertDialogOverlay(), DialogOverlay(), DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut() (+6 more)

### Community 16 - "retiros/page.tsx"
Cohesion: 0.11
Nodes (28): DashboardFilters(), TransactionType, AddAccountModal(), EditExpenseModal(), EditWithdrawalModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel() (+20 more)

### Community 19 - "copier/page.tsx"
Cohesion: 0.20
Nodes (20): CopierPage(), AddTradovateConnectionModal(), AddTradovateConnectionModalProps, CopierRuleModal(), CopierRuleModalProps, Switch, SwitchProps, deleteCopierRule() (+12 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "database.ts"
Cohesion: 0.07
Nodes (57): UnifiedTradeRow, CumulativeProfitChartProps, FirmPerformanceChart(), FirmPerformanceChartProps, NetProfitSparkline(), NetProfitSparklineProps, PerformanceLineChart(), PerformanceLineChartProps (+49 more)

### Community 22 - "[id]/page.tsx"
Cohesion: 0.07
Nodes (56): SimulatorWorkspacePage(), SimulatorDashboardPage(), CreateSimulatorSessionModal(), CreateSimulatorSessionModalProps, LightweightChartView(), LightweightChartViewProps, OrderPanel(), OrderPanelProps (+48 more)

### Community 23 - "2. Contratos de Datos y APIs Institucionales"
Cohesion: 0.14
Nodes (13): 1. Arquitectura de Pantallas y Módulos Institucionales, 2. Contratos de Datos y APIs Institucionales, 3. Matriz de Estado & Plan de Trabajo por Pantalla, 4. Tareas Específicas a Ejecutar de Inmediato, A. Dashboard Ejecutivo (`GET /api/v1/accounts/{id}/metrics/dashboard`), B. Calendario PnL por Cuenta (`GET /api/v1/accounts/{id}/metrics/calendar?view_type=money|percent`), C. Calendario Económico de Noticias en Vivo (`GET https://chartevents-reuters.tradingview.com/events`), D. Fondeo Global (`GET /api/v2/funding/dashboard`) (+5 more)

### Community 24 - "calendario/page.tsx"
Cohesion: 0.17
Nodes (11): CATEGORY_LABELS, MONTH_NAMES, WEEKDAY_NAMES, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+3 more)

### Community 25 - "economic-events.ts"
Cohesion: 0.28
Nodes (11): EconomicCalendarContent(), EconomicEvent, EconomicEventsFilter, filterEconomicEvents(), getEconomicEvents(), getFallbackEconomicEvents(), getImpactedAssets(), ImpactedAsset (+3 more)

### Community 26 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 28 - "analytics/page.tsx"
Cohesion: 0.23
Nodes (9): SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger() (+1 more)

### Community 29 - "trading-calculators.ts"
Cohesion: 0.35
Nodes (9): TradingToolsPage(), calculateConsistencyRule(), calculateDrawdownBuffer(), calculatePositionSize(), ConsistencyResult, DrawdownBufferResult, INSTRUMENT_SPECS, InstrumentSpec (+1 more)

### Community 30 - "login/page.tsx"
Cohesion: 0.17
Nodes (16): LoginPage(), SettingsPage(), ChartPoint, CumulativeProfitChart(), EmptyStateProps, Header(), Badge(), badgeVariants (+8 more)

### Community 31 - "header.tsx"
Cohesion: 0.36
Nodes (6): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

## Knowledge Gaps
- **150 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+145 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `drawer.tsx`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `drawer.tsx`, `PropFirm`, `app/page.tsx`, `utils.ts`, `retiros/page.tsx`, `copier/page.tsx`, `calendario/page.tsx`, `tabs.tsx`, `analytics/page.tsx`, `login/page.tsx`, `header.tsx`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Why does `react` connect `drawer.tsx` to `dependencies`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _150 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._