// front/dashboard.js
const API_URL = 'https://tasselapp-back.onrender.com';

// Global store
let productsData = [];
let vouchersData = [];
let servicesData = [];
let bookingsData = [];
let staffData = [];
let transactionsData = [];
let notificationsData = [];
let scheduleData = [];
let revenueChart, bookingPieChart, popularServicesChart, staffPerformanceChart, peakHoursChart;

document.addEventListener('DOMContentLoaded', () => {
    try {
        checkAuth();
        initLogout();
        initProfile();
        initPageLogic();
        initDateTime();
        initNotifications();
        initDataTables();
    } catch (e) {
        console.error("Initialization Error:", e);
        alert("Critical Error: " + e.message);
    }
});

// == AUTH & CORE ==
function checkAuth() {
    try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const path = window.location.pathname;

        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        const user = userStr ? JSON.parse(userStr) : null;
        if (!user) {
            localStorage.clear();
            window.location.href = 'index.html';
            return;
        }

        if (path.includes('admin') && user.role !== 'admin') {
            alert('Access Denied');
            window.location.href = 'customer.html';
        }
        if (path.includes('staff') && (user.role !== 'staff' && user.role !== 'admin')) {
            alert('Access Denied');
            window.location.href = 'customer.html';
        }

        const userNameEl = document.getElementById('user-name');
        if (userNameEl && user) {
            userNameEl.textContent = user.name;
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            const userInitials = document.getElementById('user-initials');
            if (userInitials) userInitials.textContent = initials;
        }
    } catch (e) {
        console.error("Auth Check Failed", e);
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

function initLogout() {
    const btn = document.getElementById('logout-btn');
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
}

function initDateTime() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-ZA', options);
    }
}

// == API HELPERS ==
async function getData(endpoint) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        return res.ok ? data : [];
    } catch (err) {
        console.error('API Error:', err);
        return [];
    }
}

async function postData(endpoint, data) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res;
    } catch (err) {
        console.error('POST Error:', err);
        throw err;
    }
}

async function putData(endpoint, data) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res;
    } catch (err) {
        console.error('PUT Error:', err);
        throw err;
    }
}

async function deleteData(endpoint) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res;
    } catch (err) {
        console.error('DELETE Error:', err);
        throw err;
    }
}

// == NOTIFICATIONS ==
function initNotifications() {
    const notifBell = document.querySelector('.notification-badge');
    if (notifBell) {
        notifBell.addEventListener('click', showNotifications);
        loadNotifications();
        setInterval(loadNotifications, 30000);
    }
}

async function loadNotifications() {
    const notifications = await getData('/api/notifications');
    notificationsData = notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const countBadge = document.getElementById('notification-count');
    if (countBadge) {
        countBadge.textContent = unreadCount;
        countBadge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

function showNotifications() {
    let notifHtml = '<div class="notifications-dropdown" style="position:absolute; top:100%; right:0; background:white; box-shadow:0 5px 15px rgba(0,0,0,0.2); border-radius:8px; width:300px; z-index:1000;">';
    notifHtml += '<h4 style="padding:1rem; margin:0; border-bottom:1px solid #eee;">Notifications</h4>';

    if (notificationsData.length === 0) {
        notifHtml += '<p style="padding:1rem; text-align:center;">No notifications</p>';
    } else {
        notificationsData.slice(0, 5).forEach(n => {
            notifHtml += `
                <div class="notification-item ${n.isRead ? '' : 'unread'}" onclick="markNotificationRead('${n._id}')" style="padding:1rem; border-bottom:1px solid #eee; cursor:pointer; ${!n.isRead ? 'background:#f0f7ff;' : ''}">
                    <strong style="display:block; margin-bottom:0.25rem;">${n.title}</strong>
                    <p style="margin:0 0 0.25rem; font-size:0.9rem; color:#666;">${n.message}</p>
                    <small style="color:#999;">${new Date(n.createdAt).toLocaleString()}</small>
                </div>
            `;
        });
    }
    notifHtml += '</div>';

    const existing = document.querySelector('.notifications-dropdown');
    if (existing) {
        existing.remove();
    } else {
        const div = document.createElement('div');
        div.innerHTML = notifHtml;
        document.querySelector('.notification-badge').style.position = 'relative';
        document.querySelector('.notification-badge').appendChild(div.firstChild);
    }
}

async function markNotificationRead(id) {
    await putData(`/api/notifications/${id}`, { isRead: true });
    loadNotifications();
    document.querySelector('.notifications-dropdown')?.remove();
}

// == PROFILE LOGIC ==
function initProfile() {
    const form = document.getElementById('profile-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('profile-name').value;
            const email = document.getElementById('profile-email').value;
            const pass = document.getElementById('profile-pass').value;
            const passConfirm = document.getElementById('profile-pass-confirm').value;

            if (pass && pass !== passConfirm) return alert('Passwords do not match!');

            const updateData = { name, email };
            if (pass) updateData.password = pass;

            try {
                const res = await putData('/api/users/me', updateData);
                const data = await res.json();
                if (res.ok) {
                    alert('Profile updated successfully!');
                    localStorage.setItem('user', JSON.stringify(data.user));
                    document.getElementById('user-name').textContent = data.user.name;
                    closeProfileModal();
                } else {
                    alert(data.error || 'Update failed');
                }
            } catch (err) {
                alert('Network error');
            }
        });
    }
}

window.openProfileModal = function () {
    try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user) {
            alert('Please login again.');
            return;
        }

        document.getElementById('profile-name').value = user.name || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-pass').value = '';
        document.getElementById('profile-pass-confirm').value = '';
        document.getElementById('profile-modal').classList.add('active');
    } catch (e) {
        console.error('Error opening profile modal:', e);
        alert("Error opening profile: " + e.message);
    }
};

window.closeProfileModal = function () {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.remove('active');
};

// == PAGE LOGIC ROUTER ==
function initPageLogic() {
    const path = window.location.pathname;
    if (path.includes('admin')) initAdmin();
    if (path.includes('staff')) initStaff();
    if (path.includes('customer')) initCustomer();
}

function initDataTables() {
    if (typeof $.fn !== 'undefined' && $.fn.DataTable) {
        $.extend($.fn.dataTable.defaults, {
            pageLength: 25,
            language: {
                search: "Search:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "→",
                    previous: "←"
                }
            }
        });
    }
}

// == ADMIN LOGIC ==
async function initAdmin() {
    window.showSection = async (sectionId) => {
        document.querySelectorAll('main > section').forEach(el => el.style.display = 'none');
        const section = document.getElementById(`sec-${sectionId}`);
        if (section) section.style.display = 'block';

        const titles = {
            'dashboard': 'Dashboard',
            'analytics': 'Business Analytics',
            'bookings': 'Booking Management',
            'schedule': 'Staff Schedule',
            'staff-leave': 'Leave Requests',
            'reports': 'Financial Reports',
            'transactions': 'Transaction History',
            'users': 'User Management',
            'staff-management': 'Staff Management',
            'services': 'Service Management',
            'products': 'Product Inventory',
            'vouchers': 'Voucher Management'
        };
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = titles[sectionId] || 'Dashboard';

        switch (sectionId) {
            case 'dashboard':
                await loadDashboardData();
                break;
            case 'analytics':
                await loadAnalyticsData();
                break;
            case 'bookings':
                await loadAllBookings();
                break;
            case 'schedule':
                await loadStaffSchedule();
                break;
            case 'staff-leave':
                await loadLeaveRequests();
                break;
            case 'reports':
                await loadFinancialReports('month');
                break;
            case 'transactions':
                await loadTransactions();
                break;
            case 'users':
                await loadUsers();
                break;
            case 'staff-management':
                await loadStaffList();
                break;
            case 'services':
                await loadServices();
                break;
            case 'products':
                await loadProducts();
                break;
            case 'vouchers':
                await loadVouchers();
                break;
        }
    };

    const adminForm = document.getElementById('admin-form');
    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = e.target.dataset.type;
            const id = e.target.dataset.id;
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            console.log('Form submission:', { type, id, data });

            if (type === 'product') {
                data.price = parseFloat(data.price);
                data.stock = parseInt(data.stock) || 0;
            } else if (type === 'voucher') {
                data.discount = parseFloat(data.discount);
                data.isActive = data.isActive === 'on';
                if (!data.discountType) {
                    data.discountType = 'fixed';
                }
                console.log('Processed voucher data:', data);
            } else if (type === 'service') {
                const items = [];
                let index = 0;

                while (document.getElementsByName(`item_name_${index}`).length > 0) {
                    const name = document.getElementsByName(`item_name_${index}`)[0]?.value;
                    const duration = document.getElementsByName(`item_duration_${index}`)[0]?.value;
                    const price = parseFloat(document.getElementsByName(`item_price_${index}`)[0]?.value);
                    const description = document.getElementsByName(`item_description_${index}`)[0]?.value;

                    if (name && !isNaN(price)) {
                        items.push({
                            name: name,
                            duration: duration || '',
                            price: price,
                            description: description || ''
                        });
                    }
                    index++;
                }

                data.items = items;
                data.isActive = data.isActive === 'on';
                data.order = parseInt(data.order) || 0;
                console.log('Processed service data:', data);
            }

            try {
                let res;
                let url;

                if (type === 'product') {
                    url = id ? `/api/products/${id}` : '/api/products';
                    res = id ? await putData(url, data) : await postData(url, data);
                } else if (type === 'voucher') {
                    url = id ? `/api/vouchers/${id}` : '/api/vouchers';
                    console.log('Sending voucher request to:', url);
                    res = id ? await putData(url, data) : await postData(url, data);
                } else if (type === 'service') {
                    url = id ? `/api/services/${id}` : '/api/services';
                    console.log('Sending service request to:', url);
                    res = id ? await putData(url, data) : await postData(url, data);
                }

                if (res && res.ok) {
                    closeAdminModal();
                    if (type === 'product') {
                        await loadProducts();
                    } else if (type === 'voucher') {
                        await loadVouchers();
                    } else if (type === 'service') {
                        await loadServices();
                    }
                    alert(`${type} saved successfully!`);
                } else {
                    const errorText = await res.text();
                    console.error('Error response:', errorText);
                    try {
                        const err = JSON.parse(errorText);
                        alert(err.error || 'Operation failed');
                    } catch {
                        alert('Operation failed: ' + errorText);
                    }
                }
            } catch (err) {
                console.error('Form submission error:', err);
                alert('Network Error: ' + err.message);
            }
        });
    }

    await loadDashboardData();
}

