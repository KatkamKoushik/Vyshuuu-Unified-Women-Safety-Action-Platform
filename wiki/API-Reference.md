# API Reference Specification

## Overview

The backend gateway (`packages/server`) is built on **Fastify 5**, providing a hardened REST API with in-memory TTL caching, in-flight request deduplication, rate limiting, and RFC 7807 structured error responses.

Base URL: `http://localhost:3000` (or `http://10.0.2.2:3000` from Android Emulator).

---

## 1. System & Health

### `GET /health`
Returns gateway runtime metrics, uptime, cache statistics, and memory telemetry.

* **Response (HTTP 200)**:
  ```json
  {
    "status": "ok",
    "service": "vyshuuu Geospatial Gateway",
    "version": "1.0.0",
    "uptime": 1420,
    "cacheEntries": 12,
    "memory": {
      "heapUsedMb": 24.15,
      "heapTotalMb": 38.5,
      "rssMb": 62.18
    },
    "timestamp": "2026-11-13T18:00:00.000Z"
  }
  ```

---

## 2. Module A — Move (Geospatial & Routing)

### `POST /api/v1/routes/pedestrian`
Computes pedestrian routes via OSRM with in-flight deduplication.

* **Request Body**:
  ```json
  {
    "origin": { "latitude": 12.9756, "longitude": 77.6066 },
    "destination": { "latitude": 12.9719, "longitude": 77.6070 }
  }
  ```

### `POST /api/v1/context/corridor`
Retrieves physical amenities within 120 meters of the walking route polyline.

* **Request Body**:
  ```json
  {
    "coordinates": [[77.6066, 12.9756], [77.6070, 12.9719]],
    "maxCorridorDistanceMeters": 120
  }
  ```

---

## 3. AI Safety Navigator & Triage

### `POST /api/v1/navigator/triage`
Performs safety triage, emergency filter detection, and intent classification.

* **Request Body**:
  ```json
  {
    "query": "A rat bit my foot in hostel room 204 and warden ignored me."
  }
  ```
* **Response (HTTP 200)**:
  ```json
  {
    "ok": true,
    "isEmergency": false,
    "intent": "ACT",
    "title": "Act — Statutory Grievance Assistant",
    "guidance": "I can help you build an evidence-backed formal grievance...",
    "actionPill": {
      "label": "Open Act Assistant",
      "targetScreen": "ActScreen",
      "initialPayload": { "initialStatement": "..." }
    },
    "disclaimer": "vyshuuu is an informational decision-support assistant..."
  }
  ```

---

## 4. Module B — Protect (Incident Vault)

### `POST /api/v1/protect/analyze`
Builds a temporal incident graph and surfaces behavioral patterns (legacy alias `/api/v1/stalkledger/analyze`).

* **Request Body**:
  ```json
  {
    "incidents": [
      {
        "id": "inc_1",
        "timestamp": "2026-11-10T23:30:00Z",
        "platform": "INSTAGRAM",
        "senderHandle": "@shadow_user",
        "messageContent": "Saw you studying at library",
        "wasBlockedPrior": false
      },
      {
        "id": "inc_2",
        "timestamp": "2026-11-11T01:15:00Z",
        "platform": "WHATSAPP",
        "senderHandle": "+91 98765 43210",
        "messageContent": "You blocked me on IG so messaging here",
        "wasBlockedPrior": true
      }
    ]
  }
  ```

### `POST /api/v1/protect/audit-exposure`
Voluntary privacy audit for social media bios or status text (legacy alias `/api/v1/stalkledger/audit-exposure`).

* **Request Body**:
  ```json
  {
    "textContent": "CS Undergrad @ Univ | Ganga Hostel Room 204 | Daily 6pm at library!"
  }
  ```

---

## 5. Module C — Act (Statutory Grievance Navigator)

### `GET /api/v1/act/authorities`
Returns the verified statutory authority directory (legacy alias `/api/v1/herproof/authorities`).

### `POST /api/v1/act/cases/intake`
Evaluates case statement, matches statutory authority, and returns 3 clarifying questions (legacy alias `/api/v1/herproof/cases/intake`).

### `POST /api/v1/act/cases/compose`
Synthesizes formal representation markdown, SHA-256 evidence annexures table, and 1-tap clipboard pills (legacy alias `/api/v1/herproof/cases/compose`).

* **Request Body**:
  ```json
  {
    "complainantName": "Aarohi S.",
    "studentId": "STU-2024-ENG-082",
    "institutionName": "Apex National Engineering University",
    "hostelOrLocation": "Ganga Girls Hostel, Room 204",
    "category": "HOSTEL_SANITATION",
    "incidentDate": "12th November 2026, 02:30 AM",
    "rawNarrative": "While asleep, a large rodent entered through broken window mesh and bit my right foot...",
    "priorSteps": "Informed warden on Nov 5 and Nov 8 with no response.",
    "reliefRequested": "Immediate fumigation and window mesh repair.",
    "evidenceItems": [
      {
        "name": "hospital_slip.jpg",
        "type": "image/jpeg",
        "capturedAt": "2026-11-12T04:15:00Z",
        "digestHex": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
      }
    ]
  }
  ```

---

## 6. Document & Manifest Exporters

### `POST /api/v1/export/grievance-package`
Generates a downloadable Markdown representation package with SHA-256 package checksum.

### `POST /api/v1/export/incident-timeline`
Exports a structured chronological JSON manifest with individual incident hashes (legacy alias `/api/v1/export/stalkledger-timeline` supported).

