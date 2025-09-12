---
layout: post
title: Kaggle Notes: Data Visualization
tags: [Learning]
---

In my recent Kaggle visualization practice, I learned that great visuals aren’t just pretty—they tell clear data stories. Starting with messy data, I refined my process through goal-setting, tool selection, and chart optimization. Below are key takeaways and practical tips.

First, I defined clear goals based on the dataset (metrics: performance, regions, categories, time): 1) Compare regional performance; 2) Analyze top categories’ seasonal trends; 3) Explore price-quantity correlation. This avoided "chart for chart’s sake" waste.

Kaggle’s go-to tools: `matplotlib` (control), `seaborn` (style), `plotly` (interactivity). Match tools to needs—seaborn for quick stats, plotly for shareable charts.

For regional performance, a sorted bar chart with labels worked best. Here’s the streamlined code:

```Plain Text

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

df = pd.read_csv("cleaned_data.csv")
sns.set_style("whitegrid")
plt.figure(figsize=(10, 6))

# Group, sort and plot
region_metrics = df.groupby("Region")["Metric"].sum().sort_values(ascending=False)
bar_plot = sns.barplot(x=region_metrics.index, y=region_metrics.values, palette="viridis")

# Add value labels
for i, v in enumerate(region_metrics.values):
    bar_plot.text(i, v + 5000, f"${v:,.0f}", ha="center")

# Clean layout
plt.xlabel("Region", fontweight="bold")
plt.ylabel("Total Metric ($)", fontweight="bold")
plt.title("Total Performance by Region (2024)", fontweight="bold")
sns.despine(top=True, right=True)
plt.tight_layout()
plt.show()
```

Sorting and labels eliminated clutter. Key lesson: **Clarity beats complexity** for comparisons.

For top 3 categories’ trends, I used a line chart with monthly resampling (to reduce noise):

```Plain Text

# Date setup
df["Date"] = pd.to_datetime(df["Date"])
df = df.set_index("Date").sort_index()

# Top categories and monthly trends
top_cats = df.groupby("Category")["Metric"].sum().nlargest(3).index
monthly_trends = df[df["Category"].isin(top_cats)].groupby(["Category", pd.Grouper(freq="M")])["Metric"].mean().reset_index()

# Plot
plt.figure(figsize=(12, 6))
sns.lineplot(data=monthly_trends, x="Date", y="Metric", hue="Category", style="Category", markers=True, linewidth=2)

# Layout
plt.legend(title="Category", bbox_to_anchor=(1.05, 1), loc="upper left")
plt.xlabel("Month", fontweight="bold")
plt.ylabel("Avg Monthly Metric ($)", fontweight="bold")
plt.title("Monthly Trends (Top 3 Categories)", fontweight="bold")
plt.xticks(rotation=45)
sns.despine()
plt.tight_layout()
plt.show()
```

Resampling revealed clear seasonal patterns. Moving the legend outside prevented line overlap—small fixes, big impact.

For price vs. quantity, a scatter plot with regression (color-coded by category) worked:

```Plain Text

plt.figure(figsize=(10, 6))
# Scatter plot with regression
sns.regplot(
    data=df, x="Price", y="Quantity",
    scatter_kws={"hue": df["Category"], "palette": "tab10", "alpha": 0.6},
    line_kws={"color": "black", "linewidth": 2}
)

# Highlight key insight
plt.annotate("Clothing: Price-sensitive", xy=(50, 200), xytext=(60, 250),
             arrowprops=dict(arrowstyle="->", color="red"), color="red")

# Layout
plt.xlabel("Unit Price ($)", fontweight="bold")
plt.ylabel("Quantity", fontweight="bold")
plt.title("Price vs. Quantity (by Category)", fontweight="bold")
sns.despine()
plt.tight_layout()
plt.show()
```

For Kaggle submission, I added Plotly interactivity for easy data exploration:

```Plain Text

import plotly.express as px

# Interactive bar chart
fig = px.bar(
    x=region_metrics.index, y=region_metrics.values,
    labels={"x": "Region", "y": "Total Metric ($)"},
    title="Total Performance by Region (2024)",
    color=region_metrics.index, color_discrete_map="viridis",
    text=[f"${v:,.0f}" for v in region_metrics.values]
)

# Customize hover and layout
fig.update_traces(hovertemplate="Region: %{x}Total Metric: %{y:,.0f}", textposition="outside")
fig.update_layout(showlegend=False, title_x=0.5)

fig.show()
```