// == DASHBOARD DATA ==
async function loadDashboardData() {
    await Promise.all([
        loadKPIs(),
        loadTodaySchedule(),
        loadRecentActivity(),
        loadRevenueChart('week'),
        loadBookingDistribution()
    ]);
}

async function loadKPIs() {
    const stats = await getData('/api/stats/detailed');
    const kpiGrid = document.getElementById('kpi-cards');
    if (!kpiGrid) return;

    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookingsData.filter(b =>
        b.date && new Date(b.date).toISOString().split('T')[0] === today
    ).length;

    kpiGrid.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-icon" style="background:#E8B4C8;">
                <i class="fas fa-calendar-check"></i>
            </div>
            <div class="kpi-info">
                <h3>Today's Bookings</h3>
                <div class="kpi-main">
                    <p>${todayBookings || stats.todayBookings || 0}</p>
                    <span class="kpi-trend">${stats.bookingTrend || 0}%</span>
                </div>
                <p class="kpi-sub">${stats.pendingBookings || 0} pending</p>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon" style="background:#6B5D52;">
                <i class="fas fa-users"></i>
            </div>
            <div class="kpi-info">
                <h3>Total Customers</h3>
                <div class="kpi-main">
                    <p>${stats.totalCustomers || 0}</p>
                    <span class="kpi-trend">+${stats.newCustomers || 0} new</span>
                </div>
                <p class="kpi-sub">${stats.activeToday || 0} active today</p>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon" style="background:#4CAF50;">
                <i class="fas fa-currency-rand"></i>
            </div>
            <div class="kpi-info">
                <h3>Today's Revenue</h3>
                <div class="kpi-main">
                    <p>R${stats.todayRevenue?.toFixed(2) || '0.00'}</p>
                    <span class="kpi-trend">${stats.revenueTrend || 0}%</span>
                </div>
                <p class="kpi-sub">R${stats.weeklyRevenue?.toFixed(2) || '0.00'} this week</p>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon" style="background:#FF9800;">
                <i class="fas fa-clock"></i>
            </div>
            <div class="kpi-info">
                <h3>Staff on Duty</h3>
                <div class="kpi-main">
                    <p>${stats.staffOnDuty || 0}</p>
                    <span class="kpi-trend">${stats.staffAvailable || 0} available</span>
                </div>
                <p class="kpi-sub">${stats.staffOnBreak || 0} on break</p>
            </div>
        </div>
    `;
}

async function loadTodaySchedule() {
    const today = new Date().toISOString().split('T')[0];
    const bookings = await getData(`/api/bookings/date/${today}`);
    const tbody = document.getElementById('today-schedule-body');
    if (!tbody) return;

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No appointments scheduled for today</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(b => {
        const staffName = b.staffId ? (b.staffId.name || 'Assigned') : 'Unassigned';
        const statusClass = `status-${b.status || 'pending'}`;
        const paymentClass = `payment-${b.paymentStatus || 'unpaid'}`;

        return `
            <tr>
                <td>${b.time || 'TBD'}</td>
                <td>${b.name || 'N/A'}</td>
                <td>${b.service || 'N/A'}</td>
                <td>
                    <span class="staff-badge" onclick="openStaffAssignModal('${b._id}')" style="cursor:pointer; background:#E8B4C8; color:white; padding:0.25rem 0.75rem; border-radius:20px; display:inline-flex; align-items:center; gap:0.5rem;">
                        <i class="fas fa-user"></i> ${staffName}
                    </span>
                </td>
                <td>${b.duration || '1 hour'}</td>
                <td><span class="status-badge ${statusClass}">${b.status || 'pending'}</span></td>
                <td><span class="status-badge ${paymentClass}">${b.paymentStatus || 'unpaid'}</span></td>
                <td>
                    <button class="btn-sm btn-info" onclick="viewBooking('${b._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-sm btn-success" onclick="updateBookingStatus('${b._id}', 'confirmed')">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // get table element (prefer table id; fall back to parent table of tbody)
    const $table = $('#today-schedule').is('table') ? $('#today-schedule') : $('#today-schedule').closest('table');

    if ($.fn.DataTable && $table.length && todayBookings.length > 0) {
        if ($.fn.DataTable.isDataTable($table)) {
            $table.DataTable().destroy();
        }
        $table.DataTable({
            pageLength: 10,
            order: [[0, 'asc']],
            retrieve: true
        });
    }
}

async function loadRecentActivity() {
    const activities = await getData('/api/activities/recent');
    const feed = document.getElementById('activity-feed');
    if (!feed) return;

    feed.innerHTML = activities.map(a => `
        <div class="activity-item" style="padding:1rem; border-bottom:1px solid #eee; display:flex; align-items:center; gap:1rem;">
            <div class="activity-icon" style="width:40px; height:40px; border-radius:50%; background:${getActivityColor(a.type)}; display:flex; align-items:center; justify-content:center; color:white;">
                <i class="fas ${getActivityIcon(a.type)}"></i>
            </div>
            <div style="flex:1;">
                <strong>${a.title}</strong>
                <p style="margin:0.25rem 0 0; color:#666;">${a.description}</p>
                <small style="color:#999;">${timeAgo(a.createdAt)}</small>
            </div>
        </div>
    `).join('');
}

function getActivityColor(type) {
    const colors = {
        'booking': '#E8B4C8',
        'payment': '#4CAF50',
        'staff': '#2196F3',
        'customer': '#FF9800',
        'system': '#9C27B0'
    };
    return colors[type] || '#6B5D52';
}

function getActivityIcon(type) {
    const icons = {
        'booking': 'fa-calendar-plus',
        'payment': 'fa-credit-card',
        'staff': 'fa-user-clock',
        'customer': 'fa-user-plus',
        'system': 'fa-cog'
    };
    return icons[type] || 'fa-bell';
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval + ' ' + unit + (interval === 1 ? '' : 's') + ' ago';
        }
    }
    return 'just now';
}

// == CHARTS ==
async function loadRevenueChart(period) {
    const data = await getData(`/api/revenue/trend/${period}`);
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Revenue (R)',
                data: data.values || [1200, 1900, 3000, 2500, 4200, 3900, 4500],
                borderColor: '#E8B4C8',
                backgroundColor: 'rgba(232, 180, 200, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f0f0f0' } }
            }
        }
    });
}

async function loadBookingDistribution() {
    const data = await getData('/api/bookings/distribution');
    const ctx = document.getElementById('bookingPieChart')?.getContext('2d');
    if (!ctx) return;

    if (bookingPieChart) bookingPieChart.destroy();

    bookingPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Confirmed', 'Cancelled'],
            datasets: [{
                data: [
                    data.completed || 45,
                    data.pending || 20,
                    data.confirmed || 25,
                    data.cancelled || 10
                ],
                backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#F44336'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '60%'
        }
    });
}

