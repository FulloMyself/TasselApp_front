// ===============================================
// TASSEL HAIR & BEAUTY STUDIO - SCRIPTS
// ===============================================

const API_URL = 'https://tasselapp-back.onrender.com';

document.addEventListener('DOMContentLoaded', function () {

    // ===== DOM Elements =====
    const loadingScreen = document.getElementById('loading-screen');
    const header = document.getElementById('main-header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const bookingModal = document.getElementById('booking-modal');
    const loginModal = document.getElementById('login-modal');
    const bookBtn = document.getElementById('book-btn');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn'); // New
    const lightbox = document.getElementById('lightbox');

    // ===== Initialization =====
    window.addEventListener('load', () => setTimeout(() => loadingScreen.classList.add('hidden'), 1500));
    checkAuthStatus(); // Check if user is already logged in
    initSliders();
    initGallery();
    initForms();
    initObservers();

    // ===== Auth Status (Check Login) =====
    function checkAuthStatus() {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (token && user) {
            // User IS logged in
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-flex'; // Show logout
            // Optional: Change Book button text
            if (user.role === 'customer') {
                bookBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> Book Now';
            } else {
                bookBtn.innerHTML = '<i class="fas fa-th-large"></i> Dashboard';
            }
        } else {
            // User NOT logged in
            loginBtn.style.display = 'inline-flex';
            logoutBtn.style.display = 'none';
            bookBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> Book Now';
        }
    }

    // ===== Header & Navigation =====
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.pageYOffset > 100);
        document.getElementById('back-to-top').classList.toggle('visible', window.pageYOffset > 300);
    });

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) window.scrollTo({ top: target.offsetTop - header.offsetHeight, behavior: 'smooth' });
            }
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
        });
    });

    // ===== Sliders (Hero & Testimonials) =====
    function initSliders() {
        // Hero Slider
        const heroSlides = document.querySelectorAll('.hero-slide');
        const heroDots = document.querySelector('.hero-dots');
        if (heroSlides.length) {
            let currentHero = 0;
            heroSlides.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = `hero-dot${i === 0 ? ' active' : ''}`;
                dot.onclick = () => goToHero(i);
                heroDots.appendChild(dot);
            });

            const goToHero = (index) => {
                heroSlides[currentHero].classList.remove('active');
                document.querySelectorAll('.hero-dot')[currentHero].classList.remove('active');
                currentHero = index;
                heroSlides[currentHero].classList.add('active');
                document.querySelectorAll('.hero-dot')[currentHero].classList.add('active');
            };

            document.querySelector('.hero-prev').onclick = () => goToHero((currentHero - 1 + heroSlides.length) % heroSlides.length);
            document.querySelector('.hero-next').onclick = () => goToHero((currentHero + 1) % heroSlides.length);

            const heroContainer = document.querySelector('.hero-slider');
            let heroInterval = setInterval(() => goToHero((currentHero + 1) % heroSlides.length), 5000);
            heroContainer.onmouseenter = () => clearInterval(heroInterval);
            heroContainer.onmouseleave = () => heroInterval = setInterval(() => goToHero((currentHero + 1) % heroSlides.length), 5000);
        }

        // Testimonials Slider
        const testCards = document.querySelectorAll('.testimonial-card');
        const testDots = document.querySelector('.testimonial-dots');
        if (testCards.length) {
            let currentTest = 0;
            testCards.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = `testimonial-dot${i === 0 ? ' active' : ''}`;
                dot.onclick = () => goToTest(i);
                testDots.appendChild(dot);
            });

            const goToTest = (index) => {
                testCards[currentTest].classList.remove('active');
                document.querySelectorAll('.testimonial-dot')[currentTest].classList.remove('active');
                currentTest = index;
                testCards[currentTest].classList.add('active');
                document.querySelectorAll('.testimonial-dot')[currentTest].classList.add('active');
            };

            document.querySelector('.testimonial-prev').onclick = () => goToTest((currentTest - 1 + testCards.length) % testCards.length);
            document.querySelector('.testimonial-next').onclick = () => goToTest((currentTest + 1) % testCards.length);
            setInterval(() => goToTest((currentTest + 1) % testCards.length), 6000);
        }
    }

    // ===== Gallery =====
    function initGallery() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const items = document.querySelectorAll('.gallery-item');

        filterBtns.forEach(btn => btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            items.forEach(item => {
                item.style.display = (filter === 'all' || item.dataset.category === filter) ? 'block' : 'none';
                setTimeout(() => item.style.opacity = (filter === 'all' || item.dataset.category === filter) ? '1' : '0', 10);
            });
        }));

        // Lightbox
        const images = [];
        items.forEach((item, i) => images.push({ src: item.querySelector('img').src, cap: item.querySelector('h4')?.textContent || '' }));

        items.forEach((item, i) => item.onclick = () => showLightbox(i));

        document.querySelector('.lightbox-close').onclick = () => lightbox.classList.remove('active');
        document.querySelector('.lightbox-prev').onclick = () => showLightbox((parseInt(lightbox.dataset.idx) - 1 + images.length) % images.length);
        document.querySelector('.lightbox-next').onclick = () => showLightbox((parseInt(lightbox.dataset.idx) + 1) % images.length);
        lightbox.onclick = (e) => { if (e.target === lightbox) lightbox.classList.remove('active'); };

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') lightbox.classList.remove('active');
            if (e.key === 'ArrowLeft') document.querySelector('.lightbox-prev').click();
            if (e.key === 'ArrowRight') document.querySelector('.lightbox-next').click();
        });

        function showLightbox(index) {
            lightbox.dataset.idx = index;
            document.querySelector('.lightbox-image').src = images[index].src;
            document.querySelector('.lightbox-caption').textContent = images[index].cap;
            lightbox.classList.add('active');
        }
    }

    // ===== Modals =====
    const openModal = (modal) => { modal.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const closeModal = (modal) => { modal.classList.remove('active'); document.body.style.overflow = ''; };

    // Event: Open Login Modal
    loginBtn.addEventListener('click', () => {
        // If already logged in, clicking "Login" should ideally do nothing or go to dashboard
        // But checkAuthStatus hides it, so this might not trigger.
        openModal(loginModal);
    });

    // Event: Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showNotification('Logged out successfully.', 'success');
        checkAuthStatus(); // Update UI
        window.location.href = 'index.html'; // Redirect home
    });

    // Event: Open Booking Modal (Check Auth First!)
    bookBtn.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token) {
            showNotification('Please login to book an appointment.', 'error');
            openModal(loginModal);
            return;
        }

        if (user.role === 'admin' || user.role === 'staff') {
            // Admin/Staff go to dashboard
            window.location.href = user.role === 'admin' ? 'admin.html' : 'staff.html';
        } else {
            // Customer opens booking modal
            openModal(bookingModal);
        }
    });

    document.querySelectorAll('.modal-close').forEach(btn => btn.onclick = () => closeModal(btn.closest('.modal')));
    [bookingModal, loginModal].forEach(m => m.onclick = (e) => { if (e.target === m) closeModal(m); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') [bookingModal, loginModal].forEach(m => closeModal(m)); });

    document.querySelectorAll('.service-overlay .btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        // Trigger the main book button logic
        bookBtn.click();
    }));

    // ===== Forms (API Integration) =====
    function initForms() {
        
        // Toggle Login/Register Forms
        document.getElementById('show-register').onclick = () => {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
        };
        document.getElementById('show-login').onclick = () => {
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        };

        // Generic Post Helper
        const postData = async (url, data, successMsg, requiresAuth = false) => {
            const headers = { 'Content-Type': 'application/json' };
            if (requiresAuth) {
                const token = localStorage.getItem('token');
                if (!token) {
                    showNotification('Please login first.', 'error');
                    return { success: false };
                }
                headers['Authorization'] = `Bearer ${token}`;
            }

            try {
                const res = await fetch(`${API_URL}${url}`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Network error');
                showNotification(successMsg, 'success');
                return { success: true, data: result };
            } catch (err) {
                console.error(err);
                showNotification(err.message || 'Something went wrong.', 'error');
                return { success: false };
            }
        };

        // 1. Register Form
        const registerForm = document.getElementById('register-form');
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = "Registering...";

            const data = {
                name: this.querySelector('#reg-name').value,
                email: this.querySelector('#reg-email').value,
                password: this.querySelector('#reg-password').value
            };

            const result = await postData('/api/auth/register', data, 'Account created! Please login.');
            if (result.success) {
                // Switch to login form
                document.getElementById('show-login').click();
                // Pre-fill email
                document.getElementById('login-email').value = data.email;
            }
            
            btn.disabled = false;
            btn.textContent = "Register";
        });

        // 2. Login Form
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = "Logging in...";

            const data = {
                email: this.querySelector('#login-email').value,
                password: this.querySelector('#login-password').value
            };

            try {
                const res = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                if (res.ok && result.token) {
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    showNotification('Login successful!', 'success');
                    closeModal(loginModal);
                    checkAuthStatus(); // Update nav
                    // Redirect based on role
                    setTimeout(() => redirectToDashboard(result.user.role), 500);
                } else {
                    throw new Error(result.error || 'Login failed');
                }
            } catch (err) {
                showNotification(err.message, 'error');
            }
            btn.disabled = false;
            btn.textContent = "Login";
        });

        // 3. Booking Form (Requires Auth)
        const bookingForm = document.getElementById('booking-form');
        bookingForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('user'));
            
            const data = {
                name: this.querySelector('#booking-name').value,
                email: this.querySelector('#booking-email').value,
                phone: this.querySelector('#booking-phone').value,
                service: this.querySelector('#booking-service').value,
                date: this.querySelector('#booking-date').value,
                time: this.querySelector('#booking-time').value,
                notes: this.querySelector('#booking-notes').value,
                userId: user ? user.id : null // Link to user
            };

            const result = await postData('/api/bookings', data, 'Booking confirmed!', true);
            if (result.success) {
                closeModal(bookingModal);
                this.reset();
            }
        });

        // 4. Contact Form
        const contactForm = document.getElementById('contact-form');
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const data = {
                name: this.querySelector('#name').value,
                email: this.querySelector('#email').value,
                phone: this.querySelector('#phone').value,
                subject: this.querySelector('#subject').value,
                message: this.querySelector('#message').value
            };
            const success = await postData('/api/contact', data, 'Message sent successfully!');
            if (success) this.reset();
        });

        // 5. Newsletter
        const newsletterForm = document.querySelector('.newsletter-form');
        newsletterForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const success = await postData('/api/newsletter', { email }, 'Subscribed successfully!');
            if (success) this.reset();
        });
    }

    // Helper Redirect
    function redirectToDashboard(role) {
        switch (role) {
            case 'admin': window.location.href = 'admin.html'; break;
            case 'staff': window.location.href = 'staff.html'; break;
            default: window.location.href = 'customer.html';
        }
    }

    // ===== Utility Functions =====
    const bookingDate = document.getElementById('booking-date');
    if (bookingDate) {
        const today = new Date().toISOString().split('T')[0];
        bookingDate.setAttribute('min', today);
    }

    document.getElementById('back-to-top').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // Notification System
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `position: fixed; top: 100px; right: 20px; background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'}; color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; animation: slideIn 0.3s ease;`;
        notification.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem"><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span></div><button style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;margin-left:10px">&times;</button>`;

        document.body.appendChild(notification);
        notification.querySelector('button').onclick = () => notification.remove();
        setTimeout(() => notification.remove(), 5000);
    }

    // Animate on Scroll Observer
    function initObservers() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.feature-card, .service-card, .product-card, .gift-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
});
