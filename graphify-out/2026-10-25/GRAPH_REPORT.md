# Graph Report - tracking  (2026-10-25)

## Corpus Check
- 138 files · ~81,527 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 670 nodes · 2101 edges · 32 communities (26 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0535c644`
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
- login/page.tsx
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
- trades/page.tsx
- schemas.ts
- tools/page.tsx
- dashboard-layout.tsx
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

## Communities (32 total, 6 thin omitted)

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
Cohesion: 0.18
Nodes (6): DropdownMenuCheckboxItem(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent(), DropdownMenuSubTrigger()

### Community 8 - "login/page.tsx"
Cohesion: 0.21
Nodes (13): LoginPage(), SettingsPage(), ChartPoint, CumulativeProfitChart(), EmptyStateProps, Card(), CardAction(), CardContent() (+5 more)

### Community 9 - "app/page.tsx"
Cohesion: 0.15
Nodes (41): AnalyticsPageContent(), CalendarioContent(), CuentasPage(), EmpresasPage(), GastosPage(), HomePageContent(), PortfolioPageContent(), ProgressTrackerContent() (+33 more)

### Community 10 - "calendario/page.tsx"
Cohesion: 0.13
Nodes (14): CATEGORY_LABELS, MONTH_NAMES, WEEKDAY_NAMES, AnimatedTabs(), AnimatedTabsProps, TabOption, Sheet(), SheetContent() (+6 more)

### Community 11 - "cn"
Cohesion: 0.13
Nodes (20): AlertDialogMedia(), AlertDialogOverlay(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+12 more)

### Community 16 - "retiros/page.tsx"
Cohesion: 0.10
Nodes (28): FirmFinancialMetric, FIRM_COLORS, DashboardFilters(), DashboardFiltersProps, TransactionType, AddFirmModal(), EditFirmModal(), AlertDialog() (+20 more)

### Community 19 - "copier/page.tsx"
Cohesion: 0.23
Nodes (17): CopierPage(), AddTradovateConnectionModal(), CopierRuleModal(), Switch, SwitchProps, deleteCopierRule(), deleteTradovateCredential(), executeKillSwitch() (+9 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.08
Nodes (46): UnifiedTradeRow, CumulativeProfitChartProps, NetProfitSparkline(), NetProfitSparklineProps, PerformanceLineChart(), PerformanceLineChartProps, KpiCards(), KpiCardsProps (+38 more)

### Community 22 - "database.ts"
Cohesion: 0.08
Nodes (48): SimulatorWorkspacePage(), SimulatorDashboardPage(), FirmPerformanceChart(), FirmPerformanceChartProps, CreateSimulatorSessionModal(), CreateSimulatorSessionModalProps, LightweightChartView(), LightweightChartViewProps (+40 more)

### Community 23 - "2. Contratos de Datos y APIs Institucionales"
Cohesion: 0.14
Nodes (13): 1. Arquitectura de Pantallas y Módulos Institucionales, 2. Contratos de Datos y APIs Institucionales, 3. Matriz de Estado & Plan de Trabajo por Pantalla, 4. Tareas Específicas a Ejecutar de Inmediato, A. Dashboard Ejecutivo (`GET /api/v1/accounts/{id}/metrics/dashboard`), B. Calendario PnL por Cuenta (`GET /api/v1/accounts/{id}/metrics/calendar?view_type=money|percent`), C. Calendario Económico de Noticias en Vivo (`GET https://chartevents-reuters.tradingview.com/events`), D. Fondeo Global (`GET /api/v2/funding/dashboard`) (+5 more)

### Community 24 - "PropFirm"
Cohesion: 0.10
Nodes (42): StrategiesPageContent(), AccountsDueWidgetProps, AddAccountModalProps, AddExpenseModalProps, AddFirmModalProps, AddTradovateConnectionModalProps, AddWithdrawalModalProps, CopierRuleModalProps (+34 more)

### Community 25 - "drawer.tsx"
Cohesion: 0.13
Nodes (13): react, react, Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter() (+5 more)

### Community 26 - "trades/page.tsx"
Cohesion: 0.11
Nodes (28): EconomicCalendarContent(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator() (+20 more)

### Community 28 - "schemas.ts"
Cohesion: 0.13
Nodes (19): AccountInput, accountSchema, CopierRuleInput, copierRuleSchema, createSessionSchema, EXPENSE_CATEGORIES, ExpenseCategoryType, ExpenseInput (+11 more)

### Community 29 - "tools/page.tsx"
Cohesion: 0.35
Nodes (9): TradingToolsPage(), calculateConsistencyRule(), calculateDrawdownBuffer(), calculatePositionSize(), ConsistencyResult, DrawdownBufferResult, INSTRUMENT_SPECS, InstrumentSpec (+1 more)

### Community 30 - "dashboard-layout.tsx"
Cohesion: 0.18
Nodes (9): DashboardLayout(), metadata, plusJakartaSans, viewport, Header(), MobileNav(), mobileNavItems, Sidebar() (+1 more)

### Community 31 - "header.tsx"
Cohesion: 0.22
Nodes (9): BrandLogo(), BrandLogoProps, BrandSymbol(), menuItems, navigationItems, navSections, supportItems, ThemeToggle() (+1 more)

## Knowledge Gaps
- **157 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+152 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `dropdown-menu.tsx`, `login/page.tsx`, `app/page.tsx`, `calendario/page.tsx`, `retiros/page.tsx`, `copier/page.tsx`, `PropFirm`, `drawer.tsx`, `trades/page.tsx`, `tools/page.tsx`, `dashboard-layout.tsx`, `header.tsx`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `drawer.tsx`, `devDependencies`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **Why does `react` connect `drawer.tsx` to `dependencies`, `dashboard-layout.tsx`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _157 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._