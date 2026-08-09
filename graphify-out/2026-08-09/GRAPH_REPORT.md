# Graph Report - tracking  (2026-08-09)

## Corpus Check
- 83 files · ~36,066 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 450 nodes · 1332 edges · 28 communities (21 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `55b2bd03`
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
- responsive-modal.tsx
- database.ts
- copier/page.tsx
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
- copier-rule-modal.tsx
- header.tsx
- utils.ts
- dropdown-menu.tsx
- tabs.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 99 edges
2. `PropFirm` - 32 edges
3. `Account` - 30 edges
4. `createClient()` - 28 edges
5. `Button()` - 27 edges
6. `formatCurrency()` - 24 edges
7. `HomePageContent()` - 20 edges
8. `Expense` - 16 edges
9. `Withdrawal` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `scanReceiptAction()` --references--> `@google/generative-ai`  [EXTRACTED]
  src/lib/actions/scan-receipt.ts → package.json
- `Drawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `useDrawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `DashboardFiltersProps` --references--> `PropFirm`  [EXTRACTED]
  src/components/dashboard/dashboard-filters.tsx → src/types/database.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/card.tsx → src/lib/utils.ts

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

### Community 7 - "responsive-modal.tsx"
Cohesion: 0.13
Nodes (15): react, react, ResponsiveModalProps, Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription() (+7 more)

### Community 8 - "database.ts"
Cohesion: 0.17
Nodes (27): AccountsDueWidgetProps, TransactionTableProps, AddAccountModalProps, AddExpenseModalProps, AddFirmModalProps, AddWithdrawalModalProps, EditAccountModalProps, EditExpenseModal() (+19 more)

### Community 9 - "copier/page.tsx"
Cohesion: 0.13
Nodes (25): CopierPage(), LoginPage(), DashboardSkeleton(), EmptyState(), EmptyStateProps, Header(), Card(), CardAction() (+17 more)

### Community 11 - "cn"
Cohesion: 0.16
Nodes (20): AlertDialogMedia(), AlertDialogOverlay(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+12 more)

### Community 16 - "retiros/page.tsx"
Cohesion: 0.19
Nodes (25): DashboardLayout(), DashboardFilters(), DashboardFiltersProps, TransactionType, AddAccountModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel() (+17 more)

### Community 19 - "app/page.tsx"
Cohesion: 0.23
Nodes (27): CuentasPage(), EmpresasPage(), GastosPage(), HomePageContent(), RetirosPage(), AddExpenseModal(), AddFirmModal(), AddWithdrawalModal() (+19 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.11
Nodes (36): AccountsDueWidget(), ChartPoint, CumulativeProfitChart(), CumulativeProfitChartProps, FirmPerformanceChart(), FirmPerformanceChartProps, NetProfitSparkline(), NetProfitSparklineProps (+28 more)

### Community 22 - "schemas.ts"
Cohesion: 0.17
Nodes (14): AccountInput, accountSchema, CopierRuleInput, copierRuleSchema, ExpenseInput, expenseSchema, FirmInput, firmSchema (+6 more)

### Community 23 - "copier-rule-modal.tsx"
Cohesion: 0.19
Nodes (10): CopierRuleModal(), CopierRuleModalProps, Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+2 more)

### Community 24 - "header.tsx"
Cohesion: 0.20
Nodes (10): DropdownMenuLabel(), DropdownMenuSeparator(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay() (+2 more)

### Community 25 - "utils.ts"
Cohesion: 0.24
Nodes (7): MobileNav(), menuItems, navigationItems, Sidebar(), supportItems, Switch, SwitchProps

### Community 26 - "dropdown-menu.tsx"
Cohesion: 0.20
Nodes (5): DropdownMenuCheckboxItem(), DropdownMenuRadioItem(), DropdownMenuShortcut(), DropdownMenuSubContent(), DropdownMenuSubTrigger()

### Community 27 - "tabs.tsx"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

## Knowledge Gaps
- **107 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+102 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `responsive-modal.tsx`?**
  _High betweenness centrality (0.201) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `responsive-modal.tsx`, `database.ts`, `copier/page.tsx`, `retiros/page.tsx`, `copier-rule-modal.tsx`, `header.tsx`, `utils.ts`, `dropdown-menu.tsx`, `tabs.tsx`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **Why does `react` connect `responsive-modal.tsx` to `dependencies`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _107 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._