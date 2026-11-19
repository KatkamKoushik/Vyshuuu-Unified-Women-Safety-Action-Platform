# ResQ — Production Readiness Master Backlog

**Repository:** https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform

**Review date:** 2026-11-19  |  **Reviewed commit:** `bdc188173945584d4cbf269490906b44a7e42ed6`

**Priorities:** P0 = blocker before safety-sensitive pilot; P1 = before general release; P2 = hardening/polish. **Kinds:** F = confirmed source finding, R = recommended requirement, T = test/verification.

## Scope and methodology
Reviewed the public GitHub repository via the GitHub connector at the pinned `main` commit, including full recursive tree, package/configuration files, selected source files in all three packages, CI, Docker, mobile native components and web dashboard. This is a **source review**, not a successful build, penetration test, deployment, on-device test or certification. A finding (F) is grounded directly in inspected source. A requirement (R) is a recommended addition/hardening task and does **not** imply the feature was exhaustively proven absent. A test (T) is a verification gate.

## Executive result
**Not yet ready for unsupervised safety-critical production use.** Highest blockers: simulated 'safe' route on the dashboard, invented destination, iOS map fallback to iframe, unencrypted sensitive SQLite, weak resettable PIN gate, no verified SOS delivery, unconfigured production gateway, provider quota/SLA dependence, and potential browser srcdoc script-context injection.

## Suggested sequence
1. **Release freeze / truthfulness:** remove simulated route paths/ratings and fabricated examples from production; validate iOS map; remove misleading SOS/evidence claims.
2. **Privacy and safety baseline:** encrypted vault, immutable evidence bytes/manifest, correct wipe, safe SOS UX, provider consent, real production gateway URL.
3. **Functional beta:** real routing and geocoding provider plan; staging, CI test gates, E2E Android/iOS, device and carrier drills, legal review.
4. **Optional live-response features:** consented SOS orchestration, acknowledgment state, verified contacts, rate limiting, expiring temporary location, provider incident operations.
5. **GA and scale:** release signing, staged rollout, SLOs, on-call/provider contracts, observability, auditing, ongoing security reviews.

## Production acceptance criteria
- Emergency call flow works with app server down, GPS denied, and data network absent.
- No UI labels a synthetic route as real or safe.
- Actual native Android/iOS release builds and physical-device emergency tests pass.
- Private evidence is encrypted and decryptable only with authorized key material.
- Original evidence bytes survive app restarts; every hash verifies on export; incorrect hashes fail visibly.
- No SOS attempt is marked sent/delivered without a corresponding event or user confirmation.
- All third-party endpoints, data transmissions, providers, licensing, and retention are disclosed accurately.
- Server deployment has HTTPS, bounded input, meaningful rate controls, monitoring, and rollback.
- The app is accessible in its supported languages and has a privacy-aware support process.

