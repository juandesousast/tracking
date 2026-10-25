# Graph Report - tracking  (2026-10-25)

## Corpus Check
- 138 files · ~81,755 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 670 nodes · 2103 edges · 31 communities (25 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `30fa56f5`
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
- analytics/page.tsx
- button.tsx
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
- PropFirm
- drawer.tsx
- economic-events.ts
- schemas.ts
- strategies/page.tsx
- header.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 116 edges
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
- `BrandSymbol()` --calls--> `cn()`  [EXTRACTED]
  src/components/brand-logo.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (31 total, 6 thin omitted)

### Community 2 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 3 - "dependencies"
Cohesion: 0.05
Nodes (41): @base-ui/react, class-variance-authority, clsx, @google/generative-ai, lightweight-charts, lucide-react, motion, next (+33 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (34): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, tailwindcss (+26 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "analytics/page.tsx"
Cohesion: 0.23
Nodes (9): SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger() (+1 more)

### Community 8 - "button.tsx"
Cohesion: 0.23
Nodes (13): LoginPage(), SettingsPage(), ChartPoint, CumulativeProfitChart(), EmptyStateProps, Button(), buttonVariants, Card() (+5 more)

### Community 9 - "app/page.tsx"
Cohesion: 0.17
Nodes (37): AnalyticsPageContent(), CalendarioContent(), CuentasPage(), EmpresasPage(), GastosPage(), HomePageContent(), PortfolioPageContent(), ProgressTrackerContent() (+29 more)

### Community 10 - "calendario/page.tsx"
Cohesion: 0.18
Nodes (10): CATEGORY_LABELS, MONTH_NAMES, WEEKDAY_NAMES, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+2 more)

### Community 11 - "cn"
Cohesion: 0.14
Nodes (19): AlertDialogMedia(), AlertDialogOverlay(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+11 more)

### Community 16 - "retiros/page.tsx"
Cohesion: 0.10
Nodes (30): FIRM_COLORS, DashboardFilters(), TransactionType, AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription() (+22 more)

### Community 19 - "copier/page.tsx"
Cohesion: 0.13
Nodes (27): CopierPage(), AddTradovateConnectionModal(), AddTradovateConnectionModalProps, CopierRuleModal(), CopierRuleModalProps, Dialog(), DialogContent(), DialogDescription() (+19 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.08
Nodes (46): UnifiedTradeRow, CumulativeProfitChartProps, NetProfitSparkline(), NetProfitSparklineProps, PerformanceLineChart(), PerformanceLineChartProps, KpiCards(), KpiCardsProps (+38 more)

### Community 22 - "database.ts"
Cohesion: 0.08
Nodes (50): SimulatorWorkspacePage(), SimulatorDashboardPage(), FirmPerformanceChart(), FirmPerformanceChartProps, CreateSimulatorSessionModal(), CreateSimulatorSessionModalProps, LightweightChartView(), LightweightChartViewProps (+42 more)

### Community 23 - "2. Contratos de Datos y APIs Institucionales"
Cohesion: 0.14
Nodes (13): 1. Arquitectura de Pantallas y Módulos Institucionales, 2. Contratos de Datos y APIs Institucionales, 3. Matriz de Estado & Plan de Trabajo por Pantalla, 4. Tareas Específicas a Ejecutar de Inmediato, A. Dashboard Ejecutivo (`GET /api/v1/accounts/{id}/metrics/dashboard`), B. Calendario PnL por Cuenta (`GET /api/v1/accounts/{id}/metrics/calendar?view_type=money|percent`), C. Calendario Económico de Noticias en Vivo (`GET https://chartevents-reuters.tradingview.com/events`), D. Fondeo Global (`GET /api/v2/funding/dashboard`) (+5 more)

### Community 24 - "PropFirm"
Cohesion: 0.11
Nodes (36): FirmFinancialMetric, AccountsDueWidget(), AccountsDueWidgetProps, DashboardFiltersProps, AddAccountModalProps, AddExpenseModal(), AddExpenseModalProps, AddFirmModal() (+28 more)

### Community 25 - "drawer.tsx"
Cohesion: 0.15
Nodes (10): DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerSwipeHandle() (+2 more)

### Community 26 - "economic-events.ts"
Cohesion: 0.28
Nodes (11): EconomicCalendarContent(), EconomicEvent, EconomicEventsFilter, filterEconomicEvents(), getEconomicEvents(), getFallbackEconomicEvents(), getImpactedAssets(), ImpactedAsset (+3 more)

### Community 28 - "schemas.ts"
Cohesion: 0.13
Nodes (19): AccountInput, accountSchema, CopierRuleInput, copierRuleSchema, createSessionSchema, EXPENSE_CATEGORIES, ExpenseCategoryType, ExpenseInput (+11 more)

### Community 29 - "strategies/page.tsx"
Cohesion: 0.15
Nodes (17): StrategiesPageContent(), TradingToolsPage(), AnimatedTabs(), AnimatedTabsProps, TabOption, calculateStrategyMetrics(), DEFAULT_PLAYBOOK_STRATEGIES, StrategyPerformanceMetrics (+9 more)

### Community 31 - "header.tsx"
Cohesion: 0.09
Nodes (20): BrandLogo(), BrandLogoProps, BrandSymbol(), Header(), MobileNav(), mobileNavItems, menuItems, navigationItems (+12 more)

## Knowledge Gaps
- **157 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+152 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `analytics/page.tsx`, `button.tsx`, `app/page.tsx`, `calendario/page.tsx`, `retiros/page.tsx`, `copier/page.tsx`, `database.ts`, `PropFirm`, `drawer.tsx`, `strategies/page.tsx`, `header.tsx`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **Why does `react` connect `dependencies` to `drawer.tsx`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _157 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._