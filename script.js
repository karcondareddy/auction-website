/**
 * e-Auction Application - Main JavaScript File
 * Contains all the application logic, state management and UI interactions
 */

// App State
let currentUser = null;
let users = [];
let auctions = [];
let history = [];
let currentFullscreenIndex = 0;
let currentFullscreenAuctionId = null;

// API Base URL
const API_BASE = 'http://localhost:3000/api';

// DOM Elements
const paymentModal = document.getElementById('payment-modal');
const paymentForm = document.getElementById('payment-form');
const paymentMethodSelect = document.getElementById('payment-method');
const upiFields = document.getElementById('upi-fields');
const cardFields = document.getElementById('card-fields');
const netbankingFields = document.getElementById('netbanking-fields');
const mainApp = document.getElementById('main-app');
const homeContent = document.getElementById('home-content');
const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginFormContainer = document.getElementById('login-form-container');
const registerFormContainer = document.getElementById('register-form-container');
const usernameError = document.getElementById('username-error');
const headerLoginBtn = document.getElementById('header-login');
const headerRegisterBtn = document.getElementById('header-register');
const headerLogoutBtn = document.getElementById('header-logout');
const usernameDisplay = document.getElementById('username-display');
const heroCtaButton = document.getElementById('hero-cta');
const heroSection = document.querySelector('.hero');
const logoHomeBtn = document.getElementById('logo-home-btn');

// Page Sections
const liveSection = document.getElementById('live-section');
const createSection = document.getElementById('create-section');
const depositSection = document.getElementById('deposit-section');
const historySection = document.getElementById('history-section');
const profileSection = document.getElementById('profile-section');
const auctionDetailSection = document.getElementById('auction-detail-section');

// List Containers
const auctionsList = document.getElementById('auctions-list');
const homeAuctionsList = document.getElementById('home-auctions-list');
const historyList = document.getElementById('history-list');
const balanceDisplay = document.getElementById('user-balance');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imageError = document.getElementById('image-error');
const auctionDetailContainer = document.getElementById('auction-detail-container');
const backToAuctionsBtn = document.getElementById('back-to-auctions');
let currentAuctionDetailId = null;

