# Graph Report - tracking  (2026-08-09)

## Corpus Check
- 87 files · ~38,002 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 459 nodes · 1394 edges · 27 communities (19 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a14e1a4b`
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
- database.ts
- utils.ts
- layout.tsx
- cn
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- retiros/page.tsx
- app/page.tsx
- src/middleware.ts
- financials.ts
- schemas.ts
- dashboard-skeleton.tsx
- header.tsx
- dropdown-menu.tsx
- tabs.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 99 edges
2. `PropFirm` - 35 edges
3. `Button()` - 30 edges
4. `Account` - 30 edges
5. `createClient()` - 29 edges
6. `formatCurrency()` - 24 edges
7. `HomePageContent()` - 20 edges
8. `Input()` - 16 edges
9. `Expense` - 16 edges
10. `Withdrawal` - 16 edges

## Surprising Connections (you probably didn't know these)
- `scanReceiptAction()` --references--> `@google/generative-ai`  [EXTRACTED]
  src/lib/actions/scan-receipt.ts → package.json
- `useDrawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `Drawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts
- `DrawerOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/drawer.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (27 total, 8 thin omitted)

### Community 2 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 3 - "dependencies"
Cohesion: 0.06
Nodes (32): @base-ui/react, class-variance-authority, clsx, @google/generative-ai, lucide-react, next, dependencies, @base-ui/react (+24 more)

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
Cohesion: 0.15
Nodes (10): DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerSwipeHandle() (+2 more)

### Community 8 - "database.ts"
Cohesion: 0.10
Nodes (40): AccountsDueWidgetProps, DashboardFiltersProps, AddAccountModalProps, AddExpenseModalProps, AddFirmModalProps, AddTradovateConnectionModal(), AddTradovateConnectionModalProps, AddWithdrawalModalProps (+32 more)

### Community 9 - "utils.ts"
Cohesion: 0.24
Nodes (7): MobileNav(), menuItems, navigationItems, Sidebar(), supportItems, Switch, SwitchProps

### Community 11 - "cn"
Cohesion: 0.14
Nodes (22): AlertDialogMedia(), AlertDialogOverlay(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+14 more)

### Community 16 - "retiros/page.tsx"
Cohesion: 0.14
Nodes (33): DashboardLayout(), ChartPoint, DashboardFilters(), EmptyStateProps, TransactionType, AddAccountModal(), AlertDialog(), AlertDialogAction() (+25 more)

### Community 19 - "app/page.tsx"
Cohesion: 0.15
Nodes (40): CopierPage(), CuentasPage(), EmpresasPage(), GastosPage(), HomePageContent(), RetirosPage(), EmptyState(), AddExpenseModal() (+32 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.12
Nodes (36): AccountsDueWidget(), CumulativeProfitChart(), CumulativeProfitChartProps, FirmPerformanceChart(), FirmPerformanceChartProps, NetProfitSparkline(), NetProfitSparklineProps, PerformanceLineChart() (+28 more)

### Community 22 - "schemas.ts"
Cohesion: 0.17
Nodes (14): AccountInput, accountSchema, CopierRuleInput, copierRuleSchema, ExpenseInput, expenseSchema, FirmInput, firmSchema (+6 more)

### Community 24 - "header.tsx"
Cohesion: 0.17
Nodes (12): LoginPage(), SettingsPage(), Header(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+4 more)

### Community 26 - "dropdown-menu.tsx"
Cohesion: 0.17
Nodes (7): DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent(), DropdownMenuSubTrigger()

### Community 27 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

## Knowledge Gaps
- **107 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+102 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.198) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `drawer.tsx`, `database.ts`, `utils.ts`, `retiros/page.tsx`, `dashboard-skeleton.tsx`, `header.tsx`, `dropdown-menu.tsx`, `tabs.tsx`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Why does `react` connect `dependencies` to `drawer.tsx`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._