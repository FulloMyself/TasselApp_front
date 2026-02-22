// front/checkout.js
document.addEventListener('DOMContentLoaded', function() {
    loadOrderSummary();
    
    document.getElementById('delivery-option').addEventListener('change', function(e) {
        const addressSection = document.getElementById('delivery-address');
        addressSection.style.display = e.target.value === 'delivery' ? 'block' : 'none';
        updateTotal();
    });
});

function loadOrderSummary() {
    const cart = window.tasselCart;
    const itemsContainer = document.getElementById('order-items');
    
    if (!itemsContainer) return;
    
    itemsContainer.innerHTML = '';
    cart.cart.forEach(item => {
        const price = item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price;
        itemsContainer.innerHTML += `
            <div class="order-item">
                <span>${item.name} x${item.quantity}</span>
                <span>R${(price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });
    
    updateTotal();
}

function updateTotal() {
    const cart = window.tasselCart;
    const subtotal = cart.getSubtotal();
    const deliveryOption = document.getElementById('delivery-option')?.value;
    const deliveryFee = deliveryOption === 'delivery' ? 200 : 0;
    const total = subtotal + deliveryFee;
    
    document.getElementById('subtotal').textContent = `R${subtotal.toFixed(2)}`;
    document.getElementById('delivery-fee').textContent = deliveryFee > 0 ? `R${deliveryFee}.00` : 'Free';
    document.getElementById('total').textContent = `R${total.toFixed(2)}`;
}

function validateCheckout() {
    const fullname = document.getElementById('fullname')?.value;
    const email = document.getElementById('email')?.value;
    const phone = document.getElementById('phone')?.value;
    const terms = document.getElementById('terms')?.checked;
    
    if (!fullname || !email || !phone) {
        alert('Please fill in all required fields');
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
        if (!address || !city) {
            alert('Please fill in delivery address');
            return false;
        }
    }
    
    return true;
}

async function processPayFastPayment() {
    if (!validateCheckout()) return;
    
    const cart = window.tasselCart;
    const email = document.getElementById('email').value;
    const deliveryOption = document.getElementById('delivery-option').value;
    
    let deliveryDetails = null;
    if (deliveryOption === 'delivery') {
        deliveryDetails = {
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postal: document.getElementById('postal').value
        };
    }
    
    await cart.processPayFastPayment(email, deliveryDetails);
}

function processWhatsAppOrder() {
    if (!validateCheckout()) return;
    
    const cart = window.tasselCart;
    
    // Add delivery info to message
    const deliveryOption = document.getElementById('delivery-option').value;
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    let message = cart.generateWhatsAppMessage();
    message += `%0A%0ADelivery Options: ${deliveryOption === 'delivery' ? 'Delivery' : 'Collection'}`;
    message += `%0AName: ${fullname}`;
    message += `%0AEmail: ${email}`;
    message += `%0APhone: ${phone}`;
    
    if (deliveryOption === 'delivery') {
        message += `%0AAddress: ${document.getElementById('address').value}, ${document.getElementById('city').value}`;
    }
    
    const whatsappNumber = "27729605153";
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
}