window.changeRevenuePeriod = function (period) {
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadRevenueChart(period);
};

// == BOOKING MANAGEMENT ==
async function loadAllBookings() {
    bookingsData = await getData('/api/bookings/all');
    const tbody = document.getElementById('bookings-table-body');
    if (!tbody) return;

    await loadStaffList();

    tbody.innerHTML = bookingsData.map(b => {
        const staffName = b.staffId ? (b.staffId.name || 'Assigned') : 'Unassigned';
        const statusClass = `status-${b.status || 'pending'}`;
        const paymentClass = `payment-${b.paymentStatus || 'unpaid'}`;
        const date = b.date ? new Date(b.date).toLocaleDateString() : 'N/A';

        return `
            <tr>
                <td>${b._id ? b._id.slice(-6) : 'N/A'}</td>
                <td>${b.name || 'N/A'}</td>
                <td>${b.service || 'N/A'}</td>
                <td>${date} ${b.time || ''}</td>
                <td>
                    <select class="staff-select" onchange="assignStaff('${b._id}', this.value)" style="padding:0.25rem; border-radius:4px; border:1px solid #ddd;">
                        <option value="">${staffName}</option>
                        ${staffData.map(s => `<option value="${s._id}">${s.name}</option>`).join('')}
                    </select>
                </td>
                <td><span class="status-badge ${statusClass}">${b.status || 'pending'}</span></td>
                <td><span class="status-badge ${paymentClass}">${b.paymentStatus || 'unpaid'}</span></td>
                <td>R${b.amount || 0}</td>
                <td>
                    <button class="btn-sm btn-info" onclick="viewBooking('${b._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-sm btn-success" onclick="updateBookingStatus('${b._id}', 'completed')">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#bookings-table')) {
        $('#bookings-table').DataTable({
            order: [[3, 'desc']],
            pageLength: 25
        });
    }
}

window.filterBookings = function () {
    const filter = document.getElementById('booking-filter').value;
    if ($.fn.DataTable && $.fn.DataTable.isDataTable('#bookings-table')) {
        $('#bookings-table').DataTable().column(5).search(filter === 'all' ? '' : filter).draw();
    }
};

// == STAFF ASSIGNMENT ==
window.openStaffAssignModal = function (bookingId) {
    document.getElementById('assign-booking-id').value = bookingId;
    loadStaffSelect();
    document.getElementById('staff-assign-modal').classList.add('active');
};

window.closeStaffAssignModal = function () {
    document.getElementById('staff-assign-modal').classList.remove('active');
};

async function loadStaffSelect() {
    const staff = await getData('/api/users/staff');
    const select = document.getElementById('assign-staff-select');
    if (select) {
        select.innerHTML = '<option value="">Select staff member...</option>' +
            staff.map(s => `<option value="${s._id}">${s.name} - ${s.specialties?.join(', ') || 'General'}</option>`).join('');
    }
}

document.getElementById('staff-assign-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bookingId = document.getElementById('assign-booking-id').value;
    const staffId = document.getElementById('assign-staff-select').value;
    const notes = document.getElementById('assign-notes').value;

    if (!staffId) {
        alert('Please select a staff member');
        return;
    }

    try {
        const res = await putData(`/api/bookings/${bookingId}/assign`, { staffId, notes });
        if (res.ok) {
            alert('Staff assigned successfully!');
            closeStaffAssignModal();
            loadAllBookings();
            loadTodaySchedule();
        } else {
            alert('Failed to assign staff');
        }
    } catch (err) {
        console.error('Assignment error:', err);
        alert('Error assigning staff');
    }
});

window.assignStaff = async function (bookingId, staffId) {
    if (!staffId) return;

    if (confirm('Assign this booking to the selected staff member?')) {
        try {
            const res = await putData(`/api/bookings/${bookingId}/assign`, { staffId });
            if (res.ok) {
                alert('Staff assigned successfully!');
                loadAllBookings();
            }
        } catch (err) {
            console.error('Assignment error:', err);
            alert('Failed to assign staff');
        }
    }
};

// == STAFF SCHEDULE ==
// Load Staff Schedule (for staff view)
async function loadStaffSchedule() {
    const calendarEl = document.getElementById('staff-calendar');
    if (!calendarEl || typeof FullCalendar === 'undefined') return;

    // Use different endpoint based on user role
    const user = JSON.parse(localStorage.getItem('user'));
    const endpoint = user.role === 'admin' ? '/api/staff/schedule' : '/api/staff/my-schedule';

    const events = await getData(endpoint);

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: events.map(e => ({
            title: e.shift || 'Working',
            start: e.start,
            end: e.end,
            backgroundColor: e.color || '#E8B4C8',
            borderColor: '#6B5D52',
            extendedProps: e
        })),
        eventClick: function (info) {
            if (user.role === 'admin') {
                showScheduleDetails(info.event.extendedProps);
            }
        },
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        allDaySlot: false,
        height: 'auto'
    });

    calendar.render();
}

window.openScheduleModal = function () {
    loadStaffForSchedule();
    document.getElementById('schedule-modal').classList.add('active');
};

window.closeScheduleModal = function () {
    document.getElementById('schedule-modal').classList.remove('active');
};

async function loadStaffForSchedule() {
    const staff = await getData('/api/users/staff');
    const select = document.getElementById('schedule-staff');
    if (select) {
        select.innerHTML = '<option value="">Select staff...</option>' +
            staff.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
    }
}

document.getElementById('schedule-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        staffId: document.getElementById('schedule-staff').value,
        date: document.getElementById('schedule-date').value,
        startTime: document.getElementById('schedule-start').value,
        endTime: document.getElementById('schedule-end').value,
        maxBookings: document.getElementById('schedule-max').value
    };

    try {
        const res = await postData('/api/staff/schedule', data);
        if (res.ok) {
            alert('Schedule saved!');
            closeScheduleModal();
            loadStaffSchedule();
        } else {
            alert('Failed to save schedule');
        }
    } catch (err) {
        console.error('Schedule error:', err);
        alert('Error saving schedule');
    }
});

function showScheduleDetails(schedule) {
    alert(`Staff: ${schedule.staffName}\nDate: ${new Date(schedule.start).toLocaleDateString()}\nHours: ${schedule.startTime} - ${schedule.endTime}`);
}

// == FINANCIAL REPORTS ==
async function loadFinancialReports(period) {
    const data = await getData(`/api/reports/financial/${period}`);

    const statsContainer = document.getElementById('financial-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="finance-card">
                <h4>Total Revenue</h4>
                <div class="amount">R${data.totalRevenue?.toFixed(2) || '0.00'}</div>
                <div class="trend">${data.revenueTrend || 0}% vs last period</div>
            </div>
            <div class="finance-card">
                <h4>Expenses</h4>
                <div class="amount">R${data.expenses?.toFixed(2) || '0.00'}</div>
                <div class="trend">${data.expenseTrend || 0}% vs last period</div>
            </div>
            <div class="finance-card">
                <h4>Net Profit</h4>
                <div class="amount">R${data.netProfit?.toFixed(2) || '0.00'}</div>
                <div class="trend">Margin: ${data.profitMargin || 0}%</div>
            </div>
            <div class="finance-card">
                <h4>Outstanding</h4>
                <div class="amount">R${data.outstanding?.toFixed(2) || '0.00'}</div>
                <div class="trend">${data.outstandingCount || 0} pending payments</div>
            </div>
        `;
    }

    const breakdownCtx = document.getElementById('revenueBreakdownChart')?.getContext('2d');
    if (breakdownCtx) {
        new Chart(breakdownCtx, {
            type: 'pie',
            data: {
                labels: ['Services', 'Products', 'Vouchers', 'Deposits'],
                datasets: [{
                    data: [
                        data.serviceRevenue || 0,
                        data.productRevenue || 0,
                        data.voucherRevenue || 0,
                        data.deposits || 0
                    ],
                    backgroundColor: ['#E8B4C8', '#6B5D52', '#4CAF50', '#FF9800']
                }]
            },
            options: { responsive: true }
        });
    }
}

window.loadFinancialReport = function () {
    const period = document.getElementById('report-period').value;
    loadFinancialReports(period);
};

async function loadTransactions() {
    transactionsData = await getData('/api/transactions');
    const tbody = document.getElementById('transactions-body');
    if (!tbody) return;

    tbody.innerHTML = transactionsData.map(t => `
        <tr>
            <td>${new Date(t.transactionDate).toLocaleDateString()}</td>
            <td>${t._id ? t._id.slice(-8) : 'N/A'}</td>
            <td>${t.userId?.name || 'N/A'}</td>
            <td>${t.description || 'N/A'}</td>
            <td>R${t.amount?.toFixed(2) || '0.00'}</td>
            <td>${t.paymentMethod || 'Cash'}</td>
            <td><span class="status-badge status-${t.status || 'completed'}">${t.status || 'completed'}</span></td>
        </tr>
    `).join('');

    if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#transactions-table')) {
        $('#transactions-table').DataTable({
            order: [[0, 'desc']],
            pageLength: 25
        });
    }
}

