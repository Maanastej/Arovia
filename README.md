# 🏥 Arovia Care Connect

> A world-class medical tourism platform connecting patients with top-tier accredited hospitals in India — built with React, Supabase, and deployed on Vercel.

🌐 **Live Site**: [arovia-care-connect.vercel.app](https://arovia-care-connect.vercel.app)

---

## ✨ Features

### For Patients
- 🔐 **Auth** — Secure sign-up / sign-in with Supabase Auth
- 🗂️ **Treatment Browser** — Browse categorised treatments (Dental, Cosmetic, Orthopedic, Cardiology, Fertility, Health Screening) with pricing estimates
- 📅 **Appointment Booking** — Book consultations directly from treatment detail pages
- 💬 **AI Concierge Chat** — Real-time messaging with an in-app medical concierge assistant
- 📁 **Medical Records Vault** — Upload and manage personal medical documents
- 📊 **Patient Dashboard** — Overview of journeys, appointments, records, and messages

### For Admins
- 🛡️ **Secure Admin Portal** — Role-based access (admin flag in `profiles` table)
- 📋 **Bookings Management** — View all patient appointments with search, status filter, and approve/reject/complete actions
- 💬 **Patient Chat Viewer** — See all patient conversations grouped by user with full threaded message history
- 📈 **Stats Overview** — Live counts for total bookings, unique patients, pending requests, and messages

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Animation** | Framer Motion |
| **Backend / DB** | Supabase (PostgreSQL + Auth + RLS) |
| **Hosting** | Vercel |
| **State** | React Query + React hooks |

---

## 🚀 Local Development

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A [Supabase](https://supabase.com) project

### 2. Clone & install
```sh
git clone https://github.com/Maanastej/arovia-care-connect.git
cd arovia-care-connect/arovia-care-connect-main
npm install
```

### 3. Set up environment variables
```sh
cp .env.example .env
```
Fill in your values in `.env`:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_GEMINI_API_KEY="your-gemini-api-key"
```
> Get these from **Supabase Dashboard → Settings → API**

### 4. Set up the database
Run the full schema in **Supabase Dashboard → SQL Editor**:
```sh
# Copy and paste the contents of supabase/full_setup.sql into the SQL editor and run it
```

### 5. Start the dev server
```sh
npm run dev
# → http://localhost:5173
```

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `profiles` | User metadata (name, avatar, `is_admin` flag) |
| `treatments` | Treatment catalogue with category, price, duration |
| `appointments` | Patient bookings linked to treatments |
| `medical_records` | Uploaded patient documents |
| `messages` | Patient ↔ AI concierge chat history |

Row Level Security (RLS) is enabled on all tables. Admin access uses a `SECURITY DEFINER` function (`public.is_admin()`) to safely bypass RLS circular dependencies.

---

## ☁️ Deploying to Vercel

1. Import the GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `arovia-care-connect-main`
3. Add environment variables in **Project Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_GEMINI_API_KEY`
4. Deploy — Vercel auto-deploys on every push to `main`
5. Add your Vercel domain to **Supabase → Authentication → URL Configuration**

---

## 📁 Project Structure

```
src/
├── components/        # Shared UI components + shadcn/ui
├── pages/
│   ├── Index.tsx          # Landing page
│   ├── Auth.tsx           # Sign in / Sign up
│   ├── Dashboard.tsx      # Patient dashboard
│   ├── AdminDashboard.tsx # Admin portal
│   ├── Treatments.tsx     # Treatment catalogue
│   └── TreatmentDetail.tsx
├── integrations/
│   └── supabase/      # Auto-generated Supabase client + types
└── hooks/             # Custom React hooks

supabase/
└── full_setup.sql     # Full DB schema, RLS policies, seed data
```

---

## 🔐 Making a User an Admin

In **Supabase Dashboard → Table Editor → profiles**, find the user's row and set `is_admin = true`.

---

## 📄 License

<!-- Deployment Nudge: 2026-02-25T08:15:00Z -->

MIT © Arovia Care Connect
