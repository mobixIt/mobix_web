# 📑 Technical Debt: Playwright E2E Architecture Refactor

## 🎯 General Objective
Migrate the test suite from a monolithic and redundant structure toward an architecture based on **Page Object Model (POM)**, **Custom Fixtures**, and **Strongly Typed Data Contracts**.

The "Gold Standard" for any refactoring or new test creation is the `tests/e2e/vehicles/` directory.

---

## 🏗️ Standard Architecture
Any refactoring must implement the layer scheme used in the Vehicles module:

| Layer | Location | Responsibility |
| :--- | :--- | :--- |
| **Fixtures** | `support/fixtures.ts` | `test` extension to inject typed instances (avoid `any`). |
| **POM** | `support/*-pom.ts` | Abstraction of Material UI selectors and complex interactions. |
| **Mocks** | `support/*-mocks.ts` | Network interception, Data Factories, and API contracts. |
| **Utils** | `support/api-utils.ts` | Network constants, URL regex, and request type discrimination. |

---

## 🚩 Debt Inventory (Audit)

### 1. Critical Files (High Priority - Urgent Refactor)
These files contain important business logic, but their infrastructure is fragile:
* **`aiFilters.spec.ts`**: Hardcoded advanced filter logic. Needs to migrate to `AIPage` POM.
* **`ai-toolbar.spec.ts`**: Manual network interceptions without using a centralized mock manager.

### 2. Legacy Directories (Medium Priority)
* **`auth/`**: Legacy session setup. Must be integrated with `mockAppAuth` in `support/auth-mocks.ts`.
* **`session/`**: Scattered cookie and timeout handling; does not use the new global fixtures.
* **`dashboard/`**: Duplicated logic for loading skeleton validation.

### 3. Others
* **`smoke.spec.ts`**: Quick smoke tests that need to be updated to use `getTenantBaseUrl`.

---

## 🛠️ Repository Golden Rules

1.  **Mandatory Strong Typing**: Do not use `any`. Reuse interfaces from `@/types/access-control`.
2.  **MUI Resilience**: Do not use raw CSS locators for Material UI components. Use the POM's `selectMuiOption` method to resolve duplicate labels and strict selectors (`exact: true`).
3.  **Network Encapsulation**: `.spec` files must not contain API URL regular expressions. These must be defined in `api-utils.ts`.
4.  **Mock Isolation**: Each module must have its own mock file (e.g., `vehicle-mocks.ts`, `ai-mocks.ts`) to avoid route collisions.

---

## 🚦 Mitigation Roadmap

- [x] **Phase 1**: Infrastructure Definition (Fixtures, API Utils, Auth Mocks).
- [x] **Phase 2**: Complete refactor of the `vehicles/` module (Reference Model).
- [x] **Phase 3**: Migration of `aiFilters.spec.ts` and creation of `AIPage` POM.
- [ ] **Phase 4**: `auth/` refactor and session logic unification.
- [ ] **Phase 5**: `support/` cleanup to remove obsolete helpers (e.g., manual URL path functions).

---

## ⚠️ Note on ESLint
If the linter flags an error in `fixtures.ts` due to the use of `use` (React Hooks rule), apply the override in `.eslintrc.json` for the `tests/e2e/` folder or use:
`// eslint-disable-next-line react-hooks/rules-of-hooks`
