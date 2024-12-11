// DOM Elements
const textInput = document.getElementById('textInput');
const textDisplay = document.getElementById('textDisplay');
const startButton = document.getElementById('startButton');
const nextButton = document.getElementById('nextButton');
const wpmDisplay = document.getElementById('wpm');
const timeDisplay = document.getElementById('time');
const levelDisplay = document.getElementById('level');
const levelBox = document.getElementById('levelBox');
const modeIndicator = document.getElementById('modeIndicator');
const raceUI = document.getElementById('raceUI');
const playerProgress = document.querySelector('.player-progress');
const aiProgress = document.querySelector('.ai-progress');
const aiSpeedSelection = document.getElementById('aiSpeedSelection');
const zenUI = document.getElementById('zenUI');
const zenInput = document.getElementById('zenInput');
const zenWPM = document.getElementById('zenWPM');
const zenTime = document.getElementById('zenTime');
const zenWordCount = document.getElementById('zenWordCount');

// Game state
let gameState = {
    mode: 'practice',
    isActive: false,
    startTime: null,
    zenStartTime: null,
    zenTimer: null,
    level: 1,
    aiSpeed: 0,
    aiProgress: 0,
    playerProgress: 0,
    currentWordIndex: 0,
    totalWords: 0,
    raceInterval: null
};

// Sample texts
const texts = [
    "the quick brown fox jumps over the lazy dog",
    "pack my box with five dozen liquor jugs",
    "how vexingly quick daft zebras jump",
    "sphinx of black quartz judge my vow",
    "the five boxing wizards jump quickly",
    "just keep examining every low bid quoted",
    "two driven jocks help fax my big quiz",
    "five quacking zephyrs jolt my wax bed"
];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Debug: Check if speed buttons exist
    const speedButtons = document.querySelectorAll('.speed-btn');
    console.log('Found speed buttons:', speedButtons.length);
    
    // Add event listeners for AI speed selection
    speedButtons.forEach(btn => {
        console.log('Adding listener to button:', btn.textContent);
        btn.onclick = function() {
            console.log('Speed button clicked!');
            const speed = parseInt(this.dataset.speed);
            console.log('Selected speed:', speed);
            // Hide speed selection
            document.getElementById('aiSpeedSelection').classList.add('hidden');
            document.getElementById('modeSelection').classList.remove('active');
            // Show and start game
            document.getElementById('gameScreen').classList.add('active');
            startMode('race', speed);
        };
    });
    
    // Show menu by default
    showMenu();
    
    // Set up event listeners for mode selection
    document.getElementById('practiceMode').addEventListener('click', () => startMode('practice'));
    document.getElementById('challengeMode').addEventListener('click', () => startMode('challenge'));
    document.getElementById('raceMode').addEventListener('click', () => {
        console.log('Race mode clicked');
        document.querySelector('.mode-buttons').style.display = 'none';
        document.getElementById('aiSpeedSelection').classList.remove('hidden');
    });
    document.getElementById('zenMode').addEventListener('click', () => startMode('zen'));
    
    // Set up event listeners for navigation
    document.getElementById('backToMenu').addEventListener('click', showMenu);
    document.getElementById('backFromSpeed').addEventListener('click', showMenu);
    document.getElementById('playAgain').addEventListener('click', restartGame);
    document.getElementById('returnToMenu').addEventListener('click', showMenu);
    
    // Set up event listeners for game controls
    document.getElementById('startButton').addEventListener('click', startTest);
    document.getElementById('nextButton').addEventListener('click', nextText);
    document.getElementById('textInput').addEventListener('input', checkTyping);
    document.getElementById('zenInput').addEventListener('input', updateZenStats);
});

function showAISpeedSelection() {
    document.querySelector('.mode-buttons').style.display = 'none';
    document.getElementById('aiSpeedSelection').classList.remove('hidden');
}

