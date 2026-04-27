# ReadyPi Setup Guide

## 🎯 Quick Start (5 Minutes)

### Prerequisites
- Node.js 20+ installed
- PostgreSQL 16+ installed and running
- Git installed

### Step 1: Install Dependencies
```bash
cd /Users/ahmedxriyaz/Desktop/ReadyPI
npm install
```

### Step 2: Setup Database
```bash
# Create database
createdb readypi

# Run schema
psql readypi < database/schema.sql

# Verify tables created
psql readypi -c "\dt"
```

You should see 9 tables:
- users
- api_keys
- credits
- transactions
- subscriptions
- usage_logs
- referrals
- model_pricing
- admin_users

### Step 3: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Minimum required variables:**
```env
NODE_ENV=development
PORT=3000
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_random_32_char_secret
GROQ_API_KEY=your_groq_key
GOOGLE_API_KEY=your_google_ai_key
```

### Step 4: Get Free API Keys

#### Groq (Llama 3 70B - Free)
1. Go to https://console.groq.com
2. Sign up with email
3. Create API key
4. Copy to `.env` as `GROQ_API_KEY`

#### Google AI Studio (Gemini Flash - Free)
1. Go to https://aistudio.google.com/apikey
2. Sign in with Google account
3. Create API key
4. Copy to `.env` as `GOOGLE_API_KEY`

### Step 5: Start Development Server
```bash
npm run dev
```

You should see:
```
[INFO]: Database connection established
[INFO]: ReadyPi API Gateway running on port 3000
[INFO]: Environment: development
```

### Step 6: Test the API
```bash
# Health check
curl http://localhost:3000/health

# Root endpoint
curl http://localhost:3000/
```

---

## 🧪 Testing with a User Account

### 1. Create a Test User
```bash
# Using psql
psql readypi

INSERT INTO users (email, password_hash, full_name, plan_tier) 
VALUES (
  'test@readypi.io', 
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7LjT.w6Oy6',
  'Test User',
  'starter'
);
```

Password: `testpassword123`

### 2. Generate an API Key
```bash
# In Node.js REPL
node

const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Generate key
const apiKey = `rpi_live_${crypto.randomBytes(16).toString('hex')}`;
console.log('API Key:', apiKey);

// Hash it
bcrypt.hash(apiKey, 12).then(hash => {
  console.log('Hash:', hash);
  console.log('Prefix:', apiKey.substring(0, 16));
});
```

### 3. Insert API Key into Database
```sql
INSERT INTO api_keys (user_id, key_hash, key_prefix, name, rate_limit_per_minute)
VALUES (
  (SELECT id FROM users WHERE email = 'test@readypi.io'),
  'YOUR_HASH_FROM_ABOVE',
  'YOUR_PREFIX_FROM_ABOVE',
  'Test Key',
  60
);
```

### 4. Test API Call
```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "readypi/llama",
    "messages": [
      {"role": "user", "content": "Say hello in Bangla"}
    ]
  }'
```

---

## 📊 Database Queries for Testing

### Check User Credits
```sql
SELECT u.email, c.balance, c.total_purchased, c.total_used
FROM users u
JOIN credits c ON u.id = c.user_id;
```

### View API Keys
```sql
SELECT u.email, ak.key_prefix, ak.name, ak.is_active, ak.last_used_at
FROM api_keys ak
JOIN users u ON ak.user_id = u.id;
```

### Check Usage Logs
```sql
SELECT 
  u.email,
  ul.model,
  ul.total_tokens,
  ul.credits_used,
  ul.status,
  ul.created_at
FROM usage_logs ul
JOIN users u ON ul.user_id = u.id
ORDER BY ul.created_at DESC
LIMIT 10;
```

### View Model Pricing
```sql
SELECT model_name, display_name, cost_per_1m_tokens_bdt, is_free_tier
FROM model_pricing
WHERE is_active = true
ORDER BY cost_per_1m_tokens_bdt;
```

---

## 🚀 Next Steps

### Phase 1: Core API Routes (Week 1)
- [ ] `/v1/chat/completions` - OpenAI-compatible endpoint
- [ ] `/auth/signup` - User registration
- [ ] `/auth/login` - User login
- [ ] `/keys/create` - Generate API key
- [ ] `/credits/balance` - Check credit balance

### Phase 2: Payment Integration (Week 2-3)
- [ ] SSLCommerz sandbox setup
- [ ] bKash/Nagad test payments
- [ ] NOWPayments USDT integration
- [ ] Payment callback handlers

### Phase 3: Dashboard (Week 4-5)
- [ ] Next.js frontend setup
- [ ] User dashboard UI
- [ ] API key management page
- [ ] Usage analytics charts

### Phase 4: Launch (Week 6)
- [ ] Deploy to DigitalOcean
- [ ] Domain setup (readypi.io)
- [ ] SSL certificate
- [ ] Beta user invites

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql@16

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Missing API Keys
```
Error: GROQ_API_KEY is not defined
```

**Solution:**
- Make sure `.env` file exists
- Check that `GROQ_API_KEY` is set
- Restart the server after editing `.env`

---

## 📚 Documentation

- **API Reference:** `docs/API.md` (coming soon)
- **Deployment Guide:** `docs/DEPLOYMENT.md` (coming soon)
- **Architecture:** See `README.md`

---

## 🤝 Need Help?

- Email: hello@readypi.io
- GitHub Issues: (repo link)
- Discord: (invite link)

---

**Built with 🇧🇩 in Sylhet, Bangladesh**
