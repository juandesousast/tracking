# Graph Report - tracking  (2026-10-25)

## Corpus Check
- 137 files · ~81,234 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 666 nodes · 2090 edges · 31 communities (25 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6afbf89a`
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
- dropdown-menu.tsx
- database.ts
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
- formatCurrency
- [id]/page.tsx
- 2. Contratos de Datos y APIs Institucionales
- button.tsx
- drawer.tsx
- economic-events.ts
- tabs.tsx
- tools/page.tsx
- sidebar.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 113 edges
2. `formatCurrency()` - 49 edges
3. `PropFirm` - 43 edges
4. `Button()` - 41 edges
5. `createClient()` - 40 edges
6. `Account` - 40 edges
7. `Expense` - 28 edges
8. `Withdrawal` - 28 edges
9. `getFirms()` - 25 edges
10. `getAccounts()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `scanReceiptAction()` --references--> `@google/generative-ai`  [EXTRACTED]
  src/lib/actions/scan-receipt.ts → package.json
- `TopNavLoader()` --references--> `react`  [EXTRACTED]
  src/components/ui/top-nav-loader.tsx → package.json
- `Drawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `useDrawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `FirmFinancialMetric` --references--> `PropFirm`  [EXTRACTED]
  src/app/empresas/page.tsx → src/types/database.ts

## Import Cycles
- None detected.

## Communities (31 total, 6 thin omitted)

### Community 2 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 3 - "dependencies"
Cohesion: 0.06
Nodes (33): @base-ui/react, class-variance-authority, clsx, @google/generative-ai, lightweight-charts, lucide-react, motion, next (+25 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, tailwindcss (+26 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "dropdown-menu.tsx"
Cohesion: 0.17
Nodes (7): DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent(), DropdownMenuSubTrigger()

### Community 8 - "database.ts"
Cohesion: 0.09
Nodes (45): UnifiedTradeRow, AccountsDueWidgetProps, CumulativeProfitChartProps, NetProfitSparklineProps, PerformanceLineChartProps, TransactionTableProps, AddAccountModalProps, AddExpenseModal() (+37 more)

### Community 9 - "app/page.tsx"
Cohesion: 0.10
Nodes (32): AnalyticsPageContent(), CalendarioContent(), CATEGORY_LABELS, MONTH_NAMES, WEEKDAY_NAMES, CuentasPage(), EmpresasPage(), GastosPage() (+24 more)

### Community 10 - "header.tsx"
Cohesion: 0.21
Nodes (9): ThemeToggle(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+1 more)

### Community 11 - "cn"
Cohesion: 0.13
Nodes (20): AlertDialogMedia(), AlertDialogOverlay(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+12 more)

### Community 16 - "retiros/page.tsx"
Cohesion: 0.14
Nodes (34): FirmFinancialMetric, TradesPageContent(), DashboardFilters(), DashboardFiltersProps, TransactionType, AddAccountModal(), EditAccountModal(), EditExpenseModal() (+26 more)

### Community 19 - "copier/page.tsx"
Cohesion: 0.17
Nodes (24): CopierPage(), RiskConfigPage(), AddTradovateConnectionModal(), CopierRuleModal(), Switch, SwitchProps, PROP_FIRM_RISK_TEMPLATES, RiskTemplate (+16 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "formatCurrency"
Cohesion: 0.11
Nodes (36): RetirosPage(), AccountsDueWidget(), FirmPerformanceChart(), FirmPerformanceChartProps, NetProfitSparkline(), PerformanceLineChart(), KpiCards(), KpiCardsProps (+28 more)

### Community 22 - "[id]/page.tsx"
Cohesion: 0.06
Nodes (58): SimulatorWorkspacePage(), SimulatorDashboardPage(), CreateSimulatorSessionModal(), CreateSimulatorSessionModalProps, LightweightChartView(), LightweightChartViewProps, OrderPanel(), OrderPanelProps (+50 more)

### Community 23 - "2. Contratos de Datos y APIs Institucionales"
Cohesion: 0.14
Nodes (13): 1. Arquitectura de Pantallas y Módulos Institucionales, 2. Contratos de Datos y APIs Institucionales, 3. Matriz de Estado & Plan de Trabajo por Pantalla, 4. Tareas Específicas a Ejecutar de Inmediato, A. Dashboard Ejecutivo (`GET /api/v1/accounts/{id}/metrics/dashboard`), B. Calendario PnL por Cuenta (`GET /api/v1/accounts/{id}/metrics/calendar?view_type=money|percent`), C. Calendario Económico de Noticias en Vivo (`GET https://chartevents-reuters.tradingview.com/events`), D. Fondeo Global (`GET /api/v2/funding/dashboard`) (+5 more)

### Community 24 - "button.tsx"
Cohesion: 0.08
Nodes (40): LoginPage(), SettingsPage(), StrategiesPageContent(), ChartPoint, CumulativeProfitChart(), EmptyStateProps, AddFirmModal(), AddFirmModalProps (+32 more)

### Community 25 - "drawer.tsx"
Cohesion: 0.13
Nodes (13): react, react, Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter() (+5 more)

### Community 26 - "economic-events.ts"
Cohesion: 0.28
Nodes (11): EconomicCalendarContent(), EconomicEvent, EconomicEventsFilter, filterEconomicEvents(), getEconomicEvents(), getFallbackEconomicEvents(), getImpactedAssets(), ImpactedAsset (+3 more)

### Community 28 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 29 - "tools/page.tsx"
Cohesion: 0.23
Nodes (12): TradingToolsPage(), AnimatedTabs(), AnimatedTabsProps, TabOption, calculateConsistencyRule(), calculateDrawdownBuffer(), calculatePositionSize(), ConsistencyResult (+4 more)

### Community 30 - "sidebar.tsx"
Cohesion: 0.13
Nodes (13): DashboardLayout(), metadata, plusJakartaSans, viewport, Header(), MobileNav(), mobileNavItems, menuItems (+5 more)

## Knowledge Gaps
- **156 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+151 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `drawer.tsx`, `devDependencies`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `dropdown-menu.tsx`, `app/page.tsx`, `header.tsx`, `retiros/page.tsx`, `copier/page.tsx`, `formatCurrency`, `[id]/page.tsx`, `button.tsx`, `drawer.tsx`, `tabs.tsx`, `tools/page.tsx`, `sidebar.tsx`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Why does `react` connect `drawer.tsx` to `dependencies`, `sidebar.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _156 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._