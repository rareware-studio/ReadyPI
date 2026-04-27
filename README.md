# ReadyPi — AI API Aggregation Platform

**Bangladesh's first AI API gateway with bKash/Nagad payment integration**

## 🎯 Project Overview

ReadyPi aggregates 50+ AI models (OpenAI, Anthropic, Google, DeepSeek, Groq) behind a single OpenAI-compatible API endpoint, with BDT pricing and local payment methods.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  (Developer's App using OpenAI SDK with ReadyPi base URL)  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    READYPI API GATEWAY                      │
│  • Authentication (API Key validation)                      │
│  • Credit balance check                                     │
│  • Model routing logic                                      │
│  • Token counting & billing                                 │
│  • Request/response logging                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
   ┌─────────┐         ┌─────────┐        ┌─────────┐
   │  Groq   │         │ Google  │        │ OpenAI  │
   │ (Llama) │         │(Gemini) │        │(GPT-4o) │
   └─────────┘         └─────────┘        └─────────┘
```

## 📦 Tech Stack

### Backend (API Gateway)
- **Runtime:** Node.js 20+ with Express
- **Database:** PostgreSQL 16
- **Auth:** JWT + bcrypt for API keys
- **Payment:** SSLCommerz (bKash/Nagad), NOWPayments (crypto)

### Frontend (Dashboard)
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (free tier)

### Infrastructure
- **API Server:** DigitalOcean Droplet ($24/mo)
- **Database:** PostgreSQL on same droplet
- **Domain:** readypi.io (Namecheap)

## 🗄️ Database Schema

See `database/schema.sql` for full schema.

**Core Tables:**
- `users` — User accounts, email, password hash
- `api_keys` — API keys (bcrypt hashed), user_id FK
- `credits` — Credit balance per user
- `transactions` — Payment history (bKash/Nagad/USDT)
- `usage_logs` — API call logs (model, tokens, cost)
- `subscriptions` — Monthly plan subscriptions

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm or pnpm

### 1. Clone & Install
```bash
cd /Users/ahmedxriyaz/Desktop/ReadyPI
npm install
```

### 2. Database Setup
```bash
# Create database
createdb readypi

# Run migrations
psql readypi < database/schema.sql
```

### 3. Environment Variables
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Start Development Server
```bash
npm run dev
# API runs on http://localhost:3000
```

## 📁 Project Structure

```
ReadyPI/
├── api/                    # API Gateway (Node.js/Express)
│   ├── server.js          # Main Express app
│   ├── routes/            # API routes
│   │   ├── chat.js        # /v1/chat/completions (OpenAI-compatible)
│   │   ├── auth.js        # /auth/* (signup, login)
│   │   ├── credits.js     # /credits/* (balance, top-up)
│   │   └── keys.js        # /keys/* (API key management)
│   ├── middleware/        # Express middleware
│   │   ├── auth.js        # JWT + API key validation
│   │   ├── rateLimit.js   # Rate limiting by plan tier
│   │   └── billing.js     # Credit deduction logic
│   ├── services/          # Business logic
│   │   ├── router.js      # Model routing (Groq, Gemini, OpenAI)
│   │   ├── tokenizer.js   # Token counting (tiktoken)
│   │   └── payment.js     # SSLCommerz + NOWPayments integration
│   └── utils/             # Helpers
│       ├── logger.js      # Winston logging
│       └── db.js          # PostgreSQL connection pool
├── dashboard/             # Next.js Dashboard
│   ├── app/               # Next.js 14 App Router
│   │   ├── page.tsx       # Landing page
│   │   ├── dashboard/     # User dashboard
│   │   ├── pricing/       # Pricing page
│   │   └── docs/          # API documentation
│   ├── components/        # React components
│   └── lib/               # Client-side utilities
├── database/              # Database files
│   ├── schema.sql         # PostgreSQL schema
│   └── migrations/        # Future migrations
├── docs/                  # Documentation
│   ├── API.md             # API reference
│   └── DEPLOYMENT.md      # Deployment guide
├── .env.example           # Environment variables template
├── package.json           # Dependencies
└── README.md              # This file
```

## 🔑 API Key Format

All ReadyPi API keys follow this format:
```
rpi_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
rpi_test_x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4
```

- Prefix: `rpi_` (identifies ReadyPi keys)
- Environment: `live_` or `test_`
- Key: 32-character hex string
- Stored as bcrypt hash in database

## 💳 Payment Flow

### bKash/Nagad (via SSLCommerz)
1. User clicks "Top Up ৳499"
2. Backend creates SSLCommerz session
3. User redirected to bKash/Nagad payment page
4. After payment, SSLCommerz webhook hits `/api/payment/callback`
5. Backend verifies payment, adds credits to user account
6. User redirected to dashboard with success message

### USDT/BTC (via NOWPayments)
1. User selects "Pay with Crypto"
2. Backend creates NOWPayments invoice
3. User sends USDT/BTC to provided address
4. NOWPayments webhook confirms payment
5. Credits added automatically

## 📊 Pricing Model

**Credit System:**
- 1 credit = 1,000 tokens
- Credits never expire
- Deducted in real-time per API call

**Subscription Plans:**
| Plan | Price | Credits/mo | Rate Limit |
|------|-------|------------|------------|
| Free | ৳0 | 50 (50K tokens) | 10 req/min |
| Starter | ৳499 | 10,000 (10M tokens) | 60 req/min |
| Pro | ৳999 | 25,000 (25M tokens) | 200 req/min |
| Team | ৳2,999 | 100,000 (100M tokens) | 1000 req/min |

**Pay-As-You-Go:**
- ৳199 → 1M tokens
- ৳499 → 3M tokens
- ৳999 → 7M tokens
- ৳1,999 → 18M tokens
- ৳4,999 → 50M tokens

## 🔐 Security

- API keys stored as bcrypt hashes (cost factor 12)
- All traffic over TLS 1.3
- Rate limiting per API key
- Payment data never stored (handled by SSLCommerz/NOWPayments)
- Prompt content not logged (only metadata for billing)

## 📈 Monitoring

- Winston logging to `/logs/`
- PostgreSQL query logging
- Usage analytics in dashboard
- Uptime monitoring via UptimeRobot (free tier)

## 🚢 Deployment

See `docs/DEPLOYMENT.md` for full deployment guide.

**Quick Deploy:**
```bash
# SSH into DigitalOcean droplet
ssh root@your-droplet-ip

# Clone repo
git clone https://github.com/rareware-studio/readypi.git
cd readypi

# Install dependencies
npm install --production

# Setup database
psql -U postgres -c "CREATE DATABASE readypi;"
psql -U postgres readypi < database/schema.sql

# Start with PM2
pm2 start api/server.js --name readypi-api
pm2 save
pm2 startup
```

## 📝 License

Proprietary — © 2026 Rareware Studio

## 🤝 Contact

- **Website:** readypi.io
- **Email:** hello@readypi.io
- **Support:** support@readypi.io

---

**Built with 🇧🇩 in Sylhet, Bangladesh**
