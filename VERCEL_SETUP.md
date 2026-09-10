# Vercel Deployment Guide for "thorappankochunni"

Deploying this app to Vercel is free, fast, and takes about 2 minutes.

---

### Step 1: Push Project to GitHub
1. Create a new GitHub repository (you can make it **Private** so only you can see your repository).
2. In your terminal inside the project directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for thorappankochunni"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/thorappankochunni.git
   git push -u origin main
   ```

---

### Step 2: Import Project in Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in (e.g. with your GitHub account).
2. Click **"Add New..."** -> **"Project"**.
3. Under **"Import Git Repository"**, select your `thorappankochunni` repository and click **Import**.

---

### Step 3: Configure Environment Variables in Vercel
Before clicking Deploy, expand the **"Environment Variables"** accordion section on the Vercel setup page and add the following 4 variables:

| Variable Name | Value Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase `service_role` secret key |
| `AUTH_SECRET` | Any long secret string (e.g. `thorappan_super_secure_vault_pass_2025`) |

---

### Step 4: Click Deploy!
1. Click **"Deploy"**.
2. Vercel will build the Next.js app in ~45 seconds and give you a live production URL:
   `https://thorappankochunni.vercel.app` (or your custom project domain).
3. Open the link on any device:
   - College Lab PC: enter the **Uploader** password to drop files or notes.
   - Home PC: enter the **Viewer** or **Admin** password to view, download, or manage all files!

---

### Pro-Tips for College Lab Use:
- **Lab Privacy**: When you are finished transferring files in your lab, click the **"Lock / Logout"** button in the top bar to immediately delete the session cookie on the lab computer.
- **Bookmarks**: Bookmark your Vercel URL on your mobile phone or write down your short Vercel domain so you can easily type it on any lab PC.
