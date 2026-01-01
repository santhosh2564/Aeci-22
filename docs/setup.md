# AI Voice-to-Token Triage System - Setup Guide

## Overview
This is Phase 1 of the AI Voice-to-Token Triage System for Aravind Eye Hospital. It consists of a web-based kiosk interface and a Node.js backend that integrates with n8n for audio transcription using OpenAI Whisper.

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- An n8n instance (for transcription integration)
- OpenAI API Key (configured within n8n)

## Backend Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `.env.example` to `.env`.
   - Update `N8N_WEBHOOK_URL` with your n8n webhook endpoint.
   ```bash
   cp .env.example .env
   ```

3. **Start the Server:**
   ```bash
   npm start
   ```
   The server will run at `http://localhost:3000`.

## Frontend Access
Open your browser and navigate to `http://localhost:3000`.

## n8n Workflow Configuration

1. **Import Workflow:**
   - Open your n8n instance.
   - Go to "Workflows" -> "Import from File".
   - Select `docs/n8n_workflow.json`.

2. **Configure Nodes:**
   - **Webhook Node:** Set the HTTP method to `POST`. Note the Production/Test URL.
   - **OpenAI Whisper Node:** Ensure you have your OpenAI credentials set up in n8n.
   - **Translate to English Node:** (Optional/Included) Uses GPT-4 to translate Tamil transcription to English.

3. **Update .env:**
   - Copy the Production URL from the n8n Webhook node and paste it into your `.env` file as `N8N_WEBHOOK_URL`.

## Testing the System

### Local Testing (Mock Mode)
If `N8N_WEBHOOK_URL` is not set in `.env`, the backend will return a mock transcription for testing UI interactions.

### API Testing with Curl
You can test the backend transcription endpoint using curl:
```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@path/to/your/audio.wav" \
  -F "patientId=12345"
```

### Audio Capture Requirements
- The browser will request microphone permissions upon clicking "Start".
- Audio is captured using the `MediaRecorder` API.
- For best results with Whisper, use a clear microphone and minimize background noise.

## Project Structure
- `server.js`: Express backend handling file uploads and n8n integration.
- `public/`: Frontend assets (HTML, CSS, JS).
- `docs/`: Documentation and n8n workflow export.
- `.env`: Local environment variables (not committed).
