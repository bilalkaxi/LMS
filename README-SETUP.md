# Page & Pine Library Management System

This is an upgraded version of your existing project. It keeps the existing Next.js frontend, Express backend, MySQL database, registration/login, book CRUD, and PDF uploads while adding author/category management, dashboard statistics, and download history.

## Before running

- Keep your existing MySQL database and tables.
- Do **not** copy a real `.env` file into source control or share it publicly.
- Configure `backend/.env` using `backend/.env.example` and your existing MySQL credentials. Keep the same database name/user/password you already use locally.
- If the original `backend/.env` was lost, create it from the example and fill in the values yourself.

## Start the backend

```bash
cd backend
npm install
npm run dev
```

On startup, the backend creates the `download_history` table automatically if it does not exist. It does not delete or recreate your existing data.

## Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

## Features

- Public library catalogue with search and category filters
- Responsive book cards and PDF downloads
- User registration and login
- Admin dashboard with book, author, category, user, and download counts
- Admin book upload, edit, and delete
- Author and category CRUD
- Download history for member and guest downloads
- JWT-protected admin mutations and dashboard/history endpoints

## Admin account

Use an existing account whose `users.role` is `admin`. If you change a user's role in MySQL, log out and log in again to get a fresh JWT.

## Notes

- PDF uploads are limited to 20 MB and require the `.pdf` extension and `application/pdf` MIME type. For production, add file signature/content validation and rate limiting.
- This development setup uses `http://localhost:5000/api`. Change `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` for a deployed environment.
- For production, use HTTPS, a strong random `JWT_SECRET`, secure cookie-based sessions where appropriate, and review access control and file validation.
