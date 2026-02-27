// auth-nav.js - Handle navigation based on login state
(function() {
    // Run on every page load
    document.addEventListener('DOMContentLoaded', function() {
        updateNavigation();
    });
    
    // Also run when storage changes (login/logout in another tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'token' || e.key === 'user') {
            updateNavigation();
        }
    });
    
    function updateNavigation() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const isLoggedIn = !!(token && user);
        
        console.log('AuthNav: User logged in?', isLoggedIn, user);
        
        // Update all navigation elements
        updateLoginLogoutButtons(isLoggedIn, user);
        updateShopLink(isLoggedIn, user);
        updateDashboardButton(isLoggedIn, user);
        updateHeroButtons(isLoggedIn);
        updateFeaturedProducts(isLoggedIn);
    }
    
    function updateLoginLogoutButtons(isLoggedIn, user) {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const registerBtn = document.getElementById('register-nav-btn');
        const dashboardBtn = document.getElementById('dashboard-btn');
        const shopNavBtn = document.getElementById('shop-nav-btn');
        
        if (isLoggedIn) {
            // Hide login/register, show logout/dashboard/shop
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-flex';
            if (dashboardBtn) dashboardBtn.style.display = 'inline-flex';
            if (shopNavBtn) shopNavBtn.style.display = 'inline-flex';
            
            // Update dashboard button text based on role
            if (dashboardBtn && user) {
                if (user.role === 'admin') {
                    dashboardBtn.innerHTML = '<i class="fas fa-cog"></i> Admin';
                } else if (user.role === 'staff') {
                    dashboardBtn.innerHTML = '<i class="fas fa-clock"></i> Staff';
                } else {
                    dashboardBtn.innerHTML = '<i class="fas fa-user"></i> My Account';
                }
            }
            
            // Update user name display if exists
            const userNameEl = document.getElementById('user-name-display');
            if (userNameEl && user) {
                userNameEl.textContent = user.name || 'User';
            }
        } else {
            // Show login/register, hide logout/dashboard/shop
            if (loginBtn) loginBtn.style.display = 'inline-flex';
            if (registerBtn) registerBtn.style.display = 'inline-flex';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (dashboardBtn) dashboardBtn.style.display = 'none';
            if (shopNavBtn) shopNavBtn.style.display = 'none';
        }
    }
    
    function updateShopLink(isLoggedIn, user) {
        const shopLink = document.getElementById('shop-nav-link');
        const shopItem = document.getElementById('shop-nav-item');
        
        if (!shopLink) return;
        
        if (isLoggedIn) {
            // Logged in users go directly to shop
            shopLink.href = 'shop.html';
            shopLink.onclick = null;
            if (shopItem) shopItem.style.display = 'list-item';
        } else {
            // Non-logged in users see a modal prompt
            shopLink.href = '#';
            shopLink.onclick = function(e) {
                e.preventDefault();
                showLoginPrompt();
            };
            if (shopItem) shopItem.style.display = 'list-item';
        }
    }
    
    function updateDashboardButton(isLoggedIn, user) {
        const dashboardBtn = document.getElementById('dashboard-btn');
        if (!dashboardBtn) return;
        
        if (isLoggedIn && user) {
            dashboardBtn.onclick = function() {
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else if (user.role === 'staff') {
                    window.location.href = 'staff.html';
                } else {
                    window.location.href = 'customer.html';
                }
            };
        }
    }
    
    function updateHeroButtons(isLoggedIn) {
        const heroJoinBtn = document.querySelector('.hero-buttons .btn-primary');
        if (heroJoinBtn) {
            if (isLoggedIn) {
                heroJoinBtn.innerHTML = '<i class="fas fa-shopping-bag"></i> Go to Shop';
                heroJoinBtn.onclick = function() {
                    window.location.href = 'shop.html';
                };
            } else {
                heroJoinBtn.innerHTML = '<i class="fas fa-user-plus"></i> Join Free Today';
                heroJoinBtn.onclick = function() {
                    document.getElementById('register-modal').classList.add('active');
                };
            }
        }
    }
    
    function updateFeaturedProducts(isLoggedIn) {
        const productButtons = document.querySelectorAll('#featured-products-list .btn-primary');
        productButtons.forEach(btn => {
            if (isLoggedIn) {
                btn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
                btn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Get product data from parent card
                    const card = btn.closest('.product-card');
                    const productName = card.querySelector('.product-name').textContent;
                    alert(`Added ${productName} to cart!`);
                };
            } else {
                btn.innerHTML = '<i class="fas fa-user-plus"></i> Join to Buy';
                btn.onclick = function() {
                    document.getElementById('register-modal').classList.add('active');
                };
            }
        });
    }
    
    function showLoginPrompt() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.add('active');
            // Add a message
            const modalContent = loginModal.querySelector('.modal-content');
            const existingMsg = modalContent.querySelector('.login-prompt-msg');
            if (!existingMsg) {
                const msg = document.createElement('div');
                msg.className = 'login-prompt-msg';
                msg.style.cssText = 'background: #E8B4C8; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;';
                msg.innerHTML = '👋 Please log in to access the shop!';
                modalContent.insertBefore(msg, modalContent.firstChild);
                
                // Remove after 3 seconds
                setTimeout(() => msg.remove(), 3000);
            }
        }
    }
})();