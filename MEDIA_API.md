# Media API Documentation

## Overview

Media API provides AI-powered prompt generation and media (image/video) generation capabilities. The system includes:

- **Media Prompter**: AI-enhanced prompt optimization
- **Image Generation**: Google Imagen-3 provider
- **Video Generation**: Veo-3 placeholder (not configured)
- **Job Tracking**: In-memory and optional database persistence

## Architecture

### Components

1. **Media Prompter** (`/api/media/prompter`)
   - Enhances user prompts using Gemini AI
   - Auto-detects language (RU/EN)
   - Normalizes style and adds safety constraints
   - Returns enhanced prompt + model hints

2. **Providers** (`server/lib/mediaProviders.ts`)
   - **Imagen-3**: Google Vertex AI image generation
   - **Veo-3**: Stub (returns 501 Not Implemented)
   - Retry logic: 3 attempts with exponential backoff
   - Timeout: 30 seconds per request

3. **Job Tracking**
   - **Volatile mode**: In-memory job store (default)
   - **Persistent mode**: Database storage with X-Confirm-Code (SAFE_MODE)

4. **Router Integration**
   - `POST /api/universal-ask` with `role: "Media"`
   - Auto-routing based on intent (media.*)

## Endpoints

### 1. Media Prompter

Enhance prompts with AI optimization.

```bash
POST /api/media/prompter
```

**Request:**
```json
{
  "goal": "image",              // Required: "image" | "video" | "video-from-image"
  "promptDraft": "суши для меню", // Required: user's draft prompt
  "refs": "https://...",        // Optional: reference links
  "style": "photoreal",         // Optional: style hint
  "aspect": "16:9",             // Optional: aspect ratio
  "durationSec": 5              // Optional: for video only
}
```

**Response:**
```json
{
  "success": true,
  "prompt": "Enhanced professional prompt...",
  "negativePrompt": "blurry, distorted, nsfw...",
  "modelHints": {
    "provider": "imagen-3",
    "model": "imagen-3",
    "safety": "block_medium_and_above",
    "aspect": "16:9",
    "durationSec": null
  },
  "requestId": "abc123"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/media/prompter \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=..." \
  -d '{
    "goal": "image",
    "promptDraft": "суши для меню, фотореалистично",
    "style": "food-styled",
    "aspect": "16:9"
  }'
```

---

### 2. Image Generation

Generate images using Imagen-3.

```bash
POST /api/media/image/generate
```

**Request:**
```json
{
  "prompt": "professional sushi photo", // Required
  "negativePrompt": "blurry, text",    // Optional
  "aspect": "16:9",                     // Optional
  "modelHints": {}                      // Optional: from prompter
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid-here",
  "provider": "imagen-3",
  "etaSec": 10,
  "requestId": "xyz789"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/media/image/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=..." \
  -d '{
    "prompt": "professional sushi photo for restaurant menu, 16:9",
    "negativePrompt": "blurry, text, watermark"
  }'
```

---

### 3. Video Generation (Not Implemented)

Video generation endpoint (returns 501).

```bash
POST /api/media/video/generate
POST /api/media/video/from-image
```

**Response:**
```json
{
  "success": false,
  "error": "Video provider unavailable",
  "detail": "Veo-3 is not configured. To enable, set up Google Veo API credentials.",
  "requestId": "req123"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/media/video/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=..." \
  -d '{"prompt": "sushi preparation video", "durationSec": 5}'
```

---

### 4. Job Status

Check job status and retrieve results.

```bash
GET /api/media/job/:id
```

**Response:**
```json
{
  "success": true,
  "status": "done",              // "queued" | "running" | "done" | "failed"
  "url": "https://...",          // Present when status=done
  "error": null,                 // Present when status=failed
  "provider": "imagen-3",
  "requestId": "req456"
}
```

**Example:**
```bash
curl http://localhost:5000/api/media/job/abc-123-def \
  -H "Cookie: connect.sid=..."
```

---

### 5. Router Integration

Use universal router with Media role.

```bash
POST /api/universal-ask
```

**Request:**
```json
{
  "role": "Media",
  "query": "создай иллюстрацию суши для меню",
  "context": {
    "goal": "image",
    "style": "food-styled",
    "aspect": "16:9"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "role": "Media",
    "intent": "media.generate",
    "routedTo": "/api/media/image/generate",
    "jobId": "uuid",
    "promptPreview": "Enhanced prompt...",
    "provider": "imagen-3",
    "etaSec": 10,
    "modelHints": {...}
  },
  "requestId": "req789"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/universal-ask \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=..." \
  -H "X-Confirm-Code: YOUR_CODE" \
  -d '{
    "role": "Media",
    "query": "сгенерируй иллюстрацию суши для меню, 16:9",
    "context": {"goal": "image", "style": "food-styled"}
  }'
```

---

## How to Enable Veo-3 / Alternative Video Provider

Currently, video generation returns **501 Not Implemented**. To enable video:

### Option 1: Google Veo-3

