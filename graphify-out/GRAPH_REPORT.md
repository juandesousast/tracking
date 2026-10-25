# Graph Report - tracking  (2026-10-25)

## Corpus Check
- 160 files · ~103,182 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 914 nodes · 2477 edges · 44 communities (37 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `695df9a6`
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
- TradovateClient
- utils.ts
- app/page.tsx
- schemas.ts
- desktop/package.json
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- settings/page.tsx
- cn
- src/middleware.ts
- financials.ts
- database.ts
- 2. Contratos de Datos y APIs Institucionales
- PropFirm
- index.js
- economic-events.ts
- app.js
- tools/page.tsx
- retiros/page.tsx
- switchTab
- sidebar.tsx
- calendario/page.tsx
- renderMasterSelector
- createClient
- strategies.ts
- preload.js
- csv-export.ts
- animated-tabs.tsx
- dropdown-menu.tsx
- toast.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 122 edges
2. `formatCurrency()` - 50 edges
3. `PropFirm` - 48 edges
4. `Account` - 46 edges
5. `createClient()` - 45 edges
6. `Button()` - 43 edges
7. `Expense` - 33 edges
8. `Withdrawal` - 33 edges
9. `getAccounts()` - 25 edges
10. `getFirms()` - 23 edges

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

## Communities (44 total, 7 thin omitted)

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

### Community 7 - "TradovateClient"
Cohesion: 0.11
Nodes (11): convertSymbolToMicro(), CopyEngine, CopyExecutionResult, MINI_TO_MICRO_MAP, ConnectionStatus, TradovateAccount, TradovateClient, TradovateClientConfig (+3 more)

### Community 8 - "utils.ts"
Cohesion: 0.42
Nodes (5): CopierPage(), DesktopDownloadBanner(), Badge(), badgeVariants, CopierLog

### Community 9 - "app/page.tsx"
Cohesion: 0.12
Nodes (50): AnalyticsPageContent(), POST(), CalendarioContent(), CuentasPage(), EmpresasPage(), GastosPage(), HomePageContent(), FIRM_COLORS (+42 more)

### Community 10 - "schemas.ts"
Cohesion: 0.13
Nodes (19): AccountInput, accountSchema, CopierRuleInput, copierRuleSchema, createSessionSchema, EXPENSE_CATEGORIES, ExpenseCategoryType, ExpenseInput (+11 more)

### Community 11 - "desktop/package.json"
Cohesion: 0.05
Nodes (39): author, build, appId, directories, files, mac, productName, win (+31 more)

### Community 16 - "settings/page.tsx"
Cohesion: 0.24
Nodes (10): ChartPoint, CumulativeProfitChart(), EmptyStateProps, Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+2 more)

