# 🎓 Edu-Bot — Educational AI Learning Platform

A simple learning platform with multilingual lessons, a free AI chat assistant, and an admin dashboard for managing course content.

## What this project does

Edu-Bot lets students:
- browse educational sections and articles,
- ask questions to an AI assistant directly from the page,
- save bookmarks when signed in.

It also lets content managers:
- log in to an admin panel,
- add, edit, and remove sections,
- add, edit, and remove articles in English, Uzbek, and Russian.

## Why it is useful

- The AI helper uses your own lesson content as context.
- Admin users can update the site without editing code.
- The platform supports three languages and can be extended.

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/edubot
   GROQ_API_KEY=gsk_your_key_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin
   ```
3. Initialize the database:
   ```bash
   npm run db:push
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open the site:
   - Main app: `http://localhost:5173`
   - Admin login: `http://localhost:5173/admin/login`

## Admin access and adding content

If you want to add new information, do this:

1. Open `http://localhost:5173/admin/login`
2. Log in with:
   - Username: `admin`
   - Password: `admin`
3. After login, go to `http://localhost:5173/admin/dashboard`
4. Use the dashboard to:
   - create a new section,
   - create a new article,
   - edit articles in English, Uzbek, or Russian,
   - delete content you no longer need.

> Important: change `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` before using this in production.

## Project structure

- `client/`: React frontend application
  - `src/pages/`: Page components
    - `AdminLogin.tsx`: admin login page
    - `AdminDashboard.tsx`: admin content management
    - `Home.tsx`, `Article.tsx`, etc.: student-facing pages
  - `src/components/`: reusable UI components
    - `ChatAssistant.tsx`: AI chat widget
- `server/`: Express backend and API routes
  - `routes.ts`: main server routes
  - `replit_integrations/admin/`: admin auth and admin API
  - `storage.ts`: database helpers
- `shared/`: shared route and schema definitions

## Main user routes

- `/` — home page
- `/sections` — view all sections
- `/sections/:slug` — section details
- `/articles/:id` — article page
- `/bookmarks` — saved articles page

## Admin routes

- `/admin/login` — login to admin panel
- `/admin/dashboard` — manage content after login

## How AI chat works

When a student asks a question, the app:
1. finds relevant course content,
2. sends that content as context to the AI service,
3. receives a response,
4. displays the answer in the chat widget.

## Notes

- The admin dashboard is the place to add and update learning content.
- The AI assistant uses your published lessons to answer questions.
- Update `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` to protect the admin panel.

## License

MIT