function startMode(mode, aiSpeed = 0) {
    // Reset game state
    resetGame();
    gameState.mode = mode;
    gameState.aiSpeed = aiSpeed;
    gameState.currentWordIndex = 0;

    // Hide all screens first
    hideAllScreens();

    // Show game screen and hide mode selection completely
    document.getElementById('modeSelection').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    
    // Update mode indicator
    modeIndicator.textContent = getModeText(mode);
    
    // Show/hide UI elements based on mode
    document.getElementById('levelBox').style.display = mode === 'challenge' ? 'block' : 'none';
    raceUI.style.display = mode === 'race' ? 'block' : 'none';
    zenUI.style.display = 'none';
    
    // Set up the game
    const newText = getNewText();
    textDisplay.textContent = newText;
    textDisplay.style.display = 'block'; // Ensure visibility
    
    textInput.value = '';
    textInput.disabled = false;
    textInput.style.display = 'block'; // Ensure visibility
    
    startButton.style.display = mode === 'race' ? 'none' : 'block';
    nextButton.style.display = 'none';
    
    // Focus on text input
    setTimeout(() => {
        textInput.focus();
        // Scroll to ensure text is visible on mobile
        textDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    // Special setup for race mode
    if (mode === 'race') {
        gameState.aiSpeed = aiSpeed;
        playerProgress.style.width = '0%';
        aiProgress.style.width = '0%';
        textInput.disabled = false;
        gameState.isActive = true;
        gameState.startTime = Date.now();
        startRaceProgress();
    }
}

function hideAllScreens() {
    document.getElementById('modeSelection').classList.remove('active');
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    document.getElementById('aiSpeedSelection').classList.add('hidden');
}

function getModeText(mode) {
    switch(mode) {
        case 'practice': return 'Practice Mode';
        case 'challenge': return 'Challenge Mode';
        case 'race': return `Race Mode (AI: ${gameState.aiSpeed} WPM)`;
        case 'zen': return 'Zen Mode';
        default: return 'Unknown Mode';
    }
}

function startTest() {
    if (gameState.isActive) return;
    
    gameState.isActive = true;
    gameState.startTime = Date.now();
    gameState.currentWordIndex = 0;
    
    const textInput = document.getElementById('textInput');
    textInput.disabled = false;
    textInput.value = '';
    textInput.focus();
    
    // Start race mode AI progress
    if (gameState.mode === 'race') {
        startRaceProgress();
    }
}

function startRaceProgress() {
    // Clear any existing interval
    if (gameState.raceInterval) {
        clearInterval(gameState.raceInterval);
    }
    
    const wordsInText = document.getElementById('textDisplay').textContent.split(' ').length;
    gameState.totalWords = wordsInText;
    
    // Calculate how often the AI should update based on its WPM
    const millisecondsPerWord = (60 / gameState.aiSpeed) * 1000;
    
    gameState.raceInterval = setInterval(() => {
        if (!gameState.isActive) {
            clearInterval(gameState.raceInterval);
            return;
        }
        
        // Update AI progress
        gameState.aiProgress = Math.min(100, (gameState.aiProgress + (100 / wordsInText)));
        document.querySelector('.ai-progress').style.width = gameState.aiProgress + '%';
        
        // Check if AI has won
        if (gameState.aiProgress >= 100) {
            endRace('ai');
        }
    }, millisecondsPerWord);
}

function updatePlayerProgress(currentIndex) {
    if (gameState.mode === 'race') {
        gameState.playerProgress = (currentIndex / gameState.totalWords) * 100;
        document.querySelector('.player-progress').style.width = gameState.playerProgress + '%';
        
        // Check if player has won
        if (gameState.playerProgress >= 100) {
            endRace('player');
        }
    }
}

function endRace(winner) {
    gameState.isActive = false;
    clearInterval(gameState.raceInterval);
    
    const message = winner === 'player' ? 'Congratulations! You won!' : 'The AI won! Try again!';
    alert(message);
    
    // Reset the game
    showMenu();
}

function checkTyping() {
    if (!gameState.isActive) return;
    
    const currentText = textDisplay.textContent;
    const typedText = textInput.value;
    const currentWord = currentText.split(' ')[gameState.currentWordIndex];
    
    if (typedText.endsWith(' ')) {
        const typedWord = typedText.trim();
        
        if (typedWord === currentWord) {
            gameState.currentWordIndex++;
            textInput.value = '';
            
            // Update progress in race mode
            if (gameState.mode === 'race') {
                updatePlayerProgress(gameState.currentWordIndex);
            }
            
            // Check if completed
            if (gameState.currentWordIndex === currentText.split(' ').length) {
                if (gameState.mode === 'practice') {
                    nextButton.style.display = 'block';
                    textInput.disabled = true;
                } else {
                    endTest();
                }
                return;
            }
        }
    }
    
    // Calculate WPM
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // in minutes
    const wordsTyped = gameState.currentWordIndex;
    const currentWPM = Math.round(wordsTyped / timeElapsed) || 0;
    
    // Update WPM display
    wpmDisplay.textContent = currentWPM;
    
    // Update time display
    const secondsElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    timeDisplay.textContent = secondsElapsed + 's';
}

function getNewText() {
    const index = Math.floor(Math.random() * texts.length);
    const text = texts[index];
    textDisplay.textContent = text;
}

function nextText() {
    if (gameState.mode === 'practice') {
        getNewText();
        textInput.value = '';
        textInput.focus();
    }
}

function resetGame() {
    gameState.isActive = false;
    gameState.startTime = null;
    gameState.currentWordIndex = 0;
    gameState.aiProgress = 0;
    gameState.playerProgress = 0;
    
    if (gameState.raceInterval) {
        clearInterval(gameState.raceInterval);
        gameState.raceInterval = null;
    }
    
    // Reset UI elements
    textDisplay.style.display = 'block';
    textInput.style.display = 'block';
    textInput.value = '';
    textInput.disabled = true;
    
    wpmDisplay.textContent = '0';
    timeDisplay.textContent = '0s';
    
    // Reset progress bars
    if (playerProgress) playerProgress.style.width = '0%';
    if (aiProgress) aiProgress.style.width = '0%';
}

function showMenu() {
    // Clear Zen mode timer if active
    if (gameState.zenTimer) {
        clearInterval(gameState.zenTimer);
        gameState.zenTimer = null;
    }
    
    // Reset game state
    gameState.isActive = false;
    gameState.zenStartTime = null;
    
    // Hide all screens first
    hideAllScreens();
    
    // Show mode selection and reset speed selection
    document.getElementById('modeSelection').classList.add('active');
    document.querySelector('.mode-buttons').style.display = 'grid';
    document.getElementById('aiSpeedSelection').classList.add('hidden');
    
    resetGame();
}

function startZenMode() {
    // Reset zen mode state
    gameState.zenStartTime = Date.now();
    gameState.zenSeconds = 0;
    gameState.isActive = true;
    
    // Clear any existing timer
    if (gameState.zenTimer) {
        clearInterval(gameState.zenTimer);
    }
    
    // Reset UI
    zenInput.value = '';
    zenWPM.textContent = '0';
    zenWordCount.textContent = '0';
    zenTime.textContent = '0:00';
    zenInput.focus();
    
    // Start timer for Zen mode
    gameState.zenTimer = setInterval(() => {
        if (!gameState.isActive) {
            clearInterval(gameState.zenTimer);
            return;
        }
        gameState.zenSeconds++;
        updateZenTime();
        updateZenStats();
    }, 1000);
}

function updateZenStats() {
    if (!gameState.isActive || !gameState.zenStartTime) return;
    
    const text = zenInput.value.trim();
    const words = text ? text.split(/\s+/) : [];
    const wordCount = words.length;
    
    // Calculate time elapsed in minutes
    const timeElapsed = (Date.now() - gameState.zenStartTime) / 60000; // minutes
    
    // Calculate WPM
    const wpm = Math.round(wordCount / Math.max(timeElapsed, 0.0001));
    
    // Update stats with animation
    zenWPM.textContent = wpm;
    zenWordCount.textContent = wordCount;
    
    // Add animation class
    zenWPM.classList.add('wpm-updated');
    setTimeout(() => zenWPM.classList.remove('wpm-updated'), 300);
}

function updateZenTime() {
    const minutes = Math.floor(gameState.zenSeconds / 60);
    const seconds = gameState.zenSeconds % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    zenTime.textContent = formattedTime;
}

function endTest() {
    gameState.isActive = false;
    textInput.disabled = true;
    
    // Calculate final stats
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // in minutes
    const wordsTyped = gameState.currentWordIndex;
    const finalWPM = Math.round(wordsTyped / timeElapsed) || 0;
    
    // Update final stats display
    document.getElementById('finalWpm').textContent = finalWPM;
    
    // Show game over screen
    hideAllScreens();
    document.getElementById('gameOverScreen').classList.add('active');
    
    // Show/hide level box based on mode
    document.getElementById('finalLevelBox').style.display = 
        gameState.mode === 'challenge' ? 'block' : 'none';
    
    if (gameState.mode === 'challenge') {
        document.getElementById('finalLevel').textContent = gameState.level;
    }
}
