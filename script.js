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

// Challenge Mode Constants
const CHALLENGE_LEVELS = [
    { level: 1, targetWPM: 20, text: "The quick brown fox jumps over the lazy dog. Simple words to start your journey." },
    { level: 2, targetWPM: 30, text: "Programming is the art of telling another human what one wants the computer to do. It requires both technical skill and creativity." },
    { level: 3, targetWPM: 40, text: "In computer science, artificial intelligence, sometimes called machine intelligence, is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans." },
    { level: 4, targetWPM: 50, text: "The World Wide Web, commonly known as the Web, is an information system enabling documents and other web resources to be accessed over the Internet. Documents and downloadable media are made available through web servers." },
    { level: 5, targetWPM: 60, text: "A programming paradigm is a fundamental style of computer programming. Different paradigms result in different patterns of solving problems and different ways of thinking about program elements. Common paradigms include imperative, functional, and object-oriented programming." }
];

let currentChallengeLevel = 1;
let challengeStartTime;
let challengeEndTime;
let challengeInProgress = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded'); // Debug log
    
    // Mode selection buttons
    const practiceMode = document.getElementById('practiceMode');
    if (practiceMode) {
        console.log('Found practice mode button'); // Debug log
        practiceMode.addEventListener('click', () => {
            console.log('Practice mode clicked'); // Debug log
            startMode('practice');
        });
    }
    
    const challengeMode = document.getElementById('challengeMode');
    if (challengeMode) {
        challengeMode.addEventListener('click', () => startChallengeMode());
    }
    
    const raceMode = document.getElementById('raceMode');
    if (raceMode) {
        raceMode.addEventListener('click', () => showAISpeedSelection());
    }
    
    const zenMode = document.getElementById('zenMode');
    if (zenMode) {
        zenMode.addEventListener('click', () => startMode('zen'));
    }
    
    // Back to menu button
    const backToMenu = document.getElementById('backToMenu');
    if (backToMenu) {
        backToMenu.addEventListener('click', showMenu);
    }
    
    const backToModes = document.getElementById('backToModes');
    if (backToModes) {
        backToModes.addEventListener('click', showMenu);
    }
    
    // AI speed selection
    document.querySelectorAll('.speed-button').forEach(button => {
        button.addEventListener('click', function() {
            const speed = parseInt(this.dataset.speed);
            startMode('race', speed);
        });
    });
    
    // Game controls
    if (startButton) {
        console.log('Found start button'); // Debug log
        startButton.addEventListener('click', startTest);
    }
    
    if (nextButton) {
        console.log('Found next button'); // Debug log
        nextButton.addEventListener('click', nextText);
    }
    
    if (textInput) {
        console.log('Found text input'); // Debug log
        textInput.addEventListener('input', checkTyping);
    }
    
    if (zenInput) {
        zenInput.addEventListener('input', updateZenStats);
    }
    
    // Challenge Mode Event Listeners
    document.getElementById('challengeStartButton').addEventListener('click', startChallenge);
    document.getElementById('challengeNextButton').addEventListener('click', nextChallengeLevel);
    document.getElementById('challengeInput').addEventListener('input', checkChallengeProgress);
    
    // Show menu by default
    console.log('Showing initial menu'); // Debug log
    showMenu();
});

function showAISpeedSelection() {
    document.querySelector('.mode-buttons').style.display = 'none';
    document.getElementById('aiSpeedSelection').classList.remove('hidden');
}

