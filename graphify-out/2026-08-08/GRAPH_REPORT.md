# Graph Report - tracking  (2026-08-08)

## Corpus Check
- 57 files · ~16,117 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 336 nodes · 724 edges · 21 communities (15 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b2c0c328`
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
- add-expense-modal.tsx
- app/page.tsx
- layout.tsx
- cn
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- transaction-table.tsx
- login/page.tsx
- src/middleware.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 90 edges
2. `compilerOptions` - 16 edges
3. `Button()` - 13 edges
4. `PropFirm` - 13 edges
5. `HomePage()` - 12 edges
6. `Card()` - 11 edges
7. `CardContent()` - 11 edges
8. `calculateFinancialSummary()` - 11 edges
9. `formatCurrency()` - 11 edges
10. `Account` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Drawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `useDrawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts
- `DialogFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts
- `DrawerOverlay()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/drawer.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (21 total, 6 thin omitted)

### Community 2 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 3 - "dependencies"
Cohesion: 0.08
Nodes (25): @base-ui/react, class-variance-authority, clsx, lucide-react, next, dependencies, @base-ui/react, class-variance-authority (+17 more)

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
Nodes (21): react, react, ResponsiveModalProps, Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader() (+13 more)

### Community 8 - "add-expense-modal.tsx"
Cohesion: 0.18
Nodes (17): TransactionTableProps, AddAccountModal(), AddAccountModalProps, AddExpenseModal(), AddExpenseModalProps, AddFirmModal(), AddFirmModalProps, AddWithdrawalModal() (+9 more)

### Community 9 - "app/page.tsx"
Cohesion: 0.11
Nodes (43): HomePage(), ChartPoint, CumulativeProfitChart(), CumulativeProfitChartProps, FirmPerformanceChart(), FirmPerformanceChartProps, PerformanceLineChart(), PerformanceLineChartProps (+35 more)

### Community 10 - "layout.tsx"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 11 - "cn"
Cohesion: 0.07
Nodes (43): DashboardLayout(), KpiCards(), MobileNav(), navigationItems, Sidebar(), Avatar(), AvatarBadge(), AvatarFallback() (+35 more)

### Community 16 - "transaction-table.tsx"
Cohesion: 0.23
Nodes (11): TransactionType, Badge(), badgeVariants, Table(), TableBody(), TableCaption(), TableCell(), TableFooter() (+3 more)

### Community 19 - "login/page.tsx"
Cohesion: 0.31
Nodes (8): LoginPage(), Header(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), createClient()

### Community 20 - "src/middleware.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, middleware()

## Knowledge Gaps
- **96 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+91 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `responsive-modal.tsx`, `add-expense-modal.tsx`, `app/page.tsx`, `transaction-table.tsx`, `login/page.tsx`?**
  _High betweenness centrality (0.255) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`, `responsive-modal.tsx`?**
  _High betweenness centrality (0.227) - this node is a cross-community bridge._
- **Why does `react` connect `responsive-modal.tsx` to `dependencies`?**
  _High betweenness centrality (0.214) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _96 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._