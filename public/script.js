document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const startBtn = document.getElementById('start-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const patientIdInput = document.getElementById('patient-id');
    const displayPatientId = document.getElementById('display-patient-id');
    const recordBtn = document.getElementById('record-btn');
    const recordingStatus = document.getElementById('recording-status');
    const statusText = recordingStatus.querySelector('.status-text');
    const timerDisplay = document.getElementById('timer');
    const transcriptionEn = document.getElementById('transcription-en');
    const transcriptionTa = document.getElementById('transcription-ta');
    const loader = document.getElementById('loader');
    const visualizer = document.getElementById('visualizer');
    const visualizerCtx = visualizer.getContext('2d');

    // Recording Variables
    let mediaRecorder;
    let audioChunks = [];
    let startTime;
    let timerInterval;
    let audioContext;
    let analyser;
    let dataArray;
    let animationId;
    let stream;

    // Login logic
    startBtn.addEventListener('click', () => {
        const patientId = patientIdInput.value.trim();
        if (patientId) {
            displayPatientId.textContent = patientId;
            loginScreen.classList.add('hidden');
            dashboardScreen.classList.remove('hidden');
            initAudio();
        } else {
            alert('Please enter a Patient ID or Phone Number');
        }
    });

    logoutBtn.addEventListener('click', () => {
        dashboardScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        stopAudio();
    });

    // Audio Initialization
    async function initAudio() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                } 
            });
            setRecordingStatus('ready');
        } catch (err) {
            console.error('Microphone access denied:', err);
            alert('Microphone access is required for this application to work.');
        }
    }

    function stopAudio() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }

    // Recording logic
    recordBtn.addEventListener('mousedown', startRecording);
    recordBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startRecording();
    });

    window.addEventListener('mouseup', stopRecording);
    window.addEventListener('touchend', stopRecording);

    function startRecording() {
        if (mediaRecorder && mediaRecorder.state === 'recording') return;
        if (!stream) return;

        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = sendAudioToServer;

        mediaRecorder.start();
        startTime = Date.now();
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
        
        setRecordingStatus('recording');
        startVisualizer();
        recordBtn.classList.add('active');
    }

    function stopRecording() {
        if (!mediaRecorder || mediaRecorder.state !== 'recording') return;

        mediaRecorder.stop();
        clearInterval(timerInterval);
        setRecordingStatus('processing');
        recordBtn.classList.remove('active');
        
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }

    function updateTimer() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    function setRecordingStatus(status) {
        recordingStatus.className = 'status-indicator ' + status;
        switch(status) {
            case 'ready': statusText.textContent = 'Ready'; break;
            case 'recording': statusText.textContent = 'Recording...'; break;
            case 'processing': statusText.textContent = 'Processing Audio...'; break;
            case 'done': statusText.textContent = 'Done'; break;
            case 'error': statusText.textContent = 'Error'; break;
        }
    }

    async function sendAudioToServer() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        formData.append('patientId', patientIdInput.value.trim());

        transcriptionEn.classList.add('placeholder');
        transcriptionTa.classList.add('placeholder');
        loader.classList.remove('hidden');

        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                transcriptionEn.textContent = data.transcription_en || 'No transcription available.';
                transcriptionTa.textContent = data.transcription_ta || 'டிரான்ஸ்கிரிப்ஷன் இல்லை.';
                transcriptionEn.classList.remove('placeholder');
                transcriptionTa.classList.remove('placeholder');
                setRecordingStatus('done');
                setTimeout(() => setRecordingStatus('ready'), 3000);
            } else {
                throw new Error(data.error || 'Transcription failed');
            }
        } catch (err) {
            console.error('Error sending audio:', err);
            transcriptionEn.textContent = 'Error: ' + err.message;
            transcriptionTa.textContent = 'பிழை: ' + err.message;
            setRecordingStatus('error');
            setTimeout(() => setRecordingStatus('ready'), 3000);
        } finally {
            loader.classList.add('hidden');
        }
    }

    // Visualizer
    function startVisualizer() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Match internal canvas size to display size
        visualizer.width = visualizer.clientWidth;
        visualizer.height = visualizer.clientHeight;

        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        draw();
    }

    function draw() {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        visualizerCtx.fillStyle = '#f9f9f9';
        visualizerCtx.fillRect(0, 0, visualizer.width, visualizer.height);

        const barWidth = (visualizer.width / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            barHeight = dataArray[i] / 2;
            visualizerCtx.fillStyle = `rgb(0, 90, 156)`;
            visualizerCtx.fillRect(x, visualizer.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
});
