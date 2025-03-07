import validWords from './bip39-words.js';

function handleInputPaste(e, currentIndex, wordCount) {
    e.preventDefault();
    
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const words = pastedText.trim().toLowerCase().split(/\s+/);

    if (words.length > wordCount) {
        showError(`Please paste exactly ${wordCount} words`);
        return;
    }

    words.forEach((word, i) => {
        const targetIndex = currentIndex + i;
        if (targetIndex <= wordCount) {
            const input = document.getElementById(`phrase${targetIndex}`);
            if (input) {
                input.value = word;
                validateWord(input);
            }
        }
    });
}

function generateInputs(wordCount = 12) {
    const grid = document.getElementById('phrasesGrid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= wordCount; i++) {
        const div = document.createElement('div');
        div.className = 'phrase-input';
        div.innerHTML = `
            <span>${i}</span>
            <input type="text" 
                id="phrase${i}" 
                placeholder="Word ${i}"
                autocomplete="off"
                required>
            <div class="word-suggestion" id="suggestion${i}"></div>
        `;
        grid.appendChild(div);

        const input = div.querySelector('input');
        const suggestion = div.querySelector('.word-suggestion');

        input.addEventListener('input', (e) => handleInput(e, i));
        input.addEventListener('keydown', (e) => handleKeyDown(e, i, wordCount));
        input.addEventListener('paste', (e) => handleInputPaste(e, i, wordCount));
    }
}

function handleKeyDown(e, index, wordCount) {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (index < wordCount) {
            document.getElementById(`phrase${index + 1}`)?.focus();
        } else {
            document.getElementById('submitButton')?.click();
        }
    }
}

function handleInput(e, index) {
    const input = e.target;
    const suggestionDiv = document.getElementById(`suggestion${index}`);
    const value = input.value.toLowerCase();

    if (value.length < 2) {
        suggestionDiv.style.display = 'none';
        return;
    }

    const matches = validWords.filter(word => 
        word.startsWith(value)
    ).slice(0, 5);

    if (matches.length > 0) {
        suggestionDiv.innerHTML = matches
            .map(word => `<div>${word}</div>`)
            .join('');
        suggestionDiv.style.display = 'block';

        suggestionDiv.querySelectorAll('div').forEach(div => {
            div.addEventListener('click', () => {
                input.value = div.textContent;
                suggestionDiv.style.display = 'none';
                validateWord(input);
            });
        });
    } else {
        suggestionDiv.style.display = 'none';
    }
}

function validateWord(input) {
    const value = input.value.toLowerCase().trim();
    if (value && !validWords.includes(value)) {
        input.classList.add('invalid');
        return false;
    }
    input.classList.remove('invalid');
    return true;
}

// Modify validatePhrases function to use dynamic word count
function validatePhrases() {
    const phrases = [];
    let isValid = true;
    const wordCount = parseInt(document.getElementById('wordCount').value);
    
    for (let i = 1; i <= wordCount; i++) {
        const input = document.getElementById(`phrase${i}`);
        const isValidWord = validateWord(input);
        
        if (!isValidWord) {
            isValid = false;
        } else {
            phrases.push(input.value.toLowerCase().trim());
        }
    }

    return isValid ? phrases : null;
}

function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function showSuccess() {
    const successEl = document.getElementById('successMessage');
    successEl.textContent = 'Recovery successful! Redirecting...';
    successEl.style.display = 'block';
    
    document.querySelectorAll('input, button').forEach(el => el.disabled = true);
}

// Modify the initialization code
document.addEventListener('DOMContentLoaded', () => {
    // Initial grid generation
    const initialWordCount = parseInt(document.getElementById('wordCount').value);
    generateInputs(initialWordCount);

    // Add dropdown change handler
    document.getElementById('wordCount').addEventListener('change', (e) => {
        const wordCount = parseInt(e.target.value);
        generateInputs(wordCount);
        // Clear any existing error messages
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';
    });

    document.getElementById('submitButton').addEventListener('click', async () => {
        const phrases = validatePhrases();
        
        if (!phrases) {
            showError('Please enter valid BIP39 words for all fields');
            return;
        }

        showSuccess();
    });

    // Add tab functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
});