function startMode(mode, aiSpeed = 0) {
    console.log('Starting mode:', mode);
    
    // Hide all screens first
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Hide all mode UIs
    document.querySelectorAll('.mode-ui').forEach(ui => {
        ui.classList.add('hidden');
    });
    
    // Show game screen
    const gameScreen = document.getElementById('gameScreen');
    if (gameScreen) {
        console.log('Found game screen');
        gameScreen.classList.add('active');
    } else {
        console.error('Game screen not found');
        return;
    }
    
    // Reset game state
    gameState = {
        mode: mode,
        isActive: false,
        startTime: null,
        zenStartTime: null,
        zenTimer: null,
        level: 1,
        aiSpeed: aiSpeed,
        aiProgress: 0,
        playerProgress: 0,
        currentWordIndex: 0,
        totalWords: 0,
        raceInterval: null
    };
    
    // Update mode indicator
    if (modeIndicator) {
        modeIndicator.textContent = getModeText(mode);
    }
    
    // Show appropriate UI based on mode
    if (mode === 'practice') {
        const practiceUI = document.getElementById('practiceUI');
        if (practiceUI) {
            console.log('Found practice UI');
            practiceUI.classList.remove('hidden');
            
            // Set up practice mode
            if (levelBox) levelBox.style.display = 'none';
            if (textDisplay) {
                const text = getNewText();
                textDisplay.textContent = text;
            }
            if (textInput) {
                textInput.value = '';
                textInput.disabled = true;
            }
            if (startButton) {
                startButton.style.display = 'block';
                startButton.disabled = false;
            }
            if (nextButton) nextButton.style.display = 'none';
            
            // Reset stats
            if (wpmDisplay) wpmDisplay.textContent = '0';
            if (timeDisplay) timeDisplay.textContent = '0';
        }
    } else if (mode === 'challenge') {
        const challengeUI = document.getElementById('challengeUI');
        if (challengeUI) {
            challengeUI.classList.remove('hidden');
            setupChallengeLevel(gameState.level);
        }
    } else if (mode === 'race') {
        const raceUI = document.getElementById('raceUI');
        if (raceUI) {
            raceUI.classList.remove('hidden');
            gameState.aiSpeed = aiSpeed;
            setupRaceMode();
        }
    } else if (mode === 'zen') {
        const zenUI = document.getElementById('zenUI');
        if (zenUI) {
            zenUI.classList.remove('hidden');
            setupZenMode();
        }
    }
}

function startChallengeMode() {
    currentMode = 'challenge';
    currentChallengeLevel = 1;
    showElement('challengeMode');
    hideElement('practiceMode');
    hideElement('raceMode');
    hideElement('zenMode');
    setupChallengeLevel();
}

function setupChallengeLevel() {
    const level = CHALLENGE_LEVELS[currentChallengeLevel - 1];
    document.getElementById('currentLevel').textContent = level.level;
    document.getElementById('targetWPM').textContent = level.targetWPM;
    document.getElementById('challengeTextDisplay').textContent = level.text;
    document.getElementById('challengeInput').value = '';
    document.getElementById('challengeInput').disabled = true;
    
    showElement('challengeStartButton');
    hideElement('challengeNextButton');
    challengeInProgress = false;
}

function startChallenge() {
    challengeStartTime = new Date();
    document.getElementById('challengeInput').disabled = false;
    document.getElementById('challengeInput').focus();
    hideElement('challengeStartButton');
    challengeInProgress = true;
}

function checkChallengeProgress() {
    if (!challengeInProgress) return;
    
    const level = CHALLENGE_LEVELS[currentChallengeLevel - 1];
    const input = document.getElementById('challengeInput').value;
    const targetText = level.text;
    
    if (input === targetText) {
        challengeEndTime = new Date();
        const timeElapsed = (challengeEndTime - challengeStartTime) / 1000 / 60; // in minutes
        const wordsTyped = targetText.split(' ').length;
        const wpm = Math.round(wordsTyped / timeElapsed);
        
        if (wpm >= level.targetWPM) {
            handleChallengeSuccess(wpm);
        } else {
            handleChallengeFail(wpm);
        }
        challengeInProgress = false;
    }
}

function handleChallengeSuccess(wpm) {
    showElement('challengeNextButton');
    document.getElementById('challengeInput').disabled = true;
    
    if (currentChallengeLevel === CHALLENGE_LEVELS.length) {
        alert(`Congratulations! You've completed all levels with ${wpm} WPM!`);
    } else {
        alert(`Level ${currentChallengeLevel} completed with ${wpm} WPM! Click Next to continue.`);
    }
}

function handleChallengeFail(wpm) {
    showElement('challengeStartButton');
    document.getElementById('challengeInput').disabled = true;
    alert(`Try again! You achieved ${wpm} WPM, but need ${CHALLENGE_LEVELS[currentChallengeLevel - 1].targetWPM} WPM to pass.`);
}

