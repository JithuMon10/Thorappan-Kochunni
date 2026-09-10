# Supabase Setup Guide for "thorappankochunni"

Follow these simple steps to set up your Supabase database and storage bucket in less than 3 minutes.

---

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and log in or create a free account.
2. Click **"New Project"**.
3. Fill in:
   - **Name**: `thorappankochunni` (or any name you prefer)
   - **Database Password**: Choose a strong password and save it somewhere safe.
   - **Region**: Choose the region closest to you (e.g. `South Asia (Mumbai)` or closest to your location).
4. Click **"Create new project"** and wait ~1 minute for it to finish provisioning.

---

### Step 2: Run the SQL Schema Script (Creates Tables & Passwords)
1. In your Supabase project dashboard, click on the **SQL Editor** tab (icon looking like `>_` on the left sidebar).
2. Click **"New query"**.
3. Open the [supabase_schema.sql](file:///c:/Users/jva06/Desktop/Work/Yolo/supabase_schema.sql) file from this repository.
4. Copy all of its contents and paste it into the Supabase SQL Editor.
5. Click the green **"Run"** button.
   - This automatically creates the `app_passwords` table with default passwords:
     - **Viewer**: `viewer123`
     - **Uploader**: `uploader123`
     - **Admin**: `admin123`
   - It also creates the `posts` table and the `thorappankochunni_files` storage bucket.

---

### Step 3: How to View or Change Passwords via SQL

If you want to set your own custom passwords directly in Supabase using SQL:
In the **SQL Editor**, run:

```sql
-- To set Viewer password:
UPDATE app_passwords 
SET password_hash = crypt('YOUR_VIEWER_PASSWORD', gen_salt('bf', 10)), updated_at = NOW() 
WHERE role = 'viewer';

-- To set Uploader password:
UPDATE app_passwords 
SET password_hash = crypt('YOUR_UPLOADER_PASSWORD', gen_salt('bf', 10)), updated_at = NOW() 
WHERE role = 'uploader';

-- To set Admin password:
UPDATE app_passwords 
SET password_hash = crypt('YOUR_ADMIN_PASSWORD', gen_salt('bf', 10)), updated_at = NOW() 
WHERE role = 'admin';
```

*(Note: You can also change these passwords right from the web app's Admin Settings UI whenever you log in with the Admin password!)*

---

### Step 4: Verify the Storage Bucket
1. Click the **Storage** tab on the left sidebar.
2. You should see a bucket named `thorappankochunni_files`.
3. Make sure the bucket has **Public bucket** enabled (this was done automatically by the SQL script).
4. If you don't see it, simply click **"New bucket"**, name it `thorappankochunni_files`, toggle **"Public bucket"** to ON, and save.

---

### Step 5: Get Your API Keys
1. In your Supabase dashboard, click **Project Settings** (gear icon at the bottom left) -> **API**.
2. Copy the following 3 values:
   - **Project URL**: (e.g., `https://abcdefghijklm.supabase.co`) -> this is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key**: -> this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: (Click "Reveal" to view) -> this is `SUPABASE_SERVICE_ROLE_KEY` (Keep this secret! It allows your secure server API to manage files and check passwords).

You will paste these 3 keys into your `.env.local` for local running, and into **Vercel** for production deployment.
