# thorappankochunni

A minimalist, secure file and text transfer platform designed to transfer PDFs, documents, code snippets, notes, and images between college lab computers and home.

---

## Features

- **Single Password Access**: No registration required. Enter your assigned access password to enter.
- **3-Tier Permissions**:
  - **Viewer**: Browse, filter, search, view code/text, and download files.
  - **Uploader**: Viewer capabilities + upload files (PDFs, images, archives) and save quick text/code notes.
  - **Admin**: Full control: upload, delete any item, and manage passwords for all roles.
- **Box Card Layout**: Every item is organized in a structured card with file type icons, sizes, and timestamps.
- **Lab Utilities**:
  - **Quick Paste Code / Text**: Transfer snippets without creating local files on lab computers.
  - **Instant Logout**: Destroy session cookies before leaving public or shared machines.
  - **Live Search & Filter**: Filter by All, Files, PDFs, Images, or Notes.
- **Server-Side Security**:
  - Passwords stored as bcrypt hashes in Supabase (`app_passwords` table).
  - Signed HTTP-Only session cookies.
  - Supabase Service Role key stays strictly on the server.

---

## Password Management

### Option A: Web App Admin Settings
1. Enter the **Admin Password** on the lock screen.
2. Click **Settings** in the top navigation bar.
3. Select any role (`viewer`, `uploader`, or `admin`), enter the new password, and save.

### Option B: Directly via SQL in Supabase
In Supabase -> **SQL Editor**, run:

```sql
-- Change Viewer password:
UPDATE app_passwords 
SET password_hash = crypt('YourNewViewerPassword', gen_salt('bf', 10)), updated_at = NOW() 
WHERE role = 'viewer';

-- Change Uploader password:
UPDATE app_passwords 
SET password_hash = crypt('YourNewUploaderPassword', gen_salt('bf', 10)), updated_at = NOW() 
WHERE role = 'uploader';

-- Change Admin password:
UPDATE app_passwords 
SET password_hash = crypt('YourNewAdminPassword', gen_salt('bf', 10)), updated_at = NOW() 
WHERE role = 'admin';
```

---

## Setup & Deployment

### 1. Supabase Database & Storage
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** -> copy and paste all contents of [`supabase_schema.sql`](./supabase_schema.sql) -> click **Run**.
3. Default passwords seeded:
   - Viewer: `viewer123`
   - Uploader: `uploader123`
   - Admin: `admin123`
4. Copy your credentials from **Project Settings** -> **API**:
   - Project URL
   - anon key
   - service_role key

*(See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for full instructions).*

### 2. Run Locally
1. Copy `.env.example` to `.env.local` and add your keys:
   ```bash
   cp .env.example .env.local
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

### 3. Deploy to Vercel
1. Push this project to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Add the 4 environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH_SECRET` (random string > 32 characters)
4. Click **Deploy**.

*(See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for step-by-step instructions).*