window.exportReport = function () {
    const period = document.getElementById('report-period').value;
    window.location.href = `${API_URL}/api/reports/export/${period}`;
};

// == STAFF MANAGEMENT ==
async function loadStaffList() {
    staffData = await getData('/api/users/staff');
    const tbody = document.getElementById('staff-table-body');
    if (!tbody) return;

    tbody.innerHTML = staffData.map(s => `
        <tr>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.phone || 'N/A'}</td>
            <td>${s.specialties?.join(', ') || 'General'}</td>
            <td><span class="status-badge ${s.isActive ? 'status-confirmed' : 'status-rejected'}">${s.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                    <span>⭐ ${s.rating || '4.5'}</span>
                    <small>${s.completedBookings || 0} bookings</small>
                </div>
            </td>
            <td>
                <button class="btn-sm btn-primary" onclick="editStaff('${s._id}')">Edit</button>
                <button class="btn-sm btn-danger" onclick="toggleStaffStatus('${s._id}')">${s.isActive ? 'Deactivate' : 'Activate'}</button>
            </td>
        </tr>
    `).join('');

    if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#staff-table')) {
        $('#staff-table').DataTable();
    }
}

window.openStaffModal = function () {
    alert('Staff creation form - to be implemented');
};

window.editStaff = function (id) {
    alert('Edit staff - to be implemented');
};

window.toggleStaffStatus = async function (id) {
    const staff = staffData.find(s => s._id === id);
    if (!staff) return;

    if (confirm(`${staff.isActive ? 'Deactivate' : 'Activate'} ${staff.name}?`)) {
        try {
            const res = await putData(`/api/users/${id}/toggle-status`, { isActive: !staff.isActive });
            if (res.ok) {
                await loadStaffList();
                alert(`Staff ${staff.isActive ? 'deactivated' : 'activated'} successfully!`);
            }
        } catch (err) {
            console.error('Status change error:', err);
            alert('Failed to update staff status');
        }
    }
};

// == ANALYTICS ==
async function loadAnalyticsData() {
    const popularData = await getData('/api/analytics/popular-services');
    const staffPerfData = await getData('/api/analytics/staff-performance');
    const peakHoursData = await getData('/api/analytics/peak-hours');

    const popularCtx = document.getElementById('popularServicesChart')?.getContext('2d');
    if (popularCtx) {
        if (popularServicesChart) popularServicesChart.destroy();
        popularServicesChart = new Chart(popularCtx, {
            type: 'bar',
            data: {
                labels: popularData.map(d => d.name),
                datasets: [{
                    label: 'Number of Bookings',
                    data: popularData.map(d => d.count),
                    backgroundColor: '#E8B4C8'
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y'
            }
        });
    }

    const staffCtx = document.getElementById('staffPerformanceChart')?.getContext('2d');
    if (staffCtx) {
        if (staffPerformanceChart) staffPerformanceChart.destroy();
        staffPerformanceChart = new Chart(staffCtx, {
            type: 'radar',
            data: {
                labels: ['Completed', 'Rating', 'Punctuality', 'Customer Satisfaction', 'Revenue'],
                datasets: staffPerfData.map((staff, i) => ({
                    label: staff.name,
                    data: [staff.completed, staff.rating, staff.punctuality, staff.satisfaction, staff.revenue],
                    backgroundColor: `rgba(232, 180, 200, ${0.2 + i * 0.2})`,
                    borderColor: '#E8B4C8'
                }))
            },
            options: { responsive: true }
        });
    }

    const peakCtx = document.getElementById('peakHoursChart')?.getContext('2d');
    if (peakCtx) {
        if (peakHoursChart) peakHoursChart.destroy();
        peakHoursChart = new Chart(peakCtx, {
            type: 'line',
            data: {
                labels: peakHoursData.map(d => d.hour),
                datasets: [{
                    label: 'Bookings',
                    data: peakHoursData.map(d => d.count),
                    borderColor: '#FF9800',
                    fill: false
                }]
            },
            options: { responsive: true }
        });
    }
}

// == BOOKING STATUS UPDATES ==
window.updateBookingStatus = async function (id, status) {
    const statusMessages = {
        'confirmed': 'Confirm this booking?',
        'completed': 'Mark this booking as completed?',
        'cancelled': 'Cancel this booking?',
        'no-show': 'Mark client as no-show?'
    };

    if (!confirm(statusMessages[status] || `Update status to ${status}?`)) return;

    try {
        const res = await putData(`/api/bookings/${id}`, { status });
        if (res.ok) {
            alert(`Booking ${status} successfully!`);
            loadAllBookings();
            loadTodaySchedule();
        } else {
            alert('Failed to update booking');
        }
    } catch (err) {
        console.error('Update error:', err);
        alert('Error updating booking');
    }
};

window.viewBooking = function (id) {
    const booking = bookingsData.find(b => b._id === id);
    if (!booking) return;

    const details = `
        <div style="padding:1rem;">
            <h3 style="margin-bottom:1rem;">Booking Details</h3>
            <p><strong>Client:</strong> ${booking.name}</p>
            <p><strong>Service:</strong> ${booking.service}</p>
            <p><strong>Date/Time:</strong> ${new Date(booking.date).toLocaleDateString()} at ${booking.time}</p>
            <p><strong>Staff:</strong> ${booking.staffId?.name || 'Unassigned'}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
            <p><strong>Payment:</strong> ${booking.paymentStatus} - R${booking.amount || 0}</p>
            <p><strong>Notes:</strong> ${booking.notes || 'None'}</p>
            <div style="text-align:right; margin-top:1rem;">
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-content" style="max-width:500px;">${details}</div>`;
    document.body.appendChild(modal);
};

// == EXPORT FUNCTIONS ==
window.exportBookings = function () {
    window.location.href = `${API_URL}/api/bookings/export`;
};

window.refreshSchedule = function () {
    loadTodaySchedule();
};

// == LEAVE MANAGEMENT ==
async function loadLeaveRequests() {
    const leaves = await getData('/api/leave');
    const tbody = document.getElementById('leave-table');
    if (!tbody || !Array.isArray(leaves)) return;

    tbody.innerHTML = leaves.map(l => `
        <tr>
            <td>${l.userId?.name || 'Unknown'}</td>
            <td>${new Date(l.startDate).toLocaleDateString()}</td>
            <td>${new Date(l.endDate).toLocaleDateString()}</td>
            <td>${l.reason}</td>
            <td><span class="status-badge status-${l.status}">${l.status}</span></td>
            <td>
                ${l.status === 'pending' ? `
                    <button class="btn-sm btn-success" onclick="window.approveLeave('${l._id}')">Approve</button>
                    <button class="btn-sm btn-danger" onclick="window.rejectLeave('${l._id}')">Reject</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

window.approveLeave = async function (id) {
    if (!id) return;
    if (confirm('Approve this leave request?')) {
        try {
            const res = await putData(`/api/leave/${id}`, { status: 'approved' });
            if (res.ok) {
                await loadLeaveRequests();
                alert('Leave request approved!');
            } else {
                alert('Failed to approve leave request');
            }
        } catch (err) {
            console.error('Approve leave error:', err);
            alert('Error: ' + err.message);
        }
    }
};

window.rejectLeave = async function (id) {
    if (!id) return;
    if (confirm('Reject this leave request?')) {
        try {
            const res = await putData(`/api/leave/${id}`, { status: 'rejected' });
            if (res.ok) {
                await loadLeaveRequests();
                alert('Leave request rejected!');
            } else {
                alert('Failed to reject leave request');
            }
        } catch (err) {
            console.error('Reject leave error:', err);
            alert('Error: ' + err.message);
        }
    }
};

// == USER MANAGEMENT ==
async function loadUsers() {
    const users = await getData('/api/users');
    const tbody = document.getElementById('users-table-body');
    if (!tbody || !Array.isArray(users)) return;

    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.name || 'N/A'}</td>
            <td>${u.email || 'N/A'}</td>
            <td><span class="status-badge status-${u.role || 'customer'}">${u.role || 'customer'}</span></td>
            <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn-sm btn-primary" onclick="viewUserDetails('${u._id}')">View</button>
                <button class="btn-sm btn-warning" onclick="resetUserPassword('${u._id}')">Reset Password</button>
            </td>
        </tr>
    `).join('');

    if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#users-table')) {
        $('#users-table').DataTable();
    }
}

window.viewUserDetails = function (userId) {
    const user = staffData.find(s => s._id === userId) || bookingsData.find(b => b.userId?._id === userId);
    if (!user) {
        alert('User details not found');
        return;
    }

    const details = `
        <div style="padding:1rem;">
            <h3>User Details</h3>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Bookings:</strong> ${user.bookings?.length || 0}</p>
        </div>
    `;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-content">${details}<div style="text-align:right; margin-top:1rem;"><button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button></div></div>`;
    document.body.appendChild(modal);
};

window.resetUserPassword = function (userId) {
    if (confirm('Reset password for this user? They will receive an email with instructions.')) {
        alert('Password reset functionality - to be implemented with email service');
    }
};

// == PRODUCT MANAGEMENT ==
async function loadProducts() {
    productsData = await getData('/api/products');
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    if (!Array.isArray(productsData)) productsData = [];

    tbody.innerHTML = productsData.map(p => `
        <tr>
            <td><img src="${p.image || 'https://via.placeholder.com/50'}" width="50" height="50" style="border-radius:4px; object-fit:cover;"></td>
            <td>${p.name || 'N/A'}</td>
            <td>${p.category || 'N/A'}</td>
            <td>R${p.price?.toFixed(2) || '0.00'}</td>
            <td>${p.stock || 0}</td>
            <td>
                <button class="btn-sm btn-primary" onclick="window.openProductModal('${p._id}')">Edit</button>
                <button class="btn-sm btn-danger" onclick="window.deleteProduct('${p._id}')">Delete</button>
            </td>
        </tr>
    `).join('');

    if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#products-table')) {
        $('#products-table').DataTable();
    }
}

window.openProductModal = function (productId = null) {
    try {
        const form = document.getElementById('admin-form');
        const title = document.getElementById('modal-title');
        const modal = document.getElementById('admin-modal');

        if (!form || !title || !modal) {
            console.error('Modal elements not found');
            alert('System error: Modal elements not found');
            return;
        }

        let product = {};
        if (productId && Array.isArray(productsData)) {
            product = productsData.find(p => p._id === productId) || {};
        }

        form.dataset.type = 'product';
        form.dataset.id = product._id || '';
        title.textContent = product._id ? 'Edit Product' : 'Add New Product';

        form.innerHTML = `
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Product Name *</label>
                <input type="text" name="name" placeholder="e.g. Argan Oil Treatment" value="${product.name || ''}" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Price (R) *</label>
                <input type="number" name="price" placeholder="e.g. 245" value="${product.price || ''}" step="0.01" min="0" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Category *</label>
                <input type="text" name="category" placeholder="e.g. Hair Care" value="${product.category || ''}" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Stock Quantity</label>
                <input type="number" name="stock" placeholder="e.g. 50" value="${product.stock || 0}" min="0" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
            </div>
            <div style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Image URL (optional)</label>
                <input type="url" name="image" placeholder="https://example.com/image.jpg" value="${product.image || ''}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
            </div>
            <button type="submit" class="btn btn-primary btn-block" style="padding:12px; width:100%; background:#E8B4C8; border:none; color:white; border-radius:4px; font-weight:600; cursor:pointer;">
                ${product._id ? 'Update' : 'Save'} Product
            </button>
        `;
        modal.classList.add('active');
    } catch (e) {
        console.error("Open Product Modal Error:", e);
        alert("Error opening product form: " + e.message);
    }
};

window.deleteProduct = async function (id) {
    if (!id) return;

    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const res = await deleteData(`/api/products/${id}`);
            if (res.ok) {
                await loadProducts();
                alert('Product deleted successfully!');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to delete product');
            }
        } catch (err) {
            console.error('Delete product error:', err);
            alert('Failed to delete product: ' + err.message);
        }
    }
};

