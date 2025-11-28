# Deploy Center - Frontend Implementation Plan

This document serves as the **Master Plan** for the frontend development of Deploy Center. It is based strictly on the Server API capabilities defined in `POSTMAN_GUIDE.md` and `POSTMAN_COLLECTION.json`.

**Goal:** Achieve 100% feature parity with the Server API.

---

## 🏗️ Architecture & Standards

- **Framework:** React + TypeScript + Vite
- **UI Library:** Material-UI (Mui)
- **State Management:** Context API (Auth, Theme, Language)
- **Routing:** React Router v6+
- **HTTP Client:** Axios (with Interceptors for Auth/Refresh Token)
- **Coding Standards:** PascalCase for all data models (matching Server).

---

## 🧩 Feature Modules & Implementation Details

### 1. Authentication Module 🔐

**API Endpoints:**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/profile`
- `POST /api/auth/refresh`
- `POST /api/auth/change-password`

**Pages & Components:**
- **Login Page:**
    - [x] Username/Password form.
    - [x] "Remember Me" functionality (persisting tokens).
    - [x] Error handling (401/400).
- **Register Page:**
    - [x] Username, Email, Password, Role selection (Admin/Developer/Viewer).
    - [x] Password strength indicator.
- **Auth Context:**
    - [x] Auto-refresh token mechanism (Axios interceptor).
    - [x] Session persistence.

### 2. Dashboard Module 📊

**API Endpoints:**
- `GET /api/deployments/statistics`
- `GET /api/deployments/queue/status`
- `GET /api/projects` (for summary)

**Features:**
- **Global Stats Cards:** Total Deployments, Success Rate, Active Projects, Queue Size.
- **Global Queue Status:**
    - Show number of items in `pending` and `in_progress`.
    - Link to Queue Management.
- **Recent Activity:** List of latest 5 deployments.
- **Deployments Trend:** Bar chart showing deployments over time.

### 3. Projects Module 🚀

**API Endpoints:**
- `GET /api/projects` (filters: `includeInactive`)
- `POST /api/projects` (Simple & Full Config)
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/projects/:id/statistics`
- `POST /api/projects/:id/regenerate-webhook`

**Pages & Components:**
- **Projects List Page:**
    - [x] Grid/List view of projects.
    - [ ] **Filter:** Show/Hide Inactive projects.
    - [x] **Cards:** Show Name, Repo, Branch, Last Status.
- **Create/Edit Project Wizard (Crucial Update):**
    - **Step 1: Basic Info:** Name, Description, RepoUrl, ProjectType.
    - **Step 2: Configuration:**
        - Branch, Environment, AutoDeploy toggle.
        - `DeployOnPaths` (TagInput for glob patterns).
    - **Step 3: Pipeline Editor:**
        - Dynamic list of steps.
        - Fields: Name, Command, WorkingDirectory, Timeout, RunIf.
        - Drag-and-drop reordering (optional but nice).
    - **Step 4: Notifications:**
        - Toggles for Discord, Slack, Email, Telegram.
        - Input fields for Webhooks/Config based on selection.
- **Project Details Page:**
    - [x] Header with Actions (Edit, Delete, Deploy).
    - [ ] **Webhook Section:** Display `WebhookSecret` with "Regenerate" button (Masked by default).
    - [ ] **Project Stats:** Specific charts for this project (Success rate, etc.).
    - [ ] **Queue Status:** Show if this project has pending items.
    - [x] **Deployment History:** Table with pagination.

### 4. Deployments Module ⚙️

**API Endpoints:**
- `GET /api/deployments/projects/:id/deployments`
- `GET /api/deployments/:id`
- `POST /api/deployments/projects/:id/deploy`
- `POST /api/deployments/:id/cancel`
- `POST /api/deployments/:id/retry`
- `GET /api/deployments/queue/status`
- `POST /api/deployments/projects/:id/queue/cancel-all`

**Pages & Components:**
- **Deployments List Page:**
    - [x] Global list with filters (Status, Project, Date).
    - [x] Pagination (Server-side: `limit`, `offset`).
- **Deployment Details/Logs Page:**
    - [x] Live Terminal logs.
    - [x] Step-by-step progress indicator (Pipeline visualization).
    - [x] Metadata: Commit Hash, Message, Author, Duration.
    - [x] Actions: Cancel (if running), Retry (if failed).
- **Manual Deployment Modal:**
    - [ ] Select Branch (default to config branch).
    - [ ] Input **Commit Hash** (optional).
    - [ ] Input **Commit Message** (optional).
- **Queue Management (New):**
    - Visual representation of the deployment queue.
    - "Cancel All Pending" button (Admin only).

### 5. Settings Module ⚙️

**API Endpoints:**
- `GET /api/auth/profile`
- `POST /api/auth/change-password`

**Features:**
- **Profile Tab:** Update basic info.
- **Security Tab:** Change Password.
- **Preferences Tab:** Theme (Light/Dark), Language (EN/AR).
- **Notifications Tab:** (Global defaults if supported, otherwise per-project).

---

## 🗓️ Execution Roadmap

### Phase 1: Foundation & Auth (Completed ✅)
- [x] Project Setup
- [x] Auth Pages (Login/Register)
- [x] Core Layout & Routing
- [x] i18n Setup

### Phase 2: Advanced Project Management (Priority 🚨)
- [ ] **Task 2.1:** Implement `ProjectWizard` component for Create/Edit.
    - Support Full Config structure (Pipeline, Notifications).
- [ ] **Task 2.2:** Update `ProjectDetails` to show Webhook Secret & Stats.
- [ ] **Task 2.3:** Implement "Regenerate Webhook" functionality.

### Phase 3: Deployment & Queue Management
- [ ] **Task 3.1:** Update `ManualDeployModal` to support Commit Hash/Message.
- [ ] **Task 3.2:** Create `QueueStatus` component (Global & Project-level).
- [ ] **Task 3.3:** Implement "Cancel All Pending" functionality.

### Phase 4: Refinement & Polish
- [ ] **Task 4.1:** Ensure all API calls use `PascalCase` for request bodies.
- [ ] **Task 4.2:** Verify Error Handling for all edge cases (401, 403, 404).
- [ ] **Task 4.3:** Final UI/UX Polish (Empty states, Loading skeletons).

---

## 📝 Coding Rules (Reminder)

1.  **PascalCase:** All JSON properties sent to/received from API must be PascalCase.
    *   `{ "Username": "admin" }` ✅
    *   `{ "username": "admin" }` ❌
2.  **Types:** Update `src/types/index.ts` to match `POSTMAN_COLLECTION.json` structures exactly.
3.  **Services:** Each module should have a dedicated service file in `src/services/`.

---

This plan is the single source of truth for the frontend implementation.
