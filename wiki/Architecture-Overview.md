# Platform Architecture & Design

> Technical architecture, subsystem contracts, and data-flow specifications for the **ResQ** unified women's safety platform.

---

## 1. Monorepo Subsystem Topology

ResQ is architected as an npm-workspaces monorepo designed for high-performance execution, zero cloud telemetry, and client-side resilience:

```text
ResQ/
├── packages/
│   ├── core/                    # Shared TypeScript Domain & Algorithms Engine
│   │   ├── domain/              # Authority registries, route interfaces, scoring
│   │   ├── providers/           # OSRM, Overpass, Panoramax clients
│   │   └── services/            # Twilight math, grievance draftsman, protect engine
│   ├── server/                  # Fastify High-Throughput Geospatial Gateway
│   │   └── src/
│   │       ├── cache/           # TTL memoization & stampede shields
│   │       ├── routes/          # Pedestrian, corridor, protect, act, navigator APIs
│   │       └── services/        # Gemini client with prompt isolation guardrails
│   └── mobile/                  # React Native 0.88 & Expo 58 Mobile Client
│       └── src/
│           ├── components/      # MapLibre Native canvas, RouteCards, SOS Modal
│           ├── hooks/           # useWalkingRoute, useStreetImagery, useRouteContext
│           ├── screens/         # ExploreScreen, NavigateScreen, ProtectScreen, ActScreen
│           └── services/        # On-device multi-table SQLite storage engine
└── wiki/                        # GitHub Wiki Documentation
```

---

## 2. Pillar 1: Move (Route Context Intelligence)

The Move subsystem computes pedestrian route alternatives, evaluating physical environmental context rather than synthetic "safety ratings":

1. **Routing:** Queries OpenStreetMap-based pedestrian routing (OSRM Foot engine) with client-side fallback.
2. **Corridor Feature Aggregation:** Samples amenities within a 120-meter corridor along the polyline using the OpenStreetMap Overpass API.
3. **Decoupled Scoring:**
   - **Amenity Density Score:** Computes commercial/transit nodes per 100m.
   - **Astronomical Solar Calculation:** Uses NOAA General Modeling equations to determine true solar elevation, astronomical twilight, and day/night transitions for the exact location and time.
4. **Street-Level Imagery:** Probes the decentralized open-source Panoramax imagery network for actual 360° street photos along the route.

---

## 3. Pillar 2: Protect (Incident Evidence Vault)

The Protect subsystem helps victims of digital stalking and harassment preserve contemporaneously verifiable evidence:

1. **Local SQLite Persistence:** Records are committed strictly to the on-device SQLite database (`walking_companion.db`). Zero telemetry leaves the phone.
2. **Cryptographic SHA-256 Digest:** Immediately upon logging an incident, a SHA-256 hash is generated binding the timestamp, sender handle, platform, factual statement, and evidence reference.
3. **Temporal Graph Analysis:** Analyzes chronological contact patterns to detect:
   - Escalating contact frequency
   - Cross-platform convergence (e.g. moving from Instagram to WhatsApp/Call)
   - Account block evasion
   - Off-hours contact attempts (night-time harassment)
4. **Digital Exposure Audit:** A client-side analyzer checks social media bios and public posts for accidental leaks of hostel rooms, daily commute schedules, or phone numbers.

---

## 4. Pillar 3: Act (Statutory Grievance Navigator)

The Act subsystem bridges administrative inaction with official Indian statutory remediation mechanisms:

1. **Deterministic Authority Matching:** Matches complaints to verified statutory bodies:
   - **UGC e-Samadhaan:** Hostel sanitation, administrative neglect (20-day statutory resolution mandate).
   - **UGC Anti-Ragging Cell:** Campus ragging, coercion, intimidation (Immediate escalation).
   - **Internal Complaints Committee (ICC):** College sexual harassment under PoSH Act 2013.
   - **FSSAI FoSCoS:** Mess food adulteration, contamination, food poisoning.
   - **National Cyber Crime Portal (1930):** Digital stalking, threatening DMs, morphing.
   - **National Commission for Women (NCW):** Institutional apathy, systemic violence.
2. **Formal Representation Drafting:** Formats factual chronologies, legal citations, and evidentiary annexures into formal representation letters.
3. **Assisted Portal Handoff & Email:**
   - Pre-fills statutory authority emails (`helpline@antiragging.in`, `complaints-ncw@nic.in`, `contact.ugc@nic.in`).
   - Generates 1-tap clipboard pills for manual entry on government portals requiring CAPTCHA/OTP verification.

---

## 5. Defense & Privacy Layer

1. **Stealth Calculator Disguise:** Replaces the entire screen with a fully operational, authentic calculator. Entering a secret PIN sequence (`112=`) unlocks the application.
2. **Emergency SOS Hub:**
   - 1-tap live GPS SMS dispatch to trusted contacts.
   - Direct emergency speed dialers for 112, 1091, 181, and 1090.
3. **1-Tap Hard Wipe:** A single tap immediately executes:
   ```sql
   DELETE FROM saved_journeys;
   DELETE FROM recent_searches;
   DELETE FROM saved_incidents;
   DELETE FROM saved_grievances;
   DELETE FROM emergency_contacts;
   DELETE FROM app_security_settings;
   VACUUM;
   ```
