---
layout: post
title: Kaggle & Data Science - Practical Tips and Best Practices
date: 2025-09-15 10:00:00 +0800
tags: [data]
author: J.W.
---

Over Kaggle competitions and real data-science projects I've collected a set of practical techniques covering data cleaning, visualization, and time-series feature engineering. These come from actual work, and I hope they save you some time.

## 1. Data cleaning techniques

### 1.1 Timestamp normalization

Messy timestamp formats are common in time-series data. Here's a robust way to normalize them:

```python
import pandas as pd

# Load and normalize timestamps
df = pd.read_csv("data.csv")
df["time"] = pd.to_datetime(df["time"], utc=True)  # standardize on UTC
df.set_index("time", inplace=True)  # make it the index
df = df.sort_index()  # sort by time - crucial for time series
```

### 1.2 Handling non-standard numeric formats

Real data often carries units or letters, e.g. `"15k"` or `"20000 yuan"`. Normalize them:

```python
def clean_numeric_values(value):
    """Clean numeric values that carry units or letters."""
    if pd.isna(value):
        return None

    # Handle the "15k" style
    if isinstance(value, str) and 'k' in value.lower():
        return float(value.lower().replace('k', '')) * 1000

    # Handle values with currency symbols
    if isinstance(value, str):
        cleaned = ''.join(c for c in value if c.isdigit() or c == '.')
        return float(cleaned) if cleaned else None

    return float(value)

# Apply the cleaner
df['cleaned_column'] = df['messy_column'].apply(clean_numeric_values)
```

### 1.3 Missing and duplicate values

```python
# Inspect the basics
print(df.info())
print(df.describe())

# Fill missing values
df.fillna(method='ffill', inplace=True)  # forward fill
# Or fill with specific values
df.fillna({'column1': 0, 'column2': df['column2'].median()}, inplace=True)

# Drop duplicates
df.drop_duplicates(inplace=True)
```

## 2. Data visualization techniques

### 2.1 Principles of effective visualization

In Kaggle competitions I found that good visualization isn't just about looking pretty — it's about clearly telling the data's story. First be clear about the goal; avoid "charts for the sake of charts."

Common tools:
- `matplotlib` — fine-grained control.
- `seaborn` — attractive defaults out of the box.
- `plotly` — interactive charts.

### 2.2 Reusable visualization templates

```python
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import plotly.express as px

# Set a font that supports your labels
plt.rcParams['font.sans-serif'] = ['DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

# Grouped bar chart
fig, ax = plt.subplots(figsize=(12, 6))
sns.barplot(data=df, x='category', y='value', hue='region', ax=ax)
ax.set_title('Performance by category and region')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# Interactive scatter
fig = px.scatter(df, x='feature1', y='feature2', color='category',
                 title='Feature relationships')
fig.show()
```

## 3. Time-series feature engineering

### 3.1 Core idea

Skip the complex time-series models: extract temporal features from the timestamps, then feed them to a standard model (random forest, XGBoost). This is both practical and easy to implement.

### 3.2 Time-index features

Capture cyclical patterns (hour, weekday) and long-term trends:

```python
import pandas as pd
import numpy as np

def extract_time_features(df, time_col='timestamp'):
    """Extract useful time features from a timestamp column."""
    df = df.copy()
    df[time_col] = pd.to_datetime(df[time_col])

    # Base time features
    df['year'] = df[time_col].dt.year
    df['month'] = df[time_col].dt.month
    df['day'] = df[time_col].dt.day
    df['hour'] = df[time_col].dt.hour
    df['weekday'] = df[time_col].dt.weekday
    df['quarter'] = df[time_col].dt.quarter

    # Cyclical encoding (sin/cos handles wrap-around)
    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
    df['day_sin'] = np.sin(2 * np.pi * df['day'] / 31)
    df['day_cos'] = np.cos(2 * np.pi * df['day'] / 31)
    df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)

    return df

# Usage
df_with_features = extract_time_features(df)
```

### 3.3 Rolling-window features

