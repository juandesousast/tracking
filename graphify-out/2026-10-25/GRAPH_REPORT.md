# Graph Report - tracking  (2026-10-25)

## Corpus Check
- 157 files · ~98,274 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 856 nodes · 2449 edges · 38 communities (31 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `93c4a3a4`
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
- app/layout.tsx
- app/page.tsx
- csv-export.ts
- desktop/package.json
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- drawer.tsx
- cn
- src/middleware.ts
- financials.ts
- [id]/page.tsx
- 2. Contratos de Datos y APIs Institucionales
- database.ts
- index.js
- economic-events.ts
- app.js
- tools/page.tsx
- retiros/page.tsx
- sidebar.tsx
- header.tsx
- createClient
- tabs.tsx
- strategies.ts
- preload.js

## God Nodes (most connected - your core abstractions)
1. `cn()` - 118 edges
2. `formatCurrency()` - 49 edges
3. `PropFirm` - 49 edges
4. `Account` - 46 edges
5. `createClient()` - 45 edges
6. `Button()` - 42 edges
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

## Communities (38 total, 7 thin omitted)

### Community 2 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 3 - "dependencies"
Cohesion: 0.06
Nodes (33): @base-ui/react, class-variance-authority, clsx, @google/generative-ai, lightweight-charts, lucide-react, motion, next (+25 more)

### Community 4 - "devDependencies"
Cohesion: 0.05
Nodes (37): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, tailwindcss (+29 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "copier/page.tsx"
Cohesion: 0.07
Nodes (38): POST(), CopierPage(), RiskConfigPage(), AddTradovateConnectionModal(), CopierGroupModal(), PROP_FIRM_RISK_TEMPLATES, RiskTemplate, deleteCopierGroup() (+30 more)

### Community 8 - "app/layout.tsx"
Cohesion: 0.17
Nodes (9): DashboardLayout(), metadata, plusJakartaSans, viewport, CommandItem, CommandPalette(), MobileNav(), mobileNavItems (+1 more)

### Community 9 - "app/page.tsx"
Cohesion: 0.08
Nodes (50): AnalyticsPageContent(), CalendarioContent(), CATEGORY_LABELS, MONTH_NAMES, WEEKDAY_NAMES, CuentasPage(), EmpresasPage(), GastosPage() (+42 more)

### Community 10 - "csv-export.ts"
Cohesion: 0.39
Nodes (10): RFC-4180, TransactionTable(), buildCSVContent(), downloadCSV(), escapeCSVCell(), ExportableTransaction, exportExpensesToCSV(), exportTaxSummaryToCSV() (+2 more)

### Community 11 - "desktop/package.json"
Cohesion: 0.06
Nodes (34): author, build, appId, directories, mac, productName, win, dependencies (+26 more)

### Community 16 - "drawer.tsx"
Cohesion: 0.13
Nodes (13): react, react, Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter() (+5 more)

### Community 19 - "cn"
Cohesion: 0.09
Nodes (23): AlertDialogMedia(), AlertDialogOverlay(), CardAction(), CardFooter(), DialogOverlay(), DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+15 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.11
Nodes (37): UnifiedTradeRow, AccountDetailDrawerProps, CumulativeProfitChartProps, NetProfitSparkline(), NetProfitSparklineProps, PerformanceLineChart(), PerformanceLineChartProps, KpiCards() (+29 more)

### Community 22 - "[id]/page.tsx"
Cohesion: 0.06
Nodes (58): SimulatorWorkspacePage(), SimulatorDashboardPage(), CreateSimulatorSessionModal(), CreateSimulatorSessionModalProps, LightweightChartView(), LightweightChartViewProps, OrderPanel(), OrderPanelProps (+50 more)

### Community 23 - "2. Contratos de Datos y APIs Institucionales"
Cohesion: 0.14
Nodes (13): 1. Arquitectura de Pantallas y Módulos Institucionales, 2. Contratos de Datos y APIs Institucionales, 3. Matriz de Estado & Plan de Trabajo por Pantalla, 4. Tareas Específicas a Ejecutar de Inmediato, A. Dashboard Ejecutivo (`GET /api/v1/accounts/{id}/metrics/dashboard`), B. Calendario PnL por Cuenta (`GET /api/v1/accounts/{id}/metrics/calendar?view_type=money|percent`), C. Calendario Económico de Noticias en Vivo (`GET https://chartevents-reuters.tradingview.com/events`), D. Fondeo Global (`GET /api/v2/funding/dashboard`) (+5 more)

### Community 24 - "database.ts"
Cohesion: 0.07
Nodes (65): FirmFinancialMetric, AccountsDueWidget(), AccountsDueWidgetProps, DashboardFiltersProps, AddAccountModalProps, AddExpenseModal(), AddExpenseModalProps, AddFirmModal() (+57 more)

### Community 25 - "index.js"
Cohesion: 0.07
Nodes (25): convertSymbolToMicro(), { createClient }, DesktopCopierEngine, MINI_TO_MICRO_MAP, WebSocket, activeAccounts, { app, BrowserWindow, ipcMain }, connectTradovateWs() (+17 more)

### Community 26 - "economic-events.ts"
Cohesion: 0.28
Nodes (11): EconomicCalendarContent(), EconomicEvent, EconomicEventsFilter, filterEconomicEvents(), getEconomicEvents(), getFallbackEconomicEvents(), getImpactedAssets(), ImpactedAsset (+3 more)

### Community 28 - "app.js"
Cohesion: 0.08
Nodes (28): appendLog(), authError, authForm, authView, availableAccounts, btnConnectTradovate, btnLoginSubmit, btnLogout (+20 more)

### Community 29 - "tools/page.tsx"
Cohesion: 0.23
Nodes (12): TradingToolsPage(), AnimatedTabs(), AnimatedTabsProps, TabOption, calculateConsistencyRule(), calculateDrawdownBuffer(), calculatePositionSize(), ConsistencyResult (+4 more)

### Community 30 - "retiros/page.tsx"
Cohesion: 0.09
Nodes (42): ChartPoint, DashboardFilters(), EmptyStateProps, TransactionType, AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent() (+34 more)

### Community 31 - "sidebar.tsx"
Cohesion: 0.22
Nodes (8): BrandLogo(), BrandLogoProps, BrandSymbol(), menuItems, navigationItems, navSections, Sidebar(), supportItems

### Community 32 - "header.tsx"
Cohesion: 0.16
Nodes (15): AccountDetailDrawer(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Sheet() (+7 more)

### Community 33 - "createClient"
Cohesion: 0.24
Nodes (7): LoginPage(), SettingsPage(), Header(), CopierTradeSignal, createCopierSignalChannel(), SignalHandler, createClient()

### Community 34 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 36 - "strategies.ts"
Cohesion: 0.53
Nodes (4): calculateStrategyMetrics(), DEFAULT_PLAYBOOK_STRATEGIES, StrategyPerformanceMetrics, StrategySetup

## Knowledge Gaps
- **232 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+227 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `drawer.tsx`, `devDependencies`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `header.tsx`, `createClient`, `tabs.tsx`, `copier/page.tsx`, `app/layout.tsx`, `app/page.tsx`, `drawer.tsx`, `[id]/page.tsx`, `database.ts`, `tools/page.tsx`, `retiros/page.tsx`, `sidebar.tsx`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `scanReceiptAction()` connect `database.ts` to `dependencies`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _232 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._