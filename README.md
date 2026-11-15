# TeamHub Frontend

A modern, production-grade team collaboration and project management SaaS platform built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **TanStack Query**, seamlessly integrated with an existing **Spring Boot 3 + Spring Security + PostgreSQL + Spring AI** backend.

---

## 🚀 Key Features

- **Authentication & Security**:
  - Stateless JWT authentication flow directly integrated with Spring Security.
  - Split-screen branded authentication (Login & Registration) with password toggles, Zod validation, and error feedback handling RFC 7807 `ProblemDetail` responses.
  - Automatic session restoration (`GET /api/users/me`) and protected route guards.
  - Global 401 interception and automated graceful session termination.

- **Workspace & Layout Shell**:
  - Deep Navy collapsible sidebar with active indicators and workspace status badges.
  - Global top navbar with dynamic breadcrumbs, keyboard-driven Quick Command Palette (`⌘K` / `Ctrl+K`), and light/dark theme toggle.
  - Fully responsive design accommodating desktop, tablet, and mobile layouts.

- **Overview Dashboard**:
  - Comprehensive real-time metrics computed directly from authentic backend records: Total Teams, Total Projects, Total Tasks, and Completion Rate.
  - Interactive status distribution pie chart and priority breakdown bar chart powered by **Recharts**.
  - Quick action links to recently active projects and newly added tasks.

- **Teams & Role-Based Access Control (RBAC)**:
  - Team directory and detailed team management views.
  - Visual member listing displaying `OWNER`, `ADMIN`, and `MEMBER` badges with joined dates and initials avatars.
  - Admin/Owner operations: Invite new registered users by email with role assignment (`ADMIN` or `MEMBER`) and member removal with confirmation dialogs.

- **Project Management**:
  - Project directory with status filtering (`PLANNED`, `ACTIVE`, `COMPLETED`, `ARCHIVED`) and team association.
  - Project creation enforced by backend uppercase key format (`^[A-Z][A-Z0-9]{1,9}$`, e.g. `CORE`, `APP`).
  - Project settings drawer for updating name, description, and lifecycle status.
  - Destructive project deletion with safety confirmations.

- **Task Backlog & Kanban Boards**:
  - Interactive **Kanban Board** with drag-and-drop column transitions (`TODO` ➔ `IN_PROGRESS` ➔ `IN_REVIEW` ➔ `DONE`) using `@hello-pangea/dnd` and optimistic UI caching.
  - Alternative structured **List View** with sorting, priority indicators, assignee summaries, and due date tags.
  - Full-featured **Task Detail Drawer**: inline title editing, status & priority switchers, assignee selection from project team members, due date scheduling, and task removal.

- **Collaboration & Comments**:
  - Real-time discussion thread per task with author attribution, relative timestamps, and deletion permissions for authors and moderators.
  - Keyboard shortcut (`⌘+Enter` or `Ctrl+Enter`) for rapid comment posting.

- **Spring AI (Gemini Flash) Intelligence**:
  - **AI Task Draft Generator**: Generates titles, descriptions, and acceptance criteria from simple natural language prompts (`POST /api/projects/{projectId}/ai/task-draft`).
  - **AI Task Discussion Summary**: Synthesizes discussions into TL;DR, Key Decisions, Open Blockers, and Next Steps (`POST /api/tasks/{taskId}/ai/summarize`).
  - **Natural Language Board Filter**: Filters Kanban columns based on queries like *"show urgent in progress tasks"* (`POST /api/projects/{projectId}/ai/filter-tasks`).

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | Declarative Component Architecture |
| **TypeScript** | Strict End-to-End Type Safety |
| **Vite 6** | Ultra-fast Bundling and Dev Server |
| **Tailwind CSS** | Design System & Utility-first Styling |
| **Radix UI Primitives** | Accessible Dialogs, Dropdowns, Tabs, Selects, Tooltips |
| **Lucide React** | Consistent, Modern SVG Iconography |
| **TanStack Query v5** | Server State Management, Caching, and Invalidation |
| **Axios** | HTTP Client with Interceptors & RFC 7807 Error Parsing |
| **React Hook Form + Zod** | Robust Client-Side Form Validation |
| **Zustand** | Global Lightweight Auth & Theme Stores |
| **@hello-pangea/dnd** | Smooth Kanban Drag-and-Drop |
| **Recharts** | Interactive Dashboard Visualizations |
| **Sonner** | Polished Toast Notifications |

