// cart.js - Shopping Cart Functionality

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
            alert(message);
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

// Initialize cart
const tasselCart = new TasselCart();
window.tasselCart = tasselCart;