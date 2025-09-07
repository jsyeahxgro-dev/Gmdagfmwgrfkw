# FREE DEPLOYMENT GUIDE - MCBE TIERS APP

Deploy your MCBE Tiers application completely FREE with database intact. This guide covers the **EASIEST and BEST** free deployment method.

## 🚀 RECOMMENDED FREE DEPLOYMENT: Vercel + Neon Database

**Why This Method:**
- ✅ 100% Free forever
- ✅ Automatic deployments from GitHub
- ✅ Keep your existing database data
- ✅ Professional custom domains
- ✅ Super fast worldwide CDN
- ✅ Zero configuration required

---

## STEP 1: EXPORT YOUR PROJECT TO GITHUB

### 1.1 Connect to GitHub
1. In your Replit project, click the **Tools** panel (left sidebar)
2. Click **Git** 
3. Click **Create Git Repo** if not already done
4. Click **Connect to GitHub**
5. Sign in to your GitHub account when prompted
6. Choose **"Create new repository"**
7. Name it: `mcbe-tiers-app`
8. Click **Create Repository**

### 1.2 Push Your Code
1. In the Git panel, you'll see your files listed
2. Click **Commit & Push** 
3. Add commit message: `Initial deployment setup`
4. Click **Commit & Push**

Your code is now on GitHub! ✅

---

## STEP 2: BACKUP YOUR CURRENT DATABASE

### 2.1 Export Database Data
1. In your Replit project, open a **new Shell tab**
2. Run this command to export your data:
```bash
echo "COPY players TO STDOUT WITH CSV HEADER;" | psql $DATABASE_URL > players_backup.csv
```

3. Download the backup file:
   - Click **Files** in the left sidebar  
   - Find `players_backup.csv`
   - Right-click → **Download**
   - Save it to your computer

Your database data is now safely backed up! ✅

---

## STEP 3: CREATE FREE NEON DATABASE

### 3.1 Sign Up for Neon (FREE)
1. Go to [neon.tech](https://neon.tech)
2. Click **Get Started** (top right)
3. Sign up with GitHub (recommended)
4. Choose **Free Plan** (0$ forever)

### 3.2 Create Your Database
1. Click **Create Project**
2. Project Name: `mcbe-tiers`
3. Database Name: `mcbe_tiers`
4. Region: Choose closest to your users
5. Click **Create Project**

### 3.3 Save Database Connection
1. On the project dashboard, click **Connection Details**
2. Copy the **Connection string** (starts with `postgresql://`)
3. Save this - you'll need it in Step 5

Your production database is ready! ✅

---

## STEP 4: RESTORE DATA TO NEON DATABASE

### 4.1 Install PostgreSQL Client (if needed)
**On Windows:**
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Add to PATH during installation

**On Mac:**
```bash
brew install postgresql
```

**On Linux:**
```bash
sudo apt install postgresql-client
```

### 4.2 Create Database Tables
1. Open terminal/command prompt
2. Connect to your Neon database:
```bash
psql "YOUR_NEON_CONNECTION_STRING_HERE"
```
3. Create the players table:
```sql
CREATE TABLE players (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    skywars_tier text NOT NULL DEFAULT 'NR',
    midfight_tier text NOT NULL DEFAULT 'NR', 
    uhc_tier text NOT NULL DEFAULT 'NR',
    nodebuff_tier text NOT NULL DEFAULT 'NR',
    bedfight_tier text NOT NULL DEFAULT 'NR'
);
```
4. Type `\\q` to exit

### 4.3 Import Your Data
1. Upload your backup data:
```bash
psql "YOUR_NEON_CONNECTION_STRING_HERE" -c "\\copy players(name,skywars_tier,midfight_tier,uhc_tier,nodebuff_tier,bedfight_tier) FROM 'players_backup.csv' WITH CSV HEADER;"
```

Your data is now in production database! ✅

---

## STEP 5: DEPLOY TO VERCEL (FREE)

### 5.1 Sign Up for Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** 
3. Choose **Sign up with GitHub**
4. Authorize Vercel to access your repositories

### 5.2 Import Your Project
1. On Vercel dashboard, click **New Project**
2. Find `mcbe-tiers-app` repository 
3. Click **Import**

### 5.3 Configure Environment Variables
1. In **Environment Variables** section, add:
   - Variable: `DATABASE_URL`
   - Value: Your Neon connection string from Step 3.3
2. Click **Add**

### 5.4 Configure Build Settings
1. **Root Directory**: Leave empty (root)
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

### 5.5 Deploy
1. Click **Deploy**
2. Wait 2-3 minutes for deployment
3. You'll get a live URL like: `your-app.vercel.app`

Your app is LIVE! ✅

---

## STEP 6: TEST YOUR LIVE APP

### 6.1 Verify Everything Works
1. Visit your Vercel URL
2. Check that all players show up with correct tiers
3. Test admin login with password: `admin123`  
4. Try adding/editing players
5. Verify overall rankings update automatically

### 6.2 Custom Domain (Optional & FREE)
1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS setup instructions
5. Get free SSL certificate automatically

---

## STEP 7: AUTOMATIC UPDATES

### 7.1 Set Up Auto-Deployment
This is already configured! Every time you push to GitHub:
1. Make changes in Replit
2. Use Git panel to **Commit & Push**
3. Vercel automatically rebuilds and deploys
4. Your live site updates in ~2 minutes

---

## 🎉 CONGRATULATIONS! 

Your MCBE Tiers app is now:
- ✅ **LIVE** on a professional URL
- ✅ **FREE** hosting forever  
- ✅ **FAST** worldwide performance
- ✅ **AUTO-UPDATING** from your changes
- ✅ **SECURE** with SSL certificate
- ✅ **SCALABLE** handles unlimited users

---

## TROUBLESHOOTING

### Database Connection Issues
If you get database errors:
1. Verify your `DATABASE_URL` is correct in Vercel
2. Check Neon database is running (should always be)
3. Re-deploy by pushing a small change to GitHub

### Build Failures  
If deployment fails:
1. Check Vercel build logs
2. Ensure all dependencies are in `package.json`
3. Verify build command is `npm run build`

### Missing Data
If players don't show up:
1. Check database connection with: `psql "YOUR_CONNECTION_STRING"`
2. Run: `SELECT * FROM players;`
3. Re-import data if needed using Step 4.3

---

## COST BREAKDOWN (SPOILER: $0!)

| Service | Monthly Cost | Features |
|---------|-------------|-----------|
| **Vercel** | $0 | Hosting, SSL, CDN, Auto-deployment |
| **Neon Database** | $0 | 3GB storage, 100 compute hours |
| **GitHub** | $0 | Code repository, version control |
| **TOTAL** | **$0** | Professional production setup |

Your app can handle thousands of users completely FREE! 🚀

---

## ADVANCED FREE ALTERNATIVES

### Option 2: Netlify + Supabase
- Netlify (frontend): Free hosting
- Supabase (database): Free PostgreSQL + API
- Slightly more complex setup

### Option 3: Railway 
- Railway (full-stack): $0/month for 500 hours
- All-in-one platform
- Great for simple deployments

### Option 4: Render
- Render (full-stack): Free web services 
- PostgreSQL included
- Slower than Vercel but simpler

**Recommendation: Stick with Vercel + Neon for best performance and reliability!**