---

## 📦 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **pnpm** (or `npm`)
- **TeamHub Spring Boot Backend**: Running on `http://localhost:8080`

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points to your backend instance:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. Dependency Installation

```bash
pnpm install
```

### 3. Run Development Server

```bash
pnpm run dev
```

The application will launch at `http://localhost:5173`.

### 4. Build for Production

```bash
pnpm run build
```

To preview the built production bundle:

```bash
pnpm run preview
```

---

## 📡 API Integration Map

The frontend strictly communicates with the existing Spring Boot backend endpoints:

### Authentication (`/api/auth`)
| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | `{ name, email, password }` | Registers user & issues JWT token |
| `POST` | `/api/auth/login` | `{ email, password }` | Authenticates user & issues JWT token |

### Users (`/api/users`)
| Method | Endpoint | Headers | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | `Authorization: Bearer <token>` | Returns current authenticated user profile |

### Teams (`/api/teams`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/teams` | Creates a new team (assigns caller as `OWNER`) |
| `GET` | `/api/teams` | Retrieves teams the caller belongs to with their role |
| `GET` | `/api/teams/{teamId}` | Retrieves team details & caller's role |
| `POST` | `/api/teams/{teamId}/members` | Adds a registered user by email as `ADMIN` or `MEMBER` |
| `GET` | `/api/teams/{teamId}/members` | Lists all memberships in the team |
| `DELETE`| `/api/teams/{teamId}/members/{userId}` | Removes a member (requires OWNER or ADMIN) |

### Projects (`/api`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/teams/{teamId}/projects` | Creates project under a team (requires ADMIN/OWNER) |
| `GET` | `/api/teams/{teamId}/projects` | Lists projects belonging to a team |
| `GET` | `/api/projects/{projectId}` | Retrieves project details |
| `PATCH`| `/api/projects/{projectId}` | Updates project name, description, status |
| `DELETE`| `/api/projects/{projectId}` | Deletes project and cascades to tasks |

### Tasks (`/api`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/projects/{projectId}/tasks` | Creates task with status, priority, assignee |
| `GET` | `/api/projects/{projectId}/tasks` | Retrieves tasks filtered by status/priority/assignee/search |
| `GET` | `/api/tasks/{taskId}` | Retrieves task details |
| `PATCH`| `/api/tasks/{taskId}` | Updates task properties, status, priority, or unassigns |
| `DELETE`| `/api/tasks/{taskId}` | Deletes task |

### Task Comments (`/api`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/tasks/{taskId}/comments` | Adds a comment to a task |
| `GET` | `/api/tasks/{taskId}/comments` | Retrieves chronological comments for a task |
| `DELETE`| `/api/comments/{commentId}` | Deletes a comment (author or team ADMIN/OWNER) |

### Spring AI Features (`/api`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/projects/{projectId}/ai/task-draft` | Generates structured task draft from a prompt |
| `POST` | `/api/tasks/{taskId}/ai/summarize` | Summarizes task activity and discussion |
| `POST` | `/api/projects/{projectId}/ai/filter-tasks` | Natural language board filtering |

---

## 📋 Unavailable Backend Features & Design Decisions

Per project requirements, the backend serves as the absolute source of truth. The following features do not exist in the Spring Boot backend and are **not** mocked or faked on the frontend:

1. **User Profile / Avatar / Password Updates**:
   - `UserController` only implements `GET /api/users/me`.
   - Endpoints for `PUT /api/users/me`, avatar image uploads, and password modification do not exist. Profile information is presented read-only in Settings.
2. **Team Modification & Deletion**:
   - `TeamController` does not expose `PATCH /api/teams/{id}` or `DELETE /api/teams/{id}`. Teams cannot be edited or deleted through the API.
3. **Global Unscoped Tasks Query**:
   - The backend only queries tasks scoped to a specific project (`/api/projects/{projectId}/tasks`).
   - The "My Tasks" page transparently fetches projects across the user's teams and filters tasks assigned to the current user client-side with full caching.
4. **JWT Refresh Tokens**:
   - The backend issues a 24-hour stateless JWT token upon login/registration. There is no refresh token endpoint. Token expiration is handled by automatically prompting the user to sign back in.
5. **Real-time WebSockets / SSE**:
   - The backend is a stateless REST API. Instant updates are achieved through TanStack Query optimistic mutations and automatic cache invalidations.