// Database API Functions
const api = {
    // Users
    async getUsers() {
        const response = await fetch(`${API_BASE}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    },

    async getUser(username) {
        const response = await fetch(`${API_BASE}/users/${username}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        return await response.json();
    },

    async createUser(userData) {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Failed to create user');
        return await response.json();
    },

    async updateUserBalance(username, balance) {
        const response = await fetch(`${API_BASE}/users/${username}/balance`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ balance })
        });
        if (!response.ok) throw new Error('Failed to update balance');
        return await response.json();
    },

    async updateUserStats(username, stats) {
        const response = await fetch(`${API_BASE}/users/${username}/stats`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stats)
        });
        if (!response.ok) throw new Error('Failed to update stats');
        return await response.json();
    },

    async updateUserPassword(username, password) {
        const response = await fetch(`${API_BASE}/users/${username}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        if (!response.ok) throw new Error('Failed to update password');
        return await response.json();
    },

    // [NEW] API function to update profile
    async updateUserProfile(username, profileData) {
        const response = await fetch(`${API_BASE}/users/${username}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData) // profileData will be { fullName, email, phone }
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return await response.json();
    },

    async getUserWonAuctions(username) {
        const response = await fetch(`${API_BASE}/users/${username}/won-auctions`);
        if (!response.ok) throw new Error('Failed to fetch won auctions');
        return await response.json();
    },

    async getUserStats(username) {
        const response = await fetch(`${API_BASE}/users/${username}/stats`);
        if (!response.ok) throw new Error('Failed to fetch user stats');
        return await response.json();
    },

    // Auctions
    async getAuctions() {
        const response = await fetch(`${API_BASE}/auctions`);
        if (!response.ok) throw new Error('Failed to fetch auctions');
        return await response.json();
    },

    async getAuction(id) {
        const response = await fetch(`${API_BASE}/auctions/${id}`);
        if (!response.ok) throw new Error('Failed to fetch auction');
        return await response.json();
    },

    async createAuction(auctionData) {
        const response = await fetch(`${API_BASE}/auctions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(auctionData)
        });
        if (!response.ok) throw new Error('Failed to create auction');
        return await response.json();
    },

    async updateAuction(id, auctionData) {
        const response = await fetch(`${API_BASE}/auctions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(auctionData)
        });
        if (!response.ok) throw new Error('Failed to update auction');
        return await response.json();
    },

    // History
    async getHistory() {
        const response = await fetch(`${API_BASE}/history`);
        if (!response.ok) throw new Error('Failed to fetch history');
        return await response.json();
    },

    async addHistory(historyData) {
        const response = await fetch(`${API_BASE}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(historyData)
        });
        if (!response.ok) throw new Error('Failed to add history');
        return await response.json();
    }
};

/**
 * Initializes the application
 */
async function init() {
    try {
        await loadInitialData();
        setupEventListeners();
        updateHeader();
        initPages();
        initAnimations();
        setupKeyboardNavigation();
        startAutoImageRotation();
        
        if (currentUser) {
            homeContent.classList.add('hidden');
            mainApp.classList.remove('hidden');
            heroSection.style.display = 'none';
            showSection(liveSection);
            renderCategoryTabs();
        } else {
            showHomePage();
        }
        
        renderHomeAuctions();
        setupThemeToggle();
        
        // Setup modal listeners from the new HTML content
        document.querySelector('.footer-link[onclick="showAboutModal()"]').addEventListener('click', showAboutModal);
        document.querySelector('.footer-link[onclick="showTermsModal()"]').addEventListener('click', showTermsModal);
        document.querySelector('.footer-link[onclick="showPrivacyModal()"]').addEventListener('click', showPrivacyModal);
        document.querySelector('.footer-link[onclick="showHelpModal()"]').addEventListener('click', showHelpModal);
        document.querySelector('.footer-link[onclick="showContactModal()"]').addEventListener('click', showContactModal);
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error loading application data', 'error');
    }
}

/**
 * Loads initial data from database
 */
async function loadInitialData() {
    try {
        const [usersData, auctionsData, historyData] = await Promise.all([
            api.getUsers(),
            api.getAuctions(),
            api.getHistory()
        ]);
        
        users = usersData;
        auctions = auctionsData;
        history = historyData;
        
        console.log('Data loaded successfully:', { users, auctions, history });
    } catch (error) {
        console.error('Error loading initial data:', error);
        throw error;
    }
}

/**
 * Shows the home page (for non-logged in users)
 */
function showHomePage() {
    homeContent.classList.remove('hidden');
    mainApp.classList.add('hidden');
    heroSection.style.display = 'block';
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    homeContent.classList.add('active');
    
    if (currentUser) {
        homeContent.classList.add('hidden');
        mainApp.classList.remove('hidden');
        heroSection.style.display = 'none';
        showSection(liveSection);
        renderCategoryTabs();
    }
}

/**
 * Initializes page states
 */
function initPages() {
    document.querySelectorAll('.page').forEach((page, index) => {
        if (index === 0) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
}

/**
 * Initializes animation library
 */
function initAnimations() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
}

/**
 * Sets up keyboard navigation for fullscreen gallery
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (document.querySelector('.fullscreen-overlay.active')) {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    navigateFullscreen(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    navigateFullscreen(1);
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeFullscreenGallery();
                    break;
            }
        }
    });
}

/**
 * Sets up all event listeners for the application
 */
function setupEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.add('hidden');
            document.body.style.overflow = '';
        });
    });
    
    // Header logo for home navigation
    logoHomeBtn?.addEventListener('click', showHomePage);

    // Change password button
    document.getElementById('change-password-btn')?.addEventListener('click', showChangePasswordModal);
    document.getElementById('change-password-form')?.addEventListener('submit', handleChangePassword);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });
    
    // Tab switching
    loginTab?.addEventListener('click', showLoginTab);
    registerTab?.addEventListener('click', showRegisterTab);
    
    // Form submissions
    loginForm?.addEventListener('submit', handleLogin);
    registerForm?.addEventListener('submit', handleRegister);
    document.getElementById('contact-form')?.addEventListener('submit', handleContactForm);
    
    // Navigation
    document.getElementById('nav-live')?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(liveSection);
    });
    
    document.getElementById('nav-create')?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(createSection);
    });
    
    document.getElementById('nav-deposit')?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(depositSection);
    });
    
    document.getElementById('nav-history')?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(historySection);
    });
    
    document.getElementById('nav-profile')?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(profileSection);
        renderProfile();
    });
    
    // Check username availability
    document.getElementById('new-username')?.addEventListener('input', checkUsernameAvailability);
    
    // Create Auction
    document.getElementById('create-auction-form')?.addEventListener('submit', handleCreateAuction);
    
    // Deposit Money
    document.getElementById('deposit-form')?.addEventListener('submit', handleDeposit);
    
    // Multiple image upload preview
    document.getElementById('item-images')?.addEventListener('change', handleImageUpload);
    
    // Logout button
    headerLogoutBtn?.addEventListener('click', handleLogout);
    
    // Back to auctions button
    backToAuctionsBtn?.addEventListener('click', () => showSection(liveSection));
    
    // Profile editing
    document.getElementById('edit-profile-btn')?.addEventListener('click', showEditProfileModal);
    document.getElementById('edit-profile-form')?.addEventListener('submit', handleEditProfile);
    
    // Payment method selection
    paymentMethodSelect?.addEventListener('change', showPaymentFields);
    paymentForm?.addEventListener('submit', handlePayment);
    
    // Card input formatting
    const cardInput = document.getElementById('card-number');
    if (cardInput) {
        cardInput.addEventListener('input', formatCardNumber);
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('card-expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }
    
    // Delegated event listeners for dynamic elements
    document.addEventListener('click', function(e) {
        // Header login button
        if (e.target && e.target.id === 'header-login') {
            showLoginModal();
        }
        
        // Header register button
        if (e.target && e.target.id === 'header-register') {
            showRegisterModal();
        }
        
        // Hero CTA button
        if (e.target && e.target.id === 'hero-cta') {
            if (currentUser) {
                homeContent.classList.add('hidden');
                mainApp.classList.remove('hidden');
                heroSection.style.display = 'none';
                showSection(liveSection);
            } else {
                showLoginModal();
            }
        }
        
        // View all auctions button
        if (e.target && e.target.id === 'view-all-auctions') {
            if (!currentUser) {
                showLoginModal();
            } else {
                homeContent.classList.add('hidden');
                mainApp.classList.remove('hidden');
                heroSection.style.display = 'none';
                showSection(liveSection);
            }
        }

        // View auction details
        if (e.target && e.target.classList.contains('view-details-btn')) {
            const auctionId = parseInt(e.target.dataset.id);
            showAuctionDetails(auctionId);
        }

        // Bid button home page
        if (e.target && e.target.classList.contains('bid-button-home')) {
            const auctionId = parseInt(e.target.dataset.id);
            if (!currentUser) {
                showLoginModal();
            } else {
                homeContent.classList.add('hidden');
                mainApp.classList.remove('hidden');
                heroSection.style.display = 'none';
                showAuctionDetails(auctionId);
            }
        }
    });

    document.getElementById('home-auctions-list').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('gallery-main-image')) {
            const auctionId = parseInt(target.dataset.auctionId);
            const index = parseInt(target.dataset.index);
            openFullscreenGallery(auctionId, index);
        }
    });

    document.getElementById('auctions-list').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('gallery-main-image')) {
            const auctionId = parseInt(target.dataset.auctionId);
            const index = parseInt(target.dataset.index);
            openFullscreenGallery(auctionId, index);
        }
    });

    document.getElementById('auction-detail-container').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('gallery-main-image')) {
            const auctionId = parseInt(target.dataset.auctionId);
            const index = parseInt(target.dataset.index);
            openFullscreenGallery(auctionId, index);
        }
    });
}

/**
 * Shows the appropriate payment fields based on selected payment method
 */
function showPaymentFields() {
    upiFields.classList.add('hidden');
    cardFields.classList.add('hidden');
    netbankingFields.classList.add('hidden');
    
    const method = paymentMethodSelect.value;
    if (method === 'upi') {
        upiFields.classList.remove('hidden');
    } else if (method === 'card') {
        cardFields.classList.remove('hidden');
    } else if (method === 'netbanking') {
        netbankingFields.classList.remove('hidden');
    }
}

/**
 * Validates UPI ID format
 */
function validateUPI(upiId) {
    const upiRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upiId);
}

/**
 * Validates card number format
 */
function validateCard(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    return /^\d{16}$/.test(cleaned);
}

/**
 * Formats card number input with spaces every 4 digits
 */
function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = value.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = formatted;
}

/**
 * Validates expiry date format
 */
function validateExpiry(expiry) {
    const expiryRegex = /^(0[1-9]|1[0-2])\/?(\d{2})$/;
    if (!expiryRegex.test(expiry)) return false;
    
    const [_, month, year] = expiry.match(expiryRegex);
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (parseInt(year) < currentYear) return false;
    if (parseInt(year) === currentYear && parseInt(month) < currentMonth) return false;
    return true;
}

/**
 * Formats expiry date input
 */
function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) {
        e.target.value = value.substring(0, 2) + '/' + value.substring(2);
    } else {
        e.target.value = value;
    }
}

/**
 * Validates CVV format
 */
function validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

/**
 * Handles payment form submission
 */
async function handlePayment(e) {
    e.preventDefault();
    
    const amount = parseInt(document.getElementById('deposit-amount').value);
    const fullName = document.getElementById('deposit-full-name').value.trim();
    const phone = document.getElementById('deposit-phone').value.trim();
    const method = paymentMethodSelect.value;
    
    // Validate inputs
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    if (!fullName) {
        showNotification('Please enter your full name', 'error');
        return;
    }
    
    if (!phone || !/^\d{10}$/.test(phone)) {
        showNotification('Please enter a valid 10-digit phone number', 'error');
        return;
    }
    
    // Validate payment method specific fields
    if (method === 'upi') {
        const upiId = document.getElementById('upi-id').value.trim();
        if (!validateUPI(upiId)) {
            showNotification('Please enter a valid UPI ID (e.g. name@bank)', 'error');
            return;
        }
    } else if (method === 'card') {
        const cardNumber = document.getElementById('card-number').value.trim();
        const expiry = document.getElementById('card-expiry').value.trim();
        const cvv = document.getElementById('card-cvv').value.trim();
        const cardName = document.getElementById('card-name').value.trim();
        
        if (!validateCard(cardNumber)) {
            showNotification('Please enter a valid 16-digit card number', 'error');
            return;
        }
        
        if (!validateExpiry(expiry)) {
            showNotification('Please enter a valid expiry date (MM/YY)', 'error');
            return;
        }
        
        if (!validateCVV(cvv)) {
            showNotification('Please enter a valid CVV (3 or 4 digits)', 'error');
            return;
        }
        
        if (!cardName) {
            showNotification('Please enter the name on the card', 'error');
            return;
        }
    } else if (method === 'netbanking') {
        const bank = document.getElementById('bank-select').value;
        const userId = document.getElementById('netbanking-userid').value.trim();
        const password = document.getElementById('netbanking-password').value.trim();
        
        if (!bank) {
            showNotification('Please select your bank', 'error');
            return;
        }
        
        if (!userId) {
            showNotification('Please enter your user ID', 'error');
            return;
        }
        
        if (!password) {
            showNotification('Please enter your password', 'error');
            return;
        }
    }
    
    try {
        // Show loading indicator
        paymentForm.querySelector('input[type="submit"]').disabled = true;
        
        // Process payment
        currentUser.balance += amount;
        
        // Update user balance in database
        await api.updateUserBalance(currentUser.username, currentUser.balance);
        
        // Add to history
        await api.addHistory({
            type: 'deposit',
            amount: amount,
            username: currentUser.username,
            method: method
        });
        
        // Reload history
        history = await api.getHistory();
        
        // Reset forms
        paymentForm.reset();
        document.getElementById('deposit-form').reset();
        
        // Hide loading indicator
        paymentForm.querySelector('input[type="submit"]').disabled = false;
        
        // Close modal
        paymentModal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Show success message
        showNotification(`₹${amount.toLocaleString()} deposited successfully!`, 'success');
        updateBalance();
        
        // Update balance display with animation
        balanceDisplay.classList.add('animate__animated', 'animate__bounce');
        setTimeout(() => {
            balanceDisplay.classList.remove('animate__animated', 'animate__bounce');
        }, 1000);
    } catch (error) {
        console.error('Deposit error:', error);
        showNotification('Error processing deposit', 'error');
        
        // Reset loading state on error
        paymentForm.querySelector('input[type="submit"]').disabled = false;
    }
}

/**
 * Shows the change password modal
 */
function showChangePasswordModal() {
    document.getElementById('change-password-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Hides the change password modal
 */
function hideChangePasswordModal() {
    document.getElementById('change-password-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

/**
 * [FIXED] Handles change password form submission
 */
async function handleChangePassword(e) { // Make it async
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword = document.getElementById('change-new-password').value.trim();
    const confirmNewPassword = document.getElementById('change-confirm-new-password').value.trim();

    if (!currentUser) {
        showNotification('Please login to change password', 'error');
        return;
    }

    // Verify current password
    if (currentUser.password !== currentPassword) {
        showNotification('Current password is incorrect', 'error');
        return;
    }

    if (newPassword === currentPassword) {
        showNotification('New password must be different from current password', 'error');
        return;
    }

    // Validate new password
    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }

    if (!/[a-zA-Z]/.test(newPassword)) {
        showNotification('Password must contain at least one letter', 'error');
        return;
    }

    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
        showNotification('Password must contain at least one symbol', 'error');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    try {
        // [FIX] Call the API to update the password in the database
        await api.updateUserPassword(currentUser.username, newPassword);

        // Update local state *after* successful API call
        currentUser.password = newPassword;
        const userIndex = users.findIndex(user => user.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
        }

        // Reset form and close modal
        e.target.reset();
        hideChangePasswordModal();
        
        showNotification('Password changed successfully!', 'success');
    
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Error changing password. Please try again.', 'error');
    }
}


/**
 * Shows detailed view of an auction
 */
function showAuctionDetails(auctionId) {
    currentAuctionDetailId = auctionId; 
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) {
        showNotification('Auction not found', 'error');
        return;
    }

    const now = Date.now();
    const timeLeft = auction.sold || auction.unsold ? 'Auction ended' :
        `Time left: <span class='time-left' data-id='${auction.id}'>${formatTimeLeft(auction.endTime - now)}</span>`;

    // Build gallery HTML
    let galleryHTML = '';
    if (auction.images && auction.images.length > 0) {
        const images = auction.images.map(img => {
            if (img.startsWith('data:') || img.startsWith('http')) {
                return img;
            } else {
                return img.startsWith('/') ? img : `images/${img}`;
            }
        });
        
        galleryHTML = `
            <div class="auction-gallery">
                <div class="gallery-main-container">
                    <img src="${images[0]}" class="gallery-main-image" 
                        data-auction-id="${auction.id}" data-index="0" alt="${auction.name}">
                </div>
                ${images.length > 1 ? `
                    <div class="gallery-thumbnails">
                        ${images.map((img, index) => `
                            <img src="${img}" class="gallery-thumbnail ${index === 0 ? 'active' : ''}" 
                                data-index="${index}" data-auction-id="${auction.id}" alt="Thumbnail ${index + 1}">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Build bid form if auction is active
    let bidFormHTML = '';
    if (!auction.sold && !auction.unsold) {
        const isCreator = currentUser && auction.creator === currentUser.username;
        const isHighestBidder = currentUser && auction.highestBidder === currentUser.username;
        const minBid = auction.currentBid + 1;
        const effectiveBidLimit = isHighestBidder ? currentUser.balance + auction.currentBid : currentUser.balance;
        const canBid = currentUser && !isCreator && effectiveBidLimit >= minBid;

        bidFormHTML = `
            <div class="bid-section">
                <h3>Place Your Bid</h3>
                <form class="bid-form" data-id="${auction.id}">
                    <div class="form-group">
                        <label for="bid-amount-${auction.id}">Your Bid (Minimum ₹${minBid.toLocaleString()})</label>
                        <input type="number" id="bid-amount-${auction.id}" min="${minBid}" 
                            placeholder="Enter ₹${minBid.toLocaleString()} or more" required>
                    </div>
                    <button type="submit" ${!canBid ? 'disabled' : ''} class="btn btn-gradient bid-button">
                        <i class="fas fa-gavel"></i> Place Bid
                    </button>
                    ${!currentUser ? '<p class="error-message"><i class="fas fa-exclamation-circle"></i> Please login to bid</p>' : 
                    isCreator ? '<p class="error-message"><i class="fas fa-exclamation-circle"></i> You cannot bid on your own auction</p>' :
                    !canBid ? '<p class="error-message"><i class="fas fa-exclamation-circle"></i> Insufficient funds</p>' : ''}
                </form>
            </div>
        `;
    }

    // Build auction status
    let statusHTML = '';
    if (auction.sold) {
        statusHTML = `
            <div class="auction-status sold">
                <i class="fas fa-check-circle"></i>
                <h3>This item has been sold</h3>
                ${auction.highestBidder === currentUser?.username ? 
                    '<p>Congratulations! You won this auction for ₹' + auction.currentBid.toLocaleString() + '</p>' : 
                    '<p>Sold for ₹' + auction.currentBid.toLocaleString() + ' to ' + (auction.highestBidder || 'an unknown bidder') + '</p>'}
            </div>
        `;
    } else if (auction.unsold) {
        statusHTML = `
            <div class="auction-status unsold">
                <i class="fas fa-times-circle"></i>
                <h3>This auction ended without a sale</h3>
                <p>No bids were placed on this item.</p>
            </div>
        `;
    }

    auctionDetailContainer.innerHTML = `
        <div class="auction-detail-header">
            <div class="auction-category">${auction.category.toUpperCase()}</div>
            <h2>${auction.name}</h2>
            <p class="auction-time">${timeLeft}</p>
        </div>
        
        <div class="auction-detail-content">
            <div class="auction-detail-left">
                ${galleryHTML}
                
                <div class="auction-description">
                    <h3>Description</h3>
                    <p>${auction.description}</p>
                </div>
            </div>
            
            <div class="auction-detail-right">
                <div class="auction-bid-info">
                    <div class="current-bid">
                        <span>Current Bid:</span>
                        <span class="bid-amount">₹ ${auction.currentBid.toLocaleString()}</span>
                    </div>
                    ${auction.highestBidder ? `
                        <div class="highest-bidder">
                            <span>Highest Bidder:</span>
                            <span>${auction.highestBidder}</span>
                        </div>
                    ` : ''}
                    <div class="auction-creator-info">
                        <span>Seller:</span>
                        <span>${auction.creator}</span>
                    </div>
                </div>
                
                ${statusHTML || bidFormHTML}
            </div>
        </div>
    `;

    // Set up gallery interactions
    setupGalleryInteractions();

    // Add event listener for bid form
    const bidForm = auctionDetailContainer.querySelector('.bid-form');
    if (bidForm) {
        bidForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const bidAmount = parseInt(this.querySelector('input').value);
            if (!isNaN(bidAmount)) {
                placeBid(auction.id, bidAmount);
            } else {
                showNotification('Please enter a valid bid amount', 'error');
            }
        });
    }

    showSection(auctionDetailSection);
}

