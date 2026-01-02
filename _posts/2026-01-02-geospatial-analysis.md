---
layout: post
title: "Geospatial Analysis"
date: 2026-01-02
categories: [Learning]
---

**Core Idea**: Geospatial analysis unlocks insights from data that has a location component. This course introduces the tools and techniques for working with geospatial data, creating interactive maps, and uncovering spatial patterns using libraries like GeoPandas.

## 1. What is Geospatial Data?

Geospatial data is information that describes objects, events, or other features with a location on or near the surface of the earth. It typically combines location information (like coordinates) with attribute information (the characteristics of the object, event, or phenomenon).

*   **Vector Data**: Represents geographic features as points, lines, and polygons.
*   **Raster Data**: Represents data in a grid of cells, like satellite imagery or elevation models.

## 2. Introduction to GeoPandas

GeoPandas is an open-source project that makes working with geospatial data in Python easier. It extends the datatypes used by pandas to allow spatial operations on geometric types. GeoPandas objects can act just like pandas DataFrames and can be used for a wide range of spatial analysis tasks.

```python
import geopandas as gpd

# Load a shapefile
world = gpd.read_file(gpd.datasets.get_path("naturalearth_lowres"))
```

## 3. Interactive Maps with Folium

Folium is a powerful Python library that helps you create several types of interactive maps. It builds on the data wrangling strengths of the Python ecosystem and the mapping strengths of the Leaflet.js library.

```python
import folium

# Create a map centered on a specific location
m = folium.Map(location=[45.5236, -122.6750], zoom_start=13)

# Add a marker
folium.Marker(
    location=[45.5236, -122.6750],
    popup="Portland",
    icon=folium.Icon(icon="cloud"),
).add_to(m)
```

## 4. Spatial Joins

A spatial join is similar to a regular DataFrame join, but instead of joining on a common column, it joins based on the spatial relationship between the geometries of the two DataFrames. This is a fundamental operation for combining different geospatial datasets.

```python
# Perform a spatial join
joined_data = gpd.sjoin(gdf1, gdf2, how="inner", op="intersects")
```

## 5. Proximity Analysis

Proximity analysis is used to answer questions about the distance between features. For example, you could find all the schools within a certain distance of a park.

```python
# Create a buffer around points
buffers = gdf.buffer(1000) # 1000-meter buffer
```

**Key Takeaways**:

*   Geospatial analysis provides a powerful new lens through which to analyze your data.
*   GeoPandas is the essential tool for working with vector data in Python.
*   Folium makes it easy to create beautiful and interactive maps.
*   Spatial joins and proximity analysis are fundamental techniques for combining and analyzing geospatial data.
