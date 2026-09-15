# Technology Stack

## 📱 Application Stack

### React ![React Version](https://img.shields.io/github/package-json/dependency-version/Hardhat-Enterprises/Deakin-Detonator-Toolkit/react/main?style=flat-square&logo=react&label=React)

**Role:** Provides the component-based frontend used to build DDT's user interface.

### TypeScript ![TypeScript Version](https://img.shields.io/github/package-json/dependency-version/Hardhat-Enterprises/Deakin-Detonator-Toolkit/dev/typescript/main?style=flat-square&logo=typescript&label=TypeScript)

**Role:** Provides static typing for the frontend codebase, improving maintainability and helping identify type-related errors during development.

### Mantine ![Mantine Version](https://img.shields.io/github/package-json/dependency-version/Hardhat-Enterprises/Deakin-Detonator-Toolkit/%40mantine%2Fcore/main?style=flat-square&label=Mantine)

**Role:** Provides the React component library used for DDT's forms, controls, layouts and other interface elements.

### Tauri ![Tauri Version](https://img.shields.io/github/package-json/dependency-version/Hardhat-Enterprises/Deakin-Detonator-Toolkit/%40tauri-apps%2Fapi/main?style=flat-square&logo=tauri&label=Tauri)

**Role:** Packages DDT as a native desktop application and provides the bridge between the web-based frontend and native operating-system functionality.

### Rust

**Role:** Provides the native application layer used by Tauri and the backend components contained under `src-tauri`.

### Vite ![Vite Version](https://img.shields.io/github/package-json/dependency-version/Hardhat-Enterprises/Deakin-Detonator-Toolkit/dev/vite/main?style=flat-square&logo=vite&label=Vite)

**Role:** Provides the frontend development server and production build tooling.

## 🔨 Development and CI

### Node.js ![Node Version](https://img.shields.io/badge/dynamic/yaml?url=https%3A%2F%2Fraw.githubusercontent.com%2FHardhat-Enterprises%2FDeakin-Detonator-Toolkit%2Fmain%2F.github%2Fworkflows%2Fci.yml&query=%24.jobs.dependencies.steps%5B1%5D.with.node-version&label=Node.js&logo=nodedotjs&style=flat-square)

**Role:** Provides the JavaScript runtime used by the frontend development, build and CI processes.

### Yarn / Corepack ![Package Manager](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2FHardhat-Enterprises%2FDeakin-Detonator-Toolkit%2Fmain%2Fpackage.json&query=%24.packageManager&label=Package%20Manager&logo=yarn)

**Role:** Manages JavaScript dependencies using the Yarn version declared by the repository. Corepack ensures contributors and CI use the expected package manager version.

### Vitest ![Vitest Version](https://img.shields.io/github/package-json/dependency-version/Hardhat-Enterprises/Deakin-Detonator-Toolkit/dev/vitest/main?style=flat-square&logo=vitest&label=Vitest)

**Role:** Provides the automated frontend testing framework used by the project.

### Prettier ![Prettier Version](https://img.shields.io/github/package-json/dependency-version/Hardhat-Enterprises/Deakin-Detonator-Toolkit/dev/prettier/main?style=flat-square&logo=prettier&label=Prettier)

**Role:** Enforces consistent formatting across the codebase.

### GitHub Actions ![CI Status](https://img.shields.io/github/actions/workflow/status/Hardhat-Enterprises/Deakin-Detonator-Toolkit/ci.yml?style=flat-square&branch=main&logo=githubactions&label=CI)

**Role:** Runs dependency, style, test, security and build checks for pull requests.

### Trivy ![Trivy](https://img.shields.io/badge/Trivy-Security%20Scanning-informational?style=flat-square)

**Role:** Scans the repository and dependencies for known security vulnerabilities as part of the CI workflow.

### TruffleHog ![TruffleHog](https://img.shields.io/badge/TruffleHog-Secret%20Scanning-informational?style=flat-square)

**Role:** Scans repository content for verified secrets as part of the CI security checks.

## Rust Tooling

### Cargo

**Role:** Manages Rust dependencies and builds the native Tauri application.

[Back](../README.md)