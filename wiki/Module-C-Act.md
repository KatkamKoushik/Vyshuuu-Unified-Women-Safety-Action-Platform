# Module C — Act (Statutory Grievance Assistant)

## Overview

**Act** is an evidence-to-action navigator designed to transform raw incident narratives into legally structured formal representations, match official statutory authorities in India, and provide Assisted Portal Handoff.

---

## 1. 7-Step Evidence-to-Action Pipeline

```mermaid
flowchart TD
    Step1["1. Factual Incident Intake<br/>(Raw statement: e.g. rat bite in room 204)"] --> Step2["2. Adaptive Clarification<br/>(3 targeted questions: dates, memos, medical)"]
    Step2 --> Step3["3. Normalized Case Record<br/>(Category: HOSTEL_SANITATION)"]
    Step3 --> Step4["4. Statutory Authority Matching<br/>(UGC e-Samadhaan: 20-Day Window)"]
    Step4 --> Step5["5. Formal Document Synthesis<br/>(Markdown petition + SHA-256 annexures)"]
    Step5 --> Step6["6. User Review & Approval<br/>(User verifies facts & recipients)"]
    Step6 --> Step7["7. Assisted Portal Handoff<br/>(1-tap clipboard pills + in-app browser)"]
```

---

## 2. Dynamic 3-Question Clarification Engine

When a student enters a grievance, the system identifies missing critical facts needed for administrative and statutory review:

1. **Chronological Timestamps:** Establishing the exact date, time, and room number of the incident.
2. **Prior Administrative Inaction:** Documenting verbal and written memos sent to wardens or deans to prove institutional negligence.
3. **Medical & Physical Consequences:** Documenting clinic visits, doctor prescriptions, anti-rabies/tetanus vaccines, or safety hazards.

---

## 3. Formal Representation Structure

The generated representation adheres to formal administrative standards:
* **Subject Line:** Standardized formal title citing the location and category.
* **To Header:** Presiding Redressal Officer / Authority.
* **Section 1: Factual Chronology:** Objective, non-inflammatory statement of facts.
* **Section 2: Prior Internal Intimations:** Proof that internal remedies were exhausted without timely remediation.
* **Section 3: Statutory & Regulatory Framework:** Formal citation of governing regulations (e.g., UGC Student Grievance Regulations 2023).
* **Section 4: Specific Prayers for Relief:** Concrete, time-bound remedies requested (pest fumigation, mesh repair, medical reimbursement).
* **Section 5: Cryptographic Annexures Table:** List of attached photos and slips with individual 64-character SHA-256 hashes.

---

## 4. Assisted Portal Handoff Interface

```mermaid
flowchart LR
    CaseRecord["Prepared Grievance Case"] --> UI["Assisted Handoff Interface"]

    UI --> Pill1["Copy Subject Line"]
    UI --> Pill2["Copy Description (under 1500 chars)"]
    UI --> Pill3["Copy Relief Sought"]
    UI --> Pill4["Copy Statutory Act Citation"]
    UI --> PortalBtn["Open UGC e-Samadhaan (HTTPS)"]

    PortalBtn --> NativeBrowser["Sandboxed Browser Sheet<br/>User completes SMS OTP & CAPTCHA"]
```

* **Attachment Format Validation:** Warns the user if an uploaded document does not match the destination portal's strict rules (e.g. FSSAI FoSCoS strictly rejects PDF files and requires JPG/PNG images).

