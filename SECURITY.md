# Security Policy

## Supported Versions

Security updates and vulnerability patches are actively applied to the following branch:

| Version / Branch | Supported |
| :--- | :--- |
| `main` | Yes |
| Release tags | Current active release |

## Reporting a Vulnerability

We prioritize the security and privacy of this application, particularly given its safety-critical and evidence-handling nature.

If you discover a security vulnerability or potential data leak:

1. **Do not create a public GitHub issue.**
2. Report the vulnerability privately via GitHub's [Security Advisory tab](https://github.com/KatkamKoushik/Walkscope/security/advisories) or contact repository maintainers directly.
3. Include detailed steps to reproduce the issue, potential impact, and any proof-of-concept payload if applicable.
4. Maintainers will acknowledge receipt within 48 hours and work with you on a coordinated fix and release before public disclosure.

## Security Practices in this Repository

* **Zero Cloud Telemetry:** Mobile user routes, searches, and incident vaults remain strictly on-device in local SQLite storage.
* **1-Tap Hard Wipe:** Emergency panic wipe clears all records and executes SQLite `VACUUM`.
* **Prompt Injection Defense:** Multi-modal AI pipelines treat all user text and uploaded documents as untrusted data strings.
* **Network Defense:** Helmet security headers, rate-limiting shields, and strict request body size caps protect backend endpoints.

