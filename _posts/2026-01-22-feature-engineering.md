---
layout: post
title: "Feature Engineering"
date: 2026-01-22
categories: [Learning]
---

**Core Idea**: The features in your data will ultimately determine the success of your model. Feature engineering is the art and science of creating new features from existing data to better represent the underlying problem to the machine learning model.

## 1. Mutual Information

Mutual information (MI) is a measure of the relationship between two variables. It can be used to identify features that have the most potential to be good predictors of the target variable. A higher MI score indicates a stronger relationship.

```python
from sklearn.feature_selection import mutual_info_regression

# Calculate mutual information scores
mi_scores = mutual_info_regression(X, y)
mi_scores = pd.Series(mi_scores, name="MI Scores", index=X.columns)
mi_scores = mi_scores.sort_values(ascending=False)
```

## 2. Creating Features

Often, the most informative features are not the raw data points themselves, but combinations or transformations of them.

### 2.1 Interaction Features

Combine two or more features to create a new one. For example, you could multiply two features together to capture their interaction effect.

### 2.2 Polynomial Features

Create polynomial features to capture non-linear relationships in the data.

```python
from sklearn.preprocessing import PolynomialFeatures

# Create polynomial features
poly = PolynomialFeatures(degree=2, include_bias=False)
poly_features = poly.fit_transform(X)
```

## 3. Target Encoding

Target encoding is a powerful technique for encoding categorical features. It replaces each category with the average value of the target variable for that category. This can be very effective, but it also carries a high risk of overfitting and data leakage if not done carefully.

```python
import category_encoders as ce

# Create target encoder
target_encoder = ce.TargetEncoder()
X_encoded = target_encoder.fit_transform(X, y)
```

## 4. Clustering

You can use clustering algorithms like K-Means to group similar data points together. The cluster labels can then be used as a new categorical feature.

```python
from sklearn.cluster import KMeans

# Create K-Means model and get cluster labels
kmeans = KMeans(n_clusters=6)
X["Cluster"] = kmeans.fit_predict(X)
X["Cluster"] = X["Cluster"].astype("category")
```

## 5. Principal Component Analysis (PCA)

PCA is a dimensionality reduction technique that can be used to create a smaller set of uncorrelated features (principal components) from a larger set of correlated features. These new features can be more informative and can help to improve model performance.

```python
from sklearn.decomposition import PCA

# Create PCA model
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X)
```

**Key Takeaways**:

*   Feature engineering is a crucial step in the machine learning workflow.
*   Use mutual information to identify potentially useful features.
*   Get creative with feature creation, but always be mindful of overfitting.
*   Target encoding is a powerful but risky technique.
*   Clustering and PCA can be used to create new, more informative features.
