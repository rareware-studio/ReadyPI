# 🚀 ReadyPi — Complete Startup Guide

## ✅ What We've Built

### **Backend API (Complete)**
- ✅ Express server with PostgreSQL
- ✅ OpenAI-compatible `/v1/chat/completions` endpoint
- ✅ User authentication (signup/login with JWT)
- ✅ API key management (create/list/delete)
- ✅ Credit system with balance tracking
- ✅ Usage logging and analytics
- ✅ Rate limiting by plan tier
- ✅ AI router (Groq, Google, OpenAI, Anthropic, DeepSeek, Mistral)
- ✅ Token counting and billing

### **Frontend Dashboard (Complete)**
- ✅ Beautiful landing page with animated π symbol
- ✅ Responsive design matching your HTML mockups
- ✅ Tailwind CSS styling
- ✅ Next.js 14 App Router
- ✅ TypeScript support

---

## 🎯 Quick Start (10 Minutes)

### **Step 1: Install Dependencies**

```bash
cd /Users/ahmedxriyaz/Desktop/ReadyPI

# Install API dependencies
npm install

# Install dashboard dependencies
cd dashboard
npm install
cd ..
```

### **Step 2: Setup Database**

```bash
# Create database
createdb readypi

# Run schema
psql readypi < database/schema.sql

# Verify
psql readypi -c "SELECT COUNT(*) FROM model_pricing;"
# Should return: 8 (models)
```

### **Step 3: Get Free API Keys**

#### **Groq (Required - Free)**
1. Visit: https://console.groq.com
2. Sign up → Create API key
3. Copy key

#### **Google AI Studio (Required - Free)**
1. Visit: https://aistudio.google.com/apikey
2. Sign in → Create API key
3. Copy key

### **Step 4: Configure Environment**

```bash
# Copy template
cp .env.example .env

# Edit with your keys
nano .env
```

**Minimum required:**
```env
NODE_ENV=development
PORT=3000
DB_PASSWORD=your_postgres_password
JWT_SECRET=$(openssl rand -base64 32)
GROQ_API_KEY=gsk_your_groq_key_here
GOOGLE_API_KEY=AIzaSy_your_google_key_here
```

### **Step 5: Start Both Servers**

**Terminal 1 - API Server:**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Dashboard:**
```bash
cd dashboard
npm run dev
# Runs on http://localhost:3001
```

---

## 🧪 Test the Platform

### **1. Create a User Account**

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@readypi.io",
    "password": "testpass123",
    "full_name": "Test User"
  }'
```

**Response:**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "uuid-here",
    "email": "test@readypi.io",
    "plan_tier": "free"
  },
  "token": "jwt-token-here",
  "welcome_credits": 50
}
```

Save the `token` for next steps.

### **2. Create an API Key**

```bash
curl -X POST http://localhost:3000/keys/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Key",
    "environment": "live"
  }'
```

**Response:**
```json
{
  "message": "API key created successfully",
  "key": "rpi_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "warning": "Save this key now. You will not be able to see it again."
}
```

Save the `key` — you'll need it for API calls.

### **3. Make Your First AI Request**

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer rpi_live_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "readypi/llama",
    "messages": [
      {"role": "user", "content": "Say hello in Bangla"}
    ]
  }'
```

**Response:**
```json
{
  "id": "request-uuid",
  "object": "chat.completion",
  "model": "readypi/llama",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "হ্যালো! আপনি কেমন আছেন?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 18,
    "total_tokens": 30
  },
  "readypi": {
    "credits_used": 1,
    "cost_bdt": 0.018,
    "credits_remaining": 49,
    "provider": "groq"
  }
}
```

### **4. Check Your Credit Balance**

```bash
curl http://localhost:3000/credits/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "balance": 49,
  "total_purchased": 50,
  "total_used": 1,
  "tokens_available": 49000
}
```

### **5. View Usage Stats**

```bash
curl http://localhost:3000/credits/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🌐 Access the Dashboard

Open browser: **http://localhost:3001**

You'll see:
- ✨ Animated π symbol in the hero
- 🎨 Beautiful paper texture background
- 📊 Feature cards
- 💰 Pricing preview
- 🇧🇩 "Built in Bangladesh" footer