// == SERVICE MANAGEMENT ==
async function loadServices() {
    servicesData = await getData('/api/services');
    const tbody = document.getElementById('services-table-body');
    if (!tbody) return;

    if (!Array.isArray(servicesData)) servicesData = [];

    tbody.innerHTML = servicesData.map(s => {
        const categoryDisplay = {
            'kiddies': '👧 Kiddies Hair',
            'adult': '💇‍♀️ Adult Hair',
            'nails': '💅 Nails',
            'beauty': '✨ Skin & Beauty'
        }[s.category] || s.category;

        const itemsCount = s.items?.length || 0;
        const itemsPreview = itemsCount > 0 ? `${itemsCount} items` : 'No items';

        return `
            <tr>
                <td><img src="${s.image || 'https://via.placeholder.com/50'}" width="50" height="50" style="border-radius:4px; object-fit:cover;"></td>
                <td><span class="status-badge" style="background:var(--accent-pink); color:white;">${categoryDisplay}</span></td>
                <td><strong>${s.title}</strong></td>
                <td>${s.description.substring(0, 50)}${s.description.length > 50 ? '...' : ''}</td>
                <td>
                    <span style="cursor:pointer; color:var(--accent-pink);" onclick="showServiceItems('${s._id}')">
                        ${itemsPreview} <i class="fas fa-eye"></i>
                    </span>
                </td>
                <td><span class="status-badge ${s.isActive ? 'status-confirmed' : 'status-rejected'}">${s.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn-sm btn-primary" onclick="window.openServiceModal('${s._id}')">Edit</button>
                    <button class="btn-sm btn-danger" onclick="window.deleteService('${s._id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#services-table')) {
        $('#services-table').DataTable();
    }
}

window.filterServices = function (category) {
    document.querySelectorAll('[onclick^="filterServices"]').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    const rows = document.querySelectorAll('#services-table tr');
    rows.forEach(row => {
        if (category === 'all') {
            row.style.display = '';
        } else {
            const categoryCell = row.cells[1]?.textContent || '';
            if (categoryCell.toLowerCase().includes(category)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
};

window.showServiceItems = function (serviceId) {
    const service = servicesData.find(s => s._id === serviceId);
    if (!service) return;

    let itemsHtml = '<div style="padding:1rem;">';
    itemsHtml += `<h3 style="margin-bottom:1rem; color:var(--primary-brown);">${service.title} - Items</h3>`;
    itemsHtml += '<table style="width:100%; border-collapse:collapse;">';
    itemsHtml += '<thead><tr style="background:var(--primary-beige);">';
    itemsHtml += '<th style="padding:10px; text-align:left;">Item</th>';
    itemsHtml += '<th style="padding:10px; text-align:left;">Duration</th>';
    itemsHtml += '<th style="padding:10px; text-align:left;">Price</th>';
    itemsHtml += '<th style="padding:10px; text-align:left;">Description</th>';
    itemsHtml += '</tr></thead><tbody>';

    service.items.forEach((item) => {
        const duration = item.duration || 'N/A';
        itemsHtml += `<tr style="border-bottom:1px solid #eee;">
            <td style="padding:10px;">${item.name}</td>
            <td style="padding:10px;">${duration}</td>
            <td style="padding:10px;"><strong>R${item.price}</strong></td>
            <td style="padding:10px;">${item.description || ''}</td>
        </tr>`;
    });

    itemsHtml += '</tbody></table>';
    itemsHtml += '<div style="text-align:right; margin-top:1rem;">';
    itemsHtml += '<button class="btn-sm btn-primary" onclick="this.closest(\'.modal\').remove()">Close</button>';
    itemsHtml += '</div></div>';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `<div class="modal-content" style="max-width:700px;">${itemsHtml}</div>`;
    document.body.appendChild(modal);
};

window.openServiceModal = function (serviceId = null) {
    try {
        const form = document.getElementById('admin-form');
        const title = document.getElementById('modal-title');
        const modal = document.getElementById('admin-modal');

        if (!form || !title || !modal) {
            console.error('Modal elements not found');
            alert('System error: Modal elements not found');
            return;
        }

        let service = {};
        if (serviceId && Array.isArray(servicesData)) {
            service = servicesData.find(s => s._id === serviceId) || {};
        }

        form.dataset.type = 'service';
        form.dataset.id = service._id || '';
        title.textContent = service._id ? 'Edit Service' : 'Add New Service';

        let itemsFieldsHtml = '';
        const items = service.items || [];

        if (items.length > 0) {
            items.forEach((item, index) => {
                itemsFieldsHtml += `
                    <div class="service-item" style="background:#f9f9f9; padding:20px; margin-bottom:20px; border-radius:8px; border:1px solid #e0e0e0; position:relative;">
                        <div style="position:absolute; top:10px; right:10px;">
                            <button type="button" class="btn-sm btn-danger" onclick="removeServiceItem(this)" style="padding:4px 10px; font-size:0.8rem;">✕ Remove</button>
                        </div>
                        <h5 style="margin-top:0; margin-bottom:15px; color:var(--primary-brown);">Service Item #${index + 1}</h5>
                        
                        <div style="margin-bottom:15px;">
                            <label style="display:block; margin-bottom:5px; font-weight:600;">Item Name *</label>
                            <input type="text" name="item_name_${index}" value="${item.name || ''}" placeholder="e.g. Plain Cornrows" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                        </div>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:600;">Duration</label>
                                <input type="text" name="item_duration_${index}" value="${item.duration || ''}" placeholder="e.g. 2 hours" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                            </div>
                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:600;">Price (R) *</label>
                                <input type="number" name="item_price_${index}" value="${item.price || ''}" placeholder="e.g. 420" step="0.01" min="0" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                            </div>
                        </div>
                        
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:600;">Description (optional)</label>
                            <input type="text" name="item_description_${index}" value="${item.description || ''}" placeholder="Brief description" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                        </div>
                    </div>
                `;
            });
        } else {
            itemsFieldsHtml = `
                <div class="service-item" style="background:#f9f9f9; padding:20px; margin-bottom:20px; border-radius:8px; border:1px solid #e0e0e0; position:relative;">
                    <div style="position:absolute; top:10px; right:10px;">
                        <button type="button" class="btn-sm btn-danger" onclick="removeServiceItem(this)" style="padding:4px 10px; font-size:0.8rem;">✕ Remove</button>
                    </div>
                    <h5 style="margin-top:0; margin-bottom:15px; color:var(--primary-brown);">Service Item #1</h5>
                    
                    <div style="margin-bottom:15px;">
                        <label style="display:block; margin-bottom:5px; font-weight:600;">Item Name *</label>
                        <input type="text" name="item_name_0" placeholder="e.g. Plain Cornrows" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                    </div>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:600;">Duration</label>
                            <input type="text" name="item_duration_0" placeholder="e.g. 2 hours" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:600;">Price (R) *</label>
                            <input type="number" name="item_price_0" placeholder="e.g. 420" step="0.01" min="0" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                        </div>
                    </div>
                    
                    <div>
                        <label style="display:block; margin-bottom:5px; font-weight:600;">Description (optional)</label>
                        <input type="text" name="item_description_0" placeholder="Brief description" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                    </div>
                </div>
            `;
        }

        form.innerHTML = `
            <div style="margin-bottom:20px; background:white; padding:20px; border-radius:8px; border:1px solid #e0e0e0;">
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-weight:600;">Category *</label>
                    <select name="category" id="service-category" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:4px;">
                        <option value="">Select Category</option>
                        <option value="kiddies" ${service.category === 'kiddies' ? 'selected' : ''}>👧 Kiddies Hair</option>
                        <option value="adult" ${service.category === 'adult' ? 'selected' : ''}>💇‍♀️ Adult Hair</option>
                        <option value="nails" ${service.category === 'nails' ? 'selected' : ''}>💅 Nails</option>
                        <option value="beauty" ${service.category === 'beauty' ? 'selected' : ''}>✨ Skin & Beauty</option>
                    </select>
                </div>
                
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-weight:600;">Category Display Name *</label>
                    <input type="text" name="categoryDisplay" placeholder="e.g. Kiddies Hair" value="${service.categoryDisplay || ''}" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:4px;">
                    <small style="color:#666;">This is what customers will see (e.g., "Kiddies Hair")</small>
                </div>
                
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-weight:600;">Service Title *</label>
                    <input type="text" name="title" placeholder="e.g. Kids Braids, Benny & Betty Styles" value="${service.title || ''}" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:4px;">
                </div>
                
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-weight:600;">Description *</label>
                    <textarea name="description" placeholder="Brief description of this service" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:4px; min-height:80px;">${service.description || ''}</textarea>
                </div>
                
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-weight:600;">Image URL (optional)</label>
                    <input type="url" name="image" placeholder="https://example.com/image.jpg" value="${service.image || ''}" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:4px;">
                </div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                    <div>
                        <label style="display:block; margin-bottom:5px; font-weight:600;">Display Order</label>
                        <input type="number" name="order" value="${service.order || 0}" min="0" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:4px;">
                        <small style="color:#666;">Lower numbers appear first</small>
                    </div>
                    <div style="display:flex; align-items:center;">
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                            <input type="checkbox" name="isActive" ${service.isActive !== false ? 'checked' : ''} style="width:18px; height:18px;"> 
                            <span style="font-weight:600;">Active (show on website)</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div style="background:white; padding:20px; border-radius:8px; border:1px solid #e0e0e0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h4 style="margin:0; color:var(--primary-brown);">Service Items / Pricing</h4>
                    <button type="button" class="btn-sm btn-primary" onclick="addServiceItem()" style="background:var(--accent-pink); padding:8px 15px;">+ Add Another Item</button>
                </div>
                
                <div id="service-items-container">
                    ${itemsFieldsHtml}
                </div>
                
                <p style="color:#666; font-size:0.85rem; margin-top:15px; padding-top:15px; border-top:1px dashed #ddd;">
                    <i class="fas fa-info-circle"></i> Add all the specific services and prices under this category. Each item will appear as a separate service option.
                </p>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block" style="margin-top:20px; padding:14px; width:100%; background:#E8B4C8; border:none; color:white; border-radius:4px; font-weight:600; cursor:pointer; font-size:1rem;">
                ${service._id ? 'Update' : 'Save'} Service
            </button>
        `;

        modal.classList.add('active');
    } catch (e) {
        console.error("Open Service Modal Error:", e);
        alert("Error opening service form: " + e.message);
    }
};

window.addServiceItem = function () {
    const container = document.getElementById('service-items-container');
    const itemCount = container.children.length;
    const newIndex = itemCount;

    const newItemHtml = `
        <div class="service-item" style="background:#f9f9f9; padding:20px; margin-bottom:20px; border-radius:8px; border:1px solid #e0e0e0; position:relative;">
            <div style="position:absolute; top:10px; right:10px;">
                <button type="button" class="btn-sm btn-danger" onclick="removeServiceItem(this)" style="padding:4px 10px; font-size:0.8rem;">✕ Remove</button>
            </div>
            <h5 style="margin-top:0; margin-bottom:15px; color:var(--primary-brown);">Service Item #${itemCount + 1}</h5>
            
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Item Name *</label>
                <input type="text" name="item_name_${newIndex}" placeholder="e.g. Plain Cornrows" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                <div>
                    <label style="display:block; margin-bottom:5px; font-weight:600;">Duration</label>
                    <input type="text" name="item_duration_${newIndex}" placeholder="e.g. 2 hours" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                </div>
                <div>
                    <label style="display:block; margin-bottom:5px; font-weight:600;">Price (R) *</label>
                    <input type="number" name="item_price_${newIndex}" placeholder="e.g. 420" step="0.01" min="0" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                </div>
            </div>
            
            <div>
                <label style="display:block; margin-bottom:5px; font-weight:600;">Description (optional)</label>
                <input type="text" name="item_description_${newIndex}" placeholder="Brief description" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', newItemHtml);
};

window.removeServiceItem = function (button) {
    const itemDiv = button.closest('.service-item');
    if (document.querySelectorAll('.service-item').length > 1) {
        itemDiv.remove();
    } else {
        alert('You must have at least one service item.');
    }
};

window.deleteService = async function (id) {
    if (!id) return;

    if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
        try {
            const res = await deleteData(`/api/services/${id}`);
            if (res.ok) {
                await loadServices();
                alert('Service deleted successfully!');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to delete service');
            }
        } catch (err) {
            console.error('Delete service error:', err);
            alert('Failed to delete service: ' + err.message);
        }
    }
};

// == VOUCHER MANAGEMENT ==
async function loadVouchers() {
    vouchersData = await getData('/api/vouchers');
    const tbody = document.getElementById('vouchers-table-body');
    if (!tbody) return;

    if (!Array.isArray(vouchersData)) vouchersData = [];

    tbody.innerHTML = vouchersData.map(v => {
        const isPercentage = v.discountType === 'percentage';
        const discountDisplay = isPercentage ? `${v.discount}%` : `R${v.discount}`;
        const status = v.isActive ? 'Active' : 'Inactive';
        const statusClass = v.isActive ? 'status-confirmed' : 'status-rejected';

        return `
            <tr>
                <td><strong>${v.code}</strong></td>
                <td>${discountDisplay} ${isPercentage ? '(%)' : '(R)'}</td>
                <td>${new Date(v.expiry).toLocaleDateString()}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn-sm btn-primary" onclick="window.openVoucherModal('${v._id}')">Edit</button>
                    <button class="btn-sm btn-danger" onclick="window.deleteVoucher('${v._id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#vouchers-table')) {
        $('#vouchers-table').DataTable();
    }
}

window.openVoucherModal = function (voucherId = null) {
    try {
        const form = document.getElementById('admin-form');
        const title = document.getElementById('modal-title');
        const modal = document.getElementById('admin-modal');

        if (!form || !title || !modal) {
            console.error('Modal elements not found');
            alert('System error: Modal elements not found');
            return;
        }

        let voucher = {};
        if (voucherId && Array.isArray(vouchersData)) {
            voucher = vouchersData.find(v => v._id === voucherId) || {};
        }

        form.dataset.type = 'voucher';
        form.dataset.id = voucher._id || '';
        title.textContent = voucher._id ? 'Edit Voucher' : 'Create New Voucher';

        const discountType = voucher.discountType || 'fixed';
        const isPercentage = discountType === 'percentage';

        let expiryDate = '';
        if (voucher.expiry) {
            const date = new Date(voucher.expiry);
            expiryDate = date.toISOString().split('T')[0];
        }

        form.innerHTML = `
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Voucher Code *</label>
                <input type="text" name="code" placeholder="e.g. SUMMER20" value="${voucher.code || ''}" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; text-transform:uppercase;">
                <small style="color:#666;">Use uppercase letters and numbers</small>
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Discount Type *</label>
                <select name="discountType" id="discount-type-select" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                    <option value="fixed" ${discountType === 'fixed' ? 'selected' : ''}>Fixed Amount (R)</option>
                    <option value="percentage" ${discountType === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
                </select>
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Discount Value *</label>
                <input type="number" name="discount" id="discount-value-input" placeholder="${isPercentage ? 'e.g. 20' : 'e.g. 100'}" value="${voucher.discount || ''}" step="0.01" min="0" ${isPercentage ? 'max="100"' : ''} required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
                <small id="discount-help" style="color:#666;">${isPercentage ? 'Enter percentage (1-100)' : 'Enter amount in Rand'}</small>
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Expiry Date *</label>
                <input type="date" name="expiry" value="${expiryDate}" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
            </div>
            
            <div style="margin-bottom:20px;">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" name="isActive" ${voucher.isActive !== false ? 'checked' : ''}> 
                    <span style="font-weight:600;">Active (voucher can be used)</span>
                </label>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block" style="padding:12px; width:100%; background:#E8B4C8; border:none; color:white; border-radius:4px; font-weight:600; cursor:pointer;">
                ${voucher._id ? 'Update' : 'Create'} Voucher
            </button>
        `;

        const discountTypeSelect = document.getElementById('discount-type-select');
        const discountInput = document.getElementById('discount-value-input');
        const discountHelp = document.getElementById('discount-help');

        if (discountTypeSelect && discountInput && discountHelp) {
            discountTypeSelect.addEventListener('change', function () {
                if (this.value === 'percentage') {
                    discountInput.max = 100;
                    discountInput.placeholder = 'e.g. 20';
                    discountHelp.textContent = 'Enter percentage (1-100)';
                } else {
                    discountInput.removeAttribute('max');
                    discountInput.placeholder = 'e.g. 100';
                    discountHelp.textContent = 'Enter amount in Rand';
                }
            });
        }

        modal.classList.add('active');
    } catch (e) {
        console.error("Open Voucher Modal Error:", e);
        alert("Error opening voucher form: " + e.message);
    }
};

window.deleteVoucher = async function (id) {
    if (!id) return;

    if (confirm('Are you sure you want to delete this voucher?')) {
        try {
            const res = await deleteData(`/api/vouchers/${id}`);
            if (res.ok) {
                await loadVouchers();
                alert('Voucher deleted successfully!');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to delete voucher');
            }
        } catch (err) {
            console.error('Delete voucher error:', err);
            alert('Failed to delete voucher: ' + err.message);
        }
    }
};

window.closeAdminModal = function () {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.remove('active');
};

// == STAFF LOGIC ==
async function initStaff() {
    window.showSection = async (id) => {
        document.querySelectorAll('main > section').forEach(el => el.style.display = 'none');
        const section = document.getElementById(`sec-${id}`);
        if (section) section.style.display = 'block';

        const titles = {
            'dashboard': 'Staff Dashboard',
            'schedule': 'My Schedule',
            'appointments': 'My Appointments',
            'leave': 'Leave Management'
        };
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = titles[id] || 'Staff Dashboard';

        if (id === 'dashboard') {
            await loadStaffDashboard();
        } else if (id === 'schedule') {
            await loadStaffSchedule();
        } else if (id === 'appointments') {
            await loadAllStaffAppointments();
        } else if (id === 'leave') {
            await loadStaffLeaveHistory();
        }
    };

    // Load initial dashboard
    await loadStaffDashboard();

    // Leave form submission
    const leaveForm = document.getElementById('leave-form');
    if (leaveForm) {
        leaveForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                startDate: document.getElementById('leave-start').value,
                endDate: document.getElementById('leave-end').value,
                reason: document.getElementById('leave-reason').value
            };

            if (!data.startDate || !data.endDate || !data.reason) {
                alert('Please fill in all fields');
                return;
            }

            try {
                const res = await postData('/api/leave', data);
                if (res.ok) {
                    alert('Leave Request Submitted Successfully!');
                    e.target.reset();
                    await loadStaffLeaveHistory(); // Refresh leave history
                } else {
                    const err = await res.json();
                    alert(err.error || 'Failed to submit leave request');
                }
            } catch (err) {
                console.error('Leave request error:', err);
                alert('Failed to request leave: ' + err.message);
            }
        });
    }
}

// Load Staff Dashboard Data
async function loadStaffDashboard() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const user = JSON.parse(localStorage.getItem('user'));

        // Get today's appointments
        const bookings = await getData('/api/bookings');
        const todayBookings = bookings.filter(b => {
            const bookingDate = b.date ? new Date(b.date).toISOString().split('T')[0] : '';
            return bookingDate === today;
        });

        // Update KPI cards
        const todayCountEl = document.getElementById('today-count');
        if (todayCountEl) todayCountEl.textContent = todayBookings.length;

        const completedToday = todayBookings.filter(b => b.status === 'completed').length;
        const completedTodayEl = document.getElementById('completed-today');
        if (completedTodayEl) completedTodayEl.textContent = completedToday;

        // Find next appointment
        const now = new Date();
        const futureBookings = todayBookings
            .filter(b => b.time && new Date(`${today}T${b.time}`) > now)
            .sort((a, b) => a.time.localeCompare(b.time));

        const nextAppointment = futureBookings[0];
        const nextAppointmentEl = document.getElementById('next-appointment');
        if (nextAppointmentEl) {
            nextAppointmentEl.textContent = nextAppointment ? nextAppointment.time : 'No more today';
        }

        // Update today's schedule table
        const tbody = document.getElementById('appointments-table');
        if (tbody) {
            if (todayBookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No appointments scheduled for today</td></tr>';
            } else {
                tbody.innerHTML = todayBookings.map(b => `
                    <tr>
                        <td>${b.time || 'TBD'}</td>
                        <td>${b.name || 'N/A'}</td>
                        <td>${b.service || 'N/A'}</td>
                        <td>${b.duration || '1 hour'}</td>
                        <td><span class="status-badge status-${b.status || 'pending'}">${b.status || 'pending'}</span></td>
                        <td>
                            <button class="btn-sm btn-info" onclick="viewBookingDetails('${b._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${b.status === 'pending' ? `
                                <button class="btn-sm btn-success" onclick="updateBookingStatus('${b._id}', 'confirmed')">
                                    <i class="fas fa-check"></i> Accept
                                </button>
                            ` : ''}
                            ${b.status === 'in-progress' ? `
                                <button class="btn-sm btn-success" onclick="updateBookingStatus('${b._id}', 'completed')">
                                    <i class="fas fa-check-double"></i> Complete
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('');
            }
        }

        // Initialize DataTable only if there are rows and table exists
        if ($.fn.DataTable && $('#today-schedule').length && todayBookings.length > 0) {
            // Destroy existing DataTable if it exists
            if ($.fn.DataTable.isDataTable('#today-schedule')) {
                $('#today-schedule').DataTable().destroy();
            }
            $('#today-schedule').DataTable({
                pageLength: 10,
                order: [[0, 'asc']],
                retrieve: true
            });
        }
    } catch (err) {
        console.error('Error loading staff dashboard:', err);
    }
}

// Load All Staff Appointments
async function loadAllStaffAppointments() {
    try {
        const bookings = await getData('/api/bookings');
        const tbody = document.getElementById('all-appointments-table');
        if (!tbody) return;

        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No appointments found</td></tr>';
        } else {
            tbody.innerHTML = bookings.map(b => {
                const date = b.date ? new Date(b.date).toLocaleDateString() : 'N/A';
                return `
                    <tr>
                        <td>${date}</td>
                        <td>${b.time || 'N/A'}</td>
                        <td>${b.name || 'N/A'}</td>
                        <td>${b.service || 'N/A'}</td>
                        <td>${b.duration || '1 hour'}</td>
                        <td><span class="status-badge status-${b.status || 'pending'}">${b.status || 'pending'}</span></td>
                        <td>
                            <button class="btn-sm btn-info" onclick="viewBookingDetails('${b._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        if ($.fn.DataTable && !$.fn.DataTable.isDataTable('#appointments-list')) {
            $('#appointments-list').DataTable({
                pageLength: 25,
                order: [[0, 'desc'], [1, 'asc']]
            });
        }
    } catch (err) {
        console.error('Error loading staff appointments:', err);
    }
}

// Load Staff Leave History
async function loadStaffLeaveHistory() {
    try {
        const leaves = await getData('/api/leave/my-requests');
        const tbody = document.getElementById('leave-history-table');
        if (!tbody) return;

        if (!leaves || leaves.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No leave requests found</td></tr>';
        } else {
            tbody.innerHTML = leaves.map(l => {
                const statusClass = `status-${l.status}`;
                const startDate = l.startDate ? new Date(l.startDate).toLocaleDateString() : 'N/A';
                const endDate = l.endDate ? new Date(l.endDate).toLocaleDateString() : 'N/A';

                return `
                    <tr>
                        <td>${startDate}</td>
                        <td>${endDate}</td>
                        <td>${l.reason || 'N/A'}</td>
                        <td><span class="status-badge ${statusClass}">${l.status || 'pending'}</span></td>
                    </tr>
                `;
            }).join('');
        }

        // Initialize DataTable if not already done
        if ($.fn.DataTable && $('#leave-history-table').parents('.dataTables_wrapper').length === 0) {
            $('#leave-history-table').DataTable({
                pageLength: 10,
                order: [[0, 'desc']],
                language: {
                    emptyTable: "No leave requests found"
                }
            });
        }
    } catch (err) {
        console.error('Error loading leave history:', err);
        const tbody = document.getElementById('leave-history-table');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#dc3545;">Error loading leave history</td></tr>';
        }
    }
}

// Filter Staff Appointments
window.filterStaffAppointments = function () {
    const filter = document.getElementById('appointment-filter').value;
    const table = $('#appointments-list').DataTable();

    if (filter === 'all') {
        table.search('').columns().search('').draw();
    } else if (filter === 'today') {
        const today = new Date().toLocaleDateString();
        table.column(0).search(today).draw();
    } else if (filter === 'upcoming') {
        const today = new Date();
        // Custom filtering - get all dates >= today
        $.fn.dataTable.ext.search.push(
            function (settings, data, dataIndex) {
                const date = new Date(data[0]);
                return date >= today;
            }
        );
        table.draw();
        $.fn.dataTable.ext.search.pop();
    } else if (filter === 'completed') {
        table.column(5).search('completed').draw();
    }
};

// View Booking Details
window.viewBookingDetails = function (bookingId) {
    // This function can be expanded to show detailed booking info
    alert('Viewing booking details - Feature coming soon!');
};

// Update Booking Status (override for staff)
window.updateBookingStatus = async function (id, status) {
    if (!confirm(`Mark this booking as ${status}?`)) return;

    try {
        const res = await putData(`/api/bookings/${id}`, { status });
        if (res.ok) {
            alert(`Booking ${status} successfully!`);
            // Refresh the current view
            const activeSection = document.querySelector('main > section:not([style*="none"])')?.id;
            if (activeSection === 'sec-dashboard') {
                await loadStaffDashboard();
            } else if (activeSection === 'sec-appointments') {
                await loadAllStaffAppointments();
            }
        } else {
            alert('Failed to update booking');
        }
    } catch (err) {
        console.error('Update error:', err);
        alert('Error updating booking');
    }
};

// == CUSTOMER LOGIC ==
async function initCustomer() {
    const bookings = await getData('/api/bookings');
    const tbody = document.getElementById('appointments-table');
    if (tbody && Array.isArray(bookings)) {
        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No bookings found</td></tr>';
        } else {
            tbody.innerHTML = bookings.map(b => `
                <tr>
                    <td>${b.service || 'N/A'}</td>
                    <td>${b.date ? new Date(b.date).toLocaleDateString() : 'N/A'}</td>
                    <td>${b.time || 'N/A'}</td>
                    <td><span class="status-badge status-${b.status || 'pending'}">${b.status || 'pending'}</span></td>
                </tr>
            `).join('');
        }
    }

    const statVisits = document.getElementById('stat-visits');
    if (statVisits) statVisits.textContent = bookings?.length || 0;

    if (bookings && bookings.length > 0) {
        const now = new Date();
        const futureBookings = bookings
            .filter(b => b.date && new Date(b.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const statNext = document.getElementById('stat-next');
        if (statNext) {
            if (futureBookings.length > 0) {
                const next = futureBookings[0];
                statNext.textContent = `${new Date(next.date).toLocaleDateString()} at ${next.time || 'N/A'}`;
            } else {
                statNext.textContent = 'No upcoming';
            }
        }
    }
}

// == SEARCH FUNCTION ==
window.searchUsers = async function () {
    const query = document.getElementById('search-input')?.value?.trim();
    if (!query) {
        alert('Please enter a search term');
        return;
    }

    try {
        const users = await getData('/api/users');
        const filtered = users.filter(u =>
            u.name?.toLowerCase().includes(query.toLowerCase()) ||
            u.email?.toLowerCase().includes(query.toLowerCase())
        );

        const tbody = document.getElementById('users-results');
        if (tbody) {
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No users found</td></tr>';
            } else {
                tbody.innerHTML = filtered.map(u => `
                    <tr>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td>${u.role}</td>
                        <td><button class="btn-sm btn-primary" onclick="viewUserDetails('${u._id}')">View Details</button></td>
                    </tr>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Search error:', err);
        alert('Failed to search users: ' + err.message);
    }
};

// Make all functions globally available
window.showSection = window.showSection;
window.openProfileModal = window.openProfileModal;
window.closeProfileModal = window.closeProfileModal;
window.openProductModal = window.openProductModal;
window.deleteProduct = window.deleteProduct;
window.openServiceModal = window.openServiceModal;
window.deleteService = window.deleteService;
window.filterServices = window.filterServices;
window.showServiceItems = window.showServiceItems;
window.openVoucherModal = window.openVoucherModal;
window.deleteVoucher = window.deleteVoucher;
window.closeAdminModal = window.closeAdminModal;
window.approveLeave = window.approveLeave;
window.rejectLeave = window.rejectLeave;
window.updateBookingStatus = window.updateBookingStatus;
window.searchUsers = window.searchUsers;
window.assignStaff = window.assignStaff;
window.openStaffAssignModal = window.openStaffAssignModal;
window.closeStaffAssignModal = window.closeStaffAssignModal;
window.openScheduleModal = window.openScheduleModal;
window.closeScheduleModal = window.closeScheduleModal;
window.exportBookings = window.exportBookings;
window.refreshSchedule = window.refreshSchedule;
window.filterBookings = window.filterBookings;
window.changeRevenuePeriod = window.changeRevenuePeriod;
window.loadFinancialReport = window.loadFinancialReport;
window.exportReport = window.exportReport;
window.viewBooking = window.viewBooking;
window.viewUserDetails = window.viewUserDetails;
window.resetUserPassword = window.resetUserPassword;
window.editStaff = window.editStaff;
window.toggleStaffStatus = window.toggleStaffStatus;
window.openStaffModal = window.openStaffModal;