/**
 * Handles contact form submission
 */
function handleContactForm(e) {
    e.preventDefault();
    // This is a demo form, no email is actually sent.
    showNotification('Your message has been sent! We will get back to you soon.', 'success');
    e.target.reset();
    hideContactModal();
}

/**
 * Shows the login modal
 */
function showLoginModal() {
    authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    showLoginTab();
}

/**
 * Shows the register modal
 */
function showRegisterModal() {
    authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    showRegisterTab();
}

/**
 * Hides the auth modal
 */
function hideAuthModal() {
    authModal.classList.add('hidden');
    document.body.style.overflow = '';
}

/**
 * Shows the login tab in auth modal
 */
function showLoginTab(e) {
    if (e) e.preventDefault();
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginFormContainer.classList.remove('hidden');
    registerFormContainer.classList.add('hidden');
}

/**
 * Shows the register tab in auth modal
 */
function showRegisterTab(e) {
    if (e) e.preventDefault();
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerFormContainer.classList.remove('hidden');
    loginFormContainer.classList.add('hidden');
}

/**
 * Updates the header based on login state
 */
function updateHeader() {
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    
    if (currentUser) {
        authButtons.classList.add('hidden');
        userInfo.classList.remove('hidden');
        usernameDisplay.textContent = currentUser.username;
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('member-since').textContent = currentUser.joinDate ? new Date(currentUser.joinDate).toLocaleDateString() : new Date().toLocaleDateString();
    } else {
        authButtons.classList.remove('hidden');
        userInfo.classList.add('hidden');
        usernameDisplay.textContent = '';
    }
}

