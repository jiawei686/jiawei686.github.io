---
layout: post
title: "Advanced SQL"
date: 2026-01-10
categories: [Learning]
---

**Core Idea**: Go beyond basic `SELECT-FROM-WHERE` queries and master the advanced SQL techniques needed to analyze complex datasets. This course focuses on window functions, common table expressions (CTEs), and performance optimization.

## 1. Window Functions

Window functions perform a calculation across a set of table rows that are somehow related to the current row. This is comparable to the type of calculation that can be done with an aggregate function. But unlike regular aggregate functions, use of a window function does not cause rows to become grouped into a single output row — the rows retain their separate identities.

### 1.1 `OVER()` Clause

The `OVER()` clause is what distinguishes window functions from other analytical and reporting functions. It determines the set of rows the function is applied to.

### 1.2 Common Window Functions

*   **Ranking**: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`
*   **Aggregation**: `SUM()`, `AVG()`, `COUNT()` used with `OVER()`
*   **Value**: `LAG()`, `LEAD()`, `FIRST_VALUE()`, `LAST_VALUE()`

```sql
SELECT 
    product_name,
    category,
    price,
    RANK() OVER (PARTITION BY category ORDER BY price DESC) as rank_in_category
FROM products;
```

## 2. Common Table Expressions (CTEs)

A CTE is a temporary named result set that you can reference within a `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement. CTEs help to break down complex queries into simple, logical building blocks, making them more readable and maintainable.

```sql
WITH RegionalSales AS (
    SELECT
        region,
        SUM(amount) as total_sales
    FROM orders
    GROUP BY region
)
SELECT
    region,
    total_sales
FROM RegionalSales
WHERE total_sales > 1000;
```

## 3. Query Optimization

Writing efficient SQL queries is crucial for working with large datasets.

### 3.1 `EXPLAIN`

Use the `EXPLAIN` command to see the query execution plan. This shows how the database will execute your query, including which indexes it will use. This is the first step in diagnosing a slow query.

### 3.2 Indexing

Indexes are special lookup tables that the database search engine can use to speed up data retrieval. Creating indexes on columns that are frequently used in `WHERE` clauses or `JOIN` conditions can dramatically improve query performance.

### 3.3 Data Types

Using the most appropriate and efficient data types for your columns can reduce storage requirements and improve query speed.

**Key Takeaways**:

*   Window functions are a powerful tool for performing complex analytical queries.
*   CTEs improve the readability and modularity of your SQL code.
*   Query optimization is an essential skill for working with large-scale data.
*   Understanding execution plans and proper indexing are key to high-performance SQL.
