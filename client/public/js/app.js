document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const generateBtn = document.querySelector('.generate-button');
    const textArea = document.querySelector('textarea');
    const voiceSelect = document.getElementById('voice-select');
    const languageSelect = document.getElementById('language-select');
    const audioOutput = document.getElementById('audio-output');
    
    // Event Listeners
    generateBtn.addEventListener('click', generateVoice);
    
    // Functions
    async function generateVoice() {
        const text = textArea.value.trim();
        const voice = voiceSelect.value;
        const language = languageSelect.value;
        
        if(!text) {
            showError('Please enter some text to generate speech');
            return;
        }
        
        // Disable button and show loading state
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        showLoading();
        
        try {
            const response = await fetch('/api/generate-voice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text, 
                    voice, 
                    language,
                    // In a real app, you'd include authentication
                    // headers if needed
                })
            });
            
            if(!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate voice');
            }
            
            const data = await response.json();
            renderAudioPlayer(data);
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Voice';
        }
    }
    
    function showLoading() {
        audioOutput.innerHTML = `
            <div class="loading">
                <p>Generating voice... Please wait.</p>
                <div class="spinner"></div>
            </div>
        `;
    }
    
    function showError(message) {
        audioOutput.innerHTML = `
            <div class="error">
                <p>${message}</p>
            </div>
        `;
    }
    
    function renderAudioPlayer(data) {
        audioOutput.innerHTML = `
            <div class="audio-result">
                <p>Audio generated:</p>
                <audio controls class="audio-player">
                    <source src="data:audio/mp3;base64,${data.audioContent}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <div class="audio-actions">
                    <button class="download-button">Download MP3</button>
                    <button class="copy-button">Copy Link</button>
                </div>
            </div>
        `;
        
        // Add event listeners to new buttons
        document.querySelector('.download-button').addEventListener('click', function() {
            downloadAudio(data.audioContent);
        });
        
        document.querySelector('.copy-button').addEventListener('click', function() {
            copyAudioLink(data.audioContent);
        });
    }
    
    function downloadAudio(audioContent) {
        const link = document.createElement('a');
        link.href = `data:audio/mp3;base64,${audioContent}`;
        link.download = 'voice-output.mp3';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    function copyAudioLink(audioContent) {
        const tempInput = document.createElement('input');
        tempInput.value = `data:audio/mp3;base64,${audioContent}`;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        // Show copied notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = 'Audio link copied to clipboard!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
});
