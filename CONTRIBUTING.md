# Contributing Guidelines

Thank you for your interest in contributing to the project! We welcome contributions, bug fixes, documentation improvements, and architectural suggestions.

## Repository Architecture

This repository is organized as an npm workspace monorepo:

* `packages/core`: Pure domain services, geometry math, route intelligence, authority registry, and offline cryptographic utilities.
* `packages/server`: Fastify REST gateway providing geospatial corridor caching, AI triage, and statutory handoff endpoints.
* `packages/mobile`: React Native Expo mobile application with offline SQLite persistence and stealth disguise controls.

## Development Workflow

### 1. Prerequisites
* Node.js v20+ (Node 22 or 24 recommended)
* npm v10+

### 2. Setup
Clone the repository and install dependencies:
```bash
git clone https://github.com/KatkamKoushik/Walkscope.git vyshuuu
cd vyshuuu
npm install
```

### 3. Verification & Quality Gates
Before submitting any pull request, ensure all tests and quality checks pass:
```bash
# Run all unit and integration test suites
npm test

# Run TypeScript typechecks across all 3 workspaces
npm run typecheck

# Run linter
npm run lint
```

## Pull Request Guidelines

1. Create a descriptive feature branch from `main` (e.g., `feature/corridor-filter` or `fix/imagery-timeout`).
2. Write unit tests for any new functions or service methods in a corresponding `.test.mjs` file.
3. Ensure zero regression in test coverage and adhere to existing code style.
4. Keep commits clean, atomic, and descriptive.
5. Open a Pull Request referencing the related issue or feature specification.

