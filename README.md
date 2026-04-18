# Codex Commerce Scaffold

Scalable MERN e-commerce project structure using Next.js App Router on the frontend and Express + MongoDB MVC on the backend.

## Apps

- `frontend`: Next.js 16 App Router storefront and admin panel shell
- `backend`: Express API with MVC structure and MongoDB integration

## Run locally

```bash
npm install
npm run dev
```

## Database

MongoDB connection string used in the backend scaffold:

```bash
mongodb://localhost:27017/Codex_ecomm_db
```

## Auth stack

- JWT-based authentication using an HTTP-only cookie
- Password hashing with `bcryptjs`
- Backend `protect` and `authorize` middleware for role-based access
- Frontend `AuthProvider` for hydrated client session state
- Server-side auth DAL in `frontend/src/lib/auth.js` for secure App Router checks
- Next.js `proxy.js` for optimistic redirects on protected routes

## Notes

- Frontend uses Redux Toolkit for scalable client state
- Frontend routing now follows current App Router guidance: secure auth checks happen in server pages, not layout-only client guards
- Backend uses feature-oriented MVC folders for clean growth
- `.env` examples are included for both apps
- API route structure is documented in `backend/API_STRUCTURE.md`
