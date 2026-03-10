# 🎓 Educational AI Learning Platform

A modern, multilingual educational platform (English, Uzbek, Russian) featuring an AI assistant for contextual learning support and a powerful admin panel.

## 🌟 Features

- **Multilingual Support**: Switch seamlessly between English, Uzbek, and Russian.
- **AI Learning Assistant**: Free context-aware AI assistant (powered by Groq's Mixtral) to help with student queries - no credit card required!
- **Subject-Specific Content**: Comprehensive lessons in Mathematics, Programming, Science, History, Languages, and General Knowledge.
- **User Progress & Bookmarks**: Save important lessons to your profile (requires sign-in).
- **Secure Admin Panel**: Manage sections and articles with a professional admin dashboard.
- **Content Management**: Create, edit, and delete educational content directly from the admin panel.
- **Secure Authentication**: 
  - Integrated Replit Auth for student users
  - Built-in admin authentication for content managers

## ✨ What's New

### 🤖 Free AI Chat Assistant
- Powered by **Groq's free tier** (Mixtral 8x7b)
- No credit card required!
- Context-aware responses using your content database
- Supports all three languages (English, Uzbek, Russian)
- Fast, reliable, and completely free

### 🔐 Admin Panel
- **Secure Login**: Username/password authentication
- **Section Management**: Create, edit, and delete course sections
- **Article Management**: Full CRUD operations for educational content
- **Multi-language Support**: Manage content in all supported languages
- **Clean Dashboard**: Intuitive interface for content management

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL with Drizzle ORM.
- **AI**: Groq SDK (free tier) for intelligent responses.
- **Authentication**: Session-based admin auth + Replit Auth for users.

## 🚀 Getting Started

### Quick Setup

1. **Clone the repository**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Get Groq API Key** (Free, no credit card):
   - Visit https://console.groq.com
   - Create account and generate API key

4. **Create .env file**:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/edubot
   GROQ_API_KEY=gsk_your_key_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin
   ```
   
   See `.env.example` for all available options.

5. **Push database schema**:
   ```bash
   npm run db:push
   ```

6. **Start the application**:
   ```bash
   npm run dev
   ```

7. **Access the application**:
   - Main app: http://localhost:5173
   - Admin panel: http://localhost:5173/admin/login

## 📖 Project Structure

- `client/`: React frontend application
  - `src/pages/`: Page components
    - `AdminLogin.tsx`: Admin login page
    - `AdminDashboard.tsx`: Admin content management
    - `Home.tsx`, `Article.tsx`, etc.: Student-facing pages
  - `src/components/`: Reusable React components
    - `ChatAssistant.tsx`: AI chat widget
- `server/`: Express backend
  - `routes.ts`: API endpoints
  - `replit_integrations/admin/`: Admin authentication & routes
  - `storage.ts`: Database operations
- `shared/`: Shared types and schema

## 🔑 Key Routes

### Public Routes
- `/` - Home page
- `/sections` - Browse sections
- `/sections/:slug` - Section details
- `/articles/:id` - Read article
- `/bookmarks` - Saved articles (authenticated)

### Admin Routes
- `/admin/login` - Admin login
- `/admin/dashboard` - Content management

### API Routes
- `GET /api/content/sections` - Get all sections
- `GET /api/content/articles` - Get articles
- `POST /api/chat` - Chat with AI
- `GET /api/admin/sections` - Manage sections (admin)
- `GET /api/admin/articles` - Manage articles (admin)

## 📚 Admin Features

### Manage Sections
- Create educational sections
- Add icon and translations (En/Uz/Ru)
- Edit section details
- Delete sections

### Manage Articles
- Create learning materials
- Support for multiple languages
- Add tags for better organization
- Edit and delete articles
- Organize by sections

## 🎯 Default Credentials

Default admin login:
- **Username**: `admin`
- **Password**: `admin`

⚠️ Change these in production!

## 📖 Documentation

For detailed setup instructions, see [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md)

## 💡 How the AI Chat Works

1. User asks a question in the chat widget
2. The system searches your article database for relevant content
3. The AI receives the matching articles as context
4. Groq's Mixtral model generates a context-aware response
5. Response is streamed back to the user in real-time

The AI always grounds its answers in your actual content, ensuring accuracy for your educational platform.

## 🔒 Security Features

- Admin session-based authentication
- Input validation with Zod
- Database query protection with ORM
- CORS configured for your domain
- Environment variable protection

## 📄 License

MIT