### Community 19 - "cn"
Cohesion: 0.10
Nodes (26): AlertDialogMedia(), AlertDialogOverlay(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+18 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.08
Nodes (45): UnifiedTradeRow, AccountDetailDrawerProps, CumulativeProfitChartProps, NetProfitSparkline(), NetProfitSparklineProps, PerformanceLineChart(), PerformanceLineChartProps, KpiCards() (+37 more)

### Community 22 - "database.ts"
Cohesion: 0.07
Nodes (55): RiskConfigPage(), SimulatorWorkspacePage(), SimulatorDashboardPage(), FirmPerformanceChart(), FirmPerformanceChartProps, CreateSimulatorSessionModal(), CreateSimulatorSessionModalProps, LightweightChartView() (+47 more)

### Community 23 - "2. Contratos de Datos y APIs Institucionales"
Cohesion: 0.14
Nodes (13): 1. Arquitectura de Pantallas y Módulos Institucionales, 2. Contratos de Datos y APIs Institucionales, 3. Matriz de Estado & Plan de Trabajo por Pantalla, 4. Tareas Específicas a Ejecutar de Inmediato, A. Dashboard Ejecutivo (`GET /api/v1/accounts/{id}/metrics/dashboard`), B. Calendario PnL por Cuenta (`GET /api/v1/accounts/{id}/metrics/calendar?view_type=money|percent`), C. Calendario Económico de Noticias en Vivo (`GET https://chartevents-reuters.tradingview.com/events`), D. Fondeo Global (`GET /api/v2/funding/dashboard`) (+5 more)

### Community 24 - "PropFirm"
Cohesion: 0.06
Nodes (67): react, react, FirmFinancialMetric, AccountsDueWidget(), AccountsDueWidgetProps, DashboardFiltersProps, AddAccountModalProps, AddExpenseModal() (+59 more)

### Community 25 - "index.js"
Cohesion: 0.06
Nodes (29): convertSymbolToMicro(), { createClient }, DesktopCopierEngine, MINI_TO_MICRO_MAP, WebSocket, activeAccounts, { app, BrowserWindow, ipcMain, session, Notification }, connectTradovateWs() (+21 more)

### Community 26 - "economic-events.ts"
Cohesion: 0.28
Nodes (11): EconomicCalendarContent(), EconomicEvent, EconomicEventsFilter, filterEconomicEvents(), getEconomicEvents(), getFallbackEconomicEvents(), getImpactedAssets(), ImpactedAsset (+3 more)

### Community 28 - "app.js"
Cohesion: 0.04
Nodes (52): authError, authForm, authView, availableAccounts, btnConnectTradovate, btnDisconnectTradovate, btnLoginSubmit, btnLogout (+44 more)

### Community 29 - "tools/page.tsx"
Cohesion: 0.35
Nodes (9): TradingToolsPage(), calculateConsistencyRule(), calculateDrawdownBuffer(), calculatePositionSize(), ConsistencyResult, DrawdownBufferResult, INSTRUMENT_SPECS, InstrumentSpec (+1 more)

### Community 30 - "retiros/page.tsx"
Cohesion: 0.10
Nodes (28): DashboardFilters(), TransactionType, AddAccountModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription() (+20 more)

### Community 31 - "switchTab"
Cohesion: 0.25
Nodes (8): loadCloudAccounts(), loadCloudLogs(), loadEconomicNews(), loadRiskConfig(), renderCloudAccounts(), renderCloudLogs(), renderEconomicNews(), switchTab()

### Community 32 - "sidebar.tsx"
Cohesion: 0.15
Nodes (12): DashboardLayout(), BrandLogo(), BrandLogoProps, BrandSymbol(), Header(), MobileNav(), mobileNavItems, menuItems (+4 more)

### Community 33 - "calendario/page.tsx"
Cohesion: 0.19
Nodes (12): CATEGORY_LABELS, MONTH_NAMES, WEEKDAY_NAMES, AccountDetailDrawer(), Sheet(), SheetContent(), SheetDescription(), SheetFooter() (+4 more)

### Community 34 - "renderMasterSelector"
Cohesion: 0.40
Nodes (5): appendLog(), checkAuthSession(), renderMasterSelector(), renderSlavesList(), saveAndSyncConfig()

### Community 35 - "createClient"
Cohesion: 0.28
Nodes (6): LoginPage(), SettingsPage(), CopierTradeSignal, createCopierSignalChannel(), SignalHandler, createClient()

### Community 36 - "strategies.ts"
Cohesion: 0.53
Nodes (4): calculateStrategyMetrics(), DEFAULT_PLAYBOOK_STRATEGIES, StrategyPerformanceMetrics, StrategySetup

### Community 39 - "csv-export.ts"
Cohesion: 0.39
Nodes (10): RFC-4180, TransactionTable(), buildCSVContent(), downloadCSV(), escapeCSVCell(), ExportableTransaction, exportExpensesToCSV(), exportTaxSummaryToCSV() (+2 more)

### Community 40 - "animated-tabs.tsx"
Cohesion: 0.50
Nodes (3): AnimatedTabs(), AnimatedTabsProps, TabOption

### Community 45 - "dropdown-menu.tsx"
Cohesion: 0.17
Nodes (7): DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent(), DropdownMenuSubTrigger()

### Community 46 - "toast.ts"
Cohesion: 0.12
Nodes (15): metadata, plusJakartaSans, viewport, CommandItem, CommandPalette(), iconColors, ToastContainer(), toastIcons (+7 more)

## Knowledge Gaps
- **269 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+264 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `PropFirm`, `devDependencies`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `sidebar.tsx`, `calendario/page.tsx`, `utils.ts`, `app/page.tsx`, `animated-tabs.tsx`, `dropdown-menu.tsx`, `settings/page.tsx`, `database.ts`, `PropFirm`, `tools/page.tsx`, `retiros/page.tsx`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `scanReceiptAction()` connect `PropFirm` to `dependencies`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _269 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._