1. Set up Google Cloud credentials:
   ```bash
   export GOOGLE_CLOUD_PROJECT_ID="your-project-id"
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
   ```

2. Update `server/lib/mediaProviders.ts`:
   ```typescript
   // Replace stub with real implementation
   export async function generateVideoVeo3(params: GenerateVideoParams) {
     const vertex = new VertexAI({ 
       project: process.env.GOOGLE_CLOUD_PROJECT_ID,
       location: 'us-central1'
     });
     
     // Use Veo model when available
     // Implementation details depend on Google's Veo API
   }
   ```

### Option 2: Alternative Provider

1. Create provider adapter in `server/lib/mediaProviders.ts`:
   ```typescript
   export async function generateVideoAlternative(params: GenerateVideoParams) {
     // Example: Runway, Pika, or other video API
     const response = await fetch('https://api.alternative.com/generate', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${process.env.ALT_API_KEY}` },
       body: JSON.stringify({
         prompt: params.prompt,
         duration: params.durationSec,
         aspect: params.aspect
       })
     });
     
     const data = await response.json();
     // Return MediaJob with jobId and status
   }
   ```

2. Update route in `server/routes.ts`:
   ```typescript
   app.post("/api/media/video/generate", requireAuth, async (req, res) => {
     const job = await generateVideoAlternative(req.body);
     res.json({ success: true, jobId: job.id, ... });
   });
   ```

---

## Authentication

All endpoints require authentication (session or JWT).

### Session Auth (Cookie)
```bash
# 1. Login
curl -c /tmp/cookie.txt -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'

# 2. Use session
curl -b /tmp/cookie.txt http://localhost:5000/api/media/...
```

### JWT Auth (Bearer Token)
```bash
# 1. Get token from login response
TOKEN=$(curl -s -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' | jq -r '.data.token')

# 2. Use token
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/media/...
```

---

## SAFE_MODE

Database writes require `X-Confirm-Code` header:

```bash
curl -X POST http://localhost:5000/api/media/image/generate \
  -H "X-Confirm-Code: YOUR_CONFIRM_CODE" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"..."}'
```

Without confirmation code:
- Jobs run in **volatile mode** (in-memory only)
- Results accessible via `/api/media/job/:id`
- Lost on server restart

With confirmation code:
- Jobs saved to `media_jobs` table
- Persistent across restarts

---

## Testing

Run smoke tests:

```bash
bash scripts/smoke-media.sh
```

Expected output:
```
✅ Health check working
✅ Video endpoints return proper error (401/501)
✅ Job endpoint returns proper error (401/404)
```

---

## Error Handling

All responses follow unified format:

**Success:**
```json
{
  "success": true,
  "data": {...},
  "requestId": "req123"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "detail": "Additional context",
  "requestId": "req123"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid auth)
- `404`: Not Found (job/resource not found)
- `501`: Not Implemented (video provider unavailable)
- `503`: Service Unavailable (provider timeout)

---

## Troubleshooting

### Image generation fails
1. Check Google Cloud credentials:
   ```bash
   echo $GOOGLE_CLOUD_PROJECT_ID
   echo $GOOGLE_APPLICATION_CREDENTIALS
   ```

2. Verify Vertex AI API enabled in Google Cloud Console

3. Check job status for error details:
   ```bash
   curl http://localhost:5000/api/media/job/{JOB_ID}
   ```

### Video returns 501
This is expected - Veo-3 is not configured. See "How to Enable Veo-3" section above.

### Authentication fails
Ensure you're logged in:
```bash
curl -c /tmp/cookie.txt -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"YOUR_USERNAME","password":"YOUR_PASSWORD"}'
```

---

## Complete Workflow Example

```bash
#!/bin/bash

# 1. Login
curl -c /tmp/cookie.txt -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Enhance prompt
PROMPT_RESULT=$(curl -s -b /tmp/cookie.txt -X POST \
  http://localhost:5000/api/media/prompter \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "image",
    "promptDraft": "суши для меню",
    "style": "food-styled",
    "aspect": "16:9"
  }')

ENHANCED_PROMPT=$(echo $PROMPT_RESULT | jq -r '.prompt')
echo "Enhanced prompt: $ENHANCED_PROMPT"

# 3. Generate image
JOB_RESPONSE=$(curl -s -b /tmp/cookie.txt -X POST \
  http://localhost:5000/api/media/image/generate \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"$ENHANCED_PROMPT\"}")

JOB_ID=$(echo $JOB_RESPONSE | jq -r '.jobId')
echo "Job ID: $JOB_ID"

# 4. Poll for status
while true; do
  STATUS_RESPONSE=$(curl -s -b /tmp/cookie.txt \
    http://localhost:5000/api/media/job/$JOB_ID)
  
  STATUS=$(echo $STATUS_RESPONSE | jq -r '.status')
  echo "Status: $STATUS"
  
  if [ "$STATUS" = "done" ] || [ "$STATUS" = "failed" ]; then
    echo $STATUS_RESPONSE | jq .
    break
  fi
  
  sleep 2
done
```
