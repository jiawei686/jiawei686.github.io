---
layout: post
title: "Geospatial Analysis"
date: 2026-01-02
tags: [data]
description: "Geospatial data analysis: coordinate systems, spatial joins, and the Python stack for working with maps and geometries."
---

Geospatial analysis is working with data that has a *location* — coordinates, regions, routes. It shows up everywhere once you notice it: delivery zones, disease spread, urban planning, ride-sharing, environmental monitoring, even "which store is nearest." I'm writing this as a practical intro because location data has gotchas (coordinate systems!) that bite newcomers, and a standard Python toolkit that makes the hard parts routine.

## The first gotcha: coordinate reference systems (CRS)

The single most common geospatial bug is mixing coordinate systems. A "point" is meaningless without knowing *what framework* its numbers refer to.

- **Latitude/longitude (EPSG:4326):** degrees on the globe. What you see on Google Maps. Good for storage, bad for measuring distances (a degree of longitude is a different distance near the poles vs. the equator).
- **Projected systems (e.g. Web Mercator EPSG:3857, or local UTM zones):** flat x/y in meters. Needed for accurate distances, areas, and overlaps.

Rule I follow: **store in lat/long, project to a metric CRS for any calculation.** Forgetting this gives distances that are off by orders of magnitude.

## Core operations

- **Spatial join:** attach attributes from one layer to another by location ("which neighborhood is each crime report in?"). This is the geospatial analog of a SQL join, but on geometry instead of a key.
- **Buffering:** "everything within 500m of a river" = buffer the river line by 500m, then intersect.
- **Overlay/intersection:** combine polygons (zip code × flood zone) to find areas in both.
- **Distance & nearest neighbor:** route planning, facility location, "nearest clinic."

## The Python stack

- **GeoPandas:** pandas with geometry columns. Does spatial joins, buffers, overlays, CRS handling. The daily-driver.
- **Shapely:** the geometry engine underneath — points, lines, polygons, and their predicates (intersects, contains, distance).
- **Folium / Plotly / Kepler.gl:** interactive map visualization. Folium (Leaflet-based) is my quick default.
- **OSMnx:** pull real street networks from OpenStreetMap and analyze them (great for network/graph problems).
- **PyProj / rasterio:** CRS transforms and raster (image-like grid) data respectively.

A typical workflow: load shapefiles/GeoJSON with GeoPandas → set/check CRS → do spatial joins/buffers → visualize with Folium. Most "hard" problems reduce to picking the right operation and a correct CRS.

## Practical pitfalls

- **CRS mismatch** between layers → silently wrong results. Always check `.crs` on every layer before joining.
- **Performance:** spatial operations are `O(n²)` if naive; GeoPandas uses spatial indexes (RTree) — make sure they're built (`sindex`).
- **Precision vs. reality:** a "nearest hospital" calculation ignores road networks unless you use network distance (OSMnx), so straight-line distance can mislead.
- **Data size:** large geometries are memory-heavy; simplify polygons (`.simplify()`) when visuals don't need full detail.

## A minimal example

```python
import geopandas as gpd

points = gpd.read_file("incidents.geojson").to_crs(3857)   # metric
zones  = gpd.read_file("districts.geojson").to_crs(3857)
joined = gpd.sjoin(points, zones, how="left", predicate="within")
counts = joined.groupby("district").size()
```

That `to_crs(3857)` on both layers is the step people skip and then wonder why the join returns nothing.

## My take

Geospatial work is 20% clever algorithms and 80% *getting coordinate systems and joins right*. The toolkit (GeoPandas/Shapely) is mature and pleasant; the craft is knowing which spatial operation matches your question and respecting the CRS. If you're starting out, internalize "store lat/long, compute in a metric projection, always verify CRS before a spatial join" and you'll avoid the mistakes that cost most of the debugging time. Location data is everywhere — once these basics click, a huge class of "where" questions becomes straightforward.
