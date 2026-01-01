# AI Voice-to-Token Triage System - Aravind Eye Hospital

Phase 1 implementation of a Voice-to-Token Triage system designed to streamline patient intake at Aravind Eye Hospital.

## Features
- **Kiosk Interface**: Simple, accessible web interface for patient identification.
- **Voice Capture**: Press-and-hold audio recording using browser MediaRecorder API.
- **Real-time Feedback**: Visual audio waveforms and status indicators.
- **AI Integration**: Backend integration with n8n and OpenAI Whisper for Tamil & English transcription.
- **Responsive Design**: Optimized for tablet and touchscreen kiosks.

## Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript.
- **Backend**: Node.js, Express 5 (Beta).
- **Integration**: Axios, Multer (for audio handling).
- **AI**: n8n, OpenAI Whisper, GPT-4.

## Quick Start
1. Clone the repository.
2. Run `npm install`.
3. Set up your `.env` file (see `docs/setup.md`).
4. Run `npm start`.
5. Visit `http://localhost:3000`.

## Documentation
- [Setup & Configuration](docs/setup.md)
- [n8n Workflow Export](docs/n8n_workflow.json)

## License
Proprietary - Aravind Eye Hospital.
