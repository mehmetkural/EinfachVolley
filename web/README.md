# EinfachVolley Web

Next.js 14 web application for EinfachVolley — the volleyball training app.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS 4 (dark mode, responsive)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Vercel
- **Package Manager**: pnpm

## Getting Started

### 1. Clone & install

```bash
git clone <repo-url>
cd web
pnpm install
```

### 2. Configure environment variables

Copy the example env file and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Firebase config values. Get them from:
**Firebase Console → Project Settings → General → Your apps → Web app → SDK setup**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Optional
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_APP_ENV=development
```

> **Security note**: All `NEXT_PUBLIC_` variables are exposed in the browser bundle.
> Never put secrets (Admin SDK keys, service account credentials) with the `NEXT_PUBLIC_` prefix.

### 3. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| `pnpm dev`      | Start development server   |
| `pnpm build`    | Build for production       |
| `pnpm start`    | Start production server    |
| `pnpm lint`     | Run ESLint                 |
| `pnpm format`   | Format code with Prettier  |
| `pnpm test`     | Run unit tests (Vitest)    |
| `pnpm test:e2e` | Run e2e tests (Playwright) |

## Firebase Setup

### Authentication

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password** and **Google** providers

### Firestore

1. Go to Firestore Database → Create database
2. Start in **production mode**
3. Apply security rules from `firebase/firestore.rules`

### Storage

1. Go to Storage → Get started
2. Apply appropriate security rules

## Deploying to Vercel

### Option A: Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New Project
3. Import your GitHub repository
4. Set **Root Directory** to `web`
5. Add all environment variables from `.env.example` in Vercel's Environment Variables settings
6. Deploy!

### Option B: Vercel CLI

```bash
npm i -g vercel
cd web
vercel --prod
```

> **Important**: Add all `NEXT_PUBLIC_FIREBASE_*` variables in Vercel's project settings.
> Without them, Firebase will not initialize in production.

## Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth route group (sign-in, sign-up, reset-password)
│   ├── api/health/         # Health check API endpoint
│   ├── dashboard/          # Protected dashboard
│   ├── support/            # Support page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components
├── contexts/               # React contexts (AuthContext)
├── firebase/               # Firebase initialization & utils
├── lib/                    # Utilities (logger, analytics, i18n, auth-guard)
├── models/                 # TypeScript type definitions
├── services/               # Data layer (Firestore, Storage)
├── tests/                  # Unit tests (Vitest)
├── playwright/             # E2E tests (Playwright)
└── middleware.ts           # Next.js middleware (route protection)
```
