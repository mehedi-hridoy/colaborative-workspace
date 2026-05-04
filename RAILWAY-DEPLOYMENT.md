# 🚀 Railway Deployment Guide - TeamFlow

Complete step-by-step deployment for both API and Web services on Railway.

---

## ✅ Pre-Deployment Checklist

- [x] **Verified** - Backend has all environment variables configured
- [x] **Verified** - Frontend uses environment variables for API URLs (no hardcoded localhost)
- [x] **Verified** - Database connections use proper configuration
- [x] **Verified** - JWT secrets configured
- [x] **Verified** - Socket.io CORS properly configured
- [x] **Verified** - Prisma migrations ready
- [x] **Verified** - Build scripts configured in package.json

---

## 📋 Environment Variables Required

### Backend (API Service)
```env
DATABASE_URL=postgresql://...  # Auto-injected by Railway PostgreSQL plugin
JWT_ACCESS_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<strong-random-string>
API_URL=https://teamflow-api.up.railway.app  # Public API URL
CLIENT_URL=https://teamflow-web.up.railway.app  # Frontend URL for CORS
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

### Frontend (Web Service)
```env
NEXT_PUBLIC_API_URL=https://teamflow-api.up.railway.app
NEXT_PUBLIC_SOCKET_URL=https://teamflow-api.up.railway.app
```

---

## 🎯 Step-by-Step Deployment

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub" or "Blank Project"
4. Name it: `teamflow`

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "+ Add Service"
2. Click "Add from Marketplace"
3. Search for "PostgreSQL"
4. Select PostgreSQL and confirm
5. Railway automatically creates and injects `DATABASE_URL` ✅

### Step 3: Deploy Backend Service (API)

1. Click "+ Add Service"
2. Select "GitHub Repo" (connect your repo)
3. Select the repo and confirm
4. Railway detects `apps/api/package.json`
5. Configure in Service Settings:

   **Build Settings:**
   - Build Command: `npm install && npm run build`
   - Root Directory: `apps/api`
   
   **Deploy Settings:**
   - Start Command: `npm start` (runs `prisma migrate deploy && node src/server.js`)

6. Click "Generate Domain" (gets `https://teamflow-api.up.railway.app`)

7. Add Environment Variables in Variables tab:
   ```env
   JWT_ACCESS_SECRET=<generate-with: openssl rand -base64 32>
   JWT_REFRESH_SECRET=<generate-with: openssl rand -base64 32>
   API_URL=https://teamflow-api.up.railway.app  # Use generated domain
   CLIENT_URL=https://teamflow-web.up.railway.app  # Will set after web deploys
   CLOUDINARY_CLOUD_NAME=<your-value>
   CLOUDINARY_API_KEY=<your-value>
   CLOUDINARY_API_SECRET=<your-value>
   ```

8. Click "Deploy" ✅

### Step 4: Deploy Frontend Service (Web)

1. Click "+ Add Service"
2. Select "GitHub Repo"
3. Select same repo and confirm
4. Railway detects `apps/web/package.json`
5. Configure in Service Settings:

   **Build Settings:**
   - Build Command: `npm run build`
   - Root Directory: `apps/web`
   
   **Deploy Settings:**
   - Start Command: `npm start`

6. Click "Generate Domain" (gets `https://teamflow-web.up.railway.app`)

7. Add Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://teamflow-api.up.railway.app
   NEXT_PUBLIC_SOCKET_URL=https://teamflow-api.up.railway.app
   ```

8. Click "Deploy" ✅

### Step 5: Update Backend CLIENT_URL

1. Go back to **API service** Variables tab
2. Update `CLIENT_URL` to `https://teamflow-web.up.railway.app`
3. Click "Redeploy" on the API service

---

## 🔗 Verify Deployment

1. **Test API:**
   - Navigate to `https://teamflow-api.up.railway.app`
   - Should see: "API is running 🚀"
   
2. **Test API Docs (Swagger):**
   - Navigate to `https://teamflow-api.up.railway.app/api/docs`
   - Should see interactive API documentation

3. **Test Frontend:**
   - Navigate to `https://teamflow-web.up.railway.app`
   - Should load the landing page

4. **Test Login:**
   - Try login with `admin@example.com` / `admin123`
   - Check Network tab for API calls to confirm URLs

---

## 🛠️ Environment Variable Generation

### Generate Strong JWT Secrets
```bash
# On macOS/Linux
openssl rand -base64 32

# Output something like:
# xK8mZ9qPl2nJ7vR3xF5cG8m2bL4tY6pK9qW1eS0dZ+A=
```

---

## ⚙️ Build & Start Scripts

**Backend (`apps/api/package.json`):**
```json
{
  "scripts": {
    "build": "npx prisma generate",
    "start": "npx prisma migrate deploy && node src/server.js",
    "dev": "node src/server.js"
  }
}
```

**Frontend (`apps/web/package.json`):**
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

---

## 🐛 Troubleshooting

### Backend won't start: "DATABASE_URL not found"
- Ensure PostgreSQL plugin is added before deploying API
- Railway auto-injects DATABASE_URL

### Frontend shows "Failed to fetch API"
- Verify `NEXT_PUBLIC_API_URL` matches API service domain
- Check API service is running and accessible

### CORS errors
- Verify `CLIENT_URL` is set correctly in backend
- Must match frontend domain exactly

### Socket.io connection failed
- Verify `NEXT_PUBLIC_SOCKET_URL` matches API domain
- Backend CORS must allow the frontend URL

---

## 📊 Service Architecture

```
Railway Project: teamflow
│
├── PostgreSQL (Auto-injected DATABASE_URL)
│
├── API Service (Backend)
│   ├── Domain: https://teamflow-api.up.railway.app
│   ├── Root: apps/api
│   └── Env: JWT_*, CLOUDINARY_*, CLIENT_URL, API_URL
│
└── Web Service (Frontend)
    ├── Domain: https://teamflow-web.up.railway.app
    ├── Root: apps/web
    └── Env: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL
```

---

## 🚀 After Deployment

1. **Verify both services are healthy** in Railway dashboard
2. **Test the full flow:**
   - Register a new account
   - Create a workspace
   - Create a goal
   - Real-time features work (Socket.io)

3. **Monitor logs** in Railway dashboard for errors

4. **Set up continuous deployment** (Railway auto-deploys on push if configured)

---

## 📝 Notes

- Railway PostgreSQL plugin automatically provides `DATABASE_URL` - never set it manually
- Both services must share the same `API_URL` and `CLIENT_URL` values
- Next.js build can take 2-3 minutes, be patient
- Socket.io requires the API to be publicly accessible

---

**Deployment Status: ✅ READY FOR RAILWAY**

All code is configured for production deployment with proper environment variables and no hardcoded localhost URLs.
