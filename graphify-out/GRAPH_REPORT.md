# Graph Report - tracking  (2026-10-25)

## Corpus Check
- 144 files · ~86,473 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 700 nodes · 2219 edges · 29 communities (23 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f79f5a2e`
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
- copier/page.tsx
- toast.ts
- app/page.tsx
- csv-export.ts
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- retiros/page.tsx
- responsive-modal.tsx
- src/middleware.ts
- financials.ts
- database.ts
- 2. Contratos de Datos y APIs Institucionales
- PropFirm
- economic-events.ts
- schemas.ts
- strategies/page.tsx
- cn

## God Nodes (most connected - your core abstractions)
1. `cn()` - 116 edges
2. `formatCurrency()` - 51 edges
3. `PropFirm` - 47 edges
4. `Account` - 44 edges
5. `Button()` - 42 edges
6. `createClient()` - 40 edges
7. `Expense` - 33 edges
8. `Withdrawal` - 33 edges
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
- `AccountsDueWidget()` --calls--> `formatCurrency()`  [EXTRACTED]
  src/components/dashboard/accounts-due-widget.tsx → src/lib/formatters.ts

## Import Cycles
- None detected.

## Communities (29 total, 6 thin omitted)

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

### Community 7 - "copier/page.tsx"
Cohesion: 0.24
Nodes (19): CopierPage(), RiskConfigPage(), PROP_FIRM_RISK_TEMPLATES, RiskTemplate, deleteCopierRule(), deleteTradovateCredential(), executeKillSwitch(), getCopierLogs() (+11 more)

### Community 8 - "toast.ts"
Cohesion: 0.11
Nodes (16): DashboardLayout(), metadata, plusJakartaSans, viewport, CommandItem, CommandPalette(), iconColors, ToastContainer() (+8 more)

### Community 9 - "app/page.tsx"
Cohesion: 0.10
Nodes (40): AnalyticsPageContent(), CalendarioContent(), CuentasPage(), EmpresasPage(), GastosPage(), HomePageContent(), FIRM_COLORS, PortfolioPageContent() (+32 more)

### Community 10 - "csv-export.ts"
Cohesion: 0.45
Nodes (9): RFC-4180, buildCSVContent(), downloadCSV(), escapeCSVCell(), ExportableTransaction, exportExpensesToCSV(), exportTaxSummaryToCSV(), exportTransactionsToCSV() (+1 more)

### Community 16 - "retiros/page.tsx"
Cohesion: 0.11
Nodes (36): DashboardFilters(), DashboardFiltersProps, TransactionTable(), TransactionType, AddWithdrawalModal(), EditAccountModal(), AlertDialog(), AlertDialogAction() (+28 more)

### Community 19 - "responsive-modal.tsx"
Cohesion: 0.08
Nodes (30): react, react, AddTradovateConnectionModal(), AddTradovateConnectionModalProps, CopierRuleModal(), CopierRuleModalProps, ResponsiveModalProps, Dialog() (+22 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.09
Nodes (44): UnifiedTradeRow, AccountDetailDrawer(), AccountDetailDrawerProps, CumulativeProfitChartProps, NetProfitSparkline(), NetProfitSparklineProps, PerformanceLineChart(), PerformanceLineChartProps (+36 more)

### Community 22 - "database.ts"
Cohesion: 0.08
Nodes (48): SimulatorWorkspacePage(), SimulatorDashboardPage(), FirmPerformanceChart(), FirmPerformanceChartProps, CreateSimulatorSessionModal(), CreateSimulatorSessionModalProps, LightweightChartView(), LightweightChartViewProps (+40 more)

### Community 23 - "2. Contratos de Datos y APIs Institucionales"
Cohesion: 0.14
Nodes (13): 1. Arquitectura de Pantallas y Módulos Institucionales, 2. Contratos de Datos y APIs Institucionales, 3. Matriz de Estado & Plan de Trabajo por Pantalla, 4. Tareas Específicas a Ejecutar de Inmediato, A. Dashboard Ejecutivo (`GET /api/v1/accounts/{id}/metrics/dashboard`), B. Calendario PnL por Cuenta (`GET /api/v1/accounts/{id}/metrics/calendar?view_type=money|percent`), C. Calendario Económico de Noticias en Vivo (`GET https://chartevents-reuters.tradingview.com/events`), D. Fondeo Global (`GET /api/v2/funding/dashboard`) (+5 more)

### Community 24 - "PropFirm"
Cohesion: 0.14
Nodes (31): FirmFinancialMetric, AccountsDueWidgetProps, AddAccountModalProps, AddExpenseModal(), AddExpenseModalProps, AddFirmModal(), AddFirmModalProps, AddWithdrawalModalProps (+23 more)

### Community 26 - "economic-events.ts"
Cohesion: 0.28
Nodes (11): EconomicCalendarContent(), EconomicEvent, EconomicEventsFilter, filterEconomicEvents(), getEconomicEvents(), getFallbackEconomicEvents(), getImpactedAssets(), ImpactedAsset (+3 more)

### Community 28 - "schemas.ts"
Cohesion: 0.13
Nodes (19): AccountInput, accountSchema, CopierRuleInput, copierRuleSchema, createSessionSchema, EXPENSE_CATEGORIES, ExpenseCategoryType, ExpenseInput (+11 more)

### Community 29 - "strategies/page.tsx"
Cohesion: 0.15
Nodes (17): StrategiesPageContent(), TradingToolsPage(), AnimatedTabs(), AnimatedTabsProps, TabOption, calculateStrategyMetrics(), DEFAULT_PLAYBOOK_STRATEGIES, StrategyPerformanceMetrics (+9 more)

### Community 31 - "cn"
Cohesion: 0.05
Nodes (65): CATEGORY_LABELS, MONTH_NAMES, WEEKDAY_NAMES, LoginPage(), SettingsPage(), BrandLogo(), BrandLogoProps, BrandSymbol() (+57 more)

## Knowledge Gaps
- **165 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `responsive-modal.tsx`, `devDependencies`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `copier/page.tsx`, `app/page.tsx`, `retiros/page.tsx`, `responsive-modal.tsx`, `PropFirm`, `strategies/page.tsx`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `react` connect `responsive-modal.tsx` to `toast.ts`, `dependencies`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._