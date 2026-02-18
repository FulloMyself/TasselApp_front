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

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Role Verification
    if (path.includes('admin') && user.role !== 'admin') {
        alert('Access Denied: Admins Only');
        window.location.href = 'customer.html';
    }
    if (path.includes('staff') && (user.role !== 'staff' && user.role !== 'admin')) {
        alert('Access Denied: Staff Only');
        window.location.href = 'customer.html';
    }

    // Set User Name
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

    // Fetch Bookings for Table
    const tableBody = document.getElementById('appointments-table');
    
    if (tableBody) {
        try {
            const res = await fetch(`${API_URL}/api/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const bookings = await res.json();

            if (res.ok) {
                if (bookings.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center">No bookings found</td></tr>';
                } else {
                    tableBody.innerHTML = bookings.map(b => `
                        <tr>
                            <td style="padding:10px; border-bottom:1px solid #eee;">${b.name}</td>
                            <td>${b.service}</td>
                            <td>${new Date(b.date).toLocaleDateString()} ${b.time}</td>
                            <td><span style="color:${b.status === 'confirmed' ? 'green' : 'orange'}">${b.status}</span></td>
                        </tr>
                    `).join('');
                }

                // Update Stats (Mock calculation for now)
                if (document.getElementById('stat-bookings')) {
                    document.getElementById('stat-bookings').textContent = bookings.length;
                }
            } else {
                tableBody.innerHTML = '<tr><td colspan="4">Failed to load data</td></tr>';
            }
        } catch (err) {
            console.error("Failed to load dashboard data", err);
            tableBody.innerHTML = '<tr><td colspan="4">Network Error</td></tr>';
        }
    }
}
