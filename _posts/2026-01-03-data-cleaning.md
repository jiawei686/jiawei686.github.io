---
layout: post
title: "Data Cleaning"
date: 2026-01-03
categories: [Learning]
---

**Core Idea**: Data cleaning is the process of detecting and correcting (or removing) corrupt or inaccurate records from a dataset. It is a crucial first step in any data science project, as the quality of the data directly impacts the quality of the model.

## 1. Handling Missing Values

We've touched on this in the Intermediate ML notes, but it's worth reiterating. The strategy for handling missing values depends on the nature of the data and the reason for the missingness.

*   **Drop**: If only a small fraction of rows have missing values, dropping them might be acceptable.
*   **Impute**: Fill with a constant (0, mean, median) or use more sophisticated methods like model-based imputation.
*   **Analyze**: Sometimes, the fact that a value is missing is itself a piece of information that can be used as a feature.

## 2. Correcting Data Types

Ensure that each column has the correct data type (e.g., numeric, datetime, categorical). Incorrect data types can lead to errors and unexpected behavior in your analysis and modeling.

```python
# Convert 'date' column to datetime objects
df['date'] = pd.to_datetime(df['date'])

# Convert 'zip_code' to a categorical type
df['zip_code'] = df['zip_code'].astype('category')
```

## 3. Dealing with Inconsistent Data

Inconsistent data can arise from typos, different formatting, or different units of measurement. Regular expressions and string manipulation are powerful tools for cleaning up inconsistent text data.

```python
# Standardize street names
df['street'] = df['street'].str.replace('St.', 'Street').str.replace('Rd.', 'Road')
```

## 4. Identifying and Handling Outliers

Outliers are data points that are significantly different from other observations. They can be caused by measurement errors or they can be legitimate but extreme values. 

*   **Visualization**: Box plots and scatter plots are useful for visually identifying outliers.
*   **Statistical Methods**: Use statistical tests or rules of thumb (e.g., values more than 3 standard deviations from the mean) to programmatically identify outliers.
*   **Treatment**: Depending on the cause, you might remove, cap, or transform outliers.

## 5. Removing Duplicates

Duplicate rows can skew your analysis and should generally be removed.

```python
# Remove duplicate rows
df = df.drop_duplicates()
```

**Key Takeaways**:

*   Data cleaning is an iterative and often time-consuming process.
*   A systematic approach to data cleaning is essential for building reliable models.
*   Always document your cleaning steps to ensure reproducibility.
*   The best cleaning strategy depends on the specific context of your data and your project goals.
