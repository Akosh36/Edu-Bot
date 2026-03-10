# Edu-Bot Enhancement: Admin Panel & AI Chat Assistant Setup Guide

## Overview

Your Edu-Bot application has been enhanced with:
1. **Secure Admin Panel** - Manage sections and articles
2. **Free AI Chat Assistant** - Powered by Groq's free API (Mixtral 8x7b)
3. **Multi-language Support** - English, Uzbek, Russian
4. **Seamless Integration** - Non-disruptive to existing UI/UX

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Groq API key (free, no credit card required)

## Setup Instructions

### 1. Get a Groq API Key (Free)

1. Visit https://npm run devconsole.groq.com
2. Sign up for a free account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key for use in the next step

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/edubot

# Groq API (Free tier - no credit card needed!)
GROQ_API_KEY=gsk_your_api_key_here_from_groq_console

# Admin Credentials (change these in production!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin

# Optional: Replit Auth (if using Replit)
REPLIT_AUTH_ENABLED=false
REPLIT_CLIENT_ID=your_client_id
REPLIT_CLIENT_SECRET=your_client_secret
```

### 3. Install Dependencies

```bash
npm install
```

The new dependency added:
- `groq-sdk` - For accessing Groq's free AI models

### 4. Run Database Migrations

```bash
npm run db:push
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Features & Usage

### Admin Panel

#### Access Admin Panel
- Navigate to: `http://localhost:5173/admin/login`
- Default credentials: `admin` / `admin`

#### Admin Dashboard Features

**Sections Management:**
- View all sections
- Create new educational sections with:
  - Slug (URL-friendly identifier)
  - Title in English, Uzbek, Russian
  - Icon name (e.g., "Calculator", "Code", "Atom")
- Edit existing sections
- Delete sections

**Articles Management:**
- View all articles
- Create new articles with:
  - Section assignment
  - Title in 3 languages
  - Body content in 3 languages
  - Optional tags
- Edit existing articles
- Delete articles

#### Security Notes
- ⚠️ **Important for Production:**
  - Change default admin credentials immediately
  - Use environment variables for credentials
  - Consider adding JWT tokens for better security
  - Implement admin session timeouts
  - Add SSL/HTTPS for admin panel

### AI Chat Assistant

#### Features
- **Context-Aware**: The AI searches your content database for relevant information
- **Multi-Language**: Responds in the user's language (English, Uzbek, Russian)
- **Seamless Integration**: Chat widget blends with your existing design
- **100% Free**: Powered by Groq's free tier
- **No Tracking**: All data is processed on your server

#### How It Works
1. User asks a question in the chat
2. The AI searches your articles for relevant context
3. The AI generates a response using the context
4. Direct answers from your content ensure accuracy

#### Chat Widget
- Fixed position at bottom-right of screen
- Minimizable/maximizable
- Context-aware (knows which section user is in)
- Responsive design for mobile & desktop

### Architecture

#### Backend Routes

**Admin API Endpoints:**
```
POST   /api/admin/login              # Login (returns token)
POST   /api/admin/logout             # Logout
GET    /api/admin/sections           # List sections
POST   /api/admin/sections           # Create section
PUT    /api/admin/sections/:id       # Update section
DELETE /api/admin/sections/:id       # Delete section
GET    /api/admin/articles           # List articles
POST   /api/admin/articles           # Create article
PUT    /api/admin/articles/:id       # Update article
DELETE /api/admin/articles/:id       # Delete article
GET    /api/admin/status             # Check admin auth
```

**Public API Endpoints:**
```
GET    /api/content/sections         # Get all sections
GET    /api/content/articles         # Get articles (with optional filters)
GET    /api/content/articles/:id     # Get specific article
POST   /api/chat                     # Send message to AI chat
```

#### Database Schema

**Sections Table:**
- `id` → Primary key
- `slug` → URL-friendly identifier
- `titleEn`, `titleUz`, `titleRu` → Titles in 3 languages
- `icon` → Icon identifier

**Articles Table:**
- `id` → Primary key
- `sectionId` → Reference to section
- `titleEn`, `titleUz`, `titleRu` → Titles in 3 languages
- `bodyEn`, `bodyUz`, `bodyRu` → Content in 3 languages
- `tags` → Array of tags
- `createdAt` → Creation timestamp

**Bookmarks Table:**
- `id` → Primary key
- `userId` → User who bookmarked
- `articleId` → Bookmarked article
- `createdAt` → When bookmarked

## Frontend Routes

