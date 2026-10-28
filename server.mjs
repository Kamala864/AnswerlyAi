import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import WebSocket, { WebSocketServer } from 'ws';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true, provider: 'Gemini Live API', keyConfigured: Boolean(API_KEY) }));
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/voice' });

const instructions = `You are Answerly AI, a warm, natural, patient voice assistant for university students. Speak concisely and conversationally. This demo is grounded ONLY in the Wright State University UCIE SSN information below. Do not claim to be an official Wright State service or access a student's i-Raider account. Never ask for passwords, Social Security numbers, passport numbers, or other sensitive identifiers. If the source does not answer a question, say so and direct the student to UCIE. Do not give individualized immigration/legal advice.

SOURCE CONTENT: A student must first secure employment to obtain an SSN and apply in person at Social Security Administration, 80 N Progress Dr., Xenia, OH 45385. Bring passport, I-94, I-20 or DS-2019, and a Social Security letter obtained from UCIE. The card may arrive by mail approximately six weeks after applying. An SSN is a taxpayer identification number and does not grant permission to work. Not all international students are eligible for employment or an SSN. The SSN e-form requires both the SSN Letter and SSN Application PDFs.

The supplied i-Raider follow-up instructions say not to submit the SSN e-form more than 30 days before the work start date. An F-1 student must have a job offer letter to apply. The student completes section A of the Social Security letter and the employer completes section B. For CPT, upload the job offer letter. Once sections A and B are completed and signed, UCIE signs the bottom section; the student can pick up the completed form after receiving email confirmation from UCIE. A follow-up status means the submission is on hold awaiting further information or action; it does not by itself mean rejection. Do not guess what is missing. Ask the student to review the form or contact UCIE.

UCIE: 224 Student Union; Monday-Friday 8:30 a.m.-5 p.m.; 937-775-5745; askucie@wright.edu; immigration questions: ucieimmigration@wright.edu. For questions about employment authorization itself, explain this demo only covers the SSN process and recommend confirming with UCIE or the relevant university office before working.`;

wss.on('connection', (client) => {
  if (!API_KEY) {
    client.send(JSON.stringify({ app_error: 'GEMINI_API_KEY is missing. Copy .env.example to .env and add your Google AI Studio API key.' }));
    client.close(1011, 'Missing API key');
    return;
  }
  const upstreamUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(API_KEY)}`;
  const upstream = new WebSocket(upstreamUrl);
  let setupSent = false;
  const sendClient = (obj) => { if (client.readyState === WebSocket.OPEN) client.send(typeof obj === 'string' ? obj : JSON.stringify(obj)); };
  upstream.on('open', () => {
    const setup = {
      setup: {
        model: 'models/gemini-2.5-flash-native-audio-preview-12-2025',
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } }
        },
        systemInstruction: { parts: [{ text: instructions }] },
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      }
    };
    upstream.send(JSON.stringify(setup));
    setupSent = true;
  });
  upstream.on('message', (data) => sendClient(data.toString()));
  upstream.on('error', (err) => sendClient({ app_error: `Gemini connection error: ${err.message}` }));
  upstream.on('close', (code, reason) => {
    sendClient({ upstream_closed: true, code, reason: reason?.toString() || '' });
    if (client.readyState === WebSocket.OPEN) client.close();
  });
  client.on('message', (data) => {
    if (!setupSent || upstream.readyState !== WebSocket.OPEN) return;
    // The browser sends only Live API realtimeInput messages; the API key stays on this server.
    upstream.send(data.toString());
  });
  client.on('close', () => { if (upstream.readyState === WebSocket.OPEN || upstream.readyState === WebSocket.CONNECTING) upstream.close(); });
  client.on('error', () => { if (upstream.readyState === WebSocket.OPEN || upstream.readyState === WebSocket.CONNECTING) upstream.close(); });
});

server.listen(PORT, () => console.log(`Answerly AI Gemini Live running at http://localhost:${PORT}`));
