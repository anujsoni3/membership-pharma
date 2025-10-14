# Membership Management App (MERN)

A full-stack MERN application for managing member profiles with email verification, dynamic education/experience sections, file uploads (resume/photo), shareable profile links, and an admin console.

Features
- Landing page: Sign Up, Sign In, Admin Login
- Sign Up: validations, dynamic education/experience sections, resume/photo upload, email verification
- Sign In: login via username/email + password, login attempt notifications, block handling
- User Dashboard: view/edit profile (except username/email/member_id), manage education/experience, upload/replace files, generate/revoke share links
- Admin Dashboard: summary cards, searchable/sortable/paginated users, edit, block/unblock with notifications, delete users and related data
- Email: Nodemailer (dev uses Ethereal previews), production via SMTP/SendGrid
- Storage: Local disk by default, optional Cloudinary via environment variables
- Security: JWT auth via httpOnly cookies, bcrypt password hashing, CORS, Helmet, rate limiting, input validation/sanitization

Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React (Vite), React Router, Axios

Getting Started

1) Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

2) Clone and install
- Open a terminal in your desired folder and ensure you are in your working directory.
- Install dependencies:
  - Server: from membership-app/server, run `npm install`
  - Client: from membership-app/client, run `npm install`

3) Environment variables
Copy server/.env.sample to server/.env and set values:
- PORT=4000
- MONGO_URI=mongodb://localhost:27017/membership_app
- JWT_SECRET=change_me
- CLIENT_URL=http://localhost:5173
- NODE_ENV=development
- EMAIL_FROM="Membership App <no-reply@example.com>"

Optional (Cloudinary):
- CLOUDINARY_CLOUD_NAME=
- CLOUDINARY_API_KEY=
- CLOUDINARY_API_SECRET=

Optional (SMTP in prod):
- SMTP_HOST=
- SMTP_PORT=
- SMTP_USER=
- SMTP_PASS=

Admin seed (pre-created admin account):
- ADMIN_USERNAME=admin
- ADMIN_EMAIL=admin@example.com
- ADMIN_PASSWORD=ChangeMe!123

Client env (optional):
- See client/.env.example

4) Run (two terminals)
- Terminal 1: `npm run dev:server` (from membership-app)
- Terminal 2: `npm run dev:client` (from membership-app)

Or run concurrently (single terminal) from project root:
- `npm run dev`

5) Workflows
- Sign up, then check server logs for the Ethereal email preview URL (click to open the verification page). After verifying, you can sign in.
- Upload resume (pdf/doc/docx, max 5MB) and photo (jpg/png, max 2MB) on the dashboard.
- Generate a share link (1 or 2 days) and share the URL; others can view your profile and download resume until expiry.
- Admin login with pre-seeded credentials to manage users.

Production Notes
- Use HTTPS and secure cookies in production (set NODE_ENV=production).
- Configure SMTP or SendGrid for real emails.
- Prefer Cloudinary or S3 for file storage in production.
- Use proper secret management and rotate secrets regularly.

License
MIT
