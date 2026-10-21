# Graph Report - tracking  (2026-08-10)

## Corpus Check
- 95 files · ~38,352 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 475 nodes · 1408 edges · 28 communities (21 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `05269856`
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
- page-skeleton.tsx
- sidebar.tsx
- cn
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- app/page.tsx
- copier/page.tsx
- src/middleware.ts
- financials.ts
- schemas.ts
- button.tsx
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
- `Drawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `useDrawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `DashboardFiltersProps` --references--> `PropFirm`  [EXTRACTED]
  src/components/dashboard/dashboard-filters.tsx → src/types/database.ts
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (28 total, 7 thin omitted)

### Community 2 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 3 - "dependencies"
Cohesion: 0.07
Nodes (29): @base-ui/react, class-variance-authority, clsx, @google/generative-ai, lucide-react, next, dependencies, @base-ui/react (+21 more)

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
Cohesion: 0.13
Nodes (13): react, react, Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter() (+5 more)

### Community 8 - "database.ts"
Cohesion: 0.11
Nodes (39): AccountsDueWidgetProps, AddAccountModalProps, AddExpenseModalProps, AddFirmModalProps, AddTradovateConnectionModal(), AddTradovateConnectionModalProps, AddWithdrawalModalProps, CopierRuleModal() (+31 more)

### Community 10 - "sidebar.tsx"
Cohesion: 0.22
Nodes (8): DashboardLayout(), metadata, plusJakartaSans, MobileNav(), menuItems, navigationItems, Sidebar(), supportItems

### Community 11 - "cn"
Cohesion: 0.14
Nodes (22): AlertDialogMedia(), AlertDialogOverlay(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+14 more)

### Community 16 - "app/page.tsx"
Cohesion: 0.13
Nodes (51): CuentasPage(), EmpresasPage(), GastosPage(), HomePageContent(), RetirosPage(), DashboardFilters(), DashboardFiltersProps, TransactionType (+43 more)

### Community 19 - "copier/page.tsx"
Cohesion: 0.29
Nodes (14): CopierPage(), Switch, SwitchProps, deleteCopierRule(), deleteTradovateCredential(), executeKillSwitch(), getCopierLogs(), getCopierRules() (+6 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.11
Nodes (36): AccountsDueWidget(), CumulativeProfitChart(), CumulativeProfitChartProps, FirmPerformanceChart(), FirmPerformanceChartProps, NetProfitSparkline(), NetProfitSparklineProps, PerformanceLineChart() (+28 more)

### Community 22 - "schemas.ts"
Cohesion: 0.17
Nodes (14): AccountInput, accountSchema, CopierRuleInput, copierRuleSchema, ExpenseInput, expenseSchema, FirmInput, firmSchema (+6 more)

### Community 23 - "button.tsx"
Cohesion: 0.23
Nodes (14): LoginPage(), SettingsPage(), ChartPoint, EmptyState(), EmptyStateProps, Header(), Button(), buttonVariants (+6 more)

### Community 24 - "header.tsx"
Cohesion: 0.24
Nodes (8): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), SheetTrigger()

### Community 25 - "dropdown-menu.tsx"
Cohesion: 0.17
Nodes (7): DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent(), DropdownMenuSubTrigger()

### Community 26 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

## Knowledge Gaps
- **107 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+102 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `drawer.tsx`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `drawer.tsx`, `database.ts`, `page-skeleton.tsx`, `sidebar.tsx`, `app/page.tsx`, `copier/page.tsx`, `financials.ts`, `button.tsx`, `header.tsx`, `dropdown-menu.tsx`, `tabs.tsx`?**
  _High betweenness centrality (0.194) - this node is a cross-community bridge._
- **Why does `react` connect `drawer.tsx` to `dependencies`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._