```python
def add_rolling_features(df, target_col, windows=[3, 7, 14]):
    """Add rolling-window statistics as features."""
    for window in windows:
        df[f'{target_col}_mean_{window}'] = df[target_col].rolling(window=window).mean()
        df[f'{target_col}_std_{window}'] = df[target_col].rolling(window=window).std()
        df[f'{target_col}_min_{window}'] = df[target_col].rolling(window=window).min()
        df[f'{target_col}_max_{window}'] = df[target_col].rolling(window=window).max()
    return df

# Usage
df_with_rolling = add_rolling_features(df_with_features, 'target_value')
```

## 4. Date-format handling

Messy date formats are an everyday nuisance. Python's `datetime` module handles them cleanly.

### 4.1 String to date object

This is the foundation — only once a string is a `datetime` can you freely reformat it.

```python
from datetime import datetime

date_str1 = "2025-12-02 15:30:00"
date_obj1 = datetime.strptime(date_str1, "%Y-%m-%d %H:%M:%S")

date_str2 = "2025/12/2"
date_obj2 = datetime.strptime(date_str2, "%Y/%m/%d")

# Common directives:
# %Y - 4-digit year
# %m - 2-digit month
# %d - 2-digit day
# %H - hour (24h)
# %M - minute
# %S - second
```

### 4.2 Pandas date handling

```python
import pandas as pd

# Parse dates directly on read
df = pd.read_csv('data.csv', parse_dates=['date_column'])

# Or convert later
df['date_column'] = pd.to_datetime(df['date_column'])

# Format for output
df['formatted_date'] = df['date_column'].dt.strftime('%Y-%m-%d')
```

## 5. Advanced data cleaning

### 5.1 Missing-value strategy

The right strategy depends on the data's nature and why values are missing:

- **Drop** — acceptable if only a few rows are affected.
- **Fill** — with a constant (0, mean, median) or a more sophisticated model-based imputation.
- **Analyze** — sometimes the fact that a value is missing is itself a useful feature.

```python
# Drop rows with few non-missing values
df_clean = df.dropna(thresh=len(df.columns) - 2)

# Fill numeric column with mean
df['numeric_col'].fillna(df['numeric_col'].mean(), inplace=True)

# Fill categorical column with mode
mode_value = df['categorical_col'].mode()[0] if not df['categorical_col'].mode().empty else 'Unknown'
df['categorical_col'].fillna(mode_value, inplace=True)

# Missingness indicator feature
df['missing_indicator'] = df['some_col'].isna().astype(int)
```

### 5.2 Data-type correction

Make sure every column has the right type (numeric, datetime, categorical). Wrong types cause silent bugs in analysis and modeling.

```python
df['date'] = pd.to_datetime(df['date'])
df['zip_code'] = df['zip_code'].astype('category')
df['integer_col'] = pd.to_numeric(df['integer_col'], downcast='integer')
df['float_col'] = pd.to_numeric(df['float_col'], downcast='float')
```

### 5.3 Inconsistent data

Inconsistencies come from typos, mixed formats, or different units. Regex and string ops are your friends.

```python
# Normalize street names
df['street'] = df['street'].str.replace('St.', 'Street').str.replace('Rd.', 'Road')
df['street'] = df['street'].str.title()

# Normalize categorical values
df['category'] = df['category'].str.lower().str.strip()
df['category'] = df['category'].replace({'male': 'Male', 'female': 'Female', 'f': 'Female', 'm': 'Male'})
```

### 5.4 Outliers

An outlier is a point far from the rest. It may be a measurement error or a legitimate extreme.

- **Visualize**: box plots and scatter plots reveal them intuitively.
- **Statistical**: use tests or rules of thumb (e.g. more than 3 standard deviations from the mean).
- **Handle**: depending on cause, drop, cap, or transform.

