# Lead Management — Mini CRM
A lightweight CRM for capturing leads, tracking their source and status, and managing your sales pipeline. Built with **React 19 + Node.js + Tailwind CSS + shadcn/ui**, backed by **Supabase (PostgreSQL)**.
---
## Features
- **Add leads** — capture name, phone, and source (Call / WhatsApp / Field)
- **Status tracking** — manage lifecycle through New → Interested → Not Interested → Converted
- **Search & filter** — quickly find leads by name/phone or filter by status
- **Stats overview** — at-a-glance totals, interested count, and converted count
- **Real-time data** — all data persists to a cloud PostgreSQL database
---
## Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (React 19, file-based routing, SSR) |
| Styling | Tailwind CSS v4 + shadcn/ui components |
| Backend | Supabase — PostgreSQL + Node.js |
| Database | PostgreSQL (managed via Lovable Cloud) |
---
## Prerequisites
- **Node.js 20+** (or Bun)
- **npm** or **bun** package manager

## Getting Started
### 1. Install dependencies
```bash
npm install
# or
bun install
```
### 2. Run the development server
```bash
npm run dev
# or
bun dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
### 3. Build for production
```bash
npm run build
# or
bun run build
```
---
## Project Structure
```
├── src/
│   ├── routes/                # File-based TanStack routes
│   │   ├── __root.tsx         # Root layout (head, providers)
│   │   └── index.tsx          # Home / Lead Management page
│   ├── components/ui/         # shadcn/ui components (Button, Card, Input, etc.)
│   ├── integrations/
│   │   └── supabase/          # Supabase client, types, auth middleware
│   ├── styles.css             # Tailwind CSS + design tokens
│   ├── router.tsx             # TanStack Router configuration
│   └── server.ts / start.ts   # Server bootstrap
├── supabase/
│   ├── migrations/            # Database migrations (leads table, RLS policies)
│   └── config.toml            # Supabase project config
├── .env                       # Environment variables
├── vite.config.ts             # Vite + TanStack plugin config
├── wrangler.jsonc             # Cloudflare Workers config
└── package.json
```
---
## Database Schema
### `leads` table
| Column     | Type                                    | Notes                     |
|------------|----------------------------------------|---------------------------|
| `id`       | `uuid` (PK, auto)                      |                           |
| `name`     | `text` (not null)                      | Lead's full name          |
| `phone`    | `text` (not null)                      | Phone number              |
| `source`   | `enum: Call, WhatsApp, Field`            | How the lead was captured |
| `status`   | `enum: New, Interested, Not Interested, Converted` | Default: New |
| `created_at` | `timestamptz` (auto)                 |                           |
| `updated_at` | `timestamptz` (auto)                 |                           |
### Security
- **Row Level Security (RLS)** is enabled with permissive policies for anonymous access (suitable for open CRM use).
- See `supabase/migrations/` for exact policy definitions.
---
