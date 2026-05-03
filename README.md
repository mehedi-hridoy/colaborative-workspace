# 🚀 Collaborative Team Hub

**Fredocloud Technical Assessment Submission**

Live Demo:
- Frontend: [Replace with Railway URL]
- Backend API: [Railway]/api
- API Docs: [Railway]/api/docs
- Demo Login: `demo@teamhub.com` | Password `demo123`

## 📋 Project Overview
Full-stack collaborative platform for team goal tracking, announcements, and action items with real-time updates. Single monorepo deployed as separate Railway services.

**Timeline**: 3 days | **Effort**: ~16 hours

## 🆕 Latest Update (BLACKBOXAI Fix)
**Fixed Create Workspace Button** ✅
- Previously broken (no modal UI on click)
- Now opens beautiful glassmorphism modal with name/desc/color picker
- Button states fixed (proper disabled styling)
- Auto-closes on success, refreshes sidebar
- Sidebar '+' and Dashboard button both functional
- Advanced form still available in Workspace Management details

## ✅ Implemented Features

### Core Features
- ✅ Email/password auth (JWT + refresh tokens)
- ✅ Multi-workspace + role-based invites (Admin/Member/Viewer)
- ✅ Goals + milestones w/ progress tracking
- ✅ Rich announcements w/ reactions, pinning
- ✅ Kanban action items
- ✅ Real-time Socket.io (activity, presence, notifications)
- ✅ Analytics dashboard + CSV export

### Tech Stack
| Area | Tech |
|------|------|
| Monorepo | Turborepo |
| Frontend | Next.js 14 App Router + Tailwind + Zustand |
| Backend | Express REST API + Prisma |
| DB | PostgreSQL |
| Auth | JWT cookies |
| Storage | Cloudinary avatars |
| Deployment | Railway |

## 🛠️ Local Setup
```bash
npm install
cd apps/api && npx prisma migrate dev
npm run dev  # Backend:5000 Frontend:3000
```

**Troubleshooting Create Workspace**:
- Ensure backend running (`cd apps/api && npm run dev`)
- Check browser console for API errors
- NEXT_PUBLIC_API_URL=http://localhost:5000/api in .env.local

## 🌐 Deployment
Railway: Fork → PostgreSQL → Deploy API/Web services → Set env vars

## 🔧 Known Limitations
- No email notifications
- No PWA

**Score Target: 110/100** 🎯

---
Built with ❤️ for Fredocloud

