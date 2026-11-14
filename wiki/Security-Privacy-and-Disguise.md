# Security, Privacy & Threat Defense Architecture

## Overview

The `ResQ` platform is built with a defense-in-depth security model specifically tailored to women experiencing digital surveillance, abusive roommates, or physical vulnerability.

---

## 1. Threat Model & Mitigations (STRIDE Framework)

```
┌───────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Threat Vector                         │ Architectural Defense                                  │
├───────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ Snooping Roommate or Abusive Partner  │ Quick-Exit Bar: 1-Tap stealth Calculator Disguise      │
│ Device Inspection                     │ with working arithmetic keypad.                        │
├───────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ Forensics Extraction via USB (ADB)    │ android:allowBackup="false" in AndroidManifest.xml;   │
│                                       │ SQLite database stored in private app sandbox.        │
├───────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ Acute Personal Danger / Following     │ 112 Direct Device Dialer intent in header bar.         │
├───────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ Evidence Destruction / Seizure Risk   │ 1-Tap Hard Wipe (Panic Wipe): Purges all SQLite tables │
│                                       │ (journeys, searches, incidents, cases) + VACUUM.       │
├───────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ Tampering with Logged Evidence        │ Deterministic SHA-256 integrity hash calculated for    │
│                                       │ every contemporaneous incident and petition annexure.  │
├───────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ Prompt Injection inside Screenshots   │ System guardrail treats all OCR and user text strictly │
│ or Uploaded Letters                   │ as UNTRUSTED DATA STRINGS.                             │
└───────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 2. Interactive Calculator Disguise Architecture

When a user taps **Quick Disguise (🧮)** on the top bar:
1. The app immediately renders a full-screen, native modal replacing all safety, map, and grievance views.
2. The modal functions as a genuine standard calculator with arithmetic operations (`+`, `-`, `×`, `÷`, `%`, `±`).
3. **Stealth Unlock Mechanism:**
   * Tapping the clear button `C` twice when the screen displays `0` unlocks the disguise and restores the application.
   * Alternatively, pressing the discreet unlock icon (`🔓`) restores the interface.

```mermaid
stateDiagram-v2
    [*] --> AppView: Normal Usage (Move / Protect / Act)
    AppView --> CalculatorModal: Tap "Quick Disguise"
    state CalculatorModal {
        [*] --> Keypad
        Keypad --> ArithmeticResult: Compute 7 × 8 = 56
        ArithmeticResult --> Keypad: Punch Numbers
    }
    CalculatorModal --> AppView: Tap 'C' Twice OR Tap '🔓'
```

---

## 3. Local-First SQLite Database Schema

The database (`walking_companion.db`) is configured in write-ahead logging (`WAL`) mode with zero cloud telemetry:

```mermaid
erDiagram
    SAVED_JOURNEYS {
        string id PK
        string title
        string origin_name
        float origin_lat
        float origin_lon
        string dest_name
        float dest_lat
        float dest_lon
        float distance_m
        float duration_s
        float context_score
        int is_favorite
        string created_at
    }

    RECENT_SEARCHES {
        string id PK
        string query
        float lat
        float lon
        string display_name
        string created_at
    }

    SAVED_INCIDENTS {
        string id PK
        string timestamp
        string platform
        string sender_handle
        string message_content
        int was_blocked_prior
        string evidence_ref
        string hash
        string created_at
    }

    SAVED_GRIEVANCES {
        string id PK
        string title
        string category
        string institution_name
        string hostel_location
        string incident_date
        string raw_narrative
        string prior_steps
        string relief_requested
        string authority_code
        string formal_document
        string status
        string created_at
    }
```

* **1-Tap Hard Wipe (`hardWipeAllData()`):**
  Executes `DELETE FROM saved_journeys; DELETE FROM recent_searches; DELETE FROM saved_incidents; DELETE FROM saved_grievances; VACUUM;` to reclaim freed disk pages and eliminate residual SQLite remnants.

