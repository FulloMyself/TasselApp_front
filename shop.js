// front/shop.js
// Shopping Cart Functionality for Tassel Website

class TasselCart {
    constructor() {
        this.cart = this.loadCart();
        this.initEventListeners();
        this.updateCartDisplay();
    }

    loadCart() {
        const savedCart = localStorage.getItem('tasselCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('tasselCart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.updateCartNotification();
    }

    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                salePrice: product.salePrice || 0,
                image: product.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.showNotification(`${product.name} added to cart`, 'success');
    }

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification('Item removed from cart', 'info');
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, item.quantity + change);
            this.saveCart();
        }
    }

    getSubtotal() {
        return this.cart.reduce((sum, item) => {
            const price = item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price;
            return sum + (price * item.quantity);
        }, 0);
    }

    getTotal() {
        return this.getSubtotal(); // Add delivery fee if applicable
    }

    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    clearCart() {
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.saveCart();
            this.showNotification('Cart cleared', 'info');
        }
    }

    updateCartDisplay() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const count = this.getItemCount();

        cartCountElements.forEach(el => {
            if (el) {
                el.textContent = count;
                el.style.display = count > 0 ? 'inline-block' : 'none';
            }
        });

        // Update cart sidebar if open
        this.renderCartSidebar();
    }

    updateCartNotification() {
        // Update notification badge in header if exists
        const notifBadge = document.getElementById('cart-notification');
        if (notifBadge) {
            notifBadge.textContent = this.getItemCount();
        }
    }

    renderCartSidebar() {
        const sidebar = document.getElementById('cart-sidebar');
        const itemsContainer = document.getElementById('cart-items');
        const totalElement = document.getElementById('cart-total');

        if (!sidebar || !itemsContainer || !totalElement) return;

        if (this.cart.length === 0) {
            itemsContainer.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
            totalElement.textContent = 'R0.00';
            return;
        }

        itemsContainer.innerHTML = this.cart.map(item => {
            const price = item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price;
            // Fix image path for cart items
            const imageUrl = item.image || './assets/images/product-default.jpg';

            return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${imageUrl}" alt="${item.name}" class="cart-item-image" onerror="this.src='./assets/images/product-default.jpg'">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <div class="cart-item-price">R${price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="tasselCart.updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="tasselCart.updateQuantity('${item.id}', 1)">+</button>
                        <button class="remove-btn" onclick="tasselCart.removeItem('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        totalElement.textContent = `R${this.getTotal().toFixed(2)}`;
    }

    showNotification(message, type = 'info') {
        // Reuse your existing notification system from dashboard.js
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                position: fixed; 
                top: 100px; 
                right: 20px; 
                background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'}; 
                color: white; 
                padding: 1rem 1.5rem; 
                border-radius: 8px; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
                z-index: 9999; 
                animation: slideIn 0.3s ease;
                display: flex;
                align-items: center;
                gap: 1rem;
            `;
            notification.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.75rem">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                    <span>${message}</span>
                </div>
                <button style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;margin-left:10px">&times;</button>
            `;
            document.body.appendChild(notification);
            notification.querySelector('button').onclick = () => notification.remove();
            setTimeout(() => notification.remove(), 3000);
        }
    }

    // WhatsApp Order
    generateWhatsAppMessage() {
        let message = "Hello Tassel Beauty! I'd like to place an order:\n\n";

        this.cart.forEach(item => {
            const price = item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price;
            message += `${item.name} x${item.quantity} - R${(price * item.quantity).toFixed(2)}\n`;
        });

        message += `\nTotal: R${this.getTotal().toFixed(2)}`;
        message += `\n\n(Powered by tasselgroup.co.za/shop)`;

        return encodeURIComponent(message);
    }

    orderViaWhatsApp() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }
        const message = this.generateWhatsAppMessage();
        const whatsappNumber = "27729605153"; // Your business number from server.js
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    }

    // PayFast Payment
    async processPayFastPayment(email, deliveryDetails = null) {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }

        try {
            const response = await fetch('https://tassel-payment-portal.onrender.com/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: this.cart,
                    total: this.getTotal(),
                    email,
                    deliveryDetails
                })
            });

            if (!response.ok) throw new Error('Payment initiation failed');

            const paymentData = await response.json();
            this.submitPayFastForm(paymentData);

        } catch (error) {
            console.error('Payment error:', error);
            this.showNotification('Payment failed. Please try again.', 'error');
        }
    }

    submitPayFastForm(fields) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = fields.payfast_url;
        form.style.display = 'none';

        Object.entries(fields).forEach(([key, value]) => {
            if (key !== 'payfast_url') {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            }
        });

        document.body.appendChild(form);
        form.submit();
    }

    initEventListeners() {
        // Cart toggle
        const cartToggle = document.getElementById('cart-toggle');
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartClose = document.getElementById('cart-close');

        if (cartToggle && cartSidebar) {
            cartToggle.addEventListener('click', () => {
                cartSidebar.classList.toggle('open');
                this.renderCartSidebar();
            });
        }

        if (cartClose && cartSidebar) {
            cartClose.addEventListener('click', () => {
                cartSidebar.classList.remove('open');
            });
        }

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            if (cartSidebar && cartToggle &&
                !cartSidebar.contains(e.target) &&
                !cartToggle.contains(e.target) &&
                cartSidebar.classList.contains('open')) {
                cartSidebar.classList.remove('open');
            }
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.cart.length === 0) {
                    this.showNotification('Your cart is empty', 'error');
                    return;
                }
                window.location.href = 'checkout.html';
            });
        }

        // WhatsApp order button
        const whatsappBtn = document.getElementById('cart-whatsapp');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', () => this.orderViaWhatsApp());
        }
    }
}

// Initialize cart globally
const tasselCart = new TasselCart();
window.tasselCart = tasselCart;