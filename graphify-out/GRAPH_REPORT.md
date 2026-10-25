# Graph Report - tracking  (2026-10-25)

## Corpus Check
- 158 files · ~103,623 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 903 nodes · 2511 edges · 46 communities (32 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `836e4ddd`
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
- page-skeleton.tsx
- app/page.tsx
- scripts
- desktop/package.json
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- drawer.tsx
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
- header.tsx
- settings/page.tsx
- renderMasterSelector
- package.json
- strategies.ts
- preload.js
- badge.tsx
- @google/generative-ai
- next
- @supabase/ssr
- @supabase/supabase-js
- tailwind-merge
- class-variance-authority

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
- `Drawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `useDrawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `TopNavLoader()` --references--> `react`  [EXTRACTED]
  src/components/ui/top-nav-loader.tsx → package.json
- `AccountsDueWidget()` --calls--> `formatCurrency()`  [EXTRACTED]
  src/components/dashboard/accounts-due-widget.tsx → src/lib/formatters.ts

## Import Cycles
- None detected.

## Communities (46 total, 14 thin omitted)

### Community 2 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 3 - "dependencies"
Cohesion: 0.10
Nodes (21): @base-ui/react, clsx, lightweight-charts, lucide-react, motion, dependencies, @base-ui/react, clsx (+13 more)

### Community 4 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, tailwindcss (+17 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 6 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "copier/page.tsx"
Cohesion: 0.07
Nodes (38): POST(), CopierPage(), RiskConfigPage(), AddTradovateConnectionModal(), CopierGroupModal(), PROP_FIRM_RISK_TEMPLATES, RiskTemplate, deleteCopierGroup() (+30 more)

### Community 8 - "page-skeleton.tsx"
Cohesion: 0.14
Nodes (4): LinearLoader(), LinearLoaderProps, PageLoader, PageSkeleton()

### Community 9 - "app/page.tsx"
Cohesion: 0.12
Nodes (45): AnalyticsPageContent(), CalendarioContent(), CATEGORY_LABELS, MONTH_NAMES, WEEKDAY_NAMES, CuentasPage(), EmpresasPage(), GastosPage() (+37 more)

### Community 10 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, desktop:dist:mac, desktop:dist:win, desktop:start, dev, lint, start (+1 more)

### Community 11 - "desktop/package.json"
Cohesion: 0.06
Nodes (34): author, build, appId, directories, mac, productName, win, dependencies (+26 more)

### Community 16 - "drawer.tsx"
Cohesion: 0.06
Nodes (28): react, react, metadata, plusJakartaSans, viewport, CommandItem, CommandPalette(), Drawer() (+20 more)

### Community 19 - "cn"
Cohesion: 0.09
Nodes (28): AlertDialogMedia(), AlertDialogOverlay(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+20 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.07
Nodes (53): RFC-4180, UnifiedTradeRow, AccountDetailDrawerProps, CumulativeProfitChartProps, NetProfitSparkline(), NetProfitSparklineProps, PerformanceLineChart(), PerformanceLineChartProps (+45 more)

### Community 22 - "database.ts"
Cohesion: 0.05
Nodes (68): SimulatorWorkspacePage(), SimulatorDashboardPage(), FirmPerformanceChart(), FirmPerformanceChartProps, CreateSimulatorSessionModal(), CreateSimulatorSessionModalProps, LightweightChartView(), LightweightChartViewProps (+60 more)

### Community 23 - "2. Contratos de Datos y APIs Institucionales"
Cohesion: 0.14
Nodes (13): 1. Arquitectura de Pantallas y Módulos Institucionales, 2. Contratos de Datos y APIs Institucionales, 3. Matriz de Estado & Plan de Trabajo por Pantalla, 4. Tareas Específicas a Ejecutar de Inmediato, A. Dashboard Ejecutivo (`GET /api/v1/accounts/{id}/metrics/dashboard`), B. Calendario PnL por Cuenta (`GET /api/v1/accounts/{id}/metrics/calendar?view_type=money|percent`), C. Calendario Económico de Noticias en Vivo (`GET https://chartevents-reuters.tradingview.com/events`), D. Fondeo Global (`GET /api/v2/funding/dashboard`) (+5 more)

### Community 24 - "PropFirm"
Cohesion: 0.08
Nodes (53): FirmFinancialMetric, AccountsDueWidget(), AccountsDueWidgetProps, DashboardFiltersProps, AddAccountModalProps, AddExpenseModal(), AddExpenseModalProps, AddFirmModal() (+45 more)

### Community 25 - "index.js"
Cohesion: 0.06
Nodes (29): convertSymbolToMicro(), { createClient }, DesktopCopierEngine, MINI_TO_MICRO_MAP, WebSocket, activeAccounts, { app, BrowserWindow, ipcMain, session }, connectTradovateWs() (+21 more)

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
Cohesion: 0.17
Nodes (27): DashboardFilters(), TransactionType, AddAccountModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription() (+19 more)

### Community 31 - "switchTab"
Cohesion: 0.25
Nodes (8): loadCloudAccounts(), loadCloudLogs(), loadEconomicNews(), loadRiskConfig(), renderCloudAccounts(), renderCloudLogs(), renderEconomicNews(), switchTab()

### Community 32 - "header.tsx"
Cohesion: 0.11
Nodes (21): DashboardLayout(), AccountDetailDrawer(), BrandLogo(), BrandLogoProps, BrandSymbol(), Header(), MobileNav(), mobileNavItems (+13 more)

### Community 33 - "settings/page.tsx"
Cohesion: 0.14
Nodes (16): LoginPage(), SettingsPage(), ChartPoint, CumulativeProfitChart(), EmptyStateProps, Card(), CardAction(), CardContent() (+8 more)

### Community 34 - "renderMasterSelector"
Cohesion: 0.40
Nodes (5): appendLog(), checkAuthSession(), renderMasterSelector(), renderSlavesList(), saveAndSyncConfig()

### Community 35 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 36 - "strategies.ts"
Cohesion: 0.53
Nodes (4): calculateStrategyMetrics(), DEFAULT_PLAYBOOK_STRATEGIES, StrategyPerformanceMetrics, StrategySetup

## Knowledge Gaps
- **262 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+257 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`, `@google/generative-ai`, `next`, `@supabase/ssr`, `@supabase/supabase-js`, `tailwind-merge`, `class-variance-authority`, `drawer.tsx`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `header.tsx`, `settings/page.tsx`, `copier/page.tsx`, `badge.tsx`, `app/page.tsx`, `page-skeleton.tsx`, `drawer.tsx`, `PropFirm`, `tools/page.tsx`, `retiros/page.tsx`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `scanReceiptAction()` connect `PropFirm` to `@google/generative-ai`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _262 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._