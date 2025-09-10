---
layout: post
title: Kaggle Time Series Data Cleaning Notes
tags: [Learning]
---


A Kaggle training focused on time series data—specifically a dataset of hourly energy consumption with timestamps, consumption values, and occasional gaps. The goal was to clean the data and extract temporal features for forecasting, which taught me practical tricks for handling time-based datasets.

The first hurdle was timestamp standardization. The "time" column mixed formats like "2025-12-01 08:00" and "12/1/2025 8 AM", and some entries lacked time zones. Pandas’ `to_datetime()` handled most cases, but I added `utc=True` to avoid ambiguity and set it as the index for easier temporal operations:

```python

import pandas as pd

# Load and standardize timestamps
df = pd.read_csv("energy_consumption.csv")
df["time"] = pd.to_datetime(df["time"], utc=True)  # Unify with UTC
df.set_index("time", inplace=True)  # Time as index
df = df.sort_index()  # Critical for time series
```

Next came missing values—a common issue in time series. Unlike tabular data, filling with mean wasn’t ideal. I used `interpolate()` for linear interpolation (suitable for continuous consumption data) and `ffill()` as a fallback for longer gaps:

```python

# Handle missing values with temporal methods
df["consumption"] = df["consumption"].interpolate(method="linear")  # Linear fill
df["consumption"] = df["consumption"].fillna(method="ffill")  # Forward fill remaining gaps
```

Feature engineering was the key to improving forecast performance. I extracted temporal features like hour, day of week, and month—these capture patterns like daily peaks or weekly cycles. I also added a rolling mean to highlight trends:

```python

# Extract temporal features
df["hour"] = df.index.hour
df["day_of_week"] = df.index.dayofweek  # 0=Monday, 6=Sunday
df["month"] = df.index.month

# Add rolling window feature (7-day average)
df["7d_rolling_mean"] = df["consumption"].rolling(window=24*7).mean()  # 24h*7d
```

Resampling was another essential skill. The data was hourly, but I needed daily aggregates for initial analysis. `resample()` made this straightforward, and combining it with `agg()` let me compute multiple metrics at once:

```python

# Resample hourly data to daily frequency
daily_df = df.resample("D").agg({
    "consumption": ["mean", "max"],  # Daily avg and peak consumption
    "7d_rolling_mean": "last"  # Keep latest rolling mean
})
daily_df.columns = ["daily_avg", "daily_peak", "weekly_trend"]  # Rename columns
```

A crucial lesson: Time series data relies on order—always sort the index first. Also, choose interpolation and feature methods based on the data’s nature (e.g., linear for continuous values, categorical encoding for holidays). This training gave me a solid foundation for Kaggle time series competitions, where clean temporal features often make the difference in model performance.
> （注：文档部分内容可能由 AI 生成）