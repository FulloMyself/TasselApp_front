// ===============================================
// TASSEL HAIR & BEAUTY STUDIO - SCRIPTS
// ===============================================

const API_URL = 'https://tasselapp-back.onrender.com';

document.addEventListener('DOMContentLoaded', function() {

    // ===== DOM Elements =====
    const loadingScreen = document.getElementById('loading-screen');
    const header = document.getElementById('main-header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const bookingModal = document.getElementById('booking-modal');
    const loginModal = document.getElementById('login-modal');
    const bookBtn = document.getElementById('book-btn');
    const loginBtn = document.getElementById('login-btn');
    const lightbox = document.getElementById('lightbox');

    // ===== Initialization =====
    window.addEventListener('load', () => setTimeout(() => loadingScreen.classList.add('hidden'), 1500));
    initSliders();
    initGallery();
    initForms();
    initObservers();

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
        link.addEventListener('click', function(e) {
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
        
        filterBtns.forEach(btn => btn.addEventListener('click', function() {
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
        lightbox.onclick = (e) => { if(e.target === lightbox) lightbox.classList.remove('active'); };
        
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

    bookBtn.addEventListener('click', () => openModal(bookingModal));
    loginBtn.addEventListener('click', () => openModal(loginModal));
    document.querySelectorAll('.modal-close').forEach(btn => btn.onclick = () => closeModal(btn.closest('.modal')));
    [bookingModal, loginModal].forEach(m => m.onclick = (e) => { if(e.target === m) closeModal(m); });
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape') [bookingModal, loginModal].forEach(m => closeModal(m)); });

    document.querySelectorAll('.service-overlay .btn').forEach(btn => btn.addEventListener('click', () => openModal(bookingModal)));

    // ===== Forms (API Integration) =====
    function initForms() {
        // Generic Post Helper
        const postData = async (url, data, successMsg) => {
            try {
                const res = await fetch(`${API_URL}${url}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!res.ok) throw new Error('Network response was not ok');
                showNotification(successMsg, 'success');
                return true;
            } catch (err) {
                console.error(err);
                showNotification('Something went wrong. Please try again.', 'error');
                return false;
            }
        };

        // Booking Form
        const bookingForm = document.getElementById('booking-form');
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                name: this.querySelector('#booking-name').value,
                email: this.querySelector('#booking-email').value,
                phone: this.querySelector('#booking-phone').value,
                service: this.querySelector('#booking-service').value,
                date: this.querySelector('#booking-date').value,
                time: this.querySelector('#booking-time').value,
                notes: this.querySelector('#booking-notes').value
            };
            const success = await postData('/api/bookings', data, 'Booking request received! We will contact you shortly.');
            if (success) { closeModal(bookingModal); this.reset(); }
        });

        // Contact Form
        const contactForm = document.getElementById('contact-form');
        contactForm.addEventListener('submit', async function(e) {
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

        // Login Form
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const data = {
                email: this.querySelector('#login-email').value,
                password: this.querySelector('#login-password').value
            };
            const btn = this.querySelector('button[type="submit"]');
            const origText = btn.textContent;
            btn.textContent = 'Logging in...';
            btn.disabled = true;
            
            const success = await postData('/api/auth/login', data, 'Login successful!');
            if (success) { closeModal(loginModal); this.reset(); }
            
            btn.textContent = origText;
            btn.disabled = false;
        });

        // Newsletter
        const newsletterForm = document.querySelector('.newsletter-form');
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const success = await postData('/api/newsletter', { email }, 'Subscribed successfully!');
            if (success) this.reset();
        });
    }

    // ===== Utility Functions =====
    // Set min date for booking
    const bookingDate = document.getElementById('booking-date');
    if (bookingDate) {
        const today = new Date().toISOString().split('T')[0];
        bookingDate.setAttribute('min', today);
    }

    // Back to top
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
