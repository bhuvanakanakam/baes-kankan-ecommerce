# Deploying Bae's Kankan to Vercel

## Step 1 — Push to GitHub
1. Create a new repo on github.com
2. In VS Code terminal:
```
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/baes-kankan.git
git push -u origin main
```

## Step 2 — Deploy to Vercel
1. Go to vercel.com → Sign up / Log in
2. Click "Add New Project" → Import your GitHub repo
3. Vercel auto-detects the config from vercel.json
4. Click Deploy

## Step 3 — Set Environment Variables on Vercel
In your Vercel project → Settings → Environment Variables, add:
```
DB_SERVER       = your-azure-sql-server.database.windows.net
DB_DATABASE     = webData
DB_USER         = your_username
DB_PASSWORD     = your_password
JWT_SECRET      = pick_a_long_random_string
```

## Step 4 — Database (for live deployment)
For Vercel deployment, SQL Server needs to be accessible from the internet.
Options (all have free tiers):
- **Azure SQL** (recommended — same Microsoft stack): portal.azure.com
- **Railway** (simple): railway.app → New → Database → SQL Server
- **PlanetScale** (if you switch to MySQL)

## Local Development
```
cd backend
npm install
node server.js
```
Then open: http://localhost:3001
