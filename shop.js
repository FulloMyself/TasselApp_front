// shop.js - Shopping page functionality

const API_URL = 'https://tasselapp-back.onrender.com';
let allProducts = [];

document.addEventListener('DOMContentLoaded', function () {
    console.log('Shop page loaded');

    // Check login status
    checkShopAuthStatus();

    // Load products
    loadAllProducts();

    // Setup event listeners
    setupShopFilters();

    // Initialize cart if not already initialized
    if (!window.tasselCart) {
        console.log('Initializing cart...');
        window.tasselCart = new TasselCart();
    }
});

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        console.log('Loading screen hidden');
    }
}

// Call it when page is ready
document.addEventListener('DOMContentLoaded', function () {
    // Hide loading screen immediately
    hideLoadingScreen();

    console.log('Shop page loaded');
    checkShopAuthStatus();
    loadAllProducts();
    setupShopFilters();

    if (!window.tasselCart) {
        console.log('Initializing cart...');
        window.tasselCart = new TasselCart();
    }
});

// Also hide on window load as backup
window.addEventListener('load', function () {
    hideLoadingScreen();
});

function checkShopAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');

    if (token && user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';
        if (dashboardBtn) {
            dashboardBtn.style.display = 'inline-flex';
            if (user.role === 'admin') {
                dashboardBtn.innerHTML = '<i class="fas fa-cog"></i> Admin';
                dashboardBtn.onclick = () => window.location.href = 'admin.html';
            } else if (user.role === 'staff') {
                dashboardBtn.innerHTML = '<i class="fas fa-clock"></i> Staff';
                dashboardBtn.onclick = () => window.location.href = 'staff.html';
            } else {
                dashboardBtn.innerHTML = '<i class="fas fa-user"></i> My Account';
                dashboardBtn.onclick = () => window.location.href = 'customer.html';
            }
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (dashboardBtn) dashboardBtn.style.display = 'none';
    }

    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
}

