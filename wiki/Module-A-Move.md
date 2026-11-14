# Module A — Move (Pedestrian Route Intelligence)

## Overview

**Move** provides transparent, explainable contextual information along walking routes. Rather than computing opaque, subjective "safety scores", ResQ measures verifiable **Route Context Coverage** (0 to 100%) and generates auditable **Route Context Intelligence**.

---

## 1. Mathematical Decoupling: Data Availability vs. Daylight

In early iterations, data coverage scoring mixed mapped features with astronomical daylight, causing an identical mapped street to receive a much lower score at night. In `ResQ`, this is strictly decoupled:

$$\text{Total Context Coverage} = \text{Amenity Score (max 50)} + \text{Imagery Score (max 50)}$$

$$\text{Amenity Density} = \frac{\text{Features Count}}{\text{Distance (m)}} \times 100$$

$$\text{Amenity Score} = \min\left(50, \text{Amenity Density} \times 12.5\right)$$

* **Daylight Position** is calculated independently via standard NOAA solar zenith equations and reported under `walkingConditions`:
  * `DAYLIGHT`: Solar elevation $> 0^\circ$
  * `CIVIL_TWILIGHT`: Solar elevation between $0^\circ$ and $-6^\circ$
  * `NAUTICAL_TWILIGHT`: Solar elevation between $-6^\circ$ and $-12^\circ$
  * `ASTRONOMICAL_TWILIGHT`: Solar elevation between $-12^\circ$ and $-18^\circ$
  * `NIGHT`: Solar elevation $< -18^\circ$
* **Mathematical Invariant:** The context coverage score of any given route is identical at noon and midnight.

---

## 2. Contextual Alternative Ranking (`rankAndCompareRouteAlternatives`)

When a user searches for a route, the routing engine (OSRM Foot) returns multiple candidate paths. Instead of automatically labeling the first returned route as "Recommended", `routeIntelligenceService.js` evaluates all alternatives:

* Evaluates along-route open storefronts at estimated time of arrival (ETA).
* Evaluates road classification mix (percentage of arterial roads vs unlit pedestrian paths).
* Evaluates street-level imagery coverage.
* Assigns descriptive contextual badges:
  * `Best Lit Corridor`: Routes with high major-road share and verified open venues.
  * `Active Storefronts`: Routes with continuous open shops at passing time.
  * `Fastest Walk`: Routes that prioritize distance/time over lit corridors.
* Generates clear trade-off summaries (e.g., *"Adds 3 minutes (180m), but traverses 82% main streets with 4 open storefronts at arrival time"*).

---

## 3. Multi-Point Polyline Imagery Sampling

Legacy implementations only checked for street-level photos within 100 meters of the origin. In `ResQ`, `useStreetImagery.ts` samples multiple points along the complete route polyline:
* Start point (origin)
* Midpoint ($50\%$ along the route polyline)
* Destination point

This ensures imagery presence reflects the entire walking corridor rather than just the user's departure location.

---

## 4. Honest Disclosures & Ground-Truth Limitations

The application presents prominent disclosures regarding data limitations:
1. **OSM Opening Hours:** Opening hours are crowd-sourced and may be unverified or outdated.
2. **Verified Support Registry:** Empty by default (`0` points). Only independently audited, 24/7 public assistance desks with active audit timestamps are registered.
3. **Non-Safety Disclaimer:** *"This application provides factual information about mapped infrastructure. It does not measure, infer, or guarantee personal safety."*

