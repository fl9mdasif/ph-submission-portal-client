# PH Submission Portal — Client

Frontend for the **Project Submission & Review Dashboard** (Programming Hero Associate Web Instructor hiring task). Students submit assignment work and track its review status; mentors review, approve/reject, search and filter submissions, and see their own review history.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | TailwindCSS, ShadCN UI, lucide-react icons |
| State / Data | Redux Toolkit + RTK Query (axios base query, JWT attached via interceptor) |
| Forms | react-hook-form + Zod validation |

## Demo Credentials

| Role | Email | Password | Lands on |
|---|---|---|---|
| **Mentor** | `mentor@phsubmission.com` | `Mentor@12345` | `/mentor` |
| Student (demo) | `rafiul@example.com` | `Student@123` | `/student` |

Or sign up a new student from the `/signup` page.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the server API, e.g. `http://localhost:5000/api/v1` |

> **Deploying to Vercel?** `NEXT_PUBLIC_*` variables are baked in at **build time**. Set this in the Vercel project's environment variables *before* deploying, and trigger a fresh deploy (or redeploy) after adding/changing it — saving the variable alone does not update an already-built deployment. If it's missing, requests resolve against the client's own domain (you'll see `undefined` appear in the request URL) instead of the API server.

### 3. Run the dev server

```bash
npm run dev
```

Runs on `http://localhost:3000`.

### Production build

```bash
npm run build
npm start
```

## Pages

| Route | Access | Description |
|---|---|---|
| `/` | Any | Redirects to `/login`, or to the signed-in user's home route by role |
| `/login` | Public | Email/password login, redirects by role |
| `/signup` | Public | Student self-registration |
| `/student` | `STUDENT` | Submission form — assignment number (1–15), project name, repo URL, live link, description |
| `/student/submissions` | `STUDENT` | List of the student's own submissions with status; each can be **edited once** (resets to Pending for re-review) |
| `/mentor` | `MENTOR` | Stats cards (Pending/Approved/Rejected), paginated review table, search (project or student name), assignment filter, status filter, approve/reject |
| `/mentor/activity` | `MENTOR` | Paginated log of the mentor's own approve/reject actions |

Both roles get a sidebar (`AppSidebar`) scoped to their own pages. Route access is enforced client-side by `useAuthGuard` ([src/hooks/useAuthGuard.ts](src/hooks/useAuthGuard.ts)), which decodes the JWT from `localStorage` and redirects anyone on the wrong role's route.

## Project Structure

```
src/
  app/
    (auth)/login, (auth)/signup
    (protected)/
      student/page.tsx, student/submissions/page.tsx
      mentor/page.tsx, mentor/activity/page.tsx
    layout.tsx              # wraps the app in ReduxProvider + Toaster
  components/
    ui/                      # ShadCN components
    app-shell.tsx             # sidebar + header + content wrapper for protected pages
    app-sidebar.tsx            # role-aware navigation
    app-header.tsx              # user avatar + logout
  contains/                    # authKey, role/status constants (mirror server exactly)
  helpers/axios/                 # axiosInstance (JWT interceptor), axiosBaseQuery (for RTK Query)
  hooks/useAuthGuard.ts
  redux/
    api/authApi.ts, submissionApi.ts, baseApi.ts
    store.ts, rootReducer.ts, hooks.ts, reduxProvider.tsx, tag-types.ts
  services/auth.services.ts      # localStorage token + decoded user info
  types/index.ts                   # domain types mirroring the server
  utils/interface.ts                # Zod schemas mirroring server validation
```

## Notes on Known Trade-offs

- JWT is stored in `localStorage` for simplicity. An httpOnly cookie would be more resistant to XSS; acceptable for this assignment's scope.
- `next.config.ts` has the experimental `cacheComponents` flag disabled — it tried to statically prerender these fully client-rendered, auth-gated pages and flagged RTK Query's internal `Date.now()` usage as a blocking error. Since every page here depends on a logged-in user's data, static prerendering provides no benefit.
