// script.js - Pure Local Version

// --- DOM Elements ---
const inputField = document.getElementById("query");
const consultBtn = document.getElementById("consult-btn");
consultBtn.disabled = true; 
consultBtn.textContent = "LOADING_DATA...";
const loader = document.getElementById("loader");
const modalOverlay = document.getElementById("modal-overlay");
const closeBtn = document.getElementById("close-btn");

// Result Elements
const titleEl = document.getElementById("book-title");
const authorEl = document.getElementById("book-author");
const reasonEl = document.getElementById("book-reason");
const ratingEl = document.getElementById("book-rating");
const coverImg = document.getElementById("book-cover");
const coverFallback = document.getElementById("cover-fallback");

// --- Event Listeners ---
consultBtn.addEventListener("click", handleConsultation);
closeBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
});

window.addEventListener('popstate', function(event) {
    if (!modalOverlay.classList.contains("hidden")) {
        _internalClose();
    }
});

// --- Main Logic ---

async function handleConsultation() {
    const userQuery = inputField.value.trim();
    if (!userQuery) return;

    setLoading(true);

    try {
        console.log("CONSULTING LOCAL ARCHIVES...");
        
        // DIRECT CALL TO YOUR ALGORITHM
        // No API keys, no switches. Just your code and the CSV.
        const responseData = await localConsult(userQuery);

        if (responseData) {
            displayResult(responseData.gemini, responseData.google);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("The Archivist encountered a calculation error.");
    } finally {
        setLoading(false);
    }
}

// --- UI Helpers ---

function displayResult(geminiData, googleData) {
    // 1. Fill Text
    titleEl.textContent = geminiData.title;
    authorEl.textContent = geminiData.author;
    reasonEl.textContent = geminiData.reason;
    
    if (googleData.rating) {
        ratingEl.textContent = `Rating: ${googleData.rating}/5 (${googleData.count} votes)`;
    } else {
        ratingEl.textContent = "Unrated";
    }

    // 2. Prepare Fallback
    coverFallback.innerHTML = `
        <div class="fallback-title">${geminiData.title}</div>
        <div class="fallback-author">${geminiData.author}</div>
    `;

    // 3. Image Handling
    if (googleData.coverUrl) {
        const tempImg = new Image();
        tempImg.src = googleData.coverUrl;

        tempImg.onload = function() {
            if (this.naturalWidth < 10) {
                showFallback();
            } else {
                coverImg.src = googleData.coverUrl;
                coverImg.classList.remove("hidden");
                coverFallback.classList.add("hidden");
            }
        };

        tempImg.onerror = function() {
            showFallback();
        };

    } else {
        showFallback();
    }

    // 4. Open Modal
    modalOverlay.classList.remove("hidden");
    history.pushState({ modalOpen: true }, "", "#result");
}

function showFallback() {
    coverImg.classList.add("hidden");
    coverFallback.classList.remove("hidden");
}

function closeModal() {
    if (history.state && history.state.modalOpen) {
        history.back(); // This triggers the 'popstate' event above!
    } else {
        _internalClose();
    }
}

// Helper: The actual logic to hide the UI
function _internalClose() {
    modalOverlay.classList.add("hidden");
    setTimeout(() => {
        coverImg.src = "";
    }, 300);
}

function setLoading(isLoading) {
    if (isLoading) {
        loader.classList.remove("hidden");
        consultBtn.disabled = true;
        consultBtn.style.opacity = "0.5";
    } else {
        loader.classList.add("hidden");
        consultBtn.disabled = false;
        consultBtn.style.opacity = "1";
    }
}
