// Check if SpeechRecognition API is available
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
    alert('Speech Recognition API is not supported in your browser. Try using Chrome or Edge.');
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep recording until manually stopped
    recognition.interimResults = false; // Do not show partial results
    recognition.lang = 'en-US'; // Set language to English

    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const saveBtn = document.getElementById('saveBtn');
    const output = document.getElementById('output');

    let isRecording = false;

    // Start recording
    recordBtn.addEventListener('click', () => {
        try {
            recognition.start();
            isRecording = true;
            recordBtn.disabled = true;
            stopBtn.disabled = false;
            saveBtn.disabled = true;
        } catch (error) {
            console.error('Error starting recognition:', error);
            alert('Failed to start speech recognition. Please try again.');
        }
    });

    // Stop recording
    stopBtn.addEventListener('click', () => {
        try {
            recognition.stop();
            isRecording = false;
            recordBtn.disabled = false;
            stopBtn.disabled = true;
            saveBtn.disabled = false;
        } catch (error) {
            console.error('Error stopping recognition:', error);
            alert('Failed to stop speech recognition. Please try again.');
        }
    });

    // Append transcription to the output field
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + '\n';
        }
        output.value += transcript;
    };

    // Handle recognition errors
    recognition.onerror = (event) => {
        console.error('SpeechRecognition Error:', event.error);
        alert(`Error occurred during speech recognition: ${event.error}`);
        isRecording = false;
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        saveBtn.disabled = true;
    };

    // Save transcription to the database and download as a text file
    saveBtn.addEventListener('click', () => {
        const transcriptionText = output.value.trim();
        if (transcriptionText) {
            // Save to database
            fetch('/save-transcription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcription: transcriptionText }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Save response:', data);
                    alert(data.message);
                })
                .catch((error) => {
                    console.error('Error saving transcription:', error);
                    alert('Failed to save transcription. Please try again.');
                });

            // Download as a text file
            const blob = new Blob([transcriptionText], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `transcription_${new Date().toISOString()}.txt`;
            link.click();

            output.value = ''; // Clear the output field after saving
        } else {
            alert('No transcription to save!');
        }
    });
}