async function loadAllProducts() {
    try {
        const container = document.getElementById('products-list');
        const countEl = document.getElementById('products-count');

        if (!container) {
            console.error('Products container not found');
            return;
        }

        // Show loading state
        container.innerHTML = '<div class="loading-spinner" style="text-align: center; padding: 3rem;"><div class="spinner"></div><p>Loading products...</p></div>';

        const res = await fetch(`${API_URL}/api/products/public`);

        if (!res.ok) {
            throw new Error('Failed to load products');
        }

        const products = await res.json();
        allProducts = products;

        // Update count
        if (countEl) {
            countEl.textContent = `Showing ${products.length} products`;
        }

        // Render products
        renderProducts(products);

    } catch (err) {
        console.error('Failed to load products', err);
        const container = document.getElementById('products-list');
        if (container) {
            container.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 3rem;">
                    <h3>Failed to load products</h3>
                    <p>Please try again later or contact us.</p>
                    <button onclick="loadAllProducts()" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>
                </div>
            `;
        }
    }
}

function renderProducts(products) {
    const container = document.getElementById('products-list');
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = '<p class="no-products">No products found</p>';
        return;
    }

    container.innerHTML = '';

    products.forEach(product => {
        let imageUrl = product.image || './assets/images/product-default.jpg';

        // Ensure correct path format
        if (imageUrl && !imageUrl.startsWith('./') && !imageUrl.startsWith('http')) {
            if (imageUrl.startsWith('/')) {
                imageUrl = '.' + imageUrl;
            } else if (!imageUrl.includes('/assets/')) {
                imageUrl = './assets/images/products/' + imageUrl.split('/').pop();
            } else {
                imageUrl = './' + imageUrl;
            }
        }

        const onSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
        const displayPrice = onSale ? product.salePrice : product.price;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', product._id);
        card.setAttribute('data-category', product.category || 'other');

        card.innerHTML = `
            <div class="product-image">
                <img src="${imageUrl}" alt="${product.name}" 
                     onerror="this.onerror=null; this.src='./assets/images/product-default.jpg';">
                ${onSale ? '<div class="sale-badge">SALE</div>' : ''}
            </div>
            <div class="product-content">
                <h4 class="product-name">${product.name}</h4>
                <div class="product-price-container">
                    ${onSale ? `<span class="original-price">R${product.price.toFixed(2)}</span>` : ''}
                    <span class="product-price">R${displayPrice.toFixed(2)}</span>
                </div>
                <div class="product-category">${product.category || ''}</div>
                <button class="btn btn-sm btn-primary add-to-cart-btn" 
                        data-product='${JSON.stringify({
            id: product._id,
            name: product.name,
            price: product.price,
            salePrice: product.salePrice || 0,
            image: imageUrl,
            category: product.category || ''
        }).replace(/'/g, '&apos;')}'>
                    Add to Cart
                </button>
            </div>
        `;

        // Product click for details
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart-btn')) {
                showProductPopup(product);
            }
        });

        container.appendChild(card);
    });

    // Add cart button listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                const productData = JSON.parse(btn.dataset.product);
                if (window.tasselCart) {
                    window.tasselCart.addItem(productData);
                    showNotification('Added to cart!', 'success');
                } else {
                    console.error('Cart not initialized');
                    showNotification('Cart not available. Please refresh.', 'error');
                }
            } catch (err) {
                console.error('Error adding to cart:', err);
                showNotification('Failed to add to cart', 'error');
            }
        });
    });
}

function setupShopFilters() {
    // Category filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter products
            const category = this.dataset.category;
            filterProducts(category, searchInput?.value);
        });
    });

    // Search functionality
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const activeCategory = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
            filterProducts(activeCategory, searchInput.value);
        });

        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const activeCategory = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
                filterProducts(activeCategory, searchInput.value);
            }
        });
    }
}

function filterProducts(category, searchTerm = '') {
    let filtered = [...allProducts];

    // Filter by category
    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }

    // Filter by search term
    if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(term) ||
            (p.description && p.description.toLowerCase().includes(term))
        );
    }

    // Update count
    const countEl = document.getElementById('products-count');
    if (countEl) {
        countEl.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
    }

    renderProducts(filtered);
}

function showProductPopup(product) {
    // Remove existing popup
    const existingPopup = document.querySelector('.product-popup-overlay');
    if (existingPopup) existingPopup.remove();

    const onSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
    const displayPrice = onSale ? product.salePrice : product.price;

    let imageUrl = product.image || './assets/images/product-default.jpg';
    if (imageUrl && !imageUrl.startsWith('./') && !imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('/')) {
            imageUrl = '.' + imageUrl;
        } else {
            imageUrl = './' + imageUrl;
        }
    }

    const popup = document.createElement('div');
    popup.className = 'product-popup-overlay';
    popup.innerHTML = `
        <div class="product-popup">
            <button class="popup-close">&times;</button>
            <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null; this.src='./assets/images/product-default.jpg';">
            <h3>${product.name}</h3>
            <p>${product.description || 'No description available.'}</p>
            <div class="product-price-container">
                ${onSale ? `<span class="original-price">R${product.price.toFixed(2)}</span>` : ''}
                <span class="product-price">R${displayPrice.toFixed(2)}</span>
            </div>
            <button class="btn btn-primary add-to-cart-popup">Add to Cart</button>
        </div>
    `;

    document.body.appendChild(popup);

    popup.addEventListener('click', (e) => {
        if (e.target === popup) popup.remove();
    });

    popup.querySelector('.popup-close').addEventListener('click', () => popup.remove());

    popup.querySelector('.add-to-cart-popup').addEventListener('click', () => {
        if (window.tasselCart) {
            window.tasselCart.addItem({
                id: product._id,
                name: product.name,
                price: product.price,
                salePrice: product.salePrice || 0,
                image: imageUrl
            });
            showNotification('Added to cart!', 'success');
            popup.remove();
        }
    });
}

function showNotification(message, type = 'info') {
    if (window.showNotification) {
        window.showNotification(message, type);
    } else {
        alert(message);
    }
}