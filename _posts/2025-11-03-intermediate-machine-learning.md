---
layout: post
title: "Intermediate Machine Learning"
date: 2025-11-03
categories: [Learning]
---

**Core Idea**: Bridge the gap between introductory models and real-world applications by tackling common, complex issues like missing data, categorical features, and data leakage. This course focuses on building robust and efficient machine learning workflows.

## 1. Handling Missing Values

Real-world datasets are rarely complete. Simply dropping rows with missing values can lead to significant data loss. A better approach is imputation.

### 1.1 Simple Imputation

Fill missing values with the mean, median, or most frequent value of the column. This is a quick and easy baseline.

```python
from sklearn.impute import SimpleImputer

# Impute with mean
imputer = SimpleImputer(strategy='mean')
X_train_imputed = imputer.fit_transform(X_train)
```

### 1.2 Advanced Imputation

For more complex scenarios, consider model-based imputation (e.g., using `KNNImputer`) or creating an indicator column to signal that a value was imputed, which can sometimes provide useful information to the model.

## 2. Encoding Categorical Variables

Machine learning models require numerical input. Categorical data (like 'Red', 'Green', 'Blue') must be converted.

### 2.1 One-Hot Encoding

Creates a new binary column for each category. This is effective for low-cardinality features (few unique categories) but can lead to a very wide dataset if there are many categories.

```python
from sklearn.preprocessing import OneHotEncoder

# Apply one-hot encoder
OH_encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
OH_cols_train = pd.DataFrame(OH_encoder.fit_transform(X_train[categorical_cols]))
```

### 2.2 Label Encoding

Assigns a unique integer to each category. This can be risky as it may imply an ordinal relationship (e.g., 1 < 2 < 3) where none exists.

## 3. Building Pipelines

Pipelines are essential for clean, reproducible, and deployment-ready code. They bundle preprocessing and modeling steps into a single workflow, preventing common errors like data leakage.

```python
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor

# Define preprocessing steps and model
my_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                              ('model', RandomForestRegressor(n_estimators=50, random_state=0))])
# Train the model
my_pipeline.fit(X_train, y_train)
```

## 4. Using Cross-Validation

Instead of a single train-test split, cross-validation uses multiple splits to provide a more robust estimate of model performance. This helps ensure your model will generalize well to new, unseen data.

```python
from sklearn.model_selection import cross_val_score

# Get cross-validation scores
scores = -1 * cross_val_score(my_pipeline, X, y,
                              cv=5,
                              scoring='neg_mean_absolute_error')
print("MAE scores:", scores)
```

## 5. Mastering XGBoost

XGBoost (Extreme Gradient Boosting) is a powerful and highly efficient algorithm that often wins competitions. It's an implementation of gradient boosted decision trees designed for speed and performance.

```python
from xgboost import XGBRegressor

# Define and train the XGBoost model
xgb_model = XGBRegressor(n_estimators=1000, learning_rate=0.05, n_jobs=4)
xgb_model.fit(X_train, y_train, 
             early_stopping_rounds=5, 
             eval_set=[(X_valid, y_valid)], 
             verbose=False)
```

## 6. Preventing Data Leakage

Data leakage is one of the most insidious problems in machine learning. It occurs when your training data contains information about the target, but similar data will not be available when the model is used for prediction. Using pipelines and proper cross-validation are your best defenses.

**Key Takeaways**:

*   Systematically handle missing values and categorical data.
*   Use pipelines to create clean, robust, and deployable models.
*   Rely on cross-validation for a more accurate measure of model performance.
*   Employ powerful algorithms like XGBoost for structured data tasks.
*   Always be vigilant about preventing data leakage.
