# PH Submission Portal — Client

Next.js 16 (App Router) + TypeScript + TailwindCSS + ShadCN frontend for the Project Submission & Review Dashboard.

## Stack

- Next.js 16, React 19, TypeScript
- TailwindCSS + ShadCN UI
- Redux Toolkit + RTK Query (axios base query, JWT attached via interceptor)
- react-hook-form + Zod for form validation

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the environment file:
   ```
   cp .env.local.example .env.local
   ```

   | Variable | Description |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | Base URL of the server API, e.g. `http://localhost:5000/api/v1` |

3. Start the dev server:
   ```
   npm run dev
   ```

   Runs on `http://localhost:3000`.

## Build

```
npm run build
npm start
```

## Pages

| Route | Access | Description |
|---|---|---|
| `/` | Any | Redirects to `/login`, `/submit`, or `/dashboard` based on auth state and role |
| `/login` | Public | Email/password login, redirects by role |
| `/signup` | Public | Student registration |
| `/submit` | STUDENT only | Project submission form |
| `/dashboard` | MENTOR only | Stats cards, paginated review table, approve/reject, status filter |

Route protection is handled client-side by `useAuthGuard` ([src/hooks/useAuthGuard.ts](src/hooks/useAuthGuard.ts)), which decodes the JWT from `localStorage` and redirects based on role.

## Project structure

```
src/
  app/
    (auth)/login, (auth)/signup
    (protected)/submit, (protected)/dashboard
    layout.tsx          # wraps app in ReduxProvider + Toaster
  components/ui/          # ShadCN components
  contains/                # authKey, role/status constants (mirror server)
  helpers/axios/            # axiosInstance (JWT interceptor), axiosBaseQuery (for RTK Query)
  hooks/useAuthGuard.ts
  redux/
    api/authApi.ts, submissionApi.ts, baseApi.ts
    store.ts, rootReducer.ts, hooks.ts, reduxProvider.tsx, tag-types.ts
  services/auth.services.ts  # localStorage token + decoded user info
  types/index.ts              # domain types mirroring server
  utils/interface.ts           # Zod schemas mirroring server validation
```
