// Mario Kart World Guide - JavaScript Functionality

// Global variables
let gameData = {};
let userProgress = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadUserProgress();
    setupEventListeners();
    populateContent();
});

// Initialize application
function initializeApp() {
    console.log('Mario Kart World Guide initialized');
    
    // Load game data from JSON
    const gameDataElement = document.getElementById('gameData');
    if (gameDataElement) {
        try {
            gameData = JSON.parse(gameDataElement.textContent);
            console.log('Game data loaded successfully');
        } catch (error) {
            console.error('Error loading game data:', error);
        }
    }
    
    // Load data from localStorage if available
    const savedProgress = localStorage.getItem('mkw-progress');
    if (savedProgress) {
        userProgress = JSON.parse(savedProgress);
    } else {
        userProgress = {
            unlockedItems: [],
            completedMissions: [],
            collectibles: {
                pSwitches: 0,
                peachMedallions: 0,
                questionPanels: 0,
                yoshiDiners: 0
            }
        };
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            switchTab(targetTab);
        });
    });

    // Mode buttons in overview
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.target;
            switchTab(targetTab);
        });
    });

    // CC tabs in Grand Prix
    const ccTabs = document.querySelectorAll('.cc-tab');
    ccTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const cc = this.dataset.cc;
            switchCCTab(cc);
        });
    });

    // Global search
    const searchInput = document.getElementById('globalSearch');
    const searchBtn = document.querySelector('.search-btn');
    
    searchInput.addEventListener('input', debounce(performSearch, 300));
    searchBtn.addEventListener('click', () => performSearch());
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Filter checkboxes
    const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    // Progress tracking checkboxes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('unlock-checkbox')) {
            updateProgress(e.target);
        }
    });
}

// Tab switching functionality
function switchTab(tabName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');

    // Populate content for specific tabs
    if (tabName === 'unlocks') {
        populateUnlockTable();
    } else if (tabName === 'grand-prix') {
        populateGrandPrixLoadouts();
    } else if (tabName === 'knockout-tour') {
        populateKnockoutTourLoadouts();
    }
}

