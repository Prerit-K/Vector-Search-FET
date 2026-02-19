// local-consult.js
// RICH VERSION: Uses Descriptions, Genres, and Awards for deep matching.

// --- 1. CONCEPT MAPPING (The "AI" Simulation) ---
const CONCEPT_MAP = {
    "sad": ["tragedy", "drama", "death", "grief", "melancholy", "cry", "tear", "loss", "pain", "heartbreak"],
    "happy": ["comedy", "humor", "funny", "joy", "laugh", "satire", "fun", "wit", "light", "cheerful"],
    "scary": ["horror", "thriller", "suspense", "fear", "ghost", "dark", "creepy", "blood", "evil", "mystery"],
    "love": ["romance", "relationship", "marriage", "heart", "affair", "kiss", "crush", "passion", "lovers"],
    "adventure": ["fantasy", "journey", "travel", "quest", "epic", "magic", "action", "dragon", "wild", "hero"],
    "future": ["sci-fi", "science", "space", "robot", "technology", "dystopia", "cyber", "ai", "mars", "alien"],
    "rich": ["wealth", "money", "society", "class", "aristocrat", "empire", "luxury", "gold", "power", "king"],
    "history": ["war", "past", "ancient", "king", "queen", "empire", "century", "historical", "period", "19th"]
};

let localLibrary = [];
let isLocalReady = false;

// --- 2. THE LOADER ---
function initLocalArchivist() {
    console.log("Initializing Local Archivist...");
    
    Papa.parse("books.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log("CSV Raw Results:", results); // DEBUG: See what PapaParse found

            if (results.data.length === 0) {
                console.error("ERROR: CSV loaded but appears empty. Check file path.");
                return;
            }

            // DEBUG: Check the first row keys to verify capitalization
            const firstRow = results.data[0];
            console.log("First Row Sample:", firstRow);

            // AUTO-DETECT KEYS: Handle "Title" vs "title"
            // We find the key that looks like "title" (case-insensitive)
            const titleKey = Object.keys(firstRow).find(k => k.toLowerCase() === 'title') || 'title';
            const descKey = Object.keys(firstRow).find(k => k.toLowerCase() === 'description') || 'description';
            const authorKey = Object.keys(firstRow).find(k => k.toLowerCase() === 'author') || 'author';
            
            console.log(`Mapping keys -> Title: "${titleKey}", Author: "${authorKey}"`);

            // Filter and Normalize Data
            localLibrary = results.data
                .filter(book => book[titleKey] && book[descKey]) // Keep valid rows
                .map(book => ({
                    // Create a clean, standardized book object
                    title: book[titleKey],
                    author: book[authorKey],
                    description: book[descKey],
                    genres: book.genres || "",
                    characters: book.characters || "",
                    rating: book.rating || "0",
                    awards: book.awards || "",
                    coverImg: book.coverImg || null,
                    numRatings: book.numRatings || "0"
                }));

            isLocalReady = true;
            console.log(`Archivist Ready: Indexed ${localLibrary.length} rich volumes.`);
            const mainBtn = document.getElementById("consult-btn");
            if (mainBtn) {
                mainBtn.disabled = false;
                mainBtn.textContent = "RUN_QUERY";
            }
        },
        error: function(err) {
            console.error("Failed to load library:", err);
            alert("Error: Could not read books.csv. Is it in the root folder?");
        }
    });
}

// Start loading immediately
initLocalArchivist();

// --- 3. THE ALGORITHM ---
async function localConsult(query) {
    // 1. SAFETY CHECK: Is the library empty?
    if (!isLocalReady || localLibrary.length === 0) {
        console.error("Critical Error: Library is empty.");
        alert("SYSTEM ERROR: The Archives are empty. Check console (F12) for CSV errors.");
        return null;
    }

    // FAKE LOADING DELAY (1.5s)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const inputTerms = query.toLowerCase().split(" ");
    
    // Expand terms
    let expandedTerms = [...inputTerms];
    inputTerms.forEach(term => {
        for (const [key, relatedWords] of Object.entries(CONCEPT_MAP)) {
            if (term.includes(key)) expandedTerms.push(...relatedWords);
        }
    });

    let bestMatch = null;
    let highestScore = -Infinity;

    // --- THE SCORING LOOP ---
    for (const book of localLibrary) {
        let score = 0;
        
        // Data Normalization
        const title = (book.title || "").toLowerCase();
        const desc = (book.description || "").toLowerCase();
        const genres = (book.genres || "").toLowerCase();
        const chars = (book.characters || "").toLowerCase();
        
        // 1. EXACT TITLE MATCH
        if (title === query.toLowerCase()) score += 100;
        if (title.includes(query.toLowerCase())) score += 50;

        // 2. SEARCH EVERYWHERE
        expandedTerms.forEach(term => {
            if (term.length < 3) return;
            if (desc.includes(term)) score += 5; 
            if (genres.includes(term)) score += 15; 
            if (chars.includes(term)) score += 20;
        });

        // 3. QUALITY BIAS
        if (book.rating) score += parseFloat(book.rating) * 5; 
        if (book.awards && book.awards.length > 5) score += 10;

        // 4. NEW WINNER?
        if (score > highestScore) {
            highestScore = score;
            bestMatch = book;
        }
    }

    // Fallback if score is too low or no match found
    if (!bestMatch || highestScore < 10) {
        // SAFETY: Ensure we don't pick from an empty array
        if (localLibrary.length > 0) {
            bestMatch = localLibrary[Math.floor(Math.random() * Math.min(200, localLibrary.length))];
        } else {
            return null; // Should be caught by top check, but just in case
        }
    }

    // --- TITLE CLEANER ---
    let cleanTitle = bestMatch.title;
    if (cleanTitle) {
        cleanTitle = cleanTitle.replace(/\s*\(.*?\)\s*/g, '').trim();
    }

    return {
        gemini: {
            title: cleanTitle,
            author: bestMatch.author ? bestMatch.author.split(',')[0] : "Unknown",
            reason: `// SYSTEM_OUTPUT: MATCH_SCORE_${highestScore.toFixed(0)} // GENRE_DETECTED: [${bestMatch.genres ? bestMatch.genres.split(',')[0] : 'N/A'}]`
        },
        google: {
            coverUrl: bestMatch.coverImg || null,
            rating: bestMatch.rating,
            count: bestMatch.numRatings
        }
    };
}
