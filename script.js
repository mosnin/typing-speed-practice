// DOM Elements
const textInput = document.getElementById('textInput');
const textDisplay = document.getElementById('textDisplay');
const startButton = document.getElementById('startButton');
const nextButton = document.getElementById('nextButton');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
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
    textDisplay.textContent = getNewText();
    textInput.value = '';
    textInput.disabled = false;
    startButton.style.display = mode === 'race' ? 'none' : 'block';
    nextButton.style.display = 'none';
    
    // Focus on text input
    textInput.focus();
    
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
    
    const currentText = document.getElementById('textInput').value;
    const targetText = document.getElementById('textDisplay').textContent;
    const words = targetText.split(' ');
    const currentWords = currentText.split(' ');
    
    // Update progress in race mode
    if (gameState.mode === 'race') {
        updatePlayerProgress(currentWords.length - 1);
    }
    
    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < currentText.length; i++) {
        if (currentText[i] === targetText[i]) correct++;
    }
    
    const accuracy = Math.round((correct / currentText.length) * 100) || 100;
    accuracyDisplay.textContent = accuracy + '%';
    
    // Update stats
    const timeElapsed = (Date.now() - gameState.startTime) / 60000;
    const wordsTyped = currentWords.length;
    const wpm = Math.round(wordsTyped / timeElapsed) || 0;
    wpmDisplay.textContent = wpm;
    
    // Check if text is completed
    if (currentText === targetText) {
        if (gameState.mode === 'practice') {
            nextText();
        } else if (gameState.mode === 'challenge') {
            gameState.level++;
            levelDisplay.textContent = gameState.level;
            textInput.value = '';
            getNewText();
            textInput.focus();
        }
    }
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
    gameState = {
        ...gameState,
        isActive: false,
        startTime: null,
        level: gameState.mode === 'challenge' ? 1 : 0,
        zenStartTime: null,
        zenSeconds: 0
    };
    
    // Reset UI
    textInput.value = '';
    textInput.disabled = true;
    startButton.disabled = false;
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    timeDisplay.textContent = '60';
    levelDisplay.textContent = gameState.level;
    
    // Reset Zen mode UI if in Zen mode
    if (gameState.mode === 'zen') {
        zenInput.value = '';
        zenWPM.textContent = '0';
        zenWordCount.textContent = '0';
        zenTime.textContent = '0:00';
    } else {
        getNewText();
    }
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
