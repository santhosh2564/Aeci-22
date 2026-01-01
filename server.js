const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const FormData = require('form-data');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.warn('N8N_WEBHOOK_URL is not defined. Using mock response.');
      return res.json({
        transcription_en: "This is a mock transcription (N8N_WEBHOOK_URL not set).",
        transcription_ta: "இது ஒரு போலி டிரான்ஸ்கிரிப்ஷன் (N8N_WEBHOOK_URL அமைக்கப்படவில்லை).",
        language: "ta-en"
      });
    }

    // Forward to n8n
    const formData = new FormData();
    formData.append('audio', req.file.buffer, {
      filename: req.file.originalname || 'audio.wav',
      contentType: req.file.mimetype,
    });
    // Add any other metadata if needed
    if (req.body.patientId) {
        formData.append('patientId', req.body.patientId);
    }

    const response = await axios.post(n8nWebhookUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error transcribing audio:', error.message);
    res.status(500).json({ 
      error: 'Failed to transcribe audio', 
      details: error.message,
      fallback: true,
      transcription_en: "Transcription failed, please try again.",
      transcription_ta: "டிரான்ஸ்கிரிப்ஷன் தோல்வியடைந்தது, மீண்டும் முயற்சிக்கவும்."
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
