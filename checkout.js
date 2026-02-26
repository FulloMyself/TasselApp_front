// front/checkout.js
// checkout.js
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        alert('Please log in to access checkout');
        window.location.href = 'index.html';
        return;
    }

    // Check if cart exists
    if (!window.tasselCart) {
        console.error('Cart not initialized');
        showCheckoutError('Cart not loaded. Please return to the shop and try again.');
        return;
    }

    // Auto-fill user data
    autoFillUserData(user);

    loadOrderSummary();

    const deliveryOption = document.getElementById('delivery-option');
    if (deliveryOption) {
        deliveryOption.addEventListener('change', function (e) {
            const addressSection = document.getElementById('delivery-address');
            if (addressSection) {
                addressSection.style.display = e.target.value === 'delivery' ? 'block' : 'none';
            }
            updateTotal();
        });
    }
});

function autoFillUserData(user) {
    if (!user) return;

    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    if (fullnameInput && user.name) {
        fullnameInput.value = user.name;
        // Make read-only but with visual feedback
        fullnameInput.readOnly = true;
        fullnameInput.style.backgroundColor = '#f9f9f9';
        fullnameInput.style.border = '1px solid #e0e0e0';
        fullnameInput.title = 'This information comes from your profile';
    }

    if (emailInput && user.email) {
        emailInput.value = user.email;
        emailInput.readOnly = true;
        emailInput.style.backgroundColor = '#f9f9f9';
        emailInput.style.border = '1px solid #e0e0e0';
        emailInput.title = 'This information comes from your profile';
    }

    if (phoneInput && user.phone) {
        phoneInput.value = user.phone;
        phoneInput.readOnly = true;
        phoneInput.style.backgroundColor = '#f9f9f9';
        phoneInput.style.border = '1px solid #e0e0e0';
        phoneInput.title = 'This information comes from your profile';
    }
}

function showCheckoutError(message) {
    const container = document.querySelector('.checkout-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 3rem;">
                <h2>⚠️ Oops!</h2>
                <p>${message}</p>
                <a href="shop.html" class="btn btn-primary" style="margin-top: 1rem;">Return to Shop</a>
            </div>
        `;
    }
}

function loadOrderSummary() {
    // Safety check
    if (!window.tasselCart || !window.tasselCart.cart) {
        console.error('Cart not available');
        return;
    }

    const cart = window.tasselCart;
    const itemsContainer = document.getElementById('order-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    if (!itemsContainer) return;

    // Check if cart is empty
    if (!cart.cart || cart.cart.length === 0) {
        if (itemsContainer) {
            itemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty. <a href="index.html#products-section">Continue shopping</a></p>';
        }
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
        // Hide checkout button
        const checkoutBtn = document.querySelector('button[onclick="processPayFastPayment()"], button[onclick="processWhatsAppOrder()"]');
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    itemsContainer.innerHTML = '';

    cart.cart.forEach(item => {
        const price = item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>R${(price * item.quantity).toFixed(2)}</span>
        `;
        itemsContainer.appendChild(itemDiv);
    });

    updateTotal();
}

function updateTotal() {
    // Safety check
    if (!window.tasselCart || !window.tasselCart.cart) {
        return;
    }

    const cart = window.tasselCart;

    // Calculate subtotal safely
    let subtotal = 0;
    if (cart.cart && cart.cart.length > 0) {
        subtotal = cart.cart.reduce((sum, item) => {
            const price = item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price;
            return sum + (price * (item.quantity || 1));
        }, 0);
    }

    const deliveryOption = document.getElementById('delivery-option')?.value;
    const deliveryFee = deliveryOption === 'delivery' ? 200 : 0;
    const total = subtotal + deliveryFee;

    const subtotalEl = document.getElementById('subtotal');
    const deliveryFeeEl = document.getElementById('delivery-fee');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `R${subtotal.toFixed(2)}`;
    if (deliveryFeeEl) deliveryFeeEl.textContent = deliveryFee > 0 ? `R${deliveryFee}.00` : 'Free';
    if (totalEl) totalEl.textContent = `R${total.toFixed(2)}`;
}

