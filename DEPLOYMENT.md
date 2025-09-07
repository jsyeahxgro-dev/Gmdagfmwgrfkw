# 🚀 MCBE TIERS - Free Deployment Guide

## Overview
This guide will help you deploy your MCBE TIERS gaming leaderboard application for **completely free** using the best hosting platforms available in 2025.

## 🎯 Recommended Deployment Stack

**Frontend:** Vercel (Free tier)  
**Database:** Railway PostgreSQL (Free tier)  
**Total Cost:** $0/month for small to medium usage

---

## 📋 Prerequisites

Before deploying, make sure you have:
- [x] GitHub account
- [x] Vercel account (sign up at vercel.com)
- [x] Railway account (sign up at railway.app)
- [x] Your code pushed to a GitHub repository

---

## 🗄️ Step 1: Deploy Database (Railway)

### 1.1 Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy PostgreSQL"
5. Name your project "mcbe-tiers-db"

### 1.2 Get Database Connection Details
1. Click on your PostgreSQL service
2. Go to "Connect" tab
3. Copy the **DATABASE_URL** (it looks like: `postgresql://username:password@host:port/database`)

### 1.3 Set Up Database Schema
1. In Railway, go to your PostgreSQL service
2. Click "Query" tab
3. Run this command to set up your database:
```bash
# You can use Railway's built-in terminal or connect via any PostgreSQL client
# The database will be automatically set up when you deploy your app
```

---

## 🌐 Step 2: Deploy Frontend (Vercel)

### 2.1 Prepare Your Repository
Make sure your GitHub repository has these files in the root:
- `package.json`
- `vite.config.ts`
- Your entire project structure

### 2.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 2.3 Add Environment Variables
In Vercel project settings → Environment Variables, add:
```
DATABASE_URL=your_railway_database_url_here
NODE_ENV=production
```

### 2.4 Deploy
Click "Deploy" - Vercel will automatically build and deploy your app!

---

## 🔄 Step 3: Database Migration

After your first deployment:

1. In Vercel, go to your project
2. Click on "Functions" tab
3. Find a recent deployment log
4. You should see database tables being created automatically

Or manually run migration:
1. Clone your repo locally
2. Set DATABASE_URL environment variable
3. Run: `npm run db:push`

---

## 🎉 Step 4: You're Live!

Your app will be available at: `https://your-project-name.vercel.app`

---

## 💰 Free Tier Limits

### Vercel Free Tier:
- ✅ 100GB bandwidth/month
- ✅ 1000 serverless function executions/day
- ✅ Unlimited static sites
- ✅ Custom domains

### Railway Free Tier:
- ✅ $5 monthly credits (enough for small apps)
- ✅ 512MB RAM
- ✅ 1GB disk storage
- ✅ Shared CPU

**Perfect for:** Personal projects, portfolios, small-medium gaming communities

---

## 🔧 Alternative Free Options

### Option 2: Netlify + Supabase
**Frontend:** Netlify (Free)  
**Database:** Supabase (Free)

1. **Deploy to Netlify:**
   - Connect GitHub repo to Netlify
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Set up Supabase:**
   - Create account at supabase.com
   - Create new project
   - Get database URL from project settings
   - Add to Netlify environment variables

### Option 3: Railway Full-Stack
**Everything:** Railway (Free tier)

1. Connect GitHub repo to Railway
2. Railway auto-detects your app
3. Add PostgreSQL service
4. Deploy both frontend and backend together

---

## 🔄 Continuous Deployment

Both Vercel and Railway support automatic deployments:
- Push to GitHub main branch → Auto-deploy
- Pull requests → Preview deployments
- Real-time logs and monitoring

---

## 🛡️ Security Checklist

- [x] Environment variables (DATABASE_URL) are secure
- [x] No secrets in code
- [x] CORS properly configured
- [x] Database connection uses SSL
- [x] Admin authentication is secure

---

## 🐛 Troubleshooting

### Common Issues:

**Build Fails:**
- Check Node.js version (Railway uses Node 18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

**Database Connection Issues:**
- Verify DATABASE_URL format
- Check if database service is running
- Ensure environment variables are set correctly

**App Doesn't Load:**
- Check browser console for errors
- Verify API endpoints are working
- Check if database migration completed

---

## 📈 Monitoring & Scaling

### Free Monitoring:
- Vercel Analytics (free tier)
- Railway metrics dashboard
- Browser DevTools for client-side issues

### When to Upgrade:
- **Traffic:** > 100GB/month → Consider Vercel Pro
- **Database:** > 1GB storage → Upgrade Railway
- **Performance:** Add CDN, optimize images

---

## 🆕 Keeping Updated

To update your deployed app:
1. Make changes locally
2. Push to GitHub
3. Automatic deployment triggers
4. Check deployment logs for success

---

## 💡 Pro Tips

1. **Use Environment Variables:** Never hardcode URLs or secrets
2. **Test Locally First:** Use `npm run build` and `npm start` to test production mode
3. **Monitor Usage:** Keep an eye on free tier limits
4. **Backup Database:** Export your data regularly from Railway
5. **Custom Domain:** Both Vercel and Netlify support free custom domains

---

## 🏆 Your App is Now Live!

Congratulations! Your MCBE TIERS application is now running in production with:
- ⚡ Fast global CDN
- 🗄️ Reliable PostgreSQL database
- 🔄 Automatic deployments
- 📊 Real-time analytics
- 🛡️ HTTPS security
- 💰 $0 monthly cost

Share your live app with your gaming community and start ranking those PvP players! 🎮

---

*Need help? Check the troubleshooting section or contact support on the respective platforms.*