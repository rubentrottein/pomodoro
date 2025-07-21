// État global de l'application
let appState = {
    dayTitle: "Ma journée productive",
    tasks: [],
    currentSession: 1,
    isWorking: true,
    timeLeft: 25 * 60,
    isRunning: false,
    completedPomodoros: 0
};

let timer = null;
let audioContext = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadState();
    updateDisplay();
    
    // Synchronisation en temps réel simulée
    setInterval(syncWithServer, 5000);
});

// Gestion du timer
function startTimer() {
    if (!appState.isRunning) {
        appState.isRunning = true;
        timer = setInterval(updateTimer, 1000);
        document.getElementById('startBtn').textContent = 'En cours...';
        document.getElementById('startBtn').disabled = true;
        saveState();
    }
}

function pauseTimer() {
    if (appState.isRunning) {
        appState.isRunning = false;
        clearInterval(timer);
        document.getElementById('startBtn').textContent = 'Reprendre';
        document.getElementById('startBtn').disabled = false;
        saveState();
    }
}

function resetTimer() {
    appState.isRunning = false;
    clearInterval(timer);
    appState.currentSession = 1;
    appState.isWorking = true;
    appState.timeLeft = 25 * 60;
    appState.completedPomodoros = 0;
    document.getElementById('startBtn').textContent = 'Démarrer';
    document.getElementById('startBtn').disabled = false;
    updateDisplay();
    saveState();
}

function updateTimer() {
    if (appState.timeLeft > 0) {
        appState.timeLeft--;
        updateDisplay();
        saveState();
    } else {
        // Temps écoulé
        handleTimerComplete();
    }
}

function handleTimerComplete() {
    appState.isRunning = false;
    clearInterval(timer);
    
    if (appState.isWorking) {
        // Fin d'une session de travail
        appState.completedPomodoros++;
        
        if (appState.completedPomodoros >= 4) {
            // Pause longue après 4 pomodoros
            showFireworks();
            appState.isWorking = false;
            appState.timeLeft = 30 * 60; // 30 minutes
            appState.completedPomodoros = 0;
            appState.currentSession = 1;
        } else {
            // Pause courte
            appState.isWorking = false;
            appState.timeLeft = 5 * 60; // 5 minutes
            appState.currentSession++;
        }
    } else {
        // Fin d'une pause
        appState.isWorking = true;
        appState.timeLeft = 25 * 60; // 25 minutes
    }
    
    playBreakSound();
    document.getElementById('startBtn').textContent = 'Démarrer';
    document.getElementById('startBtn').disabled = false;
    updateDisplay();
    saveState();
}

function updateDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    const sessionInfo = document.getElementById('sessionInfo');
    const statusIndicator = document.getElementById('statusIndicator');
    
    // Formatage du temps
    const minutes = Math.floor(appState.timeLeft / 60);
    const seconds = appState.timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Mise à jour de l'affichage selon l'état
    if (appState.isWorking) {
        timerDisplay.className = 'timer-display work';
        sessionInfo.textContent = `Session ${appState.currentSession}/4 - Travail`;
        statusIndicator.className = 'status-indicator status-work';
    } else {
        if (appState.timeLeft === 30 * 60) {
            timerDisplay.className = 'timer-display long-break';
            sessionInfo.textContent = 'Pause longue (30 min)';
            statusIndicator.className = 'status-indicator status-long-break';
        } else {
            timerDisplay.className = 'timer-display break';
            sessionInfo.textContent = 'Pause courte (5 min)';
            statusIndicator.className = 'status-indicator status-break';
        }
    }
}

// Effets visuels et sonores
function showFireworks() {
    const fireworksContainer = document.getElementById('fireworks');
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            
            fireworksContainer.appendChild(firework);
            
            setTimeout(() => {
                fireworksContainer.removeChild(firework);
            }, 1000);
        }, i * 100);
    }
}

