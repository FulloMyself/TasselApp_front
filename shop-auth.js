// shop-auth.js - Protection for shop page
(function () {
    // Check if user is logged in
    function checkShopAuth() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        console.log('Shop Auth Check - Token:', !!token, 'User:', user);

        if (!token || !user) {
            console.log('No user logged in, redirecting to index.html');
            // Store the page they tried to access
            sessionStorage.setItem('redirectAfterLogin', window.location.href);

            // Show message and redirect
            alert('Please log in to access the shop.');
            window.location.href = 'index.html';
            return false;
        }

        return true;
    }

    // Only run check if we're actually on shop page
    if (window.location.pathname.includes('shop.html')) {
        checkShopAuth();
    }

    // Also check when page loads
    document.addEventListener('DOMContentLoaded', function () {
        if (window.location.pathname.includes('shop.html')) {
            const isAuthenticated = checkShopAuth();

            if (isAuthenticated) {
                console.log('User authenticated, loading shop content');
                // Auto-fill checkout form if on checkout page
                if (window.location.pathname.includes('checkout.html')) {
                    autoFillCheckoutForm();
                }
            }
        }
    });

    // Auto-fill checkout form with user data
    function autoFillCheckoutForm() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        // Wait for form to be ready
        setTimeout(() => {
            const fullnameInput = document.getElementById('fullname');
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');

            if (fullnameInput && user.name) {
                fullnameInput.value = user.name;
                fullnameInput.readOnly = true;
                fullnameInput.style.backgroundColor = '#f5f5f5';
            }

            if (emailInput && user.email) {
                emailInput.value = user.email;
                emailInput.readOnly = true;
                emailInput.style.backgroundColor = '#f5f5f5';
            }

            if (phoneInput && user.phone) {
                phoneInput.value = user.phone;
                phoneInput.readOnly = true;
                phoneInput.style.backgroundColor = '#f5f5f5';
            }
        }, 500);
    }
})();