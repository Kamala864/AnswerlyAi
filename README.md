# Answerly AI — Free-tier Gemini Live prototype

This is a demo starter that replaces the OpenAI Realtime connection with Google's Gemini Live API. It keeps the API key on the local Node server and proxies the browser's WebSocket through that server. The browser streams microphone audio to Gemini and plays Gemini's generated audio.

## Important notes
- Google AI Studio offers a free tier for eligible accounts and models, subject to quotas and availability. Free access is not guaranteed for every account/project; see https://ai.google.dev/gemini-api/docs/pricing and https://ai.google.dev/gemini-api/docs/troubleshooting.
- This demo uses `gemini-2.5-flash-native-audio-preview-12-2025`. If Google changes model availability or your project does not have free-tier access, check the current Live API model list and update `model` in `server.mjs`.
- The browser only connects to your local server; the Gemini key is read from `.env` server-side. Do not publish `.env` or commit your API key.
- The supplied SSN answer context is demo content, not a verified live university integration. This is not an official Wright State service and must not be used for individualized immigration advice.

## Setup (Mac / Windows)
1. Install Node.js 20 or newer from https://nodejs.org/.
2. Create a Gemini API key in Google AI Studio: https://aistudio.google.com/apikey. Sign in, create/select a project, then create a key. Check that your project has free-tier access before use.
3. Unzip this package and open a terminal in the `answerly-gemini-live` folder.
4. Copy `.env.example` to `.env`.
   - Mac/Linux: `cp .env.example .env`
   - Windows PowerShell: `Copy-Item .env.example .env`
5. Open `.env` in a text editor and replace the placeholder with your Gemini key. Never paste the key into chat or the browser HTML.
6. Install packages: `npm install`
7. Start the app: `npm start`
8. Open http://localhost:3000 in Chrome or Edge and click **Start talking**. Allow microphone access.
9. Test: “I got an on-campus job. How do I get an SSN?” or “My SSN form says follow-up status. Was I rejected?”

## If it fails
- `GEMINI_API_KEY is missing`: check that `.env` is in the project root and the variable is spelled exactly `GEMINI_API_KEY`.
- `403 PERMISSION_DENIED`, `Free tier unavailable`, or `Payment needed`: check project eligibility and Google AI Studio's project/billing status. Creating another key in the same ineligible project may not fix it.
- Model not found / unsupported model: check the current Gemini Live API docs and update the model name in `server.mjs`.
- Browser microphone blocked: use `http://localhost:3000` and grant microphone permission.
- Check `http://localhost:3000/health` to confirm the server is running and detects the key (it does not expose the key).

## Sources
- Gemini Live API: https://ai.google.dev/gemini-api/docs/live-api
- WebSocket guide: https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket
- Pricing/free tier: https://ai.google.dev/gemini-api/docs/pricing
- Troubleshooting: https://ai.google.dev/gemini-api/docs/troubleshooting
