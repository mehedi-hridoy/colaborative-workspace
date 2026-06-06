# Collaborative Workspace

Collaborative Workspace is a full-stack platform for aligning teams around goals, action items, and announcements with real-time activity, notifications, and analytics. It is built as a monorepo with a Next.js frontend and an Express + Prisma backend, deployed as independent services.

## Live links

- Web app: https://web-production-0b838.up.railway.app
- API: https://api-production-ca8a.up.railway.app
- API docs (Swagger): https://api-production-ca8a.up.railway.app/api/docs
- Demo account: demo@teamhub.com / demo123


## Contents
1. Purpose
2. Architecture
3. Data model
4. Authentication and security
5. Authorization (RBAC)
6. Real-time system
7. Feature deep dive
8. API reference summary
9. Frontend architecture
10. Environment variables
11. Local development
12. Deployment
13. Operational notes

## Purpose
Teams often lose context across chat, docs, and task tools. This project consolidates workspace updates, goal tracking, announcements, and tasks into one system with real-time visibility and an auditable activity trail.

## Technology stack
- Frontend: Next.js (App Router), React 19, Tailwind CSS, Zustand
- Backend: Node.js, Express, Prisma, Socket.io, Swagger UI
- Database: PostgreSQL
- Authentication: JWT access tokens + refresh tokens, http-only cookies
- Storage: Local uploads (/api/files) with optional Cloudinary-hosted assets

## Architecture
```mermaid
graph TD
  Web[Next.js Web App] -->|REST + Socket.io| API[Express API]
  API --> DB[(PostgreSQL)]
  API --> Files["uploads (local)"]
  API --> Swagger[Swagger UI]
```

## Data model
Core entities and relationships (see apps/api/prisma/schema.prisma):

- User: owns workspaces, creates content, receives notifications
- Workspace: owned by a user; has memberships, goals, announcements, activities
- Membership: connects users to workspaces with a role (ADMIN, MEMBER, VIEWER)
- Goal: belongs to a workspace; has milestones and action items
- Milestone: belongs to a goal; drives progress and status
- ActionItem: belongs to a goal; optional assignee; status and priority
- Announcement: belongs to a workspace; comments and reactions
- Comment: belongs to an announcement
- Reaction: unique by user + announcement + emoji
- Activity: audit log entries tied to workspace and optionally goal
- Notification: stored events for mentions, reactions, comments
- Attachment: file metadata linked to goal, activity, or announcement

## Authentication and security
- Auth uses JWT access tokens stored in http-only cookies.
- Access token lifetime: 1 hour. Refresh tokens are stored in the database and expire in 7 days.
- /api/auth/refresh validates the refresh token record and issues a new access token.
- Cookies are set with httpOnly, secure, sameSite=none to support cross-origin frontend deployment.
- CORS is restricted to CLIENT_URL (supports comma-separated values) and Railway preview domains.

## Authorization (RBAC)
Roles are enforced server-side via a permission matrix (apps/api/src/utils/permissions.js).

Permission matrix:

| Permission | ADMIN | MEMBER | VIEWER |
| --- | --- | --- | --- |
| workspace:invite | yes | no | no |
| workspace:remove | yes | no | no |
| workspace:archive | yes | no | no |
| workspace:changeRole | yes | no | no |
| goal:create | yes | yes | no |
| goal:edit | yes | yes | no |
| goal:delete | yes | no | no |
| task:create | yes | yes | no |
| task:edit | yes | yes | no |
| task:delete | yes | yes | no |
| task:statusUpdate | yes | yes | no |
| announcement:create | yes | yes | no |
| announcement:pin | yes | no | no |
| announcement:react | yes | yes | yes |
| announcement:comment | yes | yes | yes |
| activity:post | yes | yes | no |
| read | yes | yes | yes |

## Real-time system
Socket.io provides real-time presence, activity, task, announcement, and notification updates.

Rooms:
- user_<userId>: personal notification channel
- workspace_<workspaceId>: workspace-wide updates

Events emitted by the server:
- presence:update: list of user IDs currently online in a workspace
- activity:new: new activity entry for a goal
- task:new, task:update, task:delete: action item updates
- announcement:new, announcement:reaction, announcement:comment, announcement:pin
- notification:new: direct notification to a user room

Client events:
- join_workspace, leave_workspace

Authentication for sockets uses the same access token cookie as REST.

## Feature deep dive

### Workspaces and membership
- Workspace owners are always ADMIN.
- Creating a workspace creates an ADMIN membership for the owner.
- Archived workspaces are excluded from list queries (archivedAt set).
- Member roles can be changed by admins; owners cannot be demoted or removed.
- /api/workspaces/:workspaceId/my-role returns current role plus permissions map.