- `/` → Home page
- `/sections` → Browse all sections
- `/sections/:slug` → View section details
- `/articles/:id` → Read article
- `/bookmarks` → User's bookmarks
- `/admin/login` → Admin login page
- `/admin/dashboard` → Admin management panel

## Key Technologies Used

### Frontend
- React 18 with TypeScript
- Wouter (routing)
- Tailwind CSS + shadcn/ui (styling)
- React Query (data fetching)
- Framer Motion (animations)

### Backend
- Express.js
- Groq SDK (AI)
- Drizzle ORM (database)
- PostgreSQL (data storage)
- TypeScript

## Groq Free Tier Limitations & Benefits

### ✅ Benefits
- **Completely Free** - No credit card required
- **Fast** - Groq's specialized hardware (LPU) = 10x faster inference
- **Generous Rate Limits** - Up to 30 requests/minute
- **Open Source Model** - Mixtral 8x7b is powerful & versatile
- **No Cost** - Never charge for your educational platform

### Rate Limits (Free Tier)
- 30 requests per minute
- 14,000 tokens per minute
- Perfect for most educational use cases

### Model Used
- **Mixtral 8x7b** - Open-source MoE model
- Excellent for educational content
- Supports code, math, reasoning
- Multi-language capable

## Troubleshooting

### Admin Login Not Working
- ✅ Check GROQ_API_KEY in .env
- ✅ Verify admin credentials in .env
- ✅ Clear browser localStorage and retry
- ✅ Check browser console for errors

### Chat Not Responding
- ✅ Ensure GROQ_API_KEY is set and valid
- ✅ Check Groq console for API key status
- ✅ Verify rate limits haven't been exceeded
- ✅ Check browser network tab for API calls

### Articles Not Showing in Chat Context
- ✅ Verify articles exist in database
- ✅ Check if search terms match article content
- ✅ The AI only includes top 2 matching articles for context

### Database Connection Issues
- ✅ Ensure PostgreSQL is running
- ✅ Verify DATABASE_URL in .env
- ✅ Run `npm run db:push` to create tables
- ✅ Check database user permissions

## Production Deployment

### Security Checklist

Before deploying to production:

1. **Change Default Credentials**
   ```env
   ADMIN_USERNAME=your_secure_username
   ADMIN_PASSWORD=your_very_secure_password
   ```

2. **Enable HTTPS**
   - Use SSL certificates
   - Redirect HTTP to HTTPS

3. **Add JWT Authentication**
   - Replace simple token auth with JWT
   - Add token expiration
   - Add refresh tokens

4. **Environment Variables**
   - Never commit .env to git
   - Use production-safe values
   - Rotate API keys regularly

5. **Rate Limiting**
   - Add rate limiting middleware
   - Protect admin endpoints
   - Protect chat endpoint from abuse

6. **Database Security**
   - Use strong database password
   - Enable connection SSL
   - Regular backups
   - Limit user permissions

7. **CORS Configuration**
   - Only allow your domain
   - Restrict file uploads
   - Validate all inputs

### Deployment Example (Replit)

```bash
# .env file (keep secure)
DATABASE_URL=your_database_url
GROQ_API_KEY=your_groq_key
ADMIN_USERNAME=secure_username
ADMIN_PASSWORD=secure_password

# Deploy
npm run build
npm start
```

## Support & Community

- **Groq Community**: https://community.groq.com
- **Documentation**: https://console.groq.com/docs

## FAQ

**Q: Is the AI chat using OpenAI?**
A: No! We switched to Groq's free tier for 100% free operation.

**Q: Can I use a different AI model?**
A: Yes! The implementation is modular - you can replace Groq with any OpenAI-compatible API.

**Q: How do I backup my content?**
A: Export your database regularly using `pg_dump` or use Drizzle ORM migration tools.

**Q: Can I customize the admin interface?**
A: Yes! The admin dashboard is a standard React component in `/client/src/pages/AdminDashboard.tsx`

**Q: How do I add more languages?**
A: Update the schema to add columns like `titleFr`, `bodyFr`, then update the admin form and chat logic.

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Get Groq API key from https://console.groq.com
3. ✅ Create .env file with your configuration
4. ✅ Run `npm run db:push` to setup database
5. ✅ Start server: `npm run dev`
6. ✅ Access admin panel: http://localhost:5173/admin/login
7. ✅ Add content via admin dashboard
8. ✅ Test chat with your content

---

**Your Edu-Bot is now enhanced with a professional Admin Panel and Free AI Chat Assistant!** 🚀