/**
 * Handles login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        users = await api.getUsers();
        const user = users.find(user => user.username === username && user.password === password);
        
        if (user) {
            currentUser = { ...user };
            
            hideAuthModal();
            updateHeader();
            updateBalance();
            homeContent.classList.add('hidden');
            mainApp.classList.remove('hidden');
            heroSection.style.display = 'none';
            
            await reloadAllData();
            showSection(liveSection);
            renderCategoryTabs();
            
            e.target.reset();
            showNotification(`Welcome back, ${username}!`, 'success');
        } else {
            document.getElementById('login-form').classList.add('animate__animated', 'animate__shakeX');
            setTimeout(() => {
                document.getElementById('login-form').classList.remove('animate__animated', 'animate__shakeX');
            }, 1000);
            showNotification('Invalid username or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Error during login. Please try again.', 'error');
    }
}

/**
 * Reloads all data for the current user
 */
async function reloadAllData() {
    try {
        const [auctionsData, historyData] = await Promise.all([
            api.getAuctions(),
            api.getHistory()
        ]);
        
        auctions = auctionsData;
        history = historyData;
        
        console.log('Data reloaded for user:', currentUser?.username);
    } catch (error) {
        console.error('Error reloading data:', error);
        throw error;
    }
}

/**
 * Checks if a username is available during registration
 */
function checkUsernameAvailability() {
    const username = this.value.trim();
    if (users.some(user => user.username === username)) {
        usernameError.textContent = 'Username already exists';
        usernameError.classList.remove('hidden');
    } else {
        usernameError.classList.add('hidden');
    }
}

/**
 * Handles registration form submission
 */
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    try {
        if (users.some(user => user.username === username)) {
            usernameError.textContent = 'Username already exists';
            usernameError.classList.remove('hidden');
            return;
        }

        if (!phone || !/^\d{10}$/.test(phone)) {
            showNotification('Please enter a valid 10-digit phone number', 'error');
            return;
        }
        
        if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
            showNotification('Password must be at least 8 characters and include a letter and a symbol.', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        await api.createUser({ username, password, fullName, email, phone });
        
        users = await api.getUsers();
        const newUser = users.find(user => user.username === username);
        
        if (!newUser) throw new Error('Failed to create user');
        
        currentUser = { ...newUser };
        
        document.getElementById('register-form').classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            document.getElementById('register-form').classList.remove('animate__animated', 'animate__fadeOut');
            showNotification(`Account created for ${username}. You've been automatically logged in.`, 'success');
            
            hideAuthModal();
            updateHeader();
            updateBalance();
            homeContent.classList.add('hidden');
            mainApp.classList.remove('hidden');
            heroSection.style.display = 'none';
            
            reloadAllData().then(() => {
                showSection(liveSection);
                renderCategoryTabs();
            });
            
            e.target.reset();
        }, 500);
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Error creating account. Please try again.', 'error');
    }
}

