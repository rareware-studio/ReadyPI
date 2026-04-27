# 🚀 ReadyPI API Documentation (v1)

ReadyPI provides a unified, OpenAI-compatible gateway to access multiple AI providers (Groq, Google, Anthropic, etc.) with local billing in BDT.

## 📡 Base URLs
- **Production**: `https://api.readypi.io`
- **Dashboard API**: `https://api.readypi.io/auth`

## 🔐 Authentication
All requests to the AI gateway must include your API key in the `Authorization` header:

```http
Authorization: Bearer rpi_live_your_key_here
```

---

## 💬 Chat Completions
Standard OpenAI-compatible endpoint for text generation.

### `POST /v1/chat/completions`

**Request Body:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model` | string | Yes | The ID of the model to use (e.g., `readypi/llama`, `readypi/gemini-flash`) |
| `messages` | array | Yes | Array of message objects `{ role, content }` |
| `temperature` | number | No | Sampling temperature (0.0 to 2.0). Default: 1.0 |
| `max_tokens` | integer | No | Maximum tokens to generate. |
| `stream` | boolean | No | Whether to stream the response. (Currently WIP) |

**Available Models:**
- `readypi/llama`: Llama 3 70B (Ultra fast via Groq)
- `readypi/gemini-flash`: Gemini 1.5 Flash (Large context)
- `readypi/gemini-pro`: Gemini 1.5 Pro (Reasoning)
- `readypi/claude-sonnet`: Claude 3.5 Sonnet
- `readypi/mistral`: Mixtral 8x7B

**Example Request:**
```bash
curl https://api.readypi.io/v1/chat/completions \
  -H "Authorization: Bearer $RPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "readypi/llama",
    "messages": [{"role": "user", "content": "How do I deploy to GCP?"}]
  }'
```

---

## 💳 Credits & Billing

### `GET /credits/balance`
Returns the current credit balance for the authenticated user.

**Response:**
```json
{
  "balance": 5000,
  "total_purchased": 10000,
  "total_used": 5000,
  "tokens_available": 5000000
}
```

### `POST /payment/create`
Initiate a payment session for credit top-up.

**Request:**
```json
{
  "package_id": "medium",
  "payment_method": "bkash"
}
```

---

## 🛠️ Error Codes
ReadyPI uses standard HTTP status codes:
- `200`: Success
- `400`: Bad Request (Invalid parameters)
- `401`: Unauthorized (Invalid or missing API key)
- `402`: Payment Required (Insufficient credits)
- `403`: Forbidden (Model not available on current plan)
- `429`: Too Many Requests (Rate limit exceeded)
- `500`: Internal Server Error

---
*Built with 🇧🇩 in Sylhet, Bangladesh*