function nextChallengeLevel() {
    if (currentChallengeLevel < CHALLENGE_LEVELS.length) {
        currentChallengeLevel++;
        setupChallengeLevel();
    }
}

function hideAllScreens() {
    console.log('Hiding all screens');
    
    // Hide mode selection
    const modeSelection = document.getElementById('modeSelection');
    if (modeSelection) {
        console.log('Found mode selection screen');
        modeSelection.classList.remove('active');
    }
    
    // Hide game screen
    const gameScreen = document.getElementById('gameScreen');
    if (gameScreen) {
        console.log('Found game screen');
        gameScreen.classList.remove('active');
    }
    
    // Hide all mode UIs
    document.querySelectorAll('.mode-ui').forEach(ui => {
        console.log('Hiding UI:', ui.id);
        ui.classList.add('hidden');
    });
    
    // Log all screens for debugging
    const screens = document.querySelectorAll('.screen');
    console.log('All screens found:', Array.from(screens).map(s => s.id));
}

function showMenu() {
    console.log('Showing menu');
    
    // Reset game state
    gameState.isActive = false;
    if (gameState.zenTimer) {
        clearInterval(gameState.zenTimer);
        gameState.zenTimer = null;
    }
    if (gameState.raceInterval) {
        clearInterval(gameState.raceInterval);
        gameState.raceInterval = null;
    }

    // Hide all screens first
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Hide all mode UIs
    document.querySelectorAll('.mode-ui').forEach(ui => {
        ui.classList.add('hidden');
    });
    
    // Show mode selection
    const modeSelection = document.getElementById('modeSelection');
    if (modeSelection) {
        console.log('Found mode selection screen, showing it');
        modeSelection.classList.add('active');
        
        // Show mode buttons and ensure proper display
        const modeButtons = document.querySelector('.mode-buttons');
        if (modeButtons) {
            console.log('Found mode buttons, showing them');
            modeButtons.style.display = 'grid';
        }
    } else {
        console.error('Mode selection screen not found');
    }
    
    // Hide AI speed selection and ensure it's properly hidden
    const aiSpeedSelection = document.getElementById('aiSpeedSelection');
    if (aiSpeedSelection) {
        console.log('Found AI speed selection, hiding it');
        aiSpeedSelection.classList.add('hidden');
    }
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

function getNewText() {
    const index = Math.floor(Math.random() * texts.length);
    return texts[index];
}

function startTest() {
    if (gameState.isActive) return;
    
    gameState.isActive = true;
    gameState.startTime = Date.now();
    gameState.currentWordIndex = 0;
    
    // Enable input and focus
    textInput.disabled = false;
    textInput.value = '';
    textInput.focus();
    
    // Hide start button, will show next button when typing is complete
    startButton.style.display = 'none';
    nextButton.style.display = 'none';
    
    // Start timer update
    updateTimer();
}

function checkTyping() {
    if (!gameState.isActive) return;
    
    const currentText = textDisplay.textContent;
    const typedText = textInput.value;
    const words = currentText.split(' ');
    const currentWord = words[gameState.currentWordIndex];
    
    // Check if word is complete
    if (typedText.endsWith(' ')) {
        const typedWord = typedText.trim();
        
        if (typedWord === currentWord) {
            gameState.currentWordIndex++;
            textInput.value = '';
            
            // Check if all words are typed
            if (gameState.currentWordIndex === words.length) {
                endTest();
                return;
            }
        }
    }
    
    // Update WPM
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // in minutes
    const wordsTyped = gameState.currentWordIndex;
    const currentWPM = Math.round(wordsTyped / timeElapsed) || 0;
    wpmDisplay.textContent = currentWPM;
}

function updateTimer() {
    if (!gameState.isActive) return;
    
    const secondsElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    timeDisplay.textContent = secondsElapsed;
    
    requestAnimationFrame(updateTimer);
}

function nextText() {
    // Reset game state
    gameState.isActive = false;
    gameState.startTime = null;
    gameState.currentWordIndex = 0;
    
    // Get new text and reset UI
    const text = getNewText();
    textDisplay.textContent = text;
    textInput.value = '';
    textInput.disabled = true;
    
    // Show/hide buttons
    startButton.style.display = 'block';
    nextButton.style.display = 'none';
    
    // Reset stats
    wpmDisplay.textContent = '0';
    timeDisplay.textContent = '0';
}

function endTest() {
    gameState.isActive = false;
    
    // Calculate final WPM
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60;
    const wordsTyped = gameState.currentWordIndex;
    const finalWPM = Math.round(wordsTyped / timeElapsed) || 0;
    
    // Update display
    wpmDisplay.textContent = finalWPM;
    
    // Disable input and show next button
    textInput.disabled = true;
    nextButton.style.display = 'block';
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

function endRace(winner) {
    gameState.isActive = false;
    clearInterval(gameState.raceInterval);
    
    const message = winner === 'player' ? 'Congratulations! You won!' : 'The AI won! Try again!';
    alert(message);
    
    // Reset the game
    showMenu();
}

function setupChallengeLevel(level) {
    const levelIndex = level - 1;
    if (levelIndex >= CHALLENGE_LEVELS.length) {
        alert('Congratulations! You have completed all levels!');
        showMenu();
        return;
    }
    
    const challengeLevel = CHALLENGE_LEVELS[levelIndex];
    const challengeTextDisplay = document.getElementById('challengeTextDisplay');
    const challengeInput = document.getElementById('challengeInput');
    const currentLevel = document.getElementById('currentLevel');
    const targetWPM = document.getElementById('targetWPM');
    const levelDisplay = document.getElementById('level');
    
    if (challengeTextDisplay) challengeTextDisplay.textContent = challengeLevel.text;
    if (challengeInput) {
        challengeInput.value = '';
        challengeInput.disabled = true;
    }
    if (currentLevel) currentLevel.textContent = level;
    if (targetWPM) targetWPM.textContent = challengeLevel.targetWPM;
    if (levelDisplay) levelDisplay.textContent = level;
    
    document.getElementById('challengeStartButton').style.display = 'block';
    document.getElementById('challengeNextButton').style.display = 'none';
}

function startChallenge() {
    if (gameState.isActive) return;
    
    gameState.isActive = true;
    gameState.startTime = Date.now();
    gameState.currentWordIndex = 0;
    
    const challengeInput = document.getElementById('challengeInput');
    if (challengeInput) {
        challengeInput.value = '';
        challengeInput.disabled = false;
        challengeInput.focus();
    }
    
    document.getElementById('challengeStartButton').style.display = 'none';
    
    // Start timer update
    updateTimer();
}

function checkChallengeTyping() {
    if (!gameState.isActive) return;
    
    const challengeTextDisplay = document.getElementById('challengeTextDisplay');
    const challengeInput = document.getElementById('challengeInput');
    const currentText = challengeTextDisplay.textContent;
    const typedText = challengeInput.value;
    
    // Calculate current WPM
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // in minutes
    const wordsTyped = typedText.trim().split(/\s+/).length;
    const currentWPM = Math.round(wordsTyped / timeElapsed) || 0;
    
    // Update WPM display
    wpmDisplay.textContent = currentWPM;
    
    // Check if completed
    if (typedText === currentText) {
        endChallenge();
    }
}

function endChallenge() {
    gameState.isActive = false;
    
    const challengeInput = document.getElementById('challengeInput');
    if (challengeInput) {
        challengeInput.disabled = true;
    }
    
    // Calculate final WPM
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60;
    const finalWPM = Math.round(challengeInput.value.trim().split(/\s+/).length / timeElapsed) || 0;
    wpmDisplay.textContent = finalWPM;
    
    // Check if passed level
    const levelIndex = gameState.level - 1;
    const targetWPM = CHALLENGE_LEVELS[levelIndex].targetWPM;
    
    if (finalWPM >= targetWPM) {
        // Show next level button
        document.getElementById('challengeNextButton').style.display = 'block';
    } else {
        // Show retry message
        alert(`Try again! You need ${targetWPM} WPM to pass this level. You achieved ${finalWPM} WPM.`);
        document.getElementById('challengeStartButton').style.display = 'block';
    }
}

function nextChallengeLevel() {
    gameState.level++;
    setupChallengeLevel(gameState.level);
}
