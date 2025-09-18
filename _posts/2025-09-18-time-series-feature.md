---
layout: post
title: Kaggle Notes -- Time Series as Features
tags: [Learning]
---

# Notes on Kaggle’s *Time Series as Features*

**Core Idea**: Skip complex time-series models. Extract temporal features from time data and use standard ML models (Random Forest, XGBoost) for predictions — practical and easy to implement.

## 1. Key Feature Engineering

### 1.1 Time Index Features

Capture cycles (hour, weekday) and long-term trends via timestamps.

```python

import pandas as pd
# Convert, index and sort (must-do for time series)
df['timestamp'] = pd.to_datetime(df['timestamp'])
df = df.set_index('timestamp').sort_index()
# Extract features
df['hour'] = df.index.hour
df['dayofweek'] = df.index.dayofweek  # 0=Monday
df['days_since_start'] = (df.index - df.index.min()).days
```

### 1.2 Rolling Window Features

Short-term trends via sliding window stats (match window to data frequency: 7D for daily).

```python

# 7-day rolling stats
df['rolling_7d_mean'] = df['target'].rolling(window='7D').mean()
df['rolling_7d_std'] = df['target'].rolling(window='7D').std()
df = df.dropna()  # Remove window-generated NaNs
```

### 1.3 Lag Features

Use past values (t-1, t-7) to predict future — avoid data leakage!

```python

df['lag_1'] = df['target'].shift(1)  # 1-day lag
df['lag_7'] = df['target'].shift(7)  # 7-day lag
df = df.dropna()  # Remove shift-generated NaNs
```

## 2. Simple Workflow

1. **Clean Data**: Fill missing values with interpolation

2. **Engineer Features**: Combine the three feature types above

3. **Time-Based Split**: No random split — preserve time order

4. **Train Model**: Use standard ML models (e.g., RandomForestRegressor)

## 3. Key Takeaways

- Avoids complex models (ARIMA) — uses familiar ML tools

- **Golden Rules**: Sort by time; split by time; no future data leakage

- Great for: Demand forecasting, energy prediction, sales trends
> （注：文档部分内容可能由 AI 生成）