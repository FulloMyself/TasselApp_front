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
    const logoutBtn = document.getElementById('logout-btn');
    const lightbox = document.getElementById('lightbox');
    const backToTop = document.getElementById('back-to-top');

    // ===== Initialization =====
    window.addEventListener('load', () => setTimeout(() => loadingScreen.classList.add('hidden'), 1500));
    checkAuthStatus();
    initSliders();
    initGallery();
    initForms();
    initObservers();
    initServiceCategories();
    initSmoothScroll();

    // ===== Auth Status (Check Login) =====
    function checkAuthStatus() {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (token && user) {
            // User IS logged in
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-flex';
            
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
        if (backToTop) {
            backToTop.classList.toggle('visible', window.pageYOffset > 300);
        }
    });

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
        });
    });

    // ===== Smooth Scroll for All Anchor Links =====
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]:not(.nav-link)').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        });
    }

    // ===== Sliders (Hero & Testimonials) =====
    function initSliders() {
        // Hero Slider
        const heroSlides = document.querySelectorAll('.hero-slide');
        const heroDots = document.querySelector('.hero-dots');
        
        if (heroSlides.length && heroDots) {
            let currentHero = 0;
            
            // Create dots
            heroSlides.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = `hero-dot${i === 0 ? ' active' : ''}`;
                dot.addEventListener('click', () => goToHero(i));
                heroDots.appendChild(dot);
            });

            const goToHero = (index) => {
                heroSlides[currentHero].classList.remove('active');
                document.querySelectorAll('.hero-dot')[currentHero].classList.remove('active');
                currentHero = index;
                heroSlides[currentHero].classList.add('active');
                document.querySelectorAll('.hero-dot')[currentHero].classList.add('active');
            };

            const prevBtn = document.querySelector('.hero-prev');
            const nextBtn = document.querySelector('.hero-next');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => goToHero((currentHero - 1 + heroSlides.length) % heroSlides.length));
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => goToHero((currentHero + 1) % heroSlides.length));
            }

            // Auto-rotate
            const heroContainer = document.querySelector('.hero-slider');
            let heroInterval = setInterval(() => goToHero((currentHero + 1) % heroSlides.length), 5000);
            
            if (heroContainer) {
                heroContainer.addEventListener('mouseenter', () => clearInterval(heroInterval));
                heroContainer.addEventListener('mouseleave', () => {
                    heroInterval = setInterval(() => goToHero((currentHero + 1) % heroSlides.length), 5000);
                });
            }
        }

        // Testimonials Slider
        const testCards = document.querySelectorAll('.testimonial-card');
        const testDots = document.querySelector('.testimonial-dots');
        
        if (testCards.length && testDots) {
            let currentTest = 0;
            
            testCards.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = `testimonial-dot${i === 0 ? ' active' : ''}`;
                dot.addEventListener('click', () => goToTest(i));
                testDots.appendChild(dot);
            });

            const goToTest = (index) => {
                testCards[currentTest].classList.remove('active');
                document.querySelectorAll('.testimonial-dot')[currentTest].classList.remove('active');
                currentTest = index;
                testCards[currentTest].classList.add('active');
                document.querySelectorAll('.testimonial-dot')[currentTest].classList.add('active');
            };

            const prevBtn = document.querySelector('.testimonial-prev');
            const nextBtn = document.querySelector('.testimonial-next');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => goToTest((currentTest - 1 + testCards.length) % testCards.length));
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => goToTest((currentTest + 1) % testCards.length));
            }

            // Auto-rotate
            setInterval(() => goToTest((currentTest + 1) % testCards.length), 6000);
        }
    }

    // ===== Service Categories Interaction =====
    function initServiceCategories() {
        const categoryButtons = document.querySelectorAll('.category-card .btn-sm');
        const detailedServices = document.getElementById('detailed-services');
        
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.closest('.category-card').querySelector('h3').textContent.toLowerCase();
                
                // Show detailed services section
                if (detailedServices) {
                    detailedServices.style.display = 'block';
                    
                    // Hide all service details first
                    document.querySelectorAll('.service-detail').forEach(el => {
                        el.style.display = 'none';
                    });
                    
                    // Show relevant service detail
                    let targetId = '';
                    if (category.includes('kiddies')) targetId = 'kiddies-services';
                    else if (category.includes('adult')) targetId = 'adult-services';
                    else if (category.includes('nail')) targetId = 'nails-services';
                    else if (category.includes('skin')) targetId = 'beauty-services';
                    
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        targetSection.style.display = 'block';
                        
                        // Smooth scroll to services
                        setTimeout(() => {
                            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                    }
                }
            });
        });
    }

    // ===== Gallery =====
    function initGallery() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const items = document.querySelectorAll('.gallery-item');

        if (filterBtns.length && items.length) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const filter = this.dataset.filter;
                    items.forEach(item => {
                        if (filter === 'all' || item.dataset.category === filter) {
                            item.style.display = 'block';
                            setTimeout(() => item.style.opacity = '1', 10);
                        } else {
                            item.style.display = 'none';
                            item.style.opacity = '0';
                        }
                    });
                });
            });
        }

        // Lightbox
        const lightboxImages = [];
        items.forEach((item, i) => {
            const img = item.querySelector('img');
            const title = item.querySelector('h4')?.textContent || '';
            if (img) {
                lightboxImages.push({ src: img.src, cap: title });
            }
        });

        if (lightboxImages.length) {
            items.forEach((item, i) => {
                item.addEventListener('click', () => showLightbox(i));
            });

            const closeBtn = document.querySelector('.lightbox-close');
            const prevBtn = document.querySelector('.lightbox-prev');
            const nextBtn = document.querySelector('.lightbox-next');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
            }
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    const currentIdx = parseInt(lightbox.dataset.idx);
                    showLightbox((currentIdx - 1 + lightboxImages.length) % lightboxImages.length);
                });
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    const currentIdx = parseInt(lightbox.dataset.idx);
                    showLightbox((currentIdx + 1) % lightboxImages.length);
                });
            }
            
            if (lightbox) {
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) lightbox.classList.remove('active');
                });
            }

            document.addEventListener('keydown', (e) => {
                if (!lightbox.classList.contains('active')) return;
                if (e.key === 'Escape') lightbox.classList.remove('active');
                if (e.key === 'ArrowLeft') prevBtn?.click();
                if (e.key === 'ArrowRight') nextBtn?.click();
            });
        }

        function showLightbox(index) {
            if (!lightbox) return;
            
            lightbox.dataset.idx = index;
            const imageEl = document.querySelector('.lightbox-image');
            const captionEl = document.querySelector('.lightbox-caption');
            
            if (imageEl) imageEl.src = lightboxImages[index].src;
            if (captionEl) captionEl.textContent = lightboxImages[index].cap;
            
            lightbox.classList.add('active');
        }
    }

    // ===== Modals =====
    const openModal = (modal) => {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };
    
    const closeModal = (modal) => {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // Event: Open Login Modal
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            openModal(loginModal);
        });
    }

    // Event: Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showNotification('Logged out successfully.', 'success');
            checkAuthStatus();
            window.location.href = 'index.html';
        });
    }

    // Event: Open Booking Modal (Check Auth First!)
    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token) {
                showNotification('Please login to book an appointment.', 'error');
                openModal(loginModal);
                return;
            }

            if (user && (user.role === 'admin' || user.role === 'staff')) {
                window.location.href = user.role === 'admin' ? 'admin.html' : 'staff.html';
            } else {
                openModal(bookingModal);
            }
        });
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
    });

    // Close modal when clicking outside
    [bookingModal, loginModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal);
            });
        }
    });

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            [bookingModal, loginModal].forEach(modal => closeModal(modal));
        }
    });

    // Service overlay book buttons
    document.querySelectorAll('.service-overlay .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            bookBtn.click();
        });
    });

    // ===== Forms (API Integration) =====
    function initForms() {
        
        // Toggle Login/Register Forms
        const showRegister = document.getElementById('show-register');
        const showLogin = document.getElementById('show-login');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (showRegister && loginForm && registerForm) {
            showRegister.addEventListener('click', () => {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            });
        }

        if (showLogin && loginForm && registerForm) {
            showLogin.addEventListener('click', () => {
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';
            });
        }

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
        if (registerForm) {
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
                    document.getElementById('show-login')?.click();
                    const loginEmail = document.getElementById('login-email');
                    if (loginEmail) loginEmail.value = data.email;
                }

                btn.disabled = false;
                btn.textContent = "Register";
            });
        }

        // 2. Login Form
        if (loginForm) {
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
                        checkAuthStatus();
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
        }

        // 3. Booking Form (Requires Auth)
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
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
                    userId: user ? user.id : null
                };

                const result = await postData('/api/bookings', data, 'Booking confirmed!', true);
                if (result.success) {
                    closeModal(bookingModal);
                    this.reset();
                }
            });
        }

        // 4. Contact Form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
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
        }

        // 5. Newsletter
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                const email = this.querySelector('input[type="email"]').value;
                const success = await postData('/api/newsletter', { email }, 'Subscribed successfully!');
                if (success) this.reset();
            });
        }
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

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // WhatsApp buttons
    document.querySelectorAll('.btn-whatsapp').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // You can add tracking or analytics here if needed
            console.log('WhatsApp button clicked');
        });
    });

    // Location/directions buttons
    document.querySelectorAll('a[href*="maps.google.com"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            console.log('Directions clicked');
        });
    });

    // Notification System
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            info: '#2196F3'
        };
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };

        notification.style.cssText = `
            position: fixed; 
            top: 100px; 
            right: 20px; 
            background: ${colors[type]}; 
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
                <i class="fas fa-${icons[type]}"></i>
                <span>${message}</span>
            </div>
            <button style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;margin-left:10px">&times;</button>
        `;

        document.body.appendChild(notification);

        const closeBtn = notification.querySelector('button');
        closeBtn.addEventListener('click', () => notification.remove());

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Add slideOut animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
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
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        // Observe all animated elements
        const elementsToObserve = document.querySelectorAll(
            '.feature-card, .service-card, .product-card, .gift-card, ' +
            '.category-card, .prop-item, .about-image, .about-content, ' +
            '.contact-info, .contact-form-wrapper'
        );

        elementsToObserve.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
});