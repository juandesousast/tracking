# Graph Report - tracking  (2026-10-25)

## Corpus Check
- 161 files · ~103,661 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 917 nodes · 2477 edges · 53 communities (37 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `be0a8f39`
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
- page-skeleton.tsx
- switchTab
- header.tsx
- calendario/page.tsx
- renderMasterSelector
- drawer.tsx
- strategies.ts
- preload.js
- analytics/page.tsx
- toast-container.tsx
- react
- @base-ui/react
- clsx
- lucide-react
- app/layout.tsx
- next
- react-dom
- recharts
- shadcn
- @supabase/ssr
- @supabase/supabase-js

## God Nodes (most connected - your core abstractions)
1. `cn()` - 122 edges
2. `formatCurrency()` - 50 edges
3. `createClient()` - 48 edges
4. `PropFirm` - 48 edges
5. `Account` - 46 edges
6. `Button()` - 43 edges
7. `Expense` - 33 edges
8. `Withdrawal` - 33 edges
9. `getAccounts()` - 25 edges
10. `getFirms()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `scanReceiptAction()` --references--> `@google/generative-ai`  [EXTRACTED]
  src/lib/actions/scan-receipt.ts → package.json
- `useDrawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `TopNavLoader()` --references--> `react`  [EXTRACTED]
  src/components/ui/top-nav-loader.tsx → package.json
- `Drawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `FirmFinancialMetric` --references--> `PropFirm`  [EXTRACTED]
  src/app/empresas/page.tsx → src/types/database.ts

## Import Cycles
- None detected.

## Communities (53 total, 16 thin omitted)

### Community 2 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 3 - "dependencies"
Cohesion: 0.13
Nodes (15): class-variance-authority, @google/generative-ai, lightweight-charts, motion, dependencies, class-variance-authority, @google/generative-ai, lightweight-charts (+7 more)

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
Cohesion: 0.31
Nodes (6): CopierPage(), DesktopDownloadBanner(), Badge(), badgeVariants, StatCard(), StatCardProps

### Community 9 - "app/page.tsx"
Cohesion: 0.09
Nodes (70): AnalyticsPageContent(), CalendarioContent(), CuentasPage(), EmpresasPage(), FirmFinancialMetric, GastosPage(), HomePageContent(), FIRM_COLORS (+62 more)

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
Nodes (24): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), DialogOverlay(), DropdownMenuCheckboxItem() (+16 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.07
Nodes (56): RFC-4180, UnifiedTradeRow, AccountDetailDrawerProps, CumulativeProfitChartProps, NetProfitSparkline(), NetProfitSparklineProps, PerformanceLineChart(), PerformanceLineChartProps (+48 more)

### Community 22 - "database.ts"
Cohesion: 0.06
Nodes (70): POST(), GET(), POST(), SimulatorWorkspacePage(), SimulatorDashboardPage(), FirmPerformanceChart(), FirmPerformanceChartProps, CreateSimulatorSessionModal() (+62 more)

### Community 23 - "2. Contratos de Datos y APIs Institucionales"
Cohesion: 0.14
Nodes (13): 1. Arquitectura de Pantallas y Módulos Institucionales, 2. Contratos de Datos y APIs Institucionales, 3. Matriz de Estado & Plan de Trabajo por Pantalla, 4. Tareas Específicas a Ejecutar de Inmediato, A. Dashboard Ejecutivo (`GET /api/v1/accounts/{id}/metrics/dashboard`), B. Calendario PnL por Cuenta (`GET /api/v1/accounts/{id}/metrics/calendar?view_type=money|percent`), C. Calendario Económico de Noticias en Vivo (`GET https://chartevents-reuters.tradingview.com/events`), D. Fondeo Global (`GET /api/v2/funding/dashboard`) (+5 more)

### Community 24 - "PropFirm"
Cohesion: 0.09
Nodes (45): AccountsDueWidget(), AccountsDueWidgetProps, AddAccountModalProps, AddExpenseModalProps, AddFirmModal(), AddFirmModalProps, AddTradovateConnectionModalProps, AddWithdrawalModalProps (+37 more)

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

### Community 30 - "page-skeleton.tsx"
Cohesion: 0.14
Nodes (4): LinearLoader(), LinearLoaderProps, PageLoader, PageSkeleton()

### Community 31 - "switchTab"
Cohesion: 0.25
Nodes (8): loadCloudAccounts(), loadCloudLogs(), loadEconomicNews(), loadRiskConfig(), renderCloudAccounts(), renderCloudLogs(), renderEconomicNews(), switchTab()

### Community 32 - "header.tsx"
Cohesion: 0.11
Nodes (20): DashboardLayout(), LoginPage(), SettingsPage(), BrandLogo(), BrandLogoProps, BrandSymbol(), Header(), MobileNav() (+12 more)

### Community 33 - "calendario/page.tsx"
Cohesion: 0.15
Nodes (14): CATEGORY_LABELS, MONTH_NAMES, WEEKDAY_NAMES, AnimatedTabs(), AnimatedTabsProps, TabOption, Sheet(), SheetContent() (+6 more)

### Community 34 - "renderMasterSelector"
Cohesion: 0.40
Nodes (5): appendLog(), checkAuthSession(), renderMasterSelector(), renderSlavesList(), saveAndSyncConfig()

### Community 35 - "drawer.tsx"
Cohesion: 0.15
Nodes (10): DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerSwipeHandle() (+2 more)

### Community 36 - "strategies.ts"
Cohesion: 0.53
Nodes (4): calculateStrategyMetrics(), DEFAULT_PLAYBOOK_STRATEGIES, StrategyPerformanceMetrics, StrategySetup

### Community 39 - "analytics/page.tsx"
Cohesion: 0.23
Nodes (9): SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger() (+1 more)

### Community 40 - "toast-container.tsx"
Cohesion: 0.33
Nodes (6): iconColors, ToastContainer(), toastIcons, subscribeToasts(), ToastItem, ToastType

### Community 42 - "react"
Cohesion: 0.67
Nodes (3): react, react, Drawer()

### Community 46 - "app/layout.tsx"
Cohesion: 0.24
Nodes (6): metadata, plusJakartaSans, viewport, CommandItem, CommandPalette(), TopNavLoader()

## Knowledge Gaps
- **269 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+264 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `react`, `@base-ui/react`, `clsx`, `lucide-react`, `next`, `react-dom`, `recharts`, `shadcn`, `@supabase/ssr`, `@supabase/supabase-js`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `header.tsx`, `calendario/page.tsx`, `drawer.tsx`, `analytics/page.tsx`, `utils.ts`, `app/page.tsx`, `settings/page.tsx`, `PropFirm`, `tools/page.tsx`, `page-skeleton.tsx`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `scanReceiptAction()` connect `PropFirm` to `dependencies`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _269 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._