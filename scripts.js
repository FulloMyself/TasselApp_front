// ===============================================
// TASSEL HAIR & BEAUTY STUDIO - SCRIPTS
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Loading Screen =====
    const loadingScreen = document.getElementById('loading-screen');
    
    window.addEventListener('load', function() {
        setTimeout(function() {
            loadingScreen.classList.add('hidden');
        }, 1500);
    });
    
    // ===== Header Scroll Effect =====
    const header = document.getElementById('main-header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // ===== Mobile Navigation Toggle =====
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    mobileToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        this.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
        });
    });
    
    // ===== Smooth Scroll for Navigation Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ===== Active Navigation Link =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function setActiveNavLink() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', setActiveNavLink);
    
    // ===== Hero Slider =====
    class HeroSlider {
        constructor() {
            this.slides = document.querySelectorAll('.hero-slide');
            this.prevBtn = document.querySelector('.hero-prev');
            this.nextBtn = document.querySelector('.hero-next');
            this.dotsContainer = document.querySelector('.hero-dots');
            this.currentSlide = 0;
            this.autoPlayInterval = null;
            
            this.init();
        }
        
        init() {
            if (this.slides.length === 0) return;
            
            // Create dots
            this.createDots();
            
            // Event listeners
            this.prevBtn.addEventListener('click', () => this.prevSlide());
            this.nextBtn.addEventListener('click', () => this.nextSlide());
            
            // Auto play
            this.startAutoPlay();
            
            // Pause on hover
            const heroSlider = document.querySelector('.hero-slider');
            heroSlider.addEventListener('mouseenter', () => this.stopAutoPlay());
            heroSlider.addEventListener('mouseleave', () => this.startAutoPlay());
        }
        
        createDots() {
            this.slides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('hero-dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => this.goToSlide(index));
                this.dotsContainer.appendChild(dot);
            });
        }
        
        goToSlide(index) {
            this.slides[this.currentSlide].classList.remove('active');
            document.querySelectorAll('.hero-dot')[this.currentSlide].classList.remove('active');
            
            this.currentSlide = index;
            
            this.slides[this.currentSlide].classList.add('active');
            document.querySelectorAll('.hero-dot')[this.currentSlide].classList.add('active');
        }
        
        nextSlide() {
            const next = (this.currentSlide + 1) % this.slides.length;
            this.goToSlide(next);
        }
        
        prevSlide() {
            const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
            this.goToSlide(prev);
        }
        
        startAutoPlay() {
            this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
        }
        
        stopAutoPlay() {
            clearInterval(this.autoPlayInterval);
        }
    }
    
    new HeroSlider();
    
    // ===== Service Tabs =====
    const serviceTabs = document.querySelectorAll('.service-tab');
    const serviceCategories = document.querySelectorAll('.service-category');
    
    serviceTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Remove active class from all tabs
            serviceTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all categories
            serviceCategories.forEach(c => c.classList.remove('active'));
            
            // Show selected category
            const selectedCategory = document.querySelector(`.service-category[data-category="${category}"]`);
            if (selectedCategory) {
                selectedCategory.classList.add('active');
            }
        });
    });
    
    // ===== Gallery Filter =====
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // ===== Gallery Lightbox =====
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    let currentImageIndex = 0;
    const visibleImages = [];
    
    function updateVisibleImages() {
        visibleImages.length = 0;
        galleryItems.forEach((item, index) => {
            if (item.style.display !== 'none') {
                visibleImages.push({
                    src: item.querySelector('img').src,
                    caption: item.querySelector('.gallery-overlay h4').textContent,
                    index: index
                });
            }
        });
    }
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            updateVisibleImages();
            const imageIndex = visibleImages.findIndex(img => img.index === index);
            if (imageIndex !== -1) {
                currentImageIndex = imageIndex;
                showLightbox();
            }
        });
    });
    
    function showLightbox() {
        const currentImage = visibleImages[currentImageIndex];
        lightboxImage.src = currentImage.src;
        lightboxCaption.textContent = currentImage.caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function hideLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    lightboxClose.addEventListener('click', hideLightbox);
    
    lightboxPrev.addEventListener('click', function() {
        currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
        showLightbox();
    });
    
    lightboxNext.addEventListener('click', function() {
        currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
        showLightbox();
    });
    
    // Close lightbox on background click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            hideLightbox();
        }
    });
    
    // Close lightbox on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            hideLightbox();
        }
        if (lightbox.classList.contains('active')) {
            if (e.key === 'ArrowLeft') lightboxPrev.click();
            if (e.key === 'ArrowRight') lightboxNext.click();
        }
    });
    
    // ===== Testimonials Slider =====
    class TestimonialSlider {
        constructor() {
            this.cards = document.querySelectorAll('.testimonial-card');
            this.prevBtn = document.querySelector('.testimonial-prev');
            this.nextBtn = document.querySelector('.testimonial-next');
            this.dotsContainer = document.querySelector('.testimonial-dots');
            this.currentIndex = 0;
            this.autoPlayInterval = null;
            
            this.init();
        }
        
        init() {
            if (this.cards.length === 0) return;
            
            // Create dots
            this.createDots();
            
            // Event listeners
            this.prevBtn.addEventListener('click', () => this.prev());
            this.nextBtn.addEventListener('click', () => this.next());
            
            // Auto play
            this.startAutoPlay();
        }
        
        createDots() {
            this.cards.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('testimonial-dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => this.goTo(index));
                this.dotsContainer.appendChild(dot);
            });
        }
        
        goTo(index) {
            this.cards[this.currentIndex].classList.remove('active');
            document.querySelectorAll('.testimonial-dot')[this.currentIndex].classList.remove('active');
            
            this.currentIndex = index;
            
            this.cards[this.currentIndex].classList.add('active');
            document.querySelectorAll('.testimonial-dot')[this.currentIndex].classList.add('active');
        }
        
        next() {
            const nextIndex = (this.currentIndex + 1) % this.cards.length;
            this.goTo(nextIndex);
        }
        
        prev() {
            const prevIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
            this.goTo(prevIndex);
        }
        
        startAutoPlay() {
            this.autoPlayInterval = setInterval(() => this.next(), 6000);
        }
        
        stopAutoPlay() {
            clearInterval(this.autoPlayInterval);
        }
    }
    
    new TestimonialSlider();
    
    // ===== Back to Top Button =====
    const backToTopBtn = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // ===== Modal Functions =====
    const bookingModal = document.getElementById('booking-modal');
    const loginModal = document.getElementById('login-modal');
    const bookBtn = document.getElementById('book-btn');
    const loginBtn = document.getElementById('login-btn');
    const modalCloses = document.querySelectorAll('.modal-close');
    
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Open booking modal
    bookBtn.addEventListener('click', () => openModal(bookingModal));
    
    // Open login modal
    loginBtn.addEventListener('click', () => openModal(loginModal));
    
    // Add event listeners to all "Book Now" buttons
    document.querySelectorAll('.btn-primary:not(#book-btn)').forEach(btn => {
        if (btn.textContent.includes('Book')) {
            btn.addEventListener('click', () => openModal(bookingModal));
        }
    });
    
    // Close modals
    modalCloses.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal on background click
    [bookingModal, loginModal].forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (bookingModal.classList.contains('active')) closeModal(bookingModal);
            if (loginModal.classList.contains('active')) closeModal(loginModal);
        }
    });
    
    // ===== Form Submissions =====
    
    // Contact Form
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: this.querySelector('#name').value,
            email: this.querySelector('#email').value,
            phone: this.querySelector('#phone').value,
            subject: this.querySelector('#subject').value,
            message: this.querySelector('#message').value
        };
        
        console.log('Contact Form Submitted:', formData);
        
        // Show success message
        showNotification('Thank you for your message! We will get back to you soon.', 'success');
        
        // Reset form
        this.reset();
        
        // In production, send data to server
        // fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
    });
    
    // Booking Form
    const bookingForm = document.getElementById('booking-form');
    
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: this.querySelector('#booking-name').value,
            email: this.querySelector('#booking-email').value,
            phone: this.querySelector('#booking-phone').value,
            service: this.querySelector('#booking-service').value,
            date: this.querySelector('#booking-date').value,
            time: this.querySelector('#booking-time').value,
            notes: this.querySelector('#booking-notes').value
        };
        
        console.log('Booking Form Submitted:', formData);
        
        // Show success message
        showNotification('Booking request received! We will confirm your appointment shortly.', 'success');
        
        // Close modal
        closeModal(bookingModal);
        
        // Reset form
        this.reset();
        
        // In production, send data to server
        // fetch('/api/bookings', { method: 'POST', body: JSON.stringify(formData) })
    });
    
    // Login Form
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            email: this.querySelector('#login-email').value,
            password: this.querySelector('#login-password').value,
            rememberMe: this.querySelector('#remember-me').checked
        };
        
        console.log('Login Form Submitted:', formData);
        
        // Show loading
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Show success message
            showNotification('Welcome back! Redirecting to your dashboard...', 'success');
            
            // Close modal
            closeModal(loginModal);
            
            // Reset form
            this.reset();
            
            // In production, send data to server
            // fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(formData) })
        }, 1500);
    });
    
    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        
        console.log('Newsletter Subscription:', email);
        
        // Show success message
        showNotification('Thank you for subscribing to our newsletter!', 'success');
        
        // Reset form
        this.reset();
        
        // In production, send data to server
        // fetch('/api/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) })
    });
    
    // ===== Gift Voucher Amount Selection =====
    const voucherBtns = document.querySelectorAll('.voucher-btn');
    const voucherInput = document.querySelector('.voucher-input');
    
    voucherBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            voucherBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const amount = this.getAttribute('data-amount');
            if (amount === 'custom') {
                voucherInput.style.display = 'block';
                voucherInput.focus();
            } else {
                voucherInput.style.display = 'none';
            }
        });
    });
    
    // ===== Product Actions =====
    const productBtns = document.querySelectorAll('.product-btn');
    
    productBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const icon = this.querySelector('i');
            const action = icon.classList.contains('fa-heart') ? 'wishlist' :
                          icon.classList.contains('fa-eye') ? 'quickview' : 'cart';
            
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            
            if (action === 'wishlist') {
                icon.classList.toggle('fas');
                icon.classList.toggle('far');
                const message = icon.classList.contains('fas') ? 
                    `${productName} added to wishlist!` : 
                    `${productName} removed from wishlist!`;
                showNotification(message, 'success');
            } else if (action === 'cart') {
                showNotification(`${productName} added to cart!`, 'success');
            } else {
                // Quick view would open a modal with product details
                console.log('Quick view:', productName);
            }
        });
    });
    
    // ===== Date and Time Validation for Booking =====
    const bookingDate = document.getElementById('booking-date');
    const bookingTime = document.getElementById('booking-time');
    
    if (bookingDate) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        bookingDate.setAttribute('min', today);
        
        // Set maximum date to 3 months from now
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        bookingDate.setAttribute('max', maxDate.toISOString().split('T')[0]);
    }
    
    if (bookingTime) {
        // Set business hours
        bookingTime.setAttribute('min', '09:00');
        bookingTime.setAttribute('max', '18:00');
    }
    
    // ===== Notification System =====
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Add notification animations to stylesheet dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .notification-content i {
            font-size: 1.25rem;
        }
    `;
    document.head.appendChild(style);
    
    // ===== Animate on Scroll =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements
    const animateElements = document.querySelectorAll('.feature-card, .service-card, .product-card, .gift-card, .testimonial-card');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // ===== Lazy Loading Images =====
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // ===== Initialize Tooltips (if needed) =====
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                font-size: 0.85rem;
                pointer-events: none;
                z-index: 9999;
                white-space: nowrap;
            `;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
            
            this._tooltip = tooltip;
        });
        
        el.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                delete this._tooltip;
            }
        });
    });
    
    // ===== Form Input Animations =====
    const formInputs = document.querySelectorAll('input, textarea, select');
    
    formInputs.forEach(input => {
        // Add focus/blur effects
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Check if input has value on load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
    
    // ===== Prevent Form Resubmission =====
    window.addEventListener('beforeunload', function(e) {
        const forms = document.querySelectorAll('form');
        let hasChanges = false;
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (input.value && input.type !== 'hidden') {
                    hasChanges = true;
                }
            });
        });
        
        // Note: Modern browsers may ignore custom messages
        if (hasChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
    
    // ===== Console Welcome Message =====
    console.log('%c🌸 Welcome to Tassel Hair & Beauty Studio! 🌸', 'font-size: 20px; color: #E8B4C8; font-weight: bold;');
    console.log('%cWebsite developed with ❤️ for Tassel', 'font-size: 14px; color: #6B5D52;');
    console.log('%cIf you\'re seeing this, you must be curious about how things work! 😊', 'font-size: 12px; color: #4A4139;');
    
    // ===== Debug Mode (for development) =====
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('%c🔧 Debug Mode Active', 'background: #222; color: #FFB800; padding: 5px 10px; border-radius: 3px;');
        
        // Add debug info
        window.debugInfo = {
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            scroll: {
                x: window.pageXOffset,
                y: window.pageYOffset
            },
            userAgent: navigator.userAgent
        };
        
        console.table(window.debugInfo);
    }
    
    // ===== Performance Monitoring =====
    window.addEventListener('load', function() {
        if (window.performance) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`⚡ Page Load Time: ${pageLoadTime}ms`);
        }
    });
    
});

// ===== Service Worker Registration (for PWA) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when service worker is ready
        /*
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
        */
    });
}

// ===== Utility Functions =====

// Format currency
function formatCurrency(amount) {
    return 'R' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-ZA', options);
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone (South African format)
function validatePhone(phone) {
    const re = /^(\+27|0)[6-8][0-9]{8}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export functions for use in other modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatDate,
        validateEmail,
        validatePhone,
        debounce,
        throttle
    };
}
