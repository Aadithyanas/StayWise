# StayWise — Property Booking Platform

Monorepo with `backend` (Express + MongoDB) and `frontend` (Next.js App Router + Tailwind). TypeScript throughout. JWT auth, role-based admin, bookings.

## Features

- **Welcome Page**: Beautiful landing page with featured hotels and booking functionality
- **No-Login Booking**: Users can book hotels without creating an account
- **Hotel Search**: Search and filter hotels by location, dates, and guests
- **Booking Modal**: Complete booking form with price calculation
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Quick Start

Prereqs: Node 18+, npm, MongoDB running locally.

1) Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Seed sample data (admin + properties):

```bash
npm run seed
```

2) Frontend

```bash
cd ../frontend
npm install
npm run dev
```

## API Overview

- `GET /api/health`
- `POST /api/auth/signup { email, password }`
- `POST /api/auth/login { email, password }`
- `GET /api/properties`
- `GET /api/properties/:id`
- `POST /api/bookings` (auth)
- `GET /api/bookings/mine` (auth)
- `GET /api/bookings/all` (admin)

Auth: `Authorization: Bearer <token>`

## Frontend ENV

Create `.env.local` in `frontend/` with:

```
NEXT_PUBLIC_API_BASE=http://localhost:4000/api
```