### Goals and milestones
- Goal status is computed using milestone completion and due dates:
  - With milestones: 0 percent open, 1-99 percent in-progress, 100 percent completed.
  - Without milestones: status respects stored value; overdue computed from dueDate.
- Goal creation enforces goal:create permission; non-admins cannot set custom status.
- Milestone toggle updates goal status and logs activity entries.
- Progress updates create activity records and broadcast over Socket.io.

### Action items
- Stored under goals with status (todo, in-progress, done) and priority (low, medium, high).
- Status updates use a dedicated endpoint for Kanban drag-and-drop.
- Changes emit task:new, task:update, task:delete to workspace rooms.

### Announcements
- Announcement content is stored as rich text string and supports comments and reactions.
- Reactions are toggled (add/remove) and are unique per user + emoji.
- Mentions are parsed using @handle and notify matching members by name or email prefix.
- Pinning is restricted to ADMIN.

### Notifications
- Notifications are stored in the database and delivered in real time to user rooms.
- Types used: MENTION, COMMENT, REACTION (plus generic types for extensibility).
- API supports read-all and single read updates.

### Analytics and export
- Workspace analytics include totals, weekly completion, overdue counts, and active members.
- Chart endpoints return 28-day time series for goals and action items.
- CSV export aggregates goals, action items, announcements, members, and activity log.

### Files and attachments
- Uploads are stored on the API server under apps/api/uploads and served via /api/files/:filename.
- Avatar upload limit: 5MB. File upload limit: 10MB.
- Attachment records can reference goals, activities, or announcements.
- /api/download/:attachmentId proxies remote URLs (for Cloudinary-hosted assets).

## API reference summary
Base path: /api

Authentication
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- GET /auth/me

Workspaces
- POST /workspaces
- GET /workspaces
- PATCH /workspaces/:workspaceId/archive
- POST /workspaces/:workspaceId/invite
- GET /workspaces/:workspaceId/members
- PATCH /workspaces/:workspaceId/members/:memberId/role
- DELETE /workspaces/:workspaceId/members/:memberId
- GET /workspaces/:workspaceId/my-role

Goals
- POST /goals
- GET /goals/:workspaceId
- POST /goals/:goalId/updates
- DELETE /goals/:goalId

Milestones
- POST /milestones
- GET /milestones/:goalId
- PUT /milestones/:id

Action items
- POST /action-items
- GET /action-items/goal/:goalId
- PATCH /action-items/:id/status
- PATCH /action-items/:id
- DELETE /action-items/:id

Announcements
- POST /announcements
- GET /announcements/:workspaceId
- POST /announcements/:id/react
- POST /announcements/:id/comment
- PATCH /announcements/:id/pin

Activity
- POST /activity
- GET /activity/goal/:goalId
- GET /activity/:workspaceId

Notifications
- GET /notifications
- PATCH /notifications/read-all
- PATCH /notifications/:id/read

Analytics
- GET /analytics/:workspaceId
- GET /analytics/:workspaceId/goal-chart
- GET /analytics/:workspaceId/action-item-chart
- GET /analytics/:workspaceId/members
- GET /analytics/:workspaceId/export

Files
- POST /upload/avatar
- POST /upload/file
- GET /files/:filename
- GET /download/:attachmentId

## Frontend architecture
- Next.js App Router, React 19, Tailwind CSS, Zustand stores.
- API base URL and socket URL are derived from NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SOCKET_URL.
- Optimistic UI and rollback for goals, action items, and announcements.
- Socket listeners wire directly into stores to keep views in sync.

## Environment variables

API (apps/api/.env):
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_ACCESS_SECRET=your-secret-access-key-here-min-32chars
JWT_REFRESH_SECRET=your-secret-refresh-key-here-min-32chars
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Web (apps/web/.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Local development

Prerequisites:
- Node.js >= 20
- npm >= 10
- PostgreSQL database

Install dependencies:
```bash
npm install
```

Database setup:
```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

Optional seed data:
```bash
node prisma/seed.js
```

Run the stack:
```bash
npm run dev
```

Default ports:
- API: http://localhost:5000
- Web: http://localhost:3000

## Deployment
Railway is the reference deployment target. See RAILWAY-DEPLOYMENT.md for step-by-step instructions and DEPLOYMENT-READY.md for the production readiness checklist.

## Operational notes
- CORS uses CLIENT_URL and allows Railway preview domains for convenience.
- /api/files is public; /api/download enforces workspace access.
- Logout clears cookies; refresh tokens expire after 7 days.
- No automated tests or rate limiting are configured yet.

## License
No license is currently specified.