function validateCheckout() {
    // Safety check - redirect if cart is empty
    if (!window.tasselCart || !window.tasselCart.cart || window.tasselCart.cart.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        window.location.href = 'index.html#products-section';
        return false;
    }

    const fullname = document.getElementById('fullname')?.value;
    const email = document.getElementById('email')?.value;
    const phone = document.getElementById('phone')?.value;
    const terms = document.getElementById('terms')?.checked;

    if (!fullname || !fullname.trim()) {
        alert('Please enter your full name');
        document.getElementById('fullname')?.focus();
        return false;
    }

    if (!email || !email.trim()) {
        alert('Please enter your email address');
        document.getElementById('email')?.focus();
        return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        document.getElementById('email')?.focus();
        return false;
    }

    if (!phone || !phone.trim()) {
        alert('Please enter your phone number');
        document.getElementById('phone')?.focus();
        return false;
    }

    if (!terms) {
        alert('Please agree to the terms and conditions');
        return false;
    }

    const deliveryOption = document.getElementById('delivery-option')?.value;
    if (deliveryOption === 'delivery') {
        const address = document.getElementById('address')?.value;
        const city = document.getElementById('city')?.value;

        if (!address || !address.trim()) {
            alert('Please enter your delivery address');
            document.getElementById('address')?.focus();
            return false;
        }

        if (!city || !city.trim()) {
            alert('Please enter your city');
            document.getElementById('city')?.focus();
            return false;
        }
    }

    return true;
}

async function processPayFastPayment() {
    if (!validateCheckout()) return;

    // Safety check
    if (!window.tasselCart) {
        alert('Cart not available. Please refresh the page.');
        return;
    }

    const cart = window.tasselCart;
    const email = document.getElementById('email').value;
    const deliveryOption = document.getElementById('delivery-option').value;

    // Show loading state
    const payBtn = document.querySelector('[onclick="processPayFastPayment()"]');
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.textContent = 'Processing...';
    }

    let deliveryDetails = null;
    if (deliveryOption === 'delivery') {
        deliveryDetails = {
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postal: document.getElementById('postal')?.value || ''
        };
    }

    try {
        await cart.processPayFastPayment(email, deliveryDetails);
    } catch (error) {
        console.error('Payment error:', error);
        alert('Payment processing failed. Please try again.');
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.textContent = 'Pay with PayFast';
        }
    }
}

function processWhatsAppOrder() {
    if (!validateCheckout()) return;

    // Safety check
    if (!window.tasselCart) {
        alert('Cart not available. Please refresh the page.');
        return;
    }

    const cart = window.tasselCart;

    // Check if cart is empty
    if (!cart.cart || cart.cart.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }

    const deliveryOption = document.getElementById('delivery-option').value;
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Generate order summary
    let orderSummary = '';
    cart.cart.forEach(item => {
        const price = item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price;
        orderSummary += `${item.name} x${item.quantity} - R${(price * item.quantity).toFixed(2)}%0A`;
    });

    const subtotal = cart.cart.reduce((sum, item) => {
        const price = item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price;
        return sum + (price * item.quantity);
    }, 0);

    const deliveryFee = deliveryOption === 'delivery' ? 200 : 0;
    const total = subtotal + deliveryFee;

    let message = `*NEW ORDER FROM TASSEL STUDIO*%0A%0A`;
    message += `*CUSTOMER DETAILS*%0A`;
    message += `Name: ${fullname}%0A`;
    message += `Email: ${email}%0A`;
    message += `Phone: ${phone}%0A%0A`;

    message += `*ORDER DETAILS*%0A`;
    message += orderSummary;
    message += `%0A`;
    message += `Subtotal: R${subtotal.toFixed(2)}%0A`;
    message += `Delivery: ${deliveryFee > 0 ? 'R' + deliveryFee.toFixed(2) : 'Free'}%0A`;
    message += `*TOTAL: R${total.toFixed(2)}*%0A%0A`;

    message += `*DELIVERY OPTION*%0A`;
    message += `${deliveryOption === 'delivery' ? 'Delivery' : 'Collection'}%0A`;

    if (deliveryOption === 'delivery') {
        message += `%0A*DELIVERY ADDRESS*%0A`;
        message += `${document.getElementById('address').value}%0A`;
        message += `${document.getElementById('city').value}`;
        if (document.getElementById('postal')?.value) {
            message += `%0A${document.getElementById('postal').value}`;
        }
    }

    message += `%0A%0A_Powered by tasselgroup.co.za_`;

    const whatsappNumber = "27729605153";
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
}

// Add this to your checkout.html to handle back navigation
window.addEventListener('pageshow', function (event) {
    // Reload order summary when page is shown (including when using back button)
    if (event.persisted || window.performance && window.performance.navigation.type === 2) {
        location.reload();
    }
});