/**
 * [FIXED] Handles logout and completely resets the application state.
 */
async function handleLogout() {
    mainApp.classList.add('animate__animated', 'animate__fadeOut');
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for animation

    mainApp.classList.remove('animate__animated', 'animate__fadeOut');

    // --- CRITICAL STATE RESET ---
    // This prevents data from one user leaking into the next user's session.
    currentUser = null;
    currentAuctionDetailId = null;
    users = [];
    auctions = [];
    history = [];
    // ---------------------------

    updateHeader();
    showHomePage(); // Show the logged-out view

    // Re-fetch initial data for the public-facing home page.
    await loadInitialData();
    renderHomeAuctions();

    showNotification('You have been logged out successfully', 'info');
}


/**
 * Handles image upload and preview
 */
function handleImageUpload(e) {
    const files = e.target.files;
    imagePreviewContainer.innerHTML = '';
    imageError.style.display = 'none';
    
    if (files.length < 2 || files.length > 5) {
        imageError.style.display = 'block';
        imageError.textContent = 'Please upload between 2 and 5 images';
        return;
    }
    
    Array.from(files).forEach((file, index) => {
        if (!file.type.startsWith('image/')) {
            imageError.style.display = 'block';
            imageError.textContent = 'Please upload only image files';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'image-preview-container';
            
            const preview = document.createElement('img');
            preview.src = event.target.result;
            preview.className = 'auction-image-preview';
            preview.alt = `Preview ${index + 1}`;
            
            previewContainer.appendChild(preview);
            imagePreviewContainer.appendChild(previewContainer);
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Handles create auction form submission
 */
async function handleCreateAuction(e) {
    e.preventDefault();
    const name = document.getElementById('item-name').value;
    const desc = document.getElementById('item-description').value;
    const price = parseInt(document.getElementById('start-price').value) || 1;
    const days = parseInt(document.getElementById('duration-days').value) || 0;
    const hours = parseInt(document.getElementById('duration-hours').value) || 0;
    const minutes = parseInt(document.getElementById('duration-minutes').value) || 30;
    const category = document.getElementById('item-category').value;
    const imageInput = document.getElementById('item-images');
    
    if (!name || !desc || !category || price <= 0) {
        showNotification('Please fill in all required fields with valid values', 'error');
        return;
    }
    
    const totalMinutes = (days * 24 * 60) + (hours * 60) + minutes;
    if (totalMinutes <= 0) {
        showNotification('Please enter a valid duration (at least 1 minute)', 'error');
        return;
    }
    
    try {
        let images = [];
        if (imageInput.files && imageInput.files.length > 0) {
            const imagePromises = Array.from(imageInput.files).map(file => 
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = err => reject(err);
                    reader.readAsDataURL(file);
                })
            );
            images = await Promise.all(imagePromises);
        }
        
        await createAuctionWithImages(name, desc, price, totalMinutes, category, images);
        
    } catch (error) {
        console.error('Error creating auction:', error);
        showNotification('Error creating auction: ' + error.message, 'error');
    }
}

/**
 * Creates a new auction with uploaded images
 */
async function createAuctionWithImages(name, desc, price, duration, category, images) {
    try {
        const auctionData = {
            name,
            description: desc,
            currentBid: price,
            endTime: Date.now() + duration * 60000,
            category,
            creator: currentUser.username,
            images
        };
        
        await api.createAuction(auctionData);
        auctions = await api.getAuctions();
        
        document.getElementById('create-auction-form').reset();
        imagePreviewContainer.innerHTML = '';
        showSection(liveSection);
        
        showNotification('Auction created successfully!', 'success');
    } catch (error) {
        console.error('Error in createAuctionWithImages:', error);
        showNotification('Error submitting auction: ' + error.message, 'error');
    }
}

/**
 * Handles deposit form submission
 */
function handleDeposit(e) {
    e.preventDefault();
    const amount = parseInt(document.getElementById('deposit-amount').value);
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    paymentModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    paymentModal.querySelector('h2').textContent = `Deposit ₹${amount.toLocaleString()}`;
    paymentMethodSelect.value = '';
    showPaymentFields();
}

/**
 * Shows a specific section and hides others
 */
function showSection(section) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    section.classList.add('active');
    
    document.querySelectorAll('#main-nav a').forEach(link => link.classList.remove('active'));
    
    if (section === liveSection) {
        document.getElementById('nav-live').classList.add('active');
        if (!document.querySelector('.category-tabs')) {
            renderCategoryTabs();
        }
        renderAuctions();
    } else if (section === createSection) {
        document.getElementById('nav-create').classList.add('active');
    } else if (section === depositSection) {
        document.getElementById('nav-deposit').classList.add('active');
    } else if (section === historySection) {
        document.getElementById('nav-history').classList.add('active');
        renderHistory();
    } else if (section === profileSection) {
        document.getElementById('nav-profile').classList.add('active');
        renderProfile();
    }
}

/**
 * Updates the user balance display
 */
function updateBalance() {
    if (currentUser) {
        balanceDisplay.textContent = currentUser.balance.toLocaleString();
        document.getElementById('user-balance-profile-stat').textContent = `₹ ${currentUser.balance.toLocaleString()}`;
    }
}

/**
 * Checks auction statuses and updates if needed.
 */
async function checkAuctionStatus() {
    const now = Date.now();
    let needsUpdate = false;
    const endedAuctions = auctions.filter(a => !a.sold && !a.unsold && a.endTime <= now);

    if (endedAuctions.length === 0) {
        return false;
    }

    console.log(`Found ${endedAuctions.length} ended auctions to process.`);
    try {
        await Promise.all(endedAuctions.map(async (auction) => {
            const creator = users.find(user => user.username === auction.creator);

            if (auction.highestBidder) {
                auction.sold = true;
                if (creator) {
                    await api.updateUserBalance(creator.username, creator.balance + auction.currentBid);
                    await api.updateUserStats(creator.username, { auctionsSold: (creator.auctionsSold || 0) + 1 });
                }
                // [FIX 1] Preserve currentBid and highestBidder when updating status
                await api.updateAuction(auction.id, { 
                    currentBid: auction.currentBid, 
                    highestBidder: auction.highestBidder, 
                    sold: true, 
                    unsold: false 
                });
                await api.addHistory({
                    type: 'sale', itemId: auction.id, itemName: auction.name, amount: auction.currentBid,
                    username: auction.highestBidder, creator: auction.creator
                });
                console.log(`Auction ${auction.id} processed as SOLD.`);
            } else {
                auction.unsold = true;
                if (creator) {
                    await api.updateUserStats(creator.username, { auctionsUnsold: (creator.auctionsUnsold || 0) + 1 });
                }
                // [FIX 1] Preserve currentBid and highestBidder when updating status
                await api.updateAuction(auction.id, { 
                    currentBid: auction.currentBid, 
                    highestBidder: auction.highestBidder, 
                    sold: false, 
                    unsold: true 
                });
                console.log(`Auction ${auction.id} processed as UNSOLD.`);
            }
        }));
        needsUpdate = true;
    } catch (error) {
        console.error('Error processing ended auctions:', error);
        showNotification('An error occurred while updating auction statuses.', 'error');
    }

    if (needsUpdate) {
        console.log('Reloading all data after processing auction status updates.');
        try {
            const [usersData, auctionsData, historyData] = await Promise.all([api.getUsers(), api.getAuctions(), api.getHistory()]);
            users = usersData;
            auctions = auctionsData;
            history = historyData;
            if (currentUser) {
                const updatedCurrentUser = users.find(u => u.id === currentUser.id);
                if (updatedCurrentUser) currentUser = { ...updatedCurrentUser };
            }
        } catch (error) {
            console.error('Failed to reload data after auction status update:', error);
        }
    }
    return needsUpdate;
}


/**
 * Renders category tabs for filtering auctions
 */
function renderCategoryTabs() {
    const categories = ['all', 'electronics', 'collectibles', 'antiques', 'art', 'fashion'];
    const categoryNames = { 'all': 'All Items', 'electronics': 'Electronics', 'collectibles': 'Collectibles', 'antiques': 'Antiques', 'art': 'Art', 'fashion': 'Fashion' };
    
    const existingTabs = document.querySelector('.category-tabs');
    if (existingTabs) existingTabs.remove();
    
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'category-tabs';
    
    categories.forEach(category => {
        const tab = document.createElement('button');
        tab.className = `category-tab ${category === 'all' ? 'active' : ''}`;
        tab.textContent = categoryNames[category];
        tab.dataset.category = category;
        tab.addEventListener('click', () => filterAuctionsByCategory(category));
        tabsContainer.appendChild(tab);
    });
    
    auctionsList?.parentNode.insertBefore(tabsContainer, auctionsList);
}

/**
 * Filters auctions by category
 */
function filterAuctionsByCategory(category) {
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    renderAuctions(category);
}

/**
 * [FIXED] Renders the list of ALL auctions (live and finished).
 */
function renderAuctions(category = 'all') {
    if (!auctionsList) return;
    const now = Date.now();
    
    auctionsList.innerHTML = '';
    
    // [FIX 2] Filter by the selected category from all auctions, not just live ones
    const filteredAuctions = category === 'all' 
        ? auctions
        : auctions.filter(auction => auction.category === category);
    
    if (filteredAuctions.length === 0) {
        auctionsList.innerHTML = `<div class="no-auctions"><p>No auctions found in this category.</p></div>`;
        return;
    }
    
    filteredAuctions.forEach(auction => {
        const auctionEl = document.createElement('div');
        auctionEl.className = `auction-item`;
        
        // [FIX 2] Check auction status to display correct time/message
        const timeLeft = auction.sold || auction.unsold
            ? 'Auction ended'
            : `Time left: <span class='time-left' data-id='${auction.id}'>${formatTimeLeft(auction.endTime - now)}</span>`;

        // [FIX 2] Add a status badge if the auction is finished
        let statusBadge = '';
        if (auction.sold) {
            statusBadge = '<span class="sold-out-badge">Sold</span>';
        } else if (auction.unsold) {
            statusBadge = '<span class="unsold-badge">Ended</span>';
        }
        
        let galleryHTML = '';
        if (auction.images && auction.images.length > 0) {
            const firstImage = auction.images[0];
            const imageSrc = firstImage.startsWith('data:') || firstImage.startsWith('http') 
                ? firstImage : `images/${firstImage}`;
            galleryHTML = `<div class="gallery-container"><img src="${imageSrc}" class="gallery-main-image" data-auction-id="${auction.id}" data-index="0" alt="${auction.name}"></div>`;
        }
        
        auctionEl.innerHTML = `
            ${galleryHTML}
            <div class="auction-content">
                <h3>${auction.name} ${statusBadge}</h3>
                <p>${auction.description.substring(0, 100)}...</p>
                <p><i class="far fa-clock"></i> ${timeLeft}</p>
                <p>Current bid: <strong>₹ ${auction.currentBid.toLocaleString()}</strong></p>
                <button class="btn btn-secondary view-details-btn" data-id="${auction.id}">View Details</button>
            </div>
        `;
        auctionsList.appendChild(auctionEl);
    });
}


/**
 * Sets up gallery interactions for all auction images
 */
function setupGalleryInteractions() {
    document.querySelectorAll('.gallery-main-image').forEach(img => {
        img.removeEventListener('mouseenter', handleGalleryMouseEnter);
        img.removeEventListener('mouseleave', handleGalleryMouseLeave);
        img.removeEventListener('click', handleGalleryClick);
        
        img.addEventListener('mouseenter', handleGalleryMouseEnter);
        img.addEventListener('mouseleave', handleGalleryMouseLeave);
        img.addEventListener('click', handleGalleryClick);
    });

    document.querySelectorAll('.gallery-thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            const auctionId = parseInt(this.dataset.auctionId);
            const index = parseInt(this.dataset.index);
            
            const auction = auctions.find(a => a.id === auctionId);
            if (auction && auction.images[index]) {
                const imageSrc = auction.images[index].startsWith('data:') || auction.images[index].startsWith('http') 
                    ? auction.images[index] : `images/${auction.images[index]}`;
                    
                const mainImage = this.closest('.auction-gallery').querySelector('.gallery-main-image');
                mainImage.src = imageSrc;
                mainImage.dataset.index = index;
                
                this.closest('.gallery-thumbnails').querySelectorAll('.gallery-thumbnail').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

/**
 * Opens fullscreen gallery view
 */
function openFullscreenGallery(auctionId, startIndex = 0) {
    const existingOverlay = document.querySelector('.fullscreen-overlay');
    if (existingOverlay) existingOverlay.remove();
    document.removeEventListener('keydown', handleFullscreenKeydown);

    const auction = auctions.find(a => a.id === auctionId);
    if (!auction?.images?.length) return;

    currentFullscreenIndex = Math.max(0, Math.min(startIndex, auction.images.length - 1));
    currentFullscreenAuctionId = auctionId;

    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    
    const imageSrc = auction.images[currentFullscreenIndex].startsWith('data:') || auction.images[currentFullscreenIndex].startsWith('http') 
        ? auction.images[currentFullscreenIndex] : `images/${auction.images[currentFullscreenIndex]}`;
    
    overlay.innerHTML = `
        <img class="fullscreen-image" src="${imageSrc}" alt="${auction.name}">
        <button class="fullscreen-close" aria-label="Close gallery">&times;</button>
        ${auction.images.length > 1 ? `
            <button class="fullscreen-nav fullscreen-prev" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>
            <button class="fullscreen-nav fullscreen-next" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>
            <div class="fullscreen-counter">${currentFullscreenIndex + 1}/${auction.images.length}</div>
        ` : ''}
    `;

    overlay.querySelector('.fullscreen-close').addEventListener('click', closeFullscreenGallery);
    if (auction.images.length > 1) {
        overlay.querySelector('.fullscreen-prev').addEventListener('click', () => navigateFullscreen(-1));
        overlay.querySelector('.fullscreen-next').addEventListener('click', () => navigateFullscreen(1));
    }
    overlay.addEventListener('click', (e) => e.target === overlay && closeFullscreenGallery());

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleFullscreenKeydown);

    setTimeout(() => overlay.classList.add('active'), 10);
}

/**
 * Closes fullscreen gallery
 */
function closeFullscreenGallery() {
    const overlay = document.querySelector('.fullscreen-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleFullscreenKeydown);
        }, 300);
    }
}

/**
 * Handles mouse enter on gallery images
 */
function handleGalleryMouseEnter() {
    clearInterval(window.autoRotateInterval);
}

/**
 * Handles mouse leave on gallery images
 */
function handleGalleryMouseLeave() {
    startAutoImageRotation();
}

/**
 * Navigates between images in fullscreen gallery
 */
function navigateFullscreen(direction) {
    const overlay = document.querySelector('.fullscreen-overlay.active');
    if (!overlay) return;

    const auction = auctions.find(a => a.id === currentFullscreenAuctionId);
    if (!auction?.images) return;

    const imagesCount = auction.images.length;
    currentFullscreenIndex = (currentFullscreenIndex + direction + imagesCount) % imagesCount;
    
    const img = overlay.querySelector('.fullscreen-image');
    const counter = overlay.querySelector('.fullscreen-counter');
    const imageSrc = auction.images[currentFullscreenIndex].startsWith('data:') || auction.images[currentFullscreenIndex].startsWith('http')
        ? auction.images[currentFullscreenIndex] : `images/${auction.images[currentFullscreenIndex]}`;

    img.style.opacity = 0;
    setTimeout(() => {
        img.src = imageSrc;
        img.style.opacity = 1;
        if (counter) counter.textContent = `${currentFullscreenIndex + 1}/${auction.images.length}`;
    }, 200);
}

/**
 * Places a bid on an auction
 */
async function placeBid(auctionId, amount) {
    if (!currentUser) return showNotification('Please login to place a bid', 'error');

    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return showNotification('Auction not found', 'error');
    if (auction.sold || auction.unsold) return showNotification('This auction has ended', 'error');
    if (auction.creator === currentUser.username) return showNotification("You can't bid on your own auction", 'error');
    if (amount <= auction.currentBid) return showNotification(`Bid must be higher than ₹${auction.currentBid.toLocaleString()}`, 'error');

    try {
        const isSameBidder = auction.highestBidder === currentUser.username;
        const paymentRequired = isSameBidder ? amount - auction.currentBid : amount;

        if (currentUser.balance < paymentRequired) {
            return showNotification(`Insufficient funds. You need ₹${paymentRequired.toLocaleString()} to place this bid.`, 'error');
        }

        if (!isSameBidder && auction.highestBidder) {
            const prevBidder = users.find(u => u.username === auction.highestBidder);
            if (prevBidder) {
                await api.updateUserBalance(prevBidder.username, prevBidder.balance + auction.currentBid);
                await api.addHistory({ type: 'refund', itemId: auction.id, itemName: auction.name, amount: auction.currentBid, username: prevBidder.username });
            }
        }

        await api.updateUserBalance(currentUser.username, currentUser.balance - paymentRequired);
        await api.updateAuction(auctionId, { currentBid: amount, highestBidder: currentUser.username });
        await api.updateUserStats(currentUser.username, { totalBids: (currentUser.totalBids || 0) + 1 });
        await api.addHistory({
            type: 'bid', itemId: auction.id, itemName: auction.name, amount, username: currentUser.username,
            creator: auction.creator, isBidIncrease: isSameBidder, previousBid: isSameBidder ? auction.currentBid : 0
        });

        const [usersData, auctionsData, historyData] = await Promise.all([api.getUsers(), api.getAuctions(), api.getHistory()]);
        users = usersData;
        auctions = auctionsData;
        history = historyData;
        currentUser = users.find(u => u.id === currentUser.id);

        updateBalance();
        showAuctionDetails(auctionId);
        showNotification('Bid placed successfully!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
        console.error('Bid placement error:', error);
    }
}

/**
 * Renders user history
 */
function renderHistory() {
    if (!currentUser || !historyList) return;
    
    const userHistory = history.filter(item => item.username === currentUser.username || item.creator === currentUser.username);

    if (userHistory.length === 0) {
        historyList.innerHTML = `<div class="no-history"><p>No history yet.</p></div>`;
        return;
    }
    
    userHistory.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    historyList.innerHTML = userHistory.map(item => {
        let description = '';
        if (item.type === 'bid' && item.username === currentUser.username) {
            description = `You placed a bid on <strong>${item.itemName}</strong>.`;
        } else if (item.type === 'sale') {
            description = item.creator === currentUser.username
                ? `You sold <strong>${item.itemName}</strong> to ${item.username}.`
                : `You won <strong>${item.itemName}</strong> from ${item.creator}.`;
        } else if (item.type === 'refund' && item.username === currentUser.username) {
            description = `Your bid on <strong>${item.itemName}</strong> was outbid and refunded.`;
        } else if (item.type === 'deposit' && item.username === currentUser.username) {
            description = `You deposited money into your account.`;
        } else {
            return ''; // Don't show history items not relevant to the user
        }
        
        return `
            <div class="history-item">
                <p>${description}</p>
                <small>${new Date(item.time).toLocaleString()}</small>
                <p>Amount: <strong>₹ ${item.amount.toLocaleString()}</strong></p>
            </div>
        `;
    }).join('');
}


/**
 * Renders auctions for the home page
 */
function renderHomeAuctions() {
    if (!homeAuctionsList) return;
    const now = Date.now();
    homeAuctionsList.innerHTML = '';
    
    const activeAuctions = auctions.filter(a => !a.sold && !a.unsold).slice(0, 3);
    
    if (activeAuctions.length === 0) {
        homeAuctionsList.innerHTML = '<p class="no-auctions">No live auctions at the moment.</p>';
        return;
    }
    
    activeAuctions.forEach(auction => {
        const auctionEl = document.createElement('div');
        auctionEl.className = 'auction-item';
        const timeLeft = `Time left: <span class='time-left' data-id='${auction.id}'>${formatTimeLeft(auction.endTime - now)}</span>`;
        
        let galleryHTML = '';
        if (auction.images && auction.images.length > 0) {
            const imageSrc = auction.images[0].startsWith('data:') || auction.images[0].startsWith('http') 
                ? auction.images[0] : `images/${auction.images[0]}`;
            galleryHTML = `<div class="gallery-container"><img src="${imageSrc}" class="gallery-main-image" data-auction-id="${auction.id}" data-index="0" alt="${auction.name}"></div>`;
        }
        
        auctionEl.innerHTML = `
            ${galleryHTML}
            <div class="auction-content">
                <h3>${auction.name}</h3>
                <p>${timeLeft} | Bid: ₹ ${auction.currentBid.toLocaleString()}</p>
                <button class="bid-button-home btn btn-gradient" data-id="${auction.id}">View & Bid</button>
            </div>
        `;
        homeAuctionsList.appendChild(auctionEl);
    });
}

/**
 * Sets up theme toggle functionality
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    });
}

/**
 * Renders user profile
 */
async function renderProfile() {
    if (!currentUser) return;
    
    try {
        // Always get fresh stats from the API when rendering the profile
        const userStats = await api.getUserStats(currentUser.username);
        
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-full-name').textContent = currentUser.fullName || 'N/A';
        document.getElementById('profile-email').textContent = currentUser.email || 'N/A';
        document.getElementById('profile-phone').textContent = currentUser.phone || 'N/A';
        document.getElementById('member-since').textContent = new Date(currentUser.joinDate).toLocaleDateString();
        
        document.getElementById('user-balance-profile-stat').textContent = `₹ ${currentUser.balance.toLocaleString()}`;
        document.getElementById('total-bids').textContent = userStats.totalBids || 0;
        document.getElementById('auctions-created').textContent = userStats.auctionsCreated || 0;
        document.getElementById('auctions-won').textContent = userStats.auctionsWon || 0;
        document.getElementById('auctions-sold').textContent = userStats.auctionsSold || 0;
        document.getElementById('auctions-unsold').textContent = userStats.auctionsUnsold || 0;
        
    } catch (error) {
        console.error('Error fetching user stats:', error);
        showNotification('Error loading profile statistics', 'error');
    }
}

function showEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (!currentUser || !modal) return;
    document.getElementById('edit-full-name').value = currentUser.fullName || '';
    document.getElementById('edit-email').value = currentUser.email || '';
    document.getElementById('edit-phone').value = currentUser.phone || '';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * [FIXED] Handles profile edit submission
 */
async function handleEditProfile(e) {
    e.preventDefault();
    if (!currentUser) return;

    // 1. Get the new values from the form
    const newFullName = document.getElementById('edit-full-name').value;
    const newEmail = document.getElementById('edit-email').value;
    const newPhone = document.getElementById('edit-phone').value;

    const profileData = {
        fullName: newFullName,
        email: newEmail,
        phone: newPhone
    };

    try {
        // 2. Call the new API to save changes to the database
        await api.updateUserProfile(currentUser.username, profileData);

        // 3. *After* success, update the local currentUser object
        currentUser.fullName = newFullName;
        currentUser.email = newEmail;
        currentUser.phone = newPhone;

        // 4. Update the UI
        hideEditProfileModal();
        renderProfile(); // This will now show the new (and saved) data
        showNotification('Profile updated successfully!', 'success');
    
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile. Please try again.', 'error');
    }
}


function hideEditProfileModal() {
    document.getElementById('edit-profile-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function showAboutModal() { document.getElementById('about-modal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function showTermsModal() { document.getElementById('terms-modal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function showPrivacyModal() { document.getElementById('privacy-modal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function showHelpModal() { document.getElementById('help-modal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function showContactModal() { document.getElementById('contact-modal').classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
function hideContactModal() { document.getElementById('contact-modal').classList.add('hidden'); document.body.style.overflow = ''; }

function handleGalleryClick(e) {
    e.stopPropagation();
    const auctionId = parseInt(this.dataset.auctionId);
    const currentIndex = parseInt(this.dataset.index || 0);
    openFullscreenGallery(auctionId, currentIndex);
}

function handleFullscreenKeydown(e) {
    const overlay = document.querySelector('.fullscreen-overlay.active');
    if (!overlay) return;
    if (e.key === 'ArrowLeft') navigateFullscreen(-1);
    if (e.key === 'ArrowRight') navigateFullscreen(1);
    if (e.key === 'Escape') closeFullscreenGallery();
}

function formatTimeLeft(ms) {
    if (ms <= 0) return 'Ended';
    const totalSeconds = Math.floor(ms / 1000);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate__animated animate__fadeInUp`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.replace('animate__fadeInUp', 'animate__fadeOutDown');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function startAutoImageRotation() {
    clearInterval(window.autoRotateInterval);
    window.autoRotateInterval = setInterval(rotateAllAuctionImages, 3000);
}

function rotateAllAuctionImages() {
    document.querySelectorAll('.gallery-main-image').forEach(img => {
        const auctionId = parseInt(img.dataset.auctionId);
        const auction = auctions.find(a => a.id === auctionId);
        if (!auction?.images || auction.images.length <= 1) return;

        const currentIndex = parseInt(img.dataset.index || 0);
        const nextIndex = (currentIndex + 1) % auction.images.length;
        
        img.style.opacity = '0';
        setTimeout(() => {
            const nextImage = auction.images[nextIndex];
            const imageSrc = nextImage.startsWith('data:') || nextImage.startsWith('http') 
                ? nextImage : `images/${nextImage}`;
            img.src = imageSrc;
            img.dataset.index = nextIndex;
            img.style.opacity = '1';
        }, 300);
    });
}

document.addEventListener('DOMContentLoaded', init);

// Main application loop for checking status and updating UI
setInterval(async () => {
    const needsUiUpdate = await checkAuctionStatus();

    if (needsUiUpdate) {
        console.log('UI update triggered by auction status change.');
        updateBalance();

        if (homeContent.classList.contains('active')) {
            renderHomeAuctions();
        }
        if (!mainApp.classList.contains('hidden')) {
             if (liveSection.classList.contains('active')) {
                const activeTab = document.querySelector('.category-tab.active');
                const category = activeTab ? activeTab.dataset.category : 'all';
                renderAuctions(category);
            }
            if (historySection.classList.contains('active')) renderHistory();
            if (profileSection.classList.contains('active')) renderProfile();
            if (auctionDetailSection.classList.contains('active') && typeof currentAuctionDetailId === 'number') {
                const bidInput = document.querySelector(`#bid-amount-${currentAuctionDetailId}`);
                const savedValue = bidInput ? bidInput.value : '';
                showAuctionDetails(currentAuctionDetailId);
                requestAnimationFrame(() => {
                    const newInput = document.querySelector(`#bid-amount-${currentAuctionDetailId}`);
                    if (newInput) newInput.value = savedValue;
                });
            }
        }
    }
}, 5000);

setInterval(() => {
    const now = Date.now();
    document.querySelectorAll('.time-left').forEach(el => {
        const id = parseInt(el.dataset.id);
        const auction = auctions.find(a => a.id === id);
        if (auction && !auction.sold && !auction.unsold) {
            const timeLeft = auction.endTime - now;
            el.textContent = formatTimeLeft(timeLeft);
        }
    });
}, 1000);