## Source links
- [packages/server/src/dashboard/dashboardHtml.ts](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/server/src/dashboard/dashboardHtml.ts)
- [packages/mobile/src/hooks/useWalkingRoute.ts](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/mobile/src/hooks/useWalkingRoute.ts)
- [packages/mobile/src/components/MapComponent.tsx](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/mobile/src/components/MapComponent.tsx)
- [packages/mobile/src/components/MapComponent.web.tsx](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/mobile/src/components/MapComponent.web.tsx)
- [packages/mobile/src/components/common/EmergencySosModal.tsx](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/mobile/src/components/common/EmergencySosModal.tsx)
- [packages/mobile/src/components/common/VaultSecurityModal.tsx](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/mobile/src/components/common/VaultSecurityModal.tsx)
- [packages/mobile/src/components/common/CalculatorDisguiseModal.tsx](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/mobile/src/components/common/CalculatorDisguiseModal.tsx)
- [packages/mobile/src/services/storageService.ts](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/mobile/src/services/storageService.ts)
- [packages/mobile/src/services/evidenceHasher.ts](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/mobile/src/services/evidenceHasher.ts)
- [packages/mobile/src/screens/ProtectScreen.tsx](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/mobile/src/screens/ProtectScreen.tsx)
- [packages/mobile/src/screens/ActScreen.tsx](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/mobile/src/screens/ActScreen.tsx)
- [packages/mobile/App.tsx](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/mobile/App.tsx)
- [packages/core/services/stalkLedgerEngine.js](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/core/services/stalkLedgerEngine.js)
- [packages/core/services/contextScoringService.js](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/core/services/contextScoringService.js)
- [packages/server/src/services/geminiClient.ts](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/server/src/services/geminiClient.ts)
- [packages/server/src/server.ts](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/server/src/server.ts)
- [packages/server/src/cache/cacheService.ts](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/server/src/cache/cacheService.ts)
- [packages/server/src/routes/geocodeRoutes.ts](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/packages/server/src/routes/geocodeRoutes.ts)
- [.github/workflows/ci.yml](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/.github/workflows/ci.yml)
- [docker-compose.yml](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/docker-compose.yml)
- [eslint.config.js](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/eslint.config.js)
- [README.md](https://github.com/KatkamKoushik/Vyshuuu-Unified-Women-Safety-Action-Platform/blob/bdc188173945584d4cbf269490906b44a7e42ed6/README.md)

## Provider references
- https://routing.openstreetmap.de/about.html (FOSSGIS routing request policy)
- https://operations.osmfoundation.org/policies/tiles/ (tile attribution, caching and best-effort access)
- https://github.com/komoot/photon (Photon demo API)
- https://ai.google.dev/gemini-api/docs/logs-policy (Gemini API project logging and retention)
- https://ai.google.dev/gemini-api/terms (Gemini API service terms)


## 01 — Confirmed source-level problems (F = finding)

- [x] **REQ-001 [P0/F]** Remove dashboard simulated pedestrian routes, fixed distance, and duration from production; show routing unavailable instead.
- [x] **REQ-002 [P0/F]** Remove invented Nearby Park & Promenade destination generated from GPS offsets; require a verified place or explicit choice.
- [x] **REQ-003 [P0/F]** Replace safe route calculated messaging with accurate routing-result language and limitations.
- [x] **REQ-004 [P0/F]** Ship a native iOS map implementation; the current non-Android branch selects a web iframe.
- [x] **REQ-005 [P0/F]** Encrypt saved incidents, contact numbers, grievance drafts, and documents at rest, not only behind a UI PIN.
- [x] **REQ-006 [P0/F]** Replace fixed-salt fast-SHA256 four-digit PIN storage with device-keystore-based content encryption and suitable PIN derivation.
- [x] **REQ-007 [P0/F]** Remove the redundant PIN hash stored in normal SQLite.
- [x] **REQ-008 [P0/F]** Make lockout state persist across re-mount/restart and use device-level authentication controls.
- [x] **REQ-009 [P0/F]** Correct SOS messaging: launching SMS composer is not successful transmission or delivery.
- [x] **REQ-010 [P0/F]** Require a production HTTPS gateway URL in release builds instead of device-local localhost/127.0.0.1 defaults.
- [x] **REQ-011 [P0/F]** Secure JSON inserted into MapComponent.web srcDoc script context; prevent HTML/script breakout and sandbox the iframe.
- [x] **REQ-012 [P1/F]** Remove static example incident records and fabricated sample digests from the real web incident list.
- [x] **REQ-013 [P1/F]** Replace dashboard fallback incident-analysis conclusions with honest unavailable results.
- [x] **REQ-014 [P1/F]** Persist real browser incident drafts in an encrypted vault or explicitly support ephemeral session-only data.
- [x] **REQ-015 [P1/F]** Stop representing metadata-only evidence checksums as proof of original file content.
- [x] **REQ-016 [P1/F]** Retain an encrypted original attachment; current file picker hashes a cache copy but stores mainly a textual reference.
- [x] **REQ-017 [P1/F]** Include evidence reference, prior-block marker, and other relevant fields in canonical incident integrity manifests.
- [x] **REQ-018 [P1/F]** Validate message size before hashing; silent 2,048-character truncation breaks later verification.
- [x] **REQ-019 [P1/F]** Unify React state updates and reroute execution to prevent using a stale origin immediately after setOrigin().
- [x] **REQ-020 [P1/F]** Resolve app distance-policy inconsistency: route rejection >15km while guidance refers to <5km.
- [x] **REQ-021 [P1/F]** Fix valid GPS lat=0 or lon=0 being mistaken for missing in SOS with truthiness checks.
- [x] **REQ-022 [P1/F]** Use a single shared promise for async SQLite open/schema initialization to avoid races.
- [x] **REQ-023 [P1/F]** Make local hard-wipe remove SecureStore credentials, cached attachments, exports, and other product-owned copies.
- [x] **REQ-024 [P1/F]** Avoid saying SQLite DELETE+VACUUM is guaranteed forensic/cryptographic secure erase.
- [x] **REQ-025 [P1/F]** Load private grievance records only after authorization, not merely on selecting the vault subtab.
- [x] **REQ-026 [P1/F]** Review the calculator disguise: built-in 112/2026 codes, triple-clear, and header-tap shortcuts defeat a secret-disguise claim.
- [x] **REQ-027 [P1/F]** Add explicit Gemini request deadlines/cancellation; existing generateContent fetches have no timeout.
- [x] **REQ-028 [P1/F]** Validate Gemini response fields after JSON.parse instead of trusting parsed model output.
- [x] **REQ-029 [P1/F]** Constrain navigator chat message count, role, per-message size, and total token cost.
- [x] **REQ-030 [P1/F]** Do not equate cross-platform contacts with one identified perpetrator in a HIGH-severity heuristic.
- [x] **REQ-031 [P1/F]** Pass the actual local timezone for off-hours incident analysis instead of default UTC.
- [x] **REQ-032 [P1/F]** Correct inaccurate web map attribution behavior when attributionControl is disabled.
- [x] **REQ-033 [P1/F]** Enable ESLint for active TypeScript/TSX code; current configuration targets JS and MJS only.
- [x] **REQ-034 [P1/F]** Replace hard-coded CI passing and test-count badges with live reports.
- [x] **REQ-035 [P1/F]** Actually connect Redis/PostGIS if needed or remove claims implying they currently handle requests.
- [x] **REQ-036 [P1/F]** Use strict browser CORS allowlists and enforce a dashboard content security policy.
- [x] **REQ-037 [P2/F]** Validate geocode limit before arithmetic; nonnumeric inputs currently can yield NaN.
- [x] **REQ-038 [P2/F]** Validate corridor point geographic ranges and prevent oversized geographic bounding boxes.
- [x] **REQ-039 [P2/F]** Fix rerouting UI that clears the rerouting state before state-driven new-origin requests finish.
- [x] **REQ-040 [P2/F]** Do not label session-only GPS coordinates live tracking when they are a one-time fix.

## 02 — SOS and emergency operations

- [ ] **REQ-041 [P0/R]** Define SOS state machine: idle, triggered, preparing, composing, submitted, provider-accepted, delivered/unknown, acknowledged, closed.
- [ ] **REQ-042 [P0/R]** Offer one-tap official emergency dialer that works without a backend or account.
- [ ] **REQ-043 [P0/R]** Distinguish locally prepared SMS from verified provider send and actual recipient acknowledgement.
- [ ] **REQ-044 [P0/R]** Provide a manual call fallback when SMS or data networks fail.
- [ ] **REQ-045 [P0/R]** Add an explicit cancel/false-alarm workflow with a safe delay and clear user control.
- [ ] **REQ-046 [P0/R]** Add trusted-contact enrollment with opt-in consent, number verification, and test alert.
- [ ] **REQ-047 [P0/R]** Use fresh, timestamped location with horizontal accuracy; communicate when last known or unavailable.
- [ ] **REQ-048 [P0/R]** Give users a choice to trigger SOS even if the GPS permission or fix is missing.
- [ ] **REQ-049 [P0/R]** Design safe failure for airplane mode, dead data, poor GPS, zero credits, and denied permissions.
- [ ] **REQ-050 [P1/R]** For opted-in cloud dispatch, create idempotent SOS jobs, delivery-provider webhooks, and acknowledgement receipts.
- [ ] **REQ-051 [P1/R]** Encrypt and minimize emergency location events and expire them automatically.
- [ ] **REQ-052 [P1/R]** Add authenticated temporary live-location sharing that can be revoked immediately.
- [ ] **REQ-053 [P1/R]** Add contact escalation order and anti-spam cooldown with clear evidence of which contacts were reached.
- [ ] **REQ-054 [P1/R]** Allow an emergency contact to acknowledge and return a safe-response status.
- [ ] **REQ-055 [P1/R]** Make emergency response options safe in app-background/locked-screen scenarios within OS restrictions.
- [ ] **REQ-056 [P1/R]** Ensure offline emergency instructions, local dialer, and cached contacts remain available.
- [ ] **REQ-057 [P1/R]** For any future automatic relay, contract a provider that supports delivery receipts and local legal requirements.
- [ ] **REQ-058 [P1/R]** Avoid implying 112 is a programmable dispatch integration unless an official integration exists.
- [ ] **REQ-059 [P1/T]** Conduct supervised real-carrier, real-device SOS drills without sending unsolicited distress messages.
- [ ] **REQ-060 [P2/R]** Provide post-event follow-up, reviewable event timeline, and safe deletion options.

## 03 — Evidence vault, chain of custody and privacy

- [ ] **REQ-061 [P0/R]** Use hardware-backed OS keystore to protect random data-encryption keys; never derive all encryption directly from a four-digit PIN.
- [ ] **REQ-062 [P0/R]** Use authenticated encryption (AEAD) and per-record or per-file nonces.
- [ ] **REQ-063 [P0/R]** Make evidence retention durable even after document picker cache cleanup.
- [ ] **REQ-064 [P0/R]** Maintain original immutable bytes alongside derived thumbnails, hashes, and metadata.
- [ ] **REQ-065 [P0/R]** Never claim a SHA-256 digest proves the original sender, timestamp authenticity, or legal admissibility.
- [ ] **REQ-066 [P1/R]** Build a versioned canonical manifest describing device creation time, claimed event time, timezone, evidence bytes, and SHA-256.
- [ ] **REQ-067 [P1/R]** Separate user-supplied statements, machine observations, and AI inferences.
- [ ] **REQ-068 [P1/R]** Verify digests upon export, restore, upload, and read; report failed integrity checks prominently.
- [ ] **REQ-069 [P1/R]** Use UUIDs/ULIDs instead of Date.now() IDs vulnerable to collisions.
- [ ] **REQ-070 [P1/R]** Support multiple attachments per incident and preserve MIME/file-extension metadata.
- [ ] **REQ-071 [P1/R]** Limit attachment sizes, hash in streams/chunks, and avoid allocating entire huge files in JavaScript.
- [ ] **REQ-072 [P1/R]** Protect against evidence deletion when app cache is cleared or OS reclaims space.
- [ ] **REQ-073 [P1/R]** Add consent-first encrypted backup, device migration, and recovery; clearly define no-recovery mode if desired.
- [ ] **REQ-074 [P1/R]** Implement append-only revision/audit history rather than silently replacing evidence records.
- [ ] **REQ-075 [P1/R]** Preserve import provenance, hash algorithm/version, app version, and export verification instructions.
- [ ] **REQ-076 [P1/R]** Do not write raw incident or grievance content to analytics, server access logs, crash dumps, or AI logs.
- [ ] **REQ-077 [P1/R]** Decouple vault unlock status from React component lifetime and auto-lock after background/inactivity.
- [ ] **REQ-078 [P1/R]** Mask sensitive content in the OS task switcher and lock screen where platforms allow.
- [ ] **REQ-079 [P1/R]** Review clipboard, share-sheet, export folder, and email leakage; warn before leaving encrypted storage.
- [ ] **REQ-080 [P1/R]** Support secure encrypted exports and plain exports with explicit user confirmation.
- [ ] **REQ-081 [P1/R]** Implement cryptographic erase by removing keys plus documented backup/cache behavior.
- [ ] **REQ-082 [P2/R]** Support accessible recovery documentation, evidence indexing, integrity reports, and print-friendly bundle exports.

## 04 — Real-time location and navigation

- [ ] **REQ-083 [P0/R]** Use only real road/path geometry returned by a routing engine, never simulated safety paths.
- [ ] **REQ-084 [P0/R]** Display routing source, last-refresh time, confidence/coverage, and provider failure state.
- [ ] **REQ-085 [P0/R]** Make off-route recalculation use the actual current coordinates, not stale render state.
- [ ] **REQ-086 [P0/R]** Separate route information coverage from actual personal safety predictions.
- [ ] **REQ-087 [P1/R]** Implement foreground GPS tracking with sensible stale-fix alerts, drift filtering, and low-accuracy modes.
- [ ] **REQ-088 [P1/R]** Use map-matching/progress along route and robust multi-step maneuver advancement.
- [ ] **REQ-089 [P1/R]** Provide an explicit navigation stop/pause/resume flow with cleanup and no lingering location updates.
- [ ] **REQ-090 [P1/R]** Persist active trip state and restore safely after process recreation.
- [ ] **REQ-091 [P1/R]** Test OS background location permissions, notifications, power policies, and battery cost before promising background tracking.
- [ ] **REQ-092 [P1/R]** Support location permission denied, approximate location, device GPS disabled, indoors, and stale GPS.
- [ ] **REQ-093 [P1/R]** Differentiate mapped streetlight objects from verified working illumination.
- [ ] **REQ-094 [P1/R]** Treat unmapped hazards, dynamic crowds, crime, roadworks, and temporary closures as unknown.
- [ ] **REQ-095 [P1/R]** Use standardized timestamps and freshness on OSM/imagery/amenities data.
- [ ] **REQ-096 [P1/R]** Implement route reranking based on actual alternative coverage, not only arbitrary information-density percentage.
- [ ] **REQ-097 [P1/R]** Add wheelchair/step-free/accessibility profiles only when route data and testing support them.
- [ ] **REQ-098 [P1/R]** Support alternate routes, no-route states, dead ends, private areas, restricted access, and unsafe crossings.
- [ ] **REQ-099 [P2/R]** Optimize GPS power with adaptive sampling and higher accuracy only near maneuvers.
- [ ] **REQ-100 [P2/R]** Add local route caches with expiry and clear degraded-mode labels.
- [ ] **REQ-101 [P2/R]** Offer route-sharing only as an explicit time-limited privacy-conscious opt-in.
- [ ] **REQ-102 [P2/R]** Use familiar turn-by-turn notifications/voice cues after safety usability review.

## 05 — Geospatial provider reliability, compliance and data

- [ ] **REQ-103 [P0/R]** Stop depending on public OSRM as a guaranteed production routing backend; obtain capacity/SLA or self-host.
- [ ] **REQ-104 [P0/R]** Enforce public-provider rate policy in aggregate, not only per client IP.
- [ ] **REQ-105 [P1/R]** Provide primary/secondary provider routing with circuit breakers and provider-specific failure messages.
- [ ] **REQ-106 [P1/R]** Use a contracted or self-hosted Photon-compatible geocoder under controlled quotas.
- [ ] **REQ-107 [P1/R]** Honor tile service attribution, user-agent, referrer, cache, and no-bulk-download policies.
- [ ] **REQ-108 [P1/R]** Do not implement offline map prefetch against standard OSM tiles; use a licensed offline-compatible source.
- [ ] **REQ-109 [P1/R]** Cache geocoding by normalized query, language, location bias, schema/provider version, and data freshness.
- [ ] **REQ-110 [P1/R]** Validate candidate coordinates and avoid biasing every search to India if worldwide support is advertised.
- [ ] **REQ-111 [P1/R]** Limit corridors by total distance and point count; reject corrupted geometries.
- [ ] **REQ-112 [P1/R]** Use low-volume materialized geospatial indexes for OSM amenities instead of unbounded real-time Overpass requests.
- [ ] **REQ-113 [P1/R]** Attach attributions and licenses to every imagery export or derived visualization.
- [ ] **REQ-114 [P1/R]** Expose imagery capture date, age, direction, location precision, and coverage gaps.
- [ ] **REQ-115 [P1/R]** Confirm whether mapped POIs are open or staffed before recommending them as support points.
- [ ] **REQ-116 [P1/R]** Track routing changes due to OSM updates and recalculate expired saved journeys.
- [ ] **REQ-117 [P1/R]** Prevent upstream response/schema drift from silently corrupting scores or route geometries.
- [ ] **REQ-118 [P2/R]** Build provider dashboards for quota, latency, 429 rates, cache hit ratio and map-tile errors.
- [ ] **REQ-119 [P2/R]** Document copyright, ODbL attribution and derivative database obligations.

## 06 — API security and backend architecture

- [ ] **REQ-120 [P0/R]** Keep emergency fallback independent of server availability and AI services.
- [ ] **REQ-121 [P1/R]** Define server-side schemas for every route, query, body, and response (e.g. TypeBox/Zod/JSON Schema).
- [ ] **REQ-122 [P1/R]** Reject unexpected values, overlong strings, nested payload bombs, malformed coordinates, and invalid timestamps.
- [ ] **REQ-123 [P1/R]** Define versioned OpenAPI and generate typed mobile/web clients.
- [ ] **REQ-124 [P1/R]** Use authentication/authorization for private or stateful workflows; preserve anonymous safe public lookup where appropriate.
- [ ] **REQ-125 [P1/R]** Restrict costly public Gemini endpoints with device/session quotas, budgets and abuse mitigation.
- [ ] **REQ-126 [P1/R]** Limit CORS for web origins; do not rely on CORS for native-app authentication.
- [ ] **REQ-127 [P1/R]** Apply a strict dashboard CSP, secure cookies if used, HSTS behind HTTPS proxy, and sensible security headers.
- [ ] **REQ-128 [P1/R]** Store secrets in managed secret stores; rotate them and never include upstream API keys in mobile bundles.
- [ ] **REQ-129 [P1/R]** Add structured request IDs and privacy-scrubbed logs with no route coordinates/user narratives by default.
- [ ] **REQ-130 [P1/R]** Add bounded per-provider timeout, retry with jitter, circuit breaker, and controlled error mapping.
- [ ] **REQ-131 [P1/R]** Use separate upstream limits for geocoding, AI and heavy corridor scans.
- [ ] **REQ-132 [P1/R]** Move rate limits and cache to Redis only if distributed deployment requires it; fail safely if Redis is down.
- [ ] **REQ-133 [P1/R]** Add idempotency keys and durable queue processing to opted-in notification/SOS workflows.
- [ ] **REQ-134 [P1/R]** Avoid leaking internal process memory and infrastructure specifics from public health endpoints.
- [ ] **REQ-135 [P1/R]** Version endpoint contracts, deprecate legacy aliases deliberately, and provide backward compatibility windows.
- [ ] **REQ-136 [P1/R]** Require HTTPS/TLS and encrypt service-to-service credentials and persistent storage.
- [ ] **REQ-137 [P2/R]** Document expected HTTP status codes, retry-after behavior and rate-limit response headers.
- [ ] **REQ-138 [P2/R]** Use tighter route-specific concurrency controls and bound in-flight request maps.
- [ ] **REQ-139 [P2/R]** Design controlled, permission-scoped webhooks for providers and partners.

## 07 — AI, safety claims and statutory assistance

- [ ] **REQ-140 [P0/R]** Do not allow LLM output to autonomously dispatch emergency services, contact third parties, or file official complaints.
- [ ] **REQ-141 [P0/R]** Require consent before sending identifiable incidents, student IDs, or social text to any external model.
- [ ] **REQ-142 [P1/R]** Confirm Gemini API data logging and project retention configuration; disable unnecessary request logs.
- [ ] **REQ-143 [P1/R]** Enforce user age/region/provider terms, especially for services likely accessed by minors.
- [ ] **REQ-144 [P1/R]** Use explicit max output, token and time budgets for every AI call.
- [ ] **REQ-145 [P1/R]** Treat model categories, risk labels, email addresses, legal deadlines, and portal routes as untrusted until verified.
- [ ] **REQ-146 [P1/R]** Use structured schema validation and confidence-based fallback, never default a failed audit to SAFE.
- [ ] **REQ-147 [P1/R]** Distinguish AI, deterministic rules, and unavailable results honestly in UI.
- [ ] **REQ-148 [P1/R]** Localize emergency intent detectors for Telugu/Hindi and common colloquial phrases.
- [ ] **REQ-149 [P1/R]** Implement prompt-injection, jailbreak, policy evasion and misleading instruction test suites.
- [ ] **REQ-150 [P1/R]** Keep statutory authority registry versioned, with verified official source URL, review date and jurisdiction.
- [ ] **REQ-151 [P1/R]** Require user review of grievance facts, dates, allegations, recipients, and evidence before submission.
- [ ] **REQ-152 [P1/R]** Validate legal deadlines and process applicability with qualified Indian counsel; avoid blanket claims.
- [ ] **REQ-153 [P1/R]** Treat email-client and government-portal handoff as prepared, never submitted until receipt evidence exists.
- [ ] **REQ-154 [P1/R]** Support a status workflow: draft, reviewed, submitted by user, acknowledgement received, follow-up due, closed.
- [ ] **REQ-155 [P1/R]** Add hallucination and red-team evaluations for legal advice and escalation recommendations.
- [ ] **REQ-156 [P2/R]** Provide links to authoritative government portals and editable templates, not just generated text.
- [ ] **REQ-157 [P2/R]** Offer a no-AI offline deterministic mode and make its limitations clear.

## 08 — Mobile application, security and usability

- [ ] **REQ-158 [P0/R]** Ship and test independent Android and iOS native navigation/map implementations.
- [ ] **REQ-159 [P0/R]** Verify actual release builds and production device configuration, not only Expo development runtime.
- [ ] **REQ-160 [P1/R]** Use EAS Build/Submit or an equivalent reproducible signed release pipeline.
- [ ] **REQ-161 [P1/R]** Configure store identifiers, version codes, privacy manifests, permission strings, app icons, splash and signing keys.
- [ ] **REQ-162 [P1/R]** Implement foreground/background state handling and immediate vault auto-lock rules.
- [ ] **REQ-163 [P1/R]** Support Android/iOS permissions for dialer, SMS composer, GPS and notifications with graceful denial.
- [ ] **REQ-164 [P1/R]** Test deep links and app-action entry points without bypassing vault authorization.
- [ ] **REQ-165 [P1/R]** Handle rotate, app suspend, process kill, force close and low-memory restart without dropping safety-critical workflow context.
- [ ] **REQ-166 [P1/R]** Prevent screenshots or app-switcher previews of private screens where safe and supported.
- [ ] **REQ-167 [P1/R]** Validate accessibility for screen readers, minimum tap targets, color contrast, text scaling and haptic feedback.
- [ ] **REQ-168 [P1/R]** Internationalize all error strings and emergency workflows, not only the main tab labels.
- [ ] **REQ-169 [P1/R]** Add clear one-handed emergency controls and low-cognitive-load confirmation flows.
- [ ] **REQ-170 [P1/R]** Create a first-run safety onboarding, emergency-contact verification and test-SOS flow.
- [ ] **REQ-171 [P1/R]** Provide transparent provider-connection status and degraded/offline mode.
- [ ] **REQ-172 [P1/R]** Protect against accidental touch, pocket activation and repeated taps without blocking legitimate emergency action.
- [ ] **REQ-173 [P2/R]** Improve battery/network behavior using adaptive GPS and rendering optimizations.
- [ ] **REQ-174 [P2/R]** Ensure stable UI on low-end Android phones and older supported iPhones.
- [ ] **REQ-175 [P2/R]** Add an in-app issue report that never sends private evidence without consent.

## 09 — Dashboard and web experience

- [ ] **REQ-176 [P0/R]** Remove simulated success data and fixed metrics from routes and incident analysis.
- [ ] **REQ-177 [P0/R]** Sanitize all untrusted data embedded into HTML, JavaScript and srcdoc contexts; sandbox iframes.
- [ ] **REQ-178 [P1/R]** Extract the 75KB inline dashboard template into source modules with tested rendering and build output.
- [ ] **REQ-179 [P1/R]** Use no inline event handlers under a strict CSP.
- [ ] **REQ-180 [P1/R]** Provide real origin/destination search; preset dropdown must not silently ignore arbitrary user-entered place text.
- [ ] **REQ-181 [P1/R]** Keep demo fixtures behind an explicit demo toggle, never inside normal production data.
- [ ] **REQ-182 [P1/R]** Persist real user data only with a documented encrypted local or cloud strategy.
- [ ] **REQ-183 [P1/R]** Avoid localStorage for personal evidence, contacts, PINs or location history.
- [ ] **REQ-184 [P1/R]** Implement authenticated private-data access and explicit logout/lock for shared computers.
- [ ] **REQ-185 [P1/R]** Give users meaningful map-data-source errors and an accessible non-map emergency route.
- [ ] **REQ-186 [P1/R]** Implement secure download export and clear filename/format/integrity metadata.
- [ ] **REQ-187 [P1/R]** Add browser E2E tests and security checks for script injection.
- [ ] **REQ-188 [P2/R]** Split CSS/JS with source maps, asset cache headers, CDN pinning and integrity checks.
- [ ] **REQ-189 [P2/R]** Improve mobile browser layouts, keyboard access, screen reader flow and responsive map controls.

## 10 — Persistence, data governance and lifecycle

- [ ] **REQ-190 [P0/R]** Decide explicitly which data stays on device and which opt-in data ever reaches servers.
- [ ] **REQ-191 [P1/R]** Implement schema migrations with version table, downgrade strategy and migration tests.
- [ ] **REQ-192 [P1/R]** Add record-level validation and DB constraints for IDs, timestamps, enum states and hashes.
- [ ] **REQ-193 [P1/R]** Prevent concurrent initialization and writes from producing duplicate data.
- [ ] **REQ-194 [P1/R]** Add transaction boundaries for multi-table operations and encrypted-key changes.
- [ ] **REQ-195 [P1/R]** Make backup/restore and data deletion consistent across SQLite, OS backups, attachments and cloud copies.
- [ ] **REQ-196 [P1/R]** Avoid silently creating artificial coordinates (0,0) for invalid saved routes.
- [ ] **REQ-197 [P1/R]** Limit data-retention period and add user-configurable auto-delete of sensitive history.
- [ ] **REQ-198 [P1/R]** Support data export/access/correction/delete workflows as applicable.
- [ ] **REQ-199 [P1/R]** Keep external data-sharing consent revocable and tied to specific action.
- [ ] **REQ-200 [P1/R]** Require least-privilege database roles and encrypted backups when server persistence is introduced.
- [ ] **REQ-201 [P2/R]** Add storage pressure diagnostics and safe attachment deduplication.
- [ ] **REQ-202 [P2/R]** Track schema and evidence format version across mobile upgrades.

## 11 — Deployment, infrastructure and observability

- [ ] **REQ-203 [P0/R]** Create reproducible staging and production environments with explicit public HTTPS endpoints.
- [ ] **REQ-204 [P1/R]** Replace Docker Compose default database password and credential fallbacks for real environments.
- [ ] **REQ-205 [P1/R]** Integrate Redis/PostGIS through actual clients, schema migrations and health checks only where useful.
- [ ] **REQ-206 [P1/R]** Create production Docker builds with image vulnerability scans, non-root execution and pinned image digests.
- [ ] **REQ-207 [P1/R]** Separate liveness, readiness and dependency-health endpoints.
- [ ] **REQ-208 [P1/R]** Establish SLOs for API uptime, route response latency, SOS provider acceptance, and actual acknowledgements.
- [ ] **REQ-209 [P1/R]** Add privacy-preserving tracing, metrics, dashboards and on-call alerts.
- [ ] **REQ-210 [P1/R]** Implement tested database backups/restore drills and RPO/RTO objectives if server data exists.
- [ ] **REQ-211 [P1/R]** Add traffic controls, autoscaling, quotas and DDoS protection.
- [ ] **REQ-212 [P1/R]** Deploy progressively with feature flags, rollback, canary/staged rollout and crash-rate gates.
- [ ] **REQ-213 [P1/R]** Create dependency incident playbooks for OSRM, Photon, Overpass, Gemini and SMS providers.
- [ ] **REQ-214 [P1/R]** Add provider cost monitoring with hard AI/SMS/geocoding spending caps.
- [ ] **REQ-215 [P1/R]** Document secure key rotation and incident-response processes.
- [ ] **REQ-216 [P2/R]** Implement chaos testing and backup provider simulations.
- [ ] **REQ-217 [P2/R]** Publish an honest user-facing service status/support channel.

## 12 — Testing, CI/CD and QA

- [ ] **REQ-218 [P0/T]** Run an actual npm ci, lint, typecheck, build and complete test suite at the reviewed SHA; inspect failures.
- [ ] **REQ-219 [P0/T]** Build signed Android and iOS release artifacts and test on physical devices.
- [ ] **REQ-220 [P0/T]** Verify SOS composer behavior on multiple carriers, dual-SIM configurations and installed SMS apps.
- [ ] **REQ-221 [P0/T]** Verify emergency dialer access without internet, GPS or backend.
- [ ] **REQ-222 [P0/T]** Verify no simulated route is presented as safe during upstream outage.
- [ ] **REQ-223 [P0/T]** Pen-test vault, PIN brute force, secure storage, backups, tampering and hard wipe.
- [ ] **REQ-224 [P1/R]** Add mobile React Native component tests, including permissions and error states.
- [ ] **REQ-225 [P1/R]** Test production TypeScript output, not only parallel .js test counterparts.
- [ ] **REQ-226 [P1/R]** Add contract tests for every API and schema/version pair.
- [ ] **REQ-227 [P1/R]** Add E2E tests for mobile onboarding, SOS, vault, GPS route, grievance export and recovery.
- [ ] **REQ-228 [P1/R]** Add browser E2E tests for dashboard XSS, source outages, navigation and evidence state.
- [ ] **REQ-229 [P1/R]** Run property-based fuzz tests for geometry, timestamps, route steps and incident hashing.
- [ ] **REQ-230 [P1/R]** Add load and soak tests for gateway, rate limits, cache eviction and upstream saturation.
- [ ] **REQ-231 [P1/R]** Test low-memory, app background, device lock, killed process and GPS signal loss.
- [ ] **REQ-232 [P1/R]** Test timezone, DST, invalid clocks and clock-tampering scenarios.
- [ ] **REQ-233 [P1/R]** Add SAST, SCA, dependency/license scan, secret scan, SBOM and container scan.
- [ ] **REQ-234 [P1/R]** Run accessibility audits for English, Telugu and Hindi, including screen readers.
- [ ] **REQ-235 [P1/R]** Define release-blocking acceptance tests and require green CI plus manual safety checks.
- [ ] **REQ-236 [P1/R]** Measure false positive/false negative rates for harassment pattern heuristics using annotated cases.
- [ ] **REQ-237 [P1/R]** Run model red-team tests with adversarial content and sensitive data.
- [ ] **REQ-238 [P1/R]** Validate routing against real local roads, walls, restricted access and pedestrian crossings.
- [ ] **REQ-239 [P1/R]** Add regression tests for evidence original bytes vs digest and record truncation.
- [ ] **REQ-240 [P1/R]** Test database migrations and atomic rollback with corrupted older user data.
- [ ] **REQ-241 [P1/R]** Monitor production error and crash data through privacy-safe diagnostics.
- [ ] **REQ-242 [P2/R]** Document manual test scripts, device matrix, provider fault simulations, and beta feedback.

## 13 — Product, accessibility, policy and operations

- [ ] **REQ-243 [P0/R]** Make no claims that an unverified route is safe, that an SMS was delivered, or that evidence is court-admissible.
- [ ] **REQ-244 [P1/R]** Define target audiences including students under 18; align AI provider use and consent design accordingly.
- [ ] **REQ-245 [P1/R]** Obtain qualified legal and privacy review of Indian law, platform claims, data handling, and statutory routing.
- [ ] **REQ-246 [P1/R]** Publish versioned privacy policy, terms, support/security contact, and disclosure procedures.
- [ ] **REQ-247 [P1/R]** Add clear in-app explanations of zero telemetry vs third-party routing, map, and AI requests.
- [ ] **REQ-248 [P1/R]** Conduct women-led safety design research and threat modeling, including domestic coercion and stalking abuse.
- [ ] **REQ-249 [P1/R]** Plan for malicious trusted contacts, coercive access, stolen devices and attacker-controlled shared screens.
- [ ] **REQ-250 [P1/R]** Avoid automatically sharing whereabouts, case facts, or contacts with default audiences.
- [ ] **REQ-251 [P1/R]** Design humane copy for uncertainty, missing data and AI mistakes without panic-inducing overconfidence.
- [ ] **REQ-252 [P1/R]** Provide documented manual emergency fallback procedures for situations where app cannot help.
- [ ] **REQ-253 [P1/R]** Create 24/7 incident response only if staffing and budget truly support it; do not promise it otherwise.
- [ ] **REQ-254 [P1/R]** Keep official authority contact information reviewed and dated; allow users to flag stale contacts.
- [ ] **REQ-255 [P1/R]** Build user feedback loop with safe bug reporting, support, and release notes.
- [ ] **REQ-256 [P1/R]** Design redacted incident-handling process for security researchers and support personnel.
- [ ] **REQ-257 [P2/R]** Offer low-data mode, accessibility text scaling, and assisted setup for less technical users.
- [ ] **REQ-258 [P2/R]** Publish limitations, known issues and a changelog that match tested functionality.


**Total actionable checklist entries: 258.**