// CC tab switching
function switchCCTab(cc) {
    const ccTabs = document.querySelectorAll('.cc-tab');
    ccTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-cc="${cc}"]`).classList.add('active');
    
    populateGrandPrixLoadouts(cc);
}

// Search functionality
function performSearch() {
    const searchTerm = document.getElementById('globalSearch').value.toLowerCase().trim();
    
    if (!searchTerm) {
        clearHighlights();
        return;
    }

    // Clear previous highlights
    clearHighlights();

    // Search through all content
    const searchableElements = document.querySelectorAll('.tab-content, .sidebar');
    let foundResults = [];

    searchableElements.forEach(element => {
        const textContent = element.textContent.toLowerCase();
        if (textContent.includes(searchTerm)) {
            foundResults.push(element);
            highlightSearchTerm(element, searchTerm);
        }
    });

    // Show results
    if (foundResults.length > 0) {
        console.log(`Found ${foundResults.length} results for "${searchTerm}"`);
        // Optionally switch to the first tab with results
        const firstResultTab = foundResults[0].closest('.tab-content');
        if (firstResultTab) {
            const tabId = firstResultTab.id;
            switchTab(tabId);
        }
    } else {
        console.log(`No results found for "${searchTerm}"`);
    }
}

// Highlight search terms
function highlightSearchTerm(element, searchTerm) {
    element.classList.add('highlight');
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
        element.classList.remove('highlight');
    }, 3000);
}

// Clear search highlights
function clearHighlights() {
    const highlightedElements = document.querySelectorAll('.highlight');
    highlightedElements.forEach(element => {
        element.classList.remove('highlight');
    });
}

// Apply filters
function applyFilters() {
    const activeFilters = {
        characters: [],
        rarity: [],
        gameMode: []
    };

    // Collect active filters
    const characterFilters = document.querySelectorAll('.filter-options input[value*="mario"], .filter-options input[value*="luigi"], .filter-options input[value*="peach"], .filter-options input[value*="bowser"], .filter-options input[value*="yoshi"], .filter-options input[value*="toad"]');
    characterFilters.forEach(filter => {
        if (filter.checked) {
            activeFilters.characters.push(filter.value);
        }
    });

    const rarityFilters = document.querySelectorAll('.filter-options input[value*="common"], .filter-options input[value*="special"], .filter-options input[value*="legendary"]');
    rarityFilters.forEach(filter => {
        if (filter.checked) {
            activeFilters.rarity.push(filter.value);
        }
    });

    const gameModeFilters = document.querySelectorAll('.filter-options input[value*="grand-prix"], .filter-options input[value*="knockout-tour"], .filter-options input[value*="battle"], .filter-options input[value*="free-roam"]');
    gameModeFilters.forEach(filter => {
        if (filter.checked) {
            activeFilters.gameMode.push(filter.value);
        }
    });

    // Apply filters to content
    applyContentFilters(activeFilters);
}

// Apply content filters
function applyContentFilters(filters) {
    // This would filter the unlock table and other content based on active filters
    const unlockRows = document.querySelectorAll('#unlockTableBody tr');
    
    unlockRows.forEach(row => {
        let shouldShow = true;
        
        // Check if row matches any active filters
        if (filters.characters.length > 0 || filters.rarity.length > 0 || filters.gameMode.length > 0) {
            const rowText = row.textContent.toLowerCase();
            
            // Character filter
            if (filters.characters.length > 0) {
                const matchesCharacter = filters.characters.some(char => rowText.includes(char));
                if (!matchesCharacter) shouldShow = false;
            }
            
            // Rarity filter
            if (filters.rarity.length > 0) {
                const matchesRarity = filters.rarity.some(rarity => row.classList.contains(`rarity-${rarity}`));
                if (!matchesRarity) shouldShow = false;
            }
            
            // Game mode filter
            if (filters.gameMode.length > 0) {
                const matchesMode = filters.gameMode.some(mode => rowText.includes(mode.replace('-', ' ')));
                if (!matchesMode) shouldShow = false;
            }
        }
        
        row.style.display = shouldShow ? '' : 'none';
    });
}

// Populate unlock table
function populateUnlockTable() {
    const tableBody = document.getElementById('unlockTableBody');
    
    const unlockData = [
        {
            requirement: 'Start the game',
            mode: 'Any',
            difficulty: 'Easy',
            rewards: 'Mario, Luigi, Peach, Bowser, Yoshi, Toad',
            rarity: 'common',
            id: 'starter-characters'
        },
        {
            requirement: 'Collect 100 coins',
            mode: 'Any',
            difficulty: 'Easy',
            rewards: 'Random Kart',
            rarity: 'common',
            id: 'first-kart'
        },
        {
            requirement: 'Complete Mushroom Cup',
            mode: 'Grand Prix',
            difficulty: 'Easy',
            rewards: 'Toadette',
            rarity: 'common',
            id: 'toadette'
        },
        {
            requirement: 'Complete Flower Cup',
            mode: 'Grand Prix',
            difficulty: 'Easy',
            rewards: 'Koopa Troopa',
            rarity: 'common',
            id: 'koopa'
        },
        {
            requirement: 'Complete Star Cup',
            mode: 'Grand Prix',
            difficulty: 'Medium',
            rewards: 'Rosalina',
            rarity: 'special',
            id: 'rosalina'
        },
        {
            requirement: 'Complete Special Cup',
            mode: 'Grand Prix',
            difficulty: 'Hard',
            rewards: 'Rainbow Road',
            rarity: 'legendary',
            id: 'rainbow-road'
        },
        {
            requirement: 'Win 1st place in Knockout Tour',
            mode: 'Knockout Tour',
            difficulty: 'Hard',
            rewards: 'King Boo',
            rarity: 'special',
            id: 'king-boo'
        },
        {
            requirement: 'Collect 1000 coins',
            mode: 'Any',
            difficulty: 'Medium',
            rewards: 'Dry Bones',
            rarity: 'common',
            id: 'dry-bones'
        },
        {
            requirement: 'Complete 50 P-Switch Missions',
            mode: 'Free Roam',
            difficulty: 'Medium',
            rewards: 'Shy Guy',
            rarity: 'common',
            id: 'shy-guy'
        },
        {
            requirement: 'Find 25 Peach Medallions',
            mode: 'Free Roam',
            difficulty: 'Medium',
            rewards: 'Piranha Plant',
            rarity: 'special',
            id: 'piranha-plant'
        }
    ];

    tableBody.innerHTML = '';
    
    unlockData.forEach(item => {
        const row = document.createElement('tr');
        row.className = `rarity-${item.rarity}`;
        row.innerHTML = `
            <td><input type="checkbox" class="unlock-checkbox" data-id="${item.id}" ${userProgress.unlockedItems.includes(item.id) ? 'checked' : ''}></td>
            <td>${item.requirement}</td>
            <td>${item.mode}</td>
            <td>${item.difficulty}</td>
            <td>${item.rewards}</td>
            <td><span class="rarity-${item.rarity}">${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// Populate Grand Prix loadouts
function populateGrandPrixLoadouts(cc = '50cc') {
    const loadoutContainer = document.getElementById('grandPrixLoadouts');
    
    const loadouts = {
        '50cc': [
            {
                name: 'Baby Peach + Baby Blooper',
                stats: { speed: '1.2', acceleration: '3.2', weight: '0.8', handling: '2.8' },
                notes: 'Best for beginners - high acceleration for recovery from items'
            },
            {
                name: 'Dry Bones + Roadster Royale',
                stats: { speed: '1.6', acceleration: '2.6', weight: '1.4', handling: '2.4' },
                notes: 'Balanced stats, good for learning the basics'
            },
            {
                name: 'Toad + Standard Kart',
                stats: { speed: '1.8', acceleration: '2.4', weight: '1.2', handling: '2.6' },
                notes: 'Available from start, reliable performance'
            }
        ],
        '100cc': [
            {
                name: 'Baby Peach + Baby Blooper',
                stats: { speed: '1.2', acceleration: '3.2', weight: '0.8', handling: '2.8' },
                notes: 'Still excellent for quick recovery from hits'
            },
            {
                name: 'Bowser + Baby Blooper',
                stats: { speed: '2.4', acceleration: '1.8', weight: '2.2', handling: '1.6' },
                notes: 'Good balance of speed and acceleration'
            },
            {
                name: 'Mario + Rally Kart',
                stats: { speed: '2.0', acceleration: '2.0', weight: '1.8', handling: '2.0' },
                notes: 'Well-rounded option for intermediate players'
            }
        ],
        '150cc': [
            {
                name: 'Rosalina + Stellar Sled',
                stats: { speed: '3.0', acceleration: '1.0', weight: '2.6', handling: '1.4' },
                notes: 'High speed with some handling, unlock required'
            },
            {
                name: 'Bowser + Charging Truck',
                stats: { speed: '3.2', acceleration: '0.8', weight: '3.0', handling: '1.0' },
                notes: 'Maximum speed for experienced players'
            },
            {
                name: 'Baby Peach + Baby Blooper',
                stats: { speed: '1.2', acceleration: '3.2', weight: '0.8', handling: '2.8' },
                notes: 'Still viable for online play with many items'
            }
        ],
        '200cc': [
            {
                name: 'Baby Peach + Baby Blooper',
                stats: { speed: '1.2', acceleration: '3.2', weight: '0.8', handling: '2.8' },
                notes: 'Essential for 200cc - need maximum acceleration and handling'
            },
            {
                name: 'Dry Bones + Roadster Royale',
                stats: { speed: '1.6', acceleration: '2.6', weight: '1.4', handling: '2.4' },
                notes: 'Alternative with slightly more speed'
            },
            {
                name: 'Toadette + Biddybuggy',
                stats: { speed: '1.4', acceleration: '2.8', weight: '1.0', handling: '2.6' },
                notes: 'Lightweight option for tight corners'
            }
        ]
    };

    loadoutContainer.innerHTML = '';
    
    loadouts[cc].forEach(loadout => {
        const card = document.createElement('div');
        card.className = 'loadout-card';
        card.innerHTML = `
            <h3>${loadout.name}</h3>
            <div class="loadout-stats">
                <div>Speed: ${loadout.stats.speed}</div>
                <div>Acceleration: ${loadout.stats.acceleration}</div>
                <div>Weight: ${loadout.stats.weight}</div>
                <div>Handling: ${loadout.stats.handling}</div>
            </div>
            <div class="loadout-notes">${loadout.notes}</div>
        `;
        loadoutContainer.appendChild(card);
    });
}

// Populate Knockout Tour loadouts
function populateKnockoutTourLoadouts() {
    const loadoutContainer = document.getElementById('knockoutLoadouts');
    
    const knockoutLoadouts = [
        {
            name: 'Bowser + Reel Racer',
            notes: 'Maximum speed for straight pathways, maintains decent overall stats'
        },
        {
            name: 'Swoop + W-Twin Chopper',
            notes: 'Better handling and acceleration, good for tight turns'
        },
        {
            name: 'Bowser Jr. + W-Twin Chopper',
            notes: 'Most balanced build for consistent performance'
        }
    ];

    loadoutContainer.innerHTML = '';
    
    knockoutLoadouts.forEach(loadout => {
        const card = document.createElement('div');
        card.className = 'loadout-card';
        card.innerHTML = `
            <h3>${loadout.name}</h3>
            <div class="loadout-notes">${loadout.notes}</div>
        `;
        loadoutContainer.appendChild(card);
    });
}

// Update progress tracking
function updateProgress(checkbox) {
    const itemId = checkbox.dataset.id;
    
    if (checkbox.checked) {
        if (!userProgress.unlockedItems.includes(itemId)) {
            userProgress.unlockedItems.push(itemId);
        }
    } else {
        const index = userProgress.unlockedItems.indexOf(itemId);
        if (index > -1) {
            userProgress.unlockedItems.splice(index, 1);
        }
    }
    
    saveUserProgress();
    updateProgressBars();
}

// Update progress bars
function updateProgressBars() {
    const progressBars = document.querySelectorAll('.progress');
    const progressTexts = document.querySelectorAll('.progress-text');
    
    // Calculate progress percentages
    const totalUnlocks = 50; // Total unlockable items
    const unlockedCount = userProgress.unlockedItems.length;
    const progressPercentage = (unlockedCount / totalUnlocks) * 100;
    
    // Update collectible progress
    const collectibleTypes = ['pSwitches', 'peachMedallions', 'questionPanels', 'yoshiDiners'];
    const collectibleTotals = [394, 150, 150, 30];
    
    collectibleTypes.forEach((type, index) => {
        const current = userProgress.collectibles[type] || 0;
        const total = collectibleTotals[index];
        const percentage = (current / total) * 100;
        
        if (progressBars[index]) {
            progressBars[index].style.width = `${percentage}%`;
        }
        if (progressTexts[index]) {
            progressTexts[index].textContent = `${current} / ${total}`;
        }
    });
}

// Save user progress to localStorage
function saveUserProgress() {
    localStorage.setItem('mkw-progress', JSON.stringify(userProgress));
}

// Load user progress from localStorage
function loadUserProgress() {
    const saved = localStorage.getItem('mkw-progress');
    if (saved) {
        userProgress = JSON.parse(saved);
    }
}

// Populate initial content
function populateContent() {
    populateUnlockTable();
    populateGrandPrixLoadouts();
    populateKnockoutTourLoadouts();
    updateProgressBars();
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        switchTab,
        performSearch,
        updateProgress,
        saveUserProgress,
        loadUserProgress
    };
}

