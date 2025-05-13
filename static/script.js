document.addEventListener('DOMContentLoaded', () => {
    const smsInput = document.getElementById('sms-input');
    const checkBtn = document.getElementById('check-btn');
    const resultSection = document.getElementById('result-section');
    const predictionText = document.getElementById('prediction');
    const confidenceText = document.getElementById('confidence');
    const loading = document.getElementById('loading');

    // Add ripple effect to button
    checkBtn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.className = 'ripple';
        
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // Add floating label effect to textarea
    smsInput.addEventListener('focus', () => {
        smsInput.parentElement.classList.add('focused');
    });

    smsInput.addEventListener('blur', () => {
        if (!smsInput.value) {
            smsInput.parentElement.classList.remove('focused');
        }
    });

    checkBtn.addEventListener('click', async () => {
        const message = smsInput.value.trim();
        
        if (!message) {
            // Add shake animation for empty input
            smsInput.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
            setTimeout(() => {
                smsInput.style.animation = '';
            }, 500);
            return;
        }

        // Show loading spinner with fade
        loading.classList.add('visible');
        resultSection.classList.remove('visible');
        checkBtn.disabled = true;

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sms: message })
            });

            const data = await response.json();

            if (response.ok) {
                // Update result section with animation
                predictionText.textContent = data.prediction;
                confidenceText.textContent = data.confidence;
                
                // Add color based on prediction with transition
                predictionText.style.color = data.prediction === 'Spam' ? '#ff4444' : '#00ff88';
                
                // Show result section with animation
                setTimeout(() => {
                    resultSection.classList.add('visible');
                }, 100);
                
                // Add confetti effect for non-spam results
                if (data.prediction === 'Not Spam') {
                    createConfetti();
                }
            } else {
                throw new Error(data.error || 'Something went wrong');
            }
        } catch (error) {
            showError(error.message);
        } finally {
            // Hide loading spinner with fade
            loading.classList.remove('visible');
            checkBtn.disabled = false;
        }
    });

    // Add enter key support
    smsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            checkBtn.click();
        }
    });

    // Error message function
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Error: ' + message;
        document.querySelector('.container').appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }

    // Confetti effect function
    function createConfetti() {
        const colors = ['#00ff88', '#00b3ff', '#ffffff'];
        const confettiCount = 100;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }
    }
}); 