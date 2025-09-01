---
layout: post
title: Pandas Row-Column Transformation Notes
tags: [Learning]
---


During a recent Kaggle data processing practice, I encountered a messy public dataset filled with missing values, duplicates, and non-standard value formats (e.g., "15k", "20000 yuan") in key indicator columns—making it unfit for direct modeling or analysis. Below is my record of cleaning the data and mastering advanced row-column transformation techniques using Pandas.

After loading the dataset, I quickly identified three critical issues using the `info()` method: 1) The "record_date" column was stored as strings, preventing time-span calculations; 2) The "indicator_value" column contained non-numeric characters, hindering statistical analysis; 3) The "valid_count" column had 3 missing values. I addressed these issues one by one.

First, I standardized the "indicator_value" column. It contained three formats: "15k", "20000 yuan", and "18000". I used Pandas' `apply()` with a custom function to extract numeric parts and unify the format:

```Python

import pandas as pd

def clean_indicator(indicator):
    if pd.isna(indicator):
        return None
    indicator_str = str(indicator).strip()
    # Handle "k" notation (e.g., 15k → 15000)
    if "k" in indicator_str.lower():
        num = float(indicator_str.replace("k", "").replace("K", ""))
        return num * 1000
    # Remove "yuan" character
    elif "yuan" in indicator_str:
        return float(indicator_str.replace("yuan", ""))
    # Direct conversion for pure numbers
    else:
        return float(indicator_str)

# Apply cleaning function
df["cleaned_indicator"] = df["indicator_value"].apply(clean_indicator)
# Drop original messy column
df.drop("indicator_value", axis=1, inplace=True)
```

A key note: Always check for missing values before using `apply()` to avoid string conversion errors. The dataset structure became much clearer after removing the original messy column with `drop()`.

Next, I converted the "record_date" column from strings to datetime format using `to_datetime()`, which automatically recognizes common date formats like "2023/5/12" and "2022-10-08":

```Python

# Convert to datetime format
df["record_date"] = pd.to_datetime(df["record_date"])
# Calculate data duration (as of December 2025)
current_date = pd.to_datetime("2025-12-01")
df["duration_years"] = (current_date - df["record_date"]).dt.days / 365.25
# Round to 2 decimal places
df["duration_years"] = df["duration_years"].round(2)
```

The converted datetime data supports time calculations. The `dt.days` attribute simplifies extracting the number of days between two dates, making it easy to calculate how long each data entry has existed.

For the 3 missing values in "valid_count", I filled them with the rounded mean (since most entries in the same category had 22 valid counts). I also removed 2 duplicate rows using "name" as the unique identifier:

```Python

# Calculate mean of non-missing values
count_mean = df["valid_count"].mean()
# Fill missing values
df["valid_count"].fillna(round(count_mean), inplace=True)
# Remove duplicates (keep first occurrence by "name")
df.drop_duplicates(subset=["name"], keep="first", inplace=True)
```

After cleaning, Kaggle practice often requires row-column transformation to restructure data for analysis. I focused on two core methods: `pivot_table()` for creating pivot tables (row-to-column) and `melt()` for data reshaping (column-to-row).

```Python

# Method 1: pivot_table() for row-to-column transformation
# Create pivot table with "name" as rows, "category" as columns
pivot_df = df.pivot_table(
    index="name",          # Rows: unique names
    columns="category",    # Columns: different categories
    values="cleaned_indicator",  # Values to aggregate
    aggfunc="mean",        # Aggregation function
    fill_value=0           # Fill missing values with 0
).round(2)
print("Pivot Table (Row-to-Column):")
print(pivot_df.head())

# Method 2: melt() for column-to-row transformation
# Reshape pivot table back to long format for batch processing
melt_df = pivot_df.melt(
    ignore_index=False,    # Preserve original index "name"
    var_name="category",   # Convert old columns to "category"
    value_name="avg_indicator"  # Convert values to "avg_indicator"
)
# Reset index to make "name" a regular column
melt_df.reset_index(inplace=True)
print("\nReshaped Data (Column-to-Row):")
print(melt_df.head())
```

My key insight: Choose transformation methods based on your analysis goals. Use `pivot_table()` for horizontal comparison (e.g., comparing an item's performance across categories). Use `melt()` for vertical analysis or batch processing, avoiding cumbersome operations caused by too many columns. These methods are particularly useful for formatting data before visualization in Kaggle (e.g., pivot tables for radar charts, long-format data for line charts).

I also practiced `stack()` and `unstack()`, which are ideal for multi-index row-column transformation. Here’s how I adjusted hierarchical data after grouping:

```Python

# Method 3: stack() & unstack() for hierarchical transformation
# Create duration bins for grouping
df["duration_bin"] = pd.cut(
    df["duration_years"], 
    bins=[0,1,3,5,10], 
    labels=["<1 Year", "1-3 Years", "3-5 Years", "5-10 Years"]
)
# Group by "category" and "duration_bin", then calculate mean
group_df = df.groupby(["category", "duration_bin"])["cleaned_indicator"].mean().round(2)

# unstack(): Convert inner row index ("duration_bin") to columns
unstack_df = group_df.unstack(fill_value=0)
print("\nunstack() (Row-to-Column with Multi-Index):")
print(unstack_df)

# stack(): Convert columns ("duration_bin") back to row index
stack_df = unstack_df.stack()
print("\nstack() (Column-to-Row with Multi-Index):")
print(stack_df.head())
```

Basic cleaning ensures data quality, while row-column transformation adapts data to analysis scenarios—in many top Kaggle solutions, the first step is using `pivot_table()` or `melt()` to restructure raw data for modeling or visualization.

These techniques solved the dimension adjustment challenges in this Kaggle practice and provide a clear framework for handling multi-dimensional public datasets. Next, I plan to practice combining `crosstab()` with row-column transformation and explore efficient transformation techniques for large datasets to improve preprocessing efficiency.
> （注：文档部分内容可能由 AI 生成）