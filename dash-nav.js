// dash-nav.js - Unified navigation for all dashboards

// Navigation configuration based on user role
const navigationConfig = {
    customer: {
        sections: [
            {
                title: 'MAIN',
                items: [
                    { icon: 'fa-home', text: 'Dashboard', section: 'dashboard', active: true },
                    { icon: 'fa-calendar-alt', text: 'My Bookings', section: 'bookings' },
                    { icon: 'fa-heart', text: 'Favourites', section: 'favourites' },
                    { icon: 'fa-gift', text: 'Rewards', section: 'rewards' }
                ]
            },
            {
                title: 'SHOPPING',
                items: [
                    { icon: 'fa-shopping-bag', text: 'Shop', href: 'shop.html' },
                    { icon: 'fa-shopping-cart', text: 'Cart', href: '#', onclick: 'openCart()' }
                ]
            },
            {
                title: 'ACCOUNT',
                items: [
                    { icon: 'fa-user-circle', text: 'My Profile', onclick: 'openProfileModal()' },
                    { icon: 'fa-sign-out-alt', text: 'Logout', id: 'logout-btn' }
                ]
            }
        ]
    },
    staff: {
        sections: [
            {
                title: 'MAIN',
                items: [
                    { icon: 'fa-tachometer-alt', text: 'Dashboard', section: 'dashboard', active: true },
                    { icon: 'fa-calendar-alt', text: 'My Schedule', section: 'schedule' },
                    { icon: 'fa-clock', text: 'Appointments', section: 'appointments' },
                    { icon: 'fa-plane-departure', text: 'Request Leave', section: 'leave' }
                ]
            },
            {
                title: 'SHOPPING',
                items: [
                    { icon: 'fa-shopping-bag', text: 'Shop', href: 'shop.html' }
                ]
            },
            {
                title: 'ACCOUNT',
                items: [
                    { icon: 'fa-user-circle', text: 'My Profile', onclick: 'openProfileModal()' },
                    { icon: 'fa-sign-out-alt', text: 'Logout', id: 'logout-btn' }
                ]
            }
        ]
    },
    admin: {
        sections: [
            {
                title: 'MAIN',
                items: [
                    { icon: 'fa-tachometer-alt', text: 'Dashboard', section: 'dashboard', active: true },
                    { icon: 'fa-chart-line', text: 'Analytics', section: 'analytics' }
                ]
            },
            {
                title: 'OPERATIONS',
                items: [
                    { icon: 'fa-calendar-check', text: 'Bookings', section: 'bookings' },
                    { icon: 'fa-clock', text: 'Staff Schedule', section: 'schedule' },
                    { icon: 'fa-plane-departure', text: 'Leave Requests', section: 'staff-leave' }
                ]
            },
            {
                title: 'MANAGEMENT',
                items: [
                    { icon: 'fa-users', text: 'Users', section: 'users' },
                    { icon: 'fa-user-tie', text: 'Staff', section: 'staff-management' },
                    { icon: 'fa-cut', text: 'Services', section: 'services' },
                    { icon: 'fa-box', text: 'Products', section: 'products' },
                    { icon: 'fa-ticket-alt', text: 'Vouchers', section: 'vouchers' }
                ]
            },
            {
                title: 'SHOPPING',
                items: [
                    { icon: 'fa-shopping-bag', text: 'Shop', href: 'shop.html' }
                ]
            },
            {
                title: 'ACCOUNT',
                items: [
                    { icon: 'fa-user-circle', text: 'My Profile', onclick: 'openProfileModal()' },
                    { icon: 'fa-sign-out-alt', text: 'Logout', id: 'logout-btn' }
                ]
            }
        ]
    }
};

// Function to render navigation
function renderNavigation(role) {
    const config = navigationConfig[role] || navigationConfig.customer;
    const navElement = document.querySelector('.dash-nav');
    if (!navElement) return;

    let html = '';
    config.sections.forEach(section => {
        html += `<div class="nav-section">${section.title}</div>`;
        section.items.forEach(item => {
            const activeClass = item.active ? 'active' : '';
            if (item.href) {
                html += `<li><a href="${item.href}" class="${activeClass}"><i class="fas ${item.icon}"></i> <span>${item.text}</span></a></li>`;
            } else if (item.onclick) {
                html += `<li><a href="#" onclick="${item.onclick}" class="${activeClass}"><i class="fas ${item.icon}"></i> <span>${item.text}</span></a></li>`;
            } else if (item.section) {
                html += `<li><a href="#" onclick="showSection('${item.section}')" class="${activeClass}"><i class="fas ${item.icon}"></i> <span>${item.text}</span></a></li>`;
            } else if (item.id) {
                html += `<li><a href="#" id="${item.id}" class="${activeClass}"><i class="fas ${item.icon}"></i> <span>${item.text}</span></a></li>`;
            }
        });
    });

    navElement.innerHTML = html;
}

// Function to open cart
window.openCart = function() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.add('open');
    } else {
        // If cart sidebar doesn't exist on this page, redirect to shop
        window.location.href = 'shop.html';
    }
};

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        renderNavigation(user.role);
    }
});