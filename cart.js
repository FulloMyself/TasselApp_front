// cart.js - Shopping Cart Functionality

// Check if TasselCart already exists to prevent duplicate declaration errors
if (typeof TasselCart !== 'undefined') {
    console.warn('TasselCart already defined, skipping re-declaration');
} else {
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
                    salePrice: product.salePrice,
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
                el.textContent = count;
                el.style.display = count > 0 ? 'inline' : 'none';
            });

            // Update cart sidebar if it exists
            const cartItemsContainer = document.getElementById('cart-items');
            const cartTotalElement = document.getElementById('cart-total');
            
            if (cartItemsContainer && cartTotalElement) {
                this.renderCartItems(cartItemsContainer, cartTotalElement);
            }
        }

        renderCartItems(container, totalElement) {
            if (this.cart.length === 0) {
                container.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
                totalElement.textContent = 'R0.00';
                return;
            }

            let html = '';
            this.cart.forEach(item => {
                const price = item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price;
                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image || 'assets/images/product-default.jpg'}" alt="${item.name}" onerror="this.src='assets/images/product-default.jpg'">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
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
            });

            container.innerHTML = html;
            totalElement.textContent = `R${this.getTotal().toFixed(2)}`;
        }

        updateCartNotification() {
            // Update notification badge in header
            const notifBadge = document.getElementById('cart-notification');
            if (notifBadge) {
                notifBadge.textContent = this.getItemCount();
            }
        }

        showNotification(message, type = 'info') {
            // Reuse your existing notification system
            if (window.showNotification) {
                window.showNotification(message, type);
            } else {
                // Create a simple notification if none exists
                const notification = document.createElement('div');
                notification.className = `notification notification-${type}`;
                notification.textContent = message;
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px;
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                `;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }
        }

        initEventListeners() {
            // Add to cart buttons
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart-btn')) {
                    e.preventDefault();
                    const productId = e.target.dataset.productId;
                    const product = JSON.parse(e.target.dataset.product || '{}');
                    this.addItem(product);
                }
            });

            // Cart toggle button
            const cartToggle = document.getElementById('cart-toggle');
            const cartSidebar = document.getElementById('cart-sidebar');
            const cartClose = document.getElementById('cart-close');

            if (cartToggle && cartSidebar) {
                cartToggle.addEventListener('click', () => {
                    cartSidebar.classList.toggle('open');
                });
            }

            if (cartClose && cartSidebar) {
                cartClose.addEventListener('click', () => {
                    cartSidebar.classList.remove('open');
                });
            }

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
                whatsappBtn.addEventListener('click', () => {
                    if (this.cart.length === 0) {
                        this.showNotification('Your cart is empty', 'error');
                        return;
                    }
                    this.orderViaWhatsApp();
                });
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
            const message = this.generateWhatsAppMessage();
            const whatsappNumber = "27632462802"; // Your business number
            window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        }

        // PayFast Payment
        async processPayFastPayment(email, deliveryDetails = null) {
            try {
                const response = await fetch('https://your-payment-portal.com/create-order', {
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
    }

    // Initialize cart only once
    if (!window.tasselCart) {
        window.tasselCart = new TasselCart();
    }
}

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TasselCart };
}