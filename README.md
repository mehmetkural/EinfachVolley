# EinfachVolley

A web platform for organizing and managing volleyball communities — built to replace chaotic WhatsApp group coordination with a clean, purpose-built tool.

## Features

- **Match Management** — Create, schedule, and manage matches with one tap
- **RSVP & Waitlist** — Real-time attendance tracking with automatic waitlist promotion
- **Venue Management** — Integrated map-based venue discovery and management
- **Player Discovery** — Find local players that match your skill level
- **Stats & History** — Track win-rates, MVP awards, and seasonal progression
- **Admin Panel** — Community admin controls and oversight
- **Multi-language** — Full support for Turkish, English, and German (TR / EN / DE)
- **Dark Mode** — System-aware theme switching

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / DB | Firebase (Firestore + Storage) |
| State | Zustand |
| Maps | Leaflet + React-Leaflet |
| i18n | next-intl |
| Unit Tests | Vitest + Testing Library |
| E2E Tests | Playwright |

## Project Structure

```
EinfachVolley/
├── web/
│   ├── app/
│   │   ├── (auth)/         # sign-in, sign-up, reset-password
│   │   ├── admin/          # admin panel
│   │   ├── dashboard/      # user dashboard
│   │   ├── matches/        # match listing, creation, detail
│   │   ├── venues/         # venue listing
│   │   ├── profile/        # user profiles
│   │   └── store/          # app store / state
│   ├── components/         # shared UI components
│   ├── services/           # Firebase service layer
│   ├── contexts/           # React contexts (language, theme)
│   ├── models/             # data models / types
│   └── lib/                # utility functions
└── web/public/             # static assets
```

## Getting Started

```bash
# Install dependencies
cd web
pnpm install

# Run development server
pnpm dev

# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Build for production
pnpm build
```

## Status

Currently in **Early Access / Waitlist** phase. The platform is accepting beta testers for the first community launches.

## License

Private — All rights reserved.
