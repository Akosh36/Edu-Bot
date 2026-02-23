# 🎓 Educational AI Learning Platform

A modern, multilingual educational platform (English, Uzbek, Russian) featuring an AI assistant for contextual learning support.

## 🌟 Features

- **Multilingual Support**: Switch seamlessly between English, Uzbek, and Russian.
- **AI Learning Assistant**: Context-aware AI assistant powered by OpenAI to help with student queries.
- **Subject-Specific Content**: Comprehensive lessons in Mathematics, Programming, Science, History, Languages, and General Knowledge.
- **User Progress & Bookmarks**: Save important lessons to your profile (requires sign-in).
- **Secure Authentication**: Integrated Replit Auth for a smooth login experience.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL with Drizzle ORM.
- **AI**: OpenAI API integration via Replit AI.

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Ensure `DATABASE_URL` and `SESSION_SECRET` are configured.
4. **Push database schema**:
   ```bash
   npm run db:push
   ```
5. **Start the application**:
   ```bash
   npm run dev
   ```

## 📖 Project Structure

- `client/`: React frontend application.
- `server/`: Express backend and storage layer.
- `shared/`: Shared TypeScript types and Drizzle schema.

## 📄 License

MIT