```python
import numpy as np

# IQR method
Q1 = df['value'].quantile(0.25)
Q3 = df['value'].quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

outliers = df[(df['value'] < lower_bound) | (df['value'] > upper_bound)]

# Cap instead of drop
df['value_capped'] = df['value'].clip(lower=lower_bound, upper=upper_bound)

# Or Z-score method
from scipy import stats
z_scores = np.abs(stats.zscore(df['value']))
df_no_outliers = df[z_scores < 3]
```

### 5.5 Duplicates

Duplicate rows distort analysis and should usually be removed.

```python
df_unique = df.drop_duplicates()
df_unique = df.drop_duplicates(subset=['col1', 'col2'])
df_unique = df.drop_duplicates(keep='last')
```

## 6. Feature engineering and ML

### 6.1 Missing values

Real-world databases are rarely complete. Blindly dropping rows loses data; imputation is better.

**Simple imputation:**

```python
from sklearn.impute import SimpleImputer

num_imputer = SimpleImputer(strategy='median')
df[['col1', 'col2']] = num_imputer.fit_transform(df[['col1', 'col2']])

cat_imputer = SimpleImputer(strategy='most_frequent')
df[['cat_col1', 'cat_col2']] = cat_imputer.fit_transform(df[['cat_col1', 'cat_col2']])
```

**Advanced imputation:**

```python
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer

imp = IterativeImputer(random_state=0)
df_imputed = imp.fit_transform(df)
```

### 6.2 The core idea of feature engineering

The features in your data ultimately determine model success. Feature engineering is the art and science of creating new features from existing data to better represent the underlying problem to the model.

**Mutual information (MI)** measures the relationship between two variables and helps identify features with the most predictive power for the target.

```python
from sklearn.feature_selection import mutual_info_regression
import pandas as pd
import numpy as np

def make_mi_scores(X, y, discrete_features):
    """Compute mutual-information scores."""
    mi_scores = mutual_info_regression(X, y, discrete_features=discrete_features)
    mi_scores = pd.Series(mi_scores, name="MI Scores", index=X.columns)
    mi_scores = mi_scores.sort_values(ascending=False)
    return mi_scores

# Usage:
# mi_scores = make_mi_scores(X, y, discrete_features)
# print(mi_scores)
```

### 6.3 Common feature-engineering techniques

```python
# 1. Count encoding - replace category with its frequency
counts = X_train[col].value_counts()
X_train.loc[:, col + '_count'] = X_train[col].map(counts)

# 2. Target encoding - replace category with target mean from training set
encoding = X_train.groupby(col)['target'].mean()
X_train.loc[:, col + '_target'] = X_train[col].map(encoding)

# 3. Binning - turn a continuous feature into discrete buckets
X['feature_binned'] = pd.cut(X['continuous_feature'], bins=5, labels=False)

# 4. Interaction features - combine two or more features
X['interaction'] = X['feature1'] * X['feature2']

# 5. Aggregation features - derive stats from grouped data
agg_features = df.groupby('category').agg({
    'value': ['mean', 'std', 'count'],
}).reset_index()
agg_features.columns = ['category', 'value_mean', 'value_std', 'value_count']
```

## 7. Lessons learned

1. **Define the goal first** — clarify the objective before any processing to avoid needless complexity.
2. **Validate step by step** — check that each operation produces the expected result.
3. **Preserve data integrity** — don't lose important information while cleaning.
4. **Document the process** — record every step for reproducibility and debugging.
5. **Leverage Pandas** — use vectorized operations to boost efficiency.
6. **Cleaning is iterative** — expect it to be a slow, repeated process.
7. **Be systematic** — a structured approach is essential for reliable models.
8. **Reproducibility** — always log your cleaning steps.
9. **Strategy depends on context** — the best approach varies with the data and the goal.
10. **Features decide success** — feature engineering often matters more than model choice.
11. **Avoid leakage** — be careful not to let future information leak into features.

These techniques are what I've gathered from Kaggle competitions and real projects. I hope they help you handle data-science tasks more efficiently. Remember: the heart of data science is solving real problems — tools and tricks are just means, and the key is understanding the story behind the data.
