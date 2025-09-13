# 📱 MOBILE DEPLOY GUIDE - RENDER.COM

## 📋 COMPLETE STEP-BY-STEP GUIDE FOR MOBILE

### 🔥 BEFORE YOU START
**Your app is 100% ready to deploy! All files are prepared.**

---

## 📱 STEP 1: GET GITHUB APP (if not installed)
1. Open **App Store** or **Google Play**
2. Search "**GitHub**"
3. Install the **GitHub** app
4. Sign in with your GitHub account

---

## 📱 STEP 2: UPLOAD YOUR CODE TO GITHUB

### Option A: GitHub Mobile App
1. Open **GitHub app**
2. Tap **"+"** (plus icon)
3. Tap **"New repository"**
4. Repository name: `mcbe-tiers-app`
5. Make it **Public**
6. Tap **"Create repository"**
7. **IMPORTANT**: You need to upload all your files from Replit to GitHub

### Option B: GitHub Website (Easier)
1. Open **browser** on mobile
2. Go to **github.com**
3. Tap **"+"** → **"New repository"**
4. Name: `mcbe-tiers-app`
5. Make it **Public**
6. Tap **"Create repository"**

### 📤 UPLOADING FILES FROM REPLIT:
1. In **Replit**, select all files
2. Download as ZIP
3. Extract ZIP on your device
4. In **GitHub**, tap **"uploading an existing file"**
5. Select ALL files from the extracted folder
6. Add commit message: "Initial upload"
7. Tap **"Commit changes"**

---

## 📱 STEP 3: SIGN UP FOR RENDER

1. Open **browser** on mobile
2. Go to **render.com**
3. Tap **"Get Started for Free"**
4. Choose **"Sign up with GitHub"**
5. Allow GitHub access
6. Verify your email

---

## 📱 STEP 4: CREATE DATABASE FIRST

1. In **Render Dashboard**, tap **"New +"**
2. Select **"PostgreSQL"**
3. Fill in:
   - **Name**: `mcbe-tiers-db`
   - **Database**: `mcbe_tiers`
   - **User**: `postgres`
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: 15
   - **Plan**: **Free**
4. Tap **"Create Database"**
5. **WAIT** for database to be created (2-3 minutes)
6. **COPY** the External Database URL (starts with `postgres://`)

---

## 📱 STEP 5: DEPLOY YOUR APP

1. In **Render Dashboard**, tap **"New +"**
2. Select **"Web Service"**
3. Choose **"Build and deploy from a Git repository"**
4. Tap **"Connect"** next to your GitHub account
5. Find and select **"mcbe-tiers-app"**
6. Tap **"Connect"**

### 🔧 Configure Service:
- **Name**: `mcbe-tiers-app`
- **Region**: Same as your database
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: `Node`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Plan**: **Free**

---

## 📱 STEP 6: SET ENVIRONMENT VARIABLES

**SCROLL DOWN** to **"Environment Variables"** section:

Add these **EXACT** variables:

1. **NODE_ENV**
   - Value: `production`

2. **PORT** 
   - Value: `5000`

3. **DATABASE_URL**
   - Value: **PASTE** the External Database URL you copied from Step 4
   - (Should look like: `postgres://username:password@host:5432/database`)

---

## 📱 STEP 7: DEPLOY!

1. Tap **"Create Web Service"**
2. **WAIT** for deployment (5-10 minutes)
3. Watch the **build logs**
4. When it shows **"Your service is live"**, you're done! 🎉

---

## 📱 STEP 8: ACCESS YOUR APP

1. Render will give you a URL like: `https://mcbe-tiers-app.onrender.com`
2. Tap the URL to open your app
3. **FIRST LOAD** might take 30 seconds (free tier)
4. Your app is now **LIVE ON THE INTERNET!** 🌍

---

## 🔧 IMPORTANT NOTES:

### ⚠️ Free Tier Limitations:
- App "sleeps" after 15 minutes of no activity
- First load after sleep takes ~30 seconds
- 750 hours/month free (enough for most usage)

### 🔄 To Update Your App:
1. Make changes in **Replit**
2. Upload new files to **GitHub**
3. Render **auto-deploys** the changes!

### 🆘 If Something Goes Wrong:
1. Check **"Logs"** in Render dashboard
2. Most common issue: Wrong DATABASE_URL
3. Make sure all environment variables are set correctly

---

## 🎯 YOUR APP FEATURES:
✅ Player tier management  
✅ Mobile responsive design  
✅ Admin panel  
✅ PostgreSQL database  
✅ Player profile modals  
✅ All game modes working  

**YOU'RE ALL SET! Your MCBE Tiers app is now live! 🚀**