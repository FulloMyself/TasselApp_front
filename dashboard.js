// front/dashboard.js

const API_URL = 'https://tasselapp-back.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initLogout();
    loadDashboardData();
});

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const path = window.location.pathname;

    // 1. If no token, redirect to login immediately
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Role Verification (Simple Frontend Check)
    // Prevent Customers accessing Admin pages
    if (path.includes('admin') && user.role !== 'admin') {
        alert('Access Denied');
        window.location.href = 'customer.html';
    }
    // Prevent Admins forced into Customer pages (optional, admins usually have access to everything)
    if (path.includes('staff') && (user.role !== 'staff' && user.role !== 'admin')) {
        alert('Access Denied');
        window.location.href = 'customer.html';
    }

    // Set User Name in Header
    const userNameEl = document.getElementById('user-name');
    if (userNameEl && user) userNameEl.textContent = user.name;
}

function initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
}

async function loadDashboardData() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // Example: Load Stats for Admin
    if (user && user.role === 'admin' && document.getElementById('stat-bookings')) {
        try {
            // Fetch admin stats from backend
            // const res = await fetch(`${API_URL}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` }});
            // const data = await res.json();
            
            // Mock Data for now
            document.getElementById('stat-bookings').textContent = '12';
            document.getElementById('stat-revenue').textContent = 'R5,200';
            
            // Load Table
            const tableBody = document.getElementById('appointments-table');
            if(tableBody) {
                // In production: map data from API
                tableBody.innerHTML = `
                    <tr><td style="padding:10px; border-bottom:1px solid #eee;">Thandiwe M.</td><td>Box Braids</td><td>10:00 AM</td><td><span style="color:green">Confirmed</span></td></tr>
                    <tr><td style="padding:10px; border-bottom:1px solid #eee;">Lerato D.</td><td>Massage</td><td>12:30 PM</td><td><span style="color:orange">Pending</span></td></tr>
                `;
            }

        } catch (err) {
            console.error("Failed to load dashboard data", err);
        }
    }
}
