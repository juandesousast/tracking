# Graph Report - tracking  (2026-10-21)

## Corpus Check
- 135 files · ~81,310 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 657 nodes · 2069 edges · 33 communities (26 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3ece933b`
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
- schemas.ts
- PropFirm
- app/page.tsx
- calendario/page.tsx
- cn
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- retiros/page.tsx
- copier/page.tsx
- src/middleware.ts
- financials.ts
- database.ts
- 2. Contratos de Datos y APIs Institucionales
- login/page.tsx
- drawer.tsx
- economic-events.ts
- button.tsx
- trading-calculators.ts
- sidebar.tsx
- strategies/page.tsx
- linear-loader.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 109 edges
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
- `useDrawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `Drawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `TopNavLoader()` --references--> `react`  [EXTRACTED]
  src/components/ui/top-nav-loader.tsx → package.json
- `AccountsDueWidget()` --calls--> `formatCurrency()`  [EXTRACTED]
  src/components/dashboard/accounts-due-widget.tsx → src/lib/formatters.ts

## Import Cycles
- None detected.

## Communities (33 total, 7 thin omitted)

### Community 2 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 3 - "dependencies"
Cohesion: 0.05
Nodes (39): @base-ui/react, class-variance-authority, clsx, @google/generative-ai, lightweight-charts, lucide-react, next, dependencies (+31 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, tailwindcss (+26 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "schemas.ts"
Cohesion: 0.13
Nodes (19): AccountInput, accountSchema, CopierRuleInput, copierRuleSchema, createSessionSchema, EXPENSE_CATEGORIES, ExpenseCategoryType, ExpenseInput (+11 more)

### Community 8 - "PropFirm"
Cohesion: 0.08
Nodes (45): FirmFinancialMetric, AccountsDueWidget(), AccountsDueWidgetProps, DashboardFiltersProps, AddAccountModalProps, AddExpenseModal(), AddExpenseModalProps, AddTradovateConnectionModal() (+37 more)

### Community 9 - "app/page.tsx"
Cohesion: 0.11
Nodes (37): AnalyticsPageContent(), CalendarioContent(), CuentasPage(), EmpresasPage(), GastosPage(), HomePageContent(), FIRM_COLORS, PortfolioPageContent() (+29 more)

### Community 10 - "calendario/page.tsx"
Cohesion: 0.16
Nodes (12): CATEGORY_LABELS, MONTH_NAMES, WEEKDAY_NAMES, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+4 more)

### Community 11 - "cn"
Cohesion: 0.09
Nodes (25): AlertDialogMedia(), AlertDialogOverlay(), CardAction(), CardFooter(), DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+17 more)

### Community 16 - "retiros/page.tsx"
Cohesion: 0.13
Nodes (33): DashboardFilters(), TransactionTable(), TransactionType, AddAccountModal(), AddFirmModal(), AddFirmModalProps, EditFirmModal(), EditFirmModalProps (+25 more)

### Community 19 - "copier/page.tsx"
Cohesion: 0.24
Nodes (19): CopierPage(), RiskConfigPage(), PROP_FIRM_RISK_TEMPLATES, RiskTemplate, deleteCopierRule(), deleteTradovateCredential(), executeKillSwitch(), getCopierLogs() (+11 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.09
Nodes (43): UnifiedTradeRow, CumulativeProfitChartProps, NetProfitSparkline(), NetProfitSparklineProps, PerformanceLineChart(), PerformanceLineChartProps, KpiCards(), KpiCardsProps (+35 more)

### Community 22 - "database.ts"
Cohesion: 0.08
Nodes (48): SimulatorWorkspacePage(), SimulatorDashboardPage(), FirmPerformanceChart(), FirmPerformanceChartProps, CreateSimulatorSessionModal(), CreateSimulatorSessionModalProps, LightweightChartView(), LightweightChartViewProps (+40 more)

### Community 23 - "2. Contratos de Datos y APIs Institucionales"
Cohesion: 0.14
Nodes (13): 1. Arquitectura de Pantallas y Módulos Institucionales, 2. Contratos de Datos y APIs Institucionales, 3. Matriz de Estado & Plan de Trabajo por Pantalla, 4. Tareas Específicas a Ejecutar de Inmediato, A. Dashboard Ejecutivo (`GET /api/v1/accounts/{id}/metrics/dashboard`), B. Calendario PnL por Cuenta (`GET /api/v1/accounts/{id}/metrics/calendar?view_type=money|percent`), C. Calendario Económico de Noticias en Vivo (`GET https://chartevents-reuters.tradingview.com/events`), D. Fondeo Global (`GET /api/v2/funding/dashboard`) (+5 more)

### Community 24 - "login/page.tsx"
Cohesion: 0.22
Nodes (12): LoginPage(), SettingsPage(), ChartPoint, CumulativeProfitChart(), EmptyStateProps, Header(), Card(), CardContent() (+4 more)

### Community 25 - "drawer.tsx"
Cohesion: 0.15
Nodes (10): DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerSwipeHandle() (+2 more)

### Community 26 - "economic-events.ts"
Cohesion: 0.28
Nodes (11): EconomicCalendarContent(), EconomicEvent, EconomicEventsFilter, filterEconomicEvents(), getEconomicEvents(), getFallbackEconomicEvents(), getImpactedAssets(), ImpactedAsset (+3 more)

### Community 28 - "button.tsx"
Cohesion: 0.26
Nodes (9): ThemeToggle(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Button() (+1 more)

### Community 29 - "trading-calculators.ts"
Cohesion: 0.35
Nodes (9): TradingToolsPage(), calculateConsistencyRule(), calculateDrawdownBuffer(), calculatePositionSize(), ConsistencyResult, DrawdownBufferResult, INSTRUMENT_SPECS, InstrumentSpec (+1 more)

### Community 30 - "sidebar.tsx"
Cohesion: 0.24
Nodes (7): MobileNav(), mobileNavItems, menuItems, navigationItems, navSections, Sidebar(), supportItems

### Community 31 - "strategies/page.tsx"
Cohesion: 0.42
Nodes (5): StrategiesPageContent(), calculateStrategyMetrics(), DEFAULT_PLAYBOOK_STRATEGIES, StrategyPerformanceMetrics, StrategySetup

## Knowledge Gaps
- **152 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+147 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `linear-loader.tsx`, `PropFirm`, `app/page.tsx`, `calendario/page.tsx`, `retiros/page.tsx`, `copier/page.tsx`, `login/page.tsx`, `drawer.tsx`, `button.tsx`, `trading-calculators.ts`, `sidebar.tsx`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `react` connect `dependencies` to `drawer.tsx`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _152 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._