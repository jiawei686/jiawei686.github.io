---
layout: post
title: "Advanced SQL"
date: 2026-01-10
tags: [data]
description: "Advanced SQL: window functions, CTEs, query optimization, and indexing for analytical workloads."
---

SQL is easy to start and surprisingly deep to master. The "advanced" parts — window functions, CTEs, query planning, indexing — are what separate "I can fetch rows" from "I can answer real analytical questions efficiently." I'm writing this as a practical guide because these features are high-leverage: they turn multi-query, application-side hacks into a single clear statement, and they're where most real-world data work happens.

## Window functions: the biggest unlock

A window function computes a value across a set of rows *related* to the current row, without collapsing them like `GROUP BY` does. This is the feature people most underuse.

```sql
-- running total per user, ordered by date, WITHOUT losing rows
SELECT user_id, order_date, amount,
       SUM(amount) OVER (
         PARTITION BY user_id
         ORDER BY order_date
       ) AS running_total
FROM orders;
```

Key clauses:
- `PARTITION BY` — the "group" (resets per user).
- `ORDER BY` — the order within the window (enables running totals, ranks).
- **Window vs. aggregate:** `GROUP BY` reduces rows; `OVER(...)` keeps every row and adds a computed column. That distinction is the whole point.

Common patterns: `ROW_NUMBER()` (dedupe, pick latest), `RANK()/DENSE_RANK()` (leaderboards), `LAG()/LEAD()` (period-over-period change), `NTILE()` (bucket into quantiles).

## CTEs: readable, composable queries

Common Table Expressions (`WITH`) let you name intermediate result sets:

```sql
WITH active AS (
  SELECT * FROM users WHERE last_seen > now() - interval '30 days'
), spend AS (
  SELECT user_id, SUM(amount) AS total
  FROM orders JOIN active USING (user_id)
  GROUP BY user_id
)
SELECT * FROM spend ORDER BY total DESC;
```

CTEs are mostly readability aids (the optimizer usually inlines them) — but `RECURSIVE` CTEs can do real work, like walking a tree/hierarchy (org charts, category trees) in pure SQL.

## Query optimization: think like the planner

- **Indexes** are the primary speed lever. They're great for `WHERE`, `JOIN`, and `ORDER BY` on indexed columns; useless for functions wrapped around a column (`WHERE LOWER(name) = ...` won't use a plain index on `name`).
- **EXPLAIN / EXPLAIN ANALYZE** is your friend — see the actual plan and where the cost is. I never tune a slow query without it.
- **Avoid SELECT \*** in analytical queries; fetch only needed columns (helps columnar stores especially).
- **Join order and filters:** push filters down early; a bad plan often comes from missing statistics or a missing index on a join key.
- **Beware correlated subqueries** — they can re-run per row; a window function or CTE join is usually better.

## Indexing strategy

- Index columns you filter/join/sort on.
- Composite indexes follow the **leftmost-prefix** rule — `(a, b, c)` helps queries filtering on `a`, or `a,b`, but not on `b` alone.
- Too many indexes slow writes; it's a trade-off, not free.
- Partial and expression indexes solve specific hot queries elegantly (`CREATE INDEX ... WHERE status = 'open'`).

## Practical habits

- Write CTEs top-to-bottom to mirror your thinking; future-you will thank you.
- Reach for window functions before pulling data into Python to "post-process" — the database does it faster.
- Profile with EXPLAIN before assuming; intuition about what's slow is often wrong.
- Know your dialect (Postgres, BigQuery, MySQL, Snowflake differ in window/CTE support and types).

## My take

Advanced SQL is the difference between a query that answers the question and one that almost does, slowly. The two features I'd learn first are **window functions** (they eliminate a whole category of app-side loops) and **EXPLAIN** (it ends guesswork about performance). Everything else — CTEs for readability, recursive CTEs for hierarchies, sensible indexing — compounds from there. If you do any analytics, investing a few days in these pays back on nearly every query you'll write afterward. The database is almost always faster at this than your application code; let it do the work.
