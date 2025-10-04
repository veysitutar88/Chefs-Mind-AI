# Git Changes - Last 48 Hours
**Analysis Period:** 2025-10-02 08:00 → 2025-10-04 08:00 UTC

## Summary
- **Total Commits:** 26
- **Primary Focus Areas:**
  1. Speech-to-Text (STT) implementation & fixes
  2. Model routing & streaming
  3. WebSocket stability improvements
  4. UI/UX enhancements

## Critical Changes

### STT / Voice Input (Major Focus)
**commits:** 5658b90, ac4ff16, 66ecf60, aa43f56, 3a276d2, dacc768, 0d1a953

**Issues Fixed:**
- ❌ **Whisper API format errors** - Buffer → File conversion issues
- ❌ **WebSocket connection failures** - URL construction bugs (`wss://localhost:undefined`)
- ✅ **Solution:** Switched to Web Speech API by default, improved temp file handling
- ✅ **UX Fix:** Removed toast notifications that blocked recording button

**Files Modified:**
- `server/services/stt.ts` - Audio transcription logic
- `client/src/hooks/use-stt.ts` - STT React hook
- `client/src/lib/ws-utils.ts` - WebSocket URL utilities
- `client/src/components/chat/chat-input.tsx` - Voice input UI

### Model Routing & Streaming
**commits:** 37f751d, 7ca5b56, 8d20bd0, 2589fc3

**Enhancements:**
- ✅ Added `/api/universal-ask-stream` endpoint (SSE)
- ✅ Intelligent model auto-selection based on query complexity
- ✅ 8-model registry: gpt-4o-mini, gpt-4o, gpt-5, gpt-4-turbo, o3-mini, gemini-1.5-pro, gemini-1.5-flash, sonar
- ✅ Speed badges (fast/medium/slow/smart) in UI

**Files Modified:**
- `server/config/models.ts` - Model registry & routing logic
- `server/services/universal.ts` - Universal agent service
- `server/services/openai.ts` - OpenAI streaming
- `client/src/components/chat/ai-model-selector.tsx` - Model selector UI

### Chat/Session Management
**commits:** 422f301, d587298, fd80b71, 8f850f9

**Improvements:**
- ✅ Auto-create default session on dashboard load
- ✅ Fixed message display issues
- ✅ Better error handling for session creation
- ✅ API response unwrapping (`data` field extraction)

**Files Modified:**
- `client/src/pages/dashboard-page.tsx` - Dashboard initialization
- `client/src/components/chat/chat-interface.tsx` - Chat UI
- `client/src/lib/api.ts` - API client

### WebSocket & Connection Stability
**commits:** 0d1a953, 98c0ea9, bd0a047

**Fixes:**
- ✅ Fixed `buildWsUrl()` utility for consistent WebSocket URLs
- ✅ Improved error handling for connection failures
- ⚠️ **Known Issue:** Vite HMR error `wss://localhost:undefined` (non-critical, affects only hot reload)

**Files Modified:**
- `client/src/lib/ws-utils.ts`
- Various WebSocket consumers

## Testing & Validation
**commits:** 7c86a38, 8d20bd0

**New Scripts:**
- `scripts/smoke-ui.sh` - UI interaction tests
- `scripts/smoke-model-latency.sh` - Model routing & latency tests
- `test_router.sh`, `test_router_v2.sh`, `test_router_v3.sh` - Router testing

## Potential Regressions

### 🔴 Critical
1. **STT Whisper API** - Temp file approach may have I/O overhead vs. in-memory
2. **Model Auto-Routing** - May not respect user's manual model selection in all cases

### 🟡 Medium
1. **WebSocket Fallback** - STT falls back to Web Speech API on any WS error (may mask real issues)
2. **Session Auto-Creation** - Could create orphaned sessions if user navigates away quickly

### 🟢 Low
1. **Vite HMR WebSocket** - Non-critical, only affects dev experience
2. **Toast Notifications Removed** - Less user feedback, but improves UX

## Files Changed (Top 10 by frequency)
1. `.replit` (8 times) - Project configuration
2. `client/src/components/chat/chat-input.tsx` (3)
3. `client/src/pages/dashboard-page.tsx` (3)
4. `server/services/stt.ts` (2)
5. `server/config/models.ts` (2)
6. `client/src/hooks/use-stt.ts` (2)
7. `client/src/lib/ws-utils.ts` (2)
8. `server/services/universal.ts` (1)
9. `server/services/openai.ts` (1)
10. `client/src/components/chat/ai-model-selector.tsx` (2)

## Attached Assets (Documentation)
- Multiple content/pasted files with WebSocket errors
- Screenshots of issues being debugged
- Test router scripts

## Next 24h Recommendations
1. ✅ Monitor STT error rates (Web Speech vs. Whisper)
2. ✅ Validate model routing accuracy (user preference vs. auto-selection)
3. ✅ Check for session leaks (auto-creation without cleanup)
4. ⚠️ Consider re-enabling Whisper with proper audio format conversion