function playBreakSound() {
    // Simulation d'un son de notification
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Gestion de la persistance

/*
function saveState() {
    // Sauvegarde du titre de journée
    appState.dayTitle = document.getElementById('dayTitle').value;
    
    // Simulation de sauvegarde (en réalité, cela irait vers un serveur)
    const stateToSave = {
        ...appState,
        timestamp: Date.now()
    };
    
    // Sauvegarde locale pour la démo
    try {
        // Note: Dans un vrai environnement, ceci irait vers un serveur
        console.log('État sauvegardé:', stateToSave);
    } catch (error) {
        console.log('Sauvegarde en mémoire uniquement');
    }
}
*/
// Clé pour le localStorage
const STORAGE_KEY = 'pomodoro_app_state';

// Gestion de la persistance
function saveState() {
    try {
        // Sauvegarde du titre de journée depuis l'input
        const dayTitleInput = document.getElementById('dayTitle');
        if (dayTitleInput) {
            appState.dayTitle = dayTitleInput.value;
        }
        
        // Création de l'objet à sauvegarder avec timestamp
        const stateToSave = {
            ...appState,
            timestamp: Date.now()
        };
        
        // Sauvegarde dans localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        
        console.log('État sauvegardé dans localStorage:', stateToSave);
        
        // Optionnel : afficher un message de confirmation
        showSaveConfirmation();
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        // Fallback : sauvegarde en mémoire uniquement
        console.log('Sauvegarde en mémoire uniquement');
    }
}

function loadState() {
    try {
        // Récupération de l'état depuis localStorage
        const savedState = localStorage.getItem(STORAGE_KEY);
        
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            // Fusion avec l'état actuel (garde les valeurs par défaut pour les propriétés manquantes)
            appState = {
                ...appState,
                ...parsedState
            };
            
            console.log('État chargé depuis localStorage:', appState);
            
            // Mise à jour de l'interface utilisateur
            updateUIFromState();
            
        } else {
            console.log('Aucun état sauvegardé trouvé, utilisation des valeurs par défaut');
            // Initialisation de l'interface avec les valeurs par défaut
            updateUIFromState();
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        console.log('Utilisation des valeurs par défaut');
        // En cas d'erreur, utiliser les valeurs par défaut
        updateUIFromState();
    }
}

function updateUIFromState() {
    // Mise à jour du titre de journée
    const dayTitleInput = document.getElementById('dayTitle');
    if (dayTitleInput) {
        dayTitleInput.value = appState.dayTitle;
    }
    
    // Mise à jour de la liste des tâches
    if (typeof updateTaskList === 'function') {
        updateTaskList();
    }
    
    // Mise à jour de l'affichage du timer
    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }
    
    // Mise à jour du compteur de pomodoros
    if (typeof updatePomodoroCounter === 'function') {
        updatePomodoroCounter();
    }
}

function clearSavedState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('État sauvegardé supprimé');
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
    }
}

function syncWithServer() {
    // Simulation de synchronisation avec d'autres utilisateurs
    // En réalité, ceci ferait un appel API pour synchroniser l'état
    console.log('Synchronisation avec le serveur...');
    
    // Exemple d'implémentation avec fetch (à adapter selon votre API)
    /*
    fetch('/api/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(appState)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Synchronisation réussie:', data);
    })
    .catch(error => {
        console.error('Erreur de synchronisation:', error);
    });
    */
}

function showSaveConfirmation() {
    // Affichage d'un message de confirmation (optionnel)
    // Vous pouvez personnaliser cette fonction selon votre UI
    const existingMessage = document.getElementById('saveMessage');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.id = 'saveMessage';
    message.textContent = '💾 Sauvegardé';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    
    document.body.appendChild(message);
    
    // Animation d'apparition
    setTimeout(() => {
        message.style.opacity = '1';
    }, 10);
    
    // Suppression après 2 secondes
    setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 300);
    }, 2000);
}

// Gestion des événements
document.getElementById('taskInput')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

document.getElementById('dayTitle')?.addEventListener('input', function() {
    appState.dayTitle = this.value;
    // Sauvegarde automatique avec un petit délai pour éviter trop d'appels
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(saveState, 500);
});

// Gestion de la fermeture de page
window.addEventListener('beforeunload', function() {
    saveState();
});

// Sauvegarde automatique périodique (toutes les 30 secondes)
setInterval(saveState, 30000);

// Chargement de l'état au démarrage
document.addEventListener('DOMContentLoaded', function() {
    loadState();
});

// Fonctions utilitaires supplémentaires
function exportState() {
    // Exporter l'état actuel en JSON pour backup
    const dataStr = JSON.stringify(appState, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pomodoro_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function importState(fileInput) {
    // Importer un état depuis un fichier JSON
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedState = JSON.parse(e.target.result);
                appState = {
                    ...appState,
                    ...importedState
                };
                saveState();
                updateUIFromState();
                console.log('État importé avec succès');
            } catch (error) {
                console.error('Erreur lors de l\'importation:', error);
                alert('Erreur lors de l\'importation du fichier');
            }
        };
        reader.readAsText(file);
    }
}

function loadState() {
    // Chargement de l'état (simulé)
    document.getElementById('dayTitle').value = appState.dayTitle;
    updateTaskList();
    updateDisplay();
}

function syncWithServer() {
    // Simulation de synchronisation avec d'autres utilisateurs
    // En réalité, ceci ferait un appel API pour synchroniser l'état
    console.log('Synchronisation avec le serveur...');
}

// Gestion des événements
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

document.getElementById('dayTitle').addEventListener('input', function() {
    appState.dayTitle = this.value;
    saveState();
});

// Gestion de la fermeture de page
window.addEventListener('beforeunload', function() {
    saveState();
});