---

## 📊 Database Queries for Monitoring

### **Check All Users**
```sql
SELECT email, plan_tier, created_at FROM users;
```

### **View API Keys**
```sql
SELECT u.email, ak.key_prefix, ak.name, ak.last_used_at
FROM api_keys ak
JOIN users u ON ak.user_id = u.id
WHERE ak.is_active = true;
```

### **Monitor Usage**
```sql
SELECT 
  u.email,
  ul.model,
  ul.total_tokens,
  ul.credits_used,
  ul.created_at
FROM usage_logs ul
JOIN users u ON ul.user_id = u.id
ORDER BY ul.created_at DESC
LIMIT 10;
```

### **Check Revenue (When Payments Work)**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as transactions,
  SUM(amount_bdt) as total_bdt,
  SUM(credits_added) as credits_sold
FROM transactions
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🎨 Available Models

| Model | Provider | BDT/1M tokens | Free Tier |
|-------|----------|---------------|-----------|
| `readypi/llama` | Groq | ৳0.60 | ✅ Yes |
| `readypi/gemini-flash` | Google | ৳0.30 | ✅ Yes |
| `readypi/deepseek` | DeepSeek | ৳0.90 | ✅ Yes |
| `readypi/gpt4o-mini` | OpenAI | ৳0.60 | ❌ Paid |
| `readypi/claude-haiku` | Anthropic | ৳2.50 | ❌ Paid |
| `readypi/mistral` | Mistral | ৳0.70 | ❌ Paid |
| `readypi/claude-sonnet` | Anthropic | ৳12.00 | ❌ Paid |
| `readypi/gpt4o` | OpenAI | ৳10.00 | ❌ Paid |

**Free tier users** can only use models marked ✅.

---

## 🔧 Troubleshooting

### **API Server Won't Start**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### **Database Connection Error**
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql@16

# Check connection
psql -U postgres -c "SELECT version();"
```

### **Dashboard Build Error**
```bash
cd dashboard

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

### **AI Request Fails**
- Check API keys in `.env`
- Verify Groq/Google keys are valid
- Check logs: `tail -f logs/combined.log`

---

## 📈 Next Steps

### **Week 1: Core Features**
- ✅ API routes (DONE)
- ✅ Auth system (DONE)
- ✅ Dashboard landing page (DONE)
- ⏳ Dashboard login/signup pages
- ⏳ User dashboard with usage charts

### **Week 2: Payment Integration**
- ⏳ SSLCommerz sandbox setup
- ⏳ bKash/Nagad test payments
- ⏳ NOWPayments USDT integration
- ⏳ Payment success/failure pages

### **Week 3: Polish**
- ⏳ API documentation page
- ⏳ Model playground
- ⏳ Email notifications
- ⏳ Referral system UI

### **Week 4: Launch**
- ⏳ Deploy to DigitalOcean
- ⏳ Domain setup (readypi.io)
- ⏳ SSL certificate
- ⏳ Beta user invites

---

## 🎯 Current Status

**✅ COMPLETED:**
- Database schema with 9 tables
- Express API with 5 route modules
- OpenAI-compatible chat endpoint
- JWT authentication
- API key generation
- Credit system
- Usage tracking
- Rate limiting
- AI router (6 providers)
- Next.js dashboard
- Landing page with animated π

**⏳ TODO:**
- Payment gateway integration
- Dashboard auth pages
- User dashboard UI
- API documentation
- Model playground

**💰 Cost to Run:**
- Domain: ৳1,200/year
- DigitalOcean: ৳2,640/month
- **Total: ৳2,740/month**

**💵 Break-even:**
- 6 users at ৳499/mo = ৳2,994
- **Profit: ৳254/mo**

---

## 🚀 You're Ready!

Your ReadyPi platform is **fully functional**. You can:
1. ✅ Create user accounts
2. ✅ Generate API keys
3. ✅ Make AI requests to Groq/Google
4. ✅ Track usage and credits
5. ✅ View beautiful dashboard

**Next:** Add payment integration and launch! 🇧🇩

---

**Built with 🇧🇩 in Sylhet, Bangladesh**
