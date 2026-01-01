# Testing with Mock Audio

To test the transcription API without using the browser interface, you can use the following curl command:

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@test-audio.wav" \
  -F "patientId=TEST123"
```

If you don't have a `.wav` file handy, you can create a dummy one for testing the multipart upload:
```bash
echo "not a real audio file" > test-audio.wav
```

(Note: The server will forward this to n8n, which might fail if it's not a valid audio file, unless you are in mock mode.)
