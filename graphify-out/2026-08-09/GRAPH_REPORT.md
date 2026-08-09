# Graph Report - tracking  (2026-08-09)

## Corpus Check
- 76 files · ~31,412 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 424 nodes · 1209 edges · 22 communities (15 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2e9d8628`
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
- login/page.tsx
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 98 edges
2. `PropFirm` - 32 edges
3. `Account` - 27 edges
4. `Button()` - 25 edges
5. `formatCurrency()` - 24 edges
6. `HomePageContent()` - 20 edges
7. `createClient()` - 18 edges
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

## Communities (22 total, 7 thin omitted)

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
Cohesion: 0.09
Nodes (22): react, react, ResponsiveModalProps, Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader() (+14 more)

### Community 8 - "database.ts"
Cohesion: 0.18
Nodes (26): AccountsDueWidgetProps, AddAccountModalProps, AddExpenseModalProps, AddFirmModalProps, AddWithdrawalModalProps, EditAccountModalProps, EditExpenseModal(), EditExpenseModalProps (+18 more)

### Community 9 - "login/page.tsx"
Cohesion: 0.10
Nodes (23): LoginPage(), DashboardSkeleton(), EmptyState(), EmptyStateProps, Header(), Card(), CardAction(), CardContent() (+15 more)

### Community 11 - "cn"
Cohesion: 0.06
Nodes (45): MobileNav(), menuItems, navigationItems, Sidebar(), supportItems, AlertDialogMedia(), AlertDialogOverlay(), Avatar() (+37 more)

### Community 16 - "retiros/page.tsx"
Cohesion: 0.18
Nodes (26): DashboardLayout(), DashboardFilters(), DashboardFiltersProps, TransactionType, AddAccountModal(), AlertDialog(), AlertDialogAction(), AlertDialogCancel() (+18 more)

### Community 19 - "app/page.tsx"
Cohesion: 0.22
Nodes (27): CuentasPage(), EmpresasPage(), GastosPage(), HomePageContent(), RetirosPage(), AddExpenseModal(), AddFirmModal(), AddWithdrawalModal() (+19 more)

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

### Community 21 - "financials.ts"
Cohesion: 0.11
Nodes (37): AccountsDueWidget(), ChartPoint, CumulativeProfitChart(), CumulativeProfitChartProps, FirmPerformanceChart(), FirmPerformanceChartProps, NetProfitSparkline(), NetProfitSparklineProps (+29 more)

## Knowledge Gaps
- **104 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `responsive-modal.tsx`?**
  _High betweenness centrality (0.208) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `responsive-modal.tsx`, `database.ts`, `login/page.tsx`, `retiros/page.tsx`, `financials.ts`?**
  _High betweenness centrality (0.201) - this node is a cross-community bridge._
- **Why does `react` connect `responsive-modal.tsx` to `dependencies`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._