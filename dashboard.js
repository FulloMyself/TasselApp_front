// front/dashboard.js
const API_URL = 'https://tasselapp-back.onrender.com';

// Global store
let productsData = [];

document.addEventListener('DOMContentLoaded', () => {
    try {
        checkAuth();
        initLogout();
        initProfile();
        initPageLogic();
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
        if (userNameEl && user) userNameEl.textContent = user.name;
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
    return fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

async function putData(endpoint, data) {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

async function deleteData(endpoint) {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
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

// MAKE GLOBAL FOR ONCLICK
function openProfileModal() {
    try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user) return alert('Please login again.');

        document.getElementById('profile-name').value = user.name || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-pass').value = '';
        document.getElementById('profile-pass-confirm').value = '';
        document.getElementById('profile-modal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert("Error opening profile: " + e.message);
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'none';
}

// == PAGE LOGIC ROUTER ==
function initPageLogic() {
    const path = window.location.pathname;
    if (path.includes('admin')) initAdmin();
    if (path.includes('staff')) initStaff();
    if (path.includes('customer')) initCustomer();
}

// == ADMIN LOGIC ==
let revenueChart;

async function initAdmin() {
    window.showSection = (sectionId) => {
        document.querySelectorAll('main > section').forEach(el => el.style.display = 'none');
        const section = document.getElementById(`sec-${sectionId}`);
        if (section) section.style.display = 'block';

        const titles = {
            'dashboard': 'Dashboard',
            'bookings': 'Bookings',
            'staff-leave': 'Leave Requests',
            'users': 'Users',
            'products': 'Products',
            'vouchers': 'Vouchers'
        };
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = titles[sectionId] || 'Dashboard';

        if (sectionId === 'dashboard') loadAdminStats();
        if (sectionId === 'bookings') loadBookings();
        if (sectionId === 'staff-leave') loadLeaveRequests();
        if (sectionId === 'users') loadUsers();
        if (sectionId === 'products') loadProducts();
        if (sectionId === 'vouchers') loadVouchers();
    };

    const adminForm = document.getElementById('admin-form');
    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = e.target.dataset.type;
            const id = e.target.dataset.id;
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            try {
                let res;
                if (type === 'product') {
                    res = id ? await putData(`/api/products/${id}`, data) : await postData('/api/products', data);
                } else if (type === 'voucher') {
                    res = id ? await putData(`/api/vouchers/${id}`, data) : await postData('/api/vouchers', data);
                }

                if (res && res.ok) {
                    closeAdminModal();
                    if (type === 'product') loadProducts();
                    if (type === 'voucher') loadVouchers();
                } else {
                    const err = res ? await res.json() : {};
                    alert(err.error || 'Operation failed');
                }
            } catch (err) {
                alert('Network Error');
            }
        });
    }

    loadAdminStats();
}

async function loadAdminStats() {
    const stats = await getData('/api/stats');
    const bookingsEl = document.getElementById('stat-bookings');
    const usersEl = document.getElementById('stat-users');
    const revenueEl = document.getElementById('stat-revenue');

    if (bookingsEl) bookingsEl.textContent = stats.bookings || 0;
    if (usersEl) usersEl.textContent = stats.users || 0;
    if (revenueEl) revenueEl.textContent = `R${stats.revenue || 0}`;

    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (ctx && !revenueChart) {
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [1200, 1900, 3000, 2500, 4200, 3900],
                    borderColor: '#E8B4C8',
                    tension: 0.4
                }]
            }
        });
    }
}

// == DATA LOADERS ==
async function loadProducts() {
    productsData = await getData('/api/products');
    const tbody = document.getElementById('products-table');
    if (!tbody) return;

    if (!Array.isArray(productsData)) productsData = [];

    tbody.innerHTML = productsData.map(p => `
        <tr>
            <td><img src="${p.image || 'https://via.placeholder.com/50'}" width="50" style="border-radius:4px;"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>R${p.price}</td>
            <td>${p.stock}</td>
            <td>
                <button class="btn-sm btn-primary" onclick='openProductModal("${p._id}")'>Edit</button>
                <button class="btn-sm btn-danger" onclick="deleteProduct('${p._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function loadVouchers() {
    const vouchers = await getData('/api/vouchers');
    const tbody = document.getElementById('vouchers-table');
    if (!tbody) return;

    if (!Array.isArray(vouchers)) return;

    tbody.innerHTML = vouchers.map(v => `
        <tr>
            <td>${v.code}</td>
            <td>R${v.discount}</td>
            <td>${new Date(v.expiry).toLocaleDateString()}</td>
            <td><span class="status-badge ${v.isActive ? 'status-confirmed' : 'status-rejected'}">${v.isActive ? 'Active' : 'Expired'}</span></td>
            <td><button class="btn-sm btn-danger" onclick="deleteVoucher('${v._id}')">Delete</button></td>
        </tr>
    `).join('');
}

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
                ${l.status === 'pending' ? `<button class="btn-sm btn-success" onclick="approveLeave('${l._id}')">Approve</button>` : ''}
            </td>
        </tr>
    `).join('');
}

async function loadBookings() {
    const bookings = await getData('/api/bookings');
    const tbody = document.getElementById('appointments-table');
    if (!tbody || !Array.isArray(bookings)) return;
    tbody.innerHTML = bookings.map(b => `
        <tr>
            <td>${b.name}</td>
            <td>${b.service}</td>
            <td>${new Date(b.date).toLocaleDateString()}</td>
            <td><span class="status-badge status-${b.status}">${b.status}</span></td>
        </tr>
    `).join('');
}

async function loadUsers() {
    const users = await getData('/api/users');
    const tbody = document.getElementById('users-table');
    if (!tbody || !Array.isArray(users)) return;
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
        </tr>
    `).join('');
}

// == GLOBAL FUNCTIONS (MUST BE AT BOTTOM FOR SCOPE SAFETY) ==

function openProductModal(productId = null) {
    try {
        const form = document.getElementById('admin-form');
        const title = document.getElementById('modal-title');
        const modal = document.getElementById('admin-modal');

        if (!form || !title || !modal) {
            console.error('Modal elements not found');
            return;
        }

        let product = {};
        if (productId && Array.isArray(productsData)) {
            product = productsData.find(p => p._id === productId) || {};
        }

        form.dataset.type = 'product';
        form.dataset.id = product._id || '';
        title.textContent = product._id ? 'Edit Product' : 'Add Product';

        form.innerHTML = `
            <input type="text" name="name" placeholder="Product Name" value="${product.name || ''}" required style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
            <input type="number" name="price" placeholder="Price (R)" value="${product.price || ''}" required style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
            <input type="text" name="category" placeholder="Category" value="${product.category || ''}" required style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
            <input type="number" name="stock" placeholder="Stock Quantity" value="${product.stock || 0}" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
            <input type="text" name="image" placeholder="Image URL (optional)" value="${product.image || ''}" style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
            <button type="submit" class="btn btn-primary btn-block" style="padding:10px; width:100%;">Save Product</button>
        `;
        modal.style.display = 'flex';
    } catch (e) {
        console.error("Open Product Modal Error:", e);
        alert("Error opening product form: " + e.message);
    }
}

function deleteProduct(id) {
    if (confirm('Delete this product?')) {
        deleteData(`/api/products/${id}`).then(() => {
            loadProducts();
        }).catch(err => {
            alert('Failed to delete product: ' + err.message);
        });
    }
}

function openVoucherModal() {
    try {
        const form = document.getElementById('admin-form');
        const title = document.getElementById('modal-title');
        const modal = document.getElementById('admin-modal');

        if (!form || !title || !modal) {
            console.error('Modal elements not found');
            return;
        }

        form.dataset.type = 'voucher';
        form.dataset.id = '';
        title.textContent = 'Create Voucher';
        form.innerHTML = `
            <input type="text" name="code" placeholder="Voucher Code (e.g. SAVE20)" required style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
            <input type="number" name="discount" placeholder="Discount Amount (R)" required style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
            <input type="date" name="expiry" required style="width:100%; padding:8px; margin-bottom:10px; border:1px solid #ccc; border-radius:4px;">
            <button type="submit" class="btn btn-primary btn-block" style="padding:10px; width:100%;">Create</button>
        `;
        modal.style.display = 'flex';
    } catch (e) {
        console.error("Open Voucher Modal Error:", e);
        alert("Error opening voucher form: " + e.message);
    }
}

function deleteVoucher(id) {
    if (confirm('Delete this voucher?')) {
        deleteData(`/api/vouchers/${id}`).then(() => {
            loadVouchers();
        }).catch(err => {
            alert('Failed to delete voucher: ' + err.message);
        });
    }
}

function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.style.display = 'none';
}

function approveLeave(id) {
    putData(`/api/leave/${id}`, { status: 'approved' }).then(() => {
        loadLeaveRequests();
    }).catch(err => {
        alert('Failed to approve leave: ' + err.message);
    });
}

function searchUsers() {
    const query = document.getElementById('search-input')?.value;
    if (!query) return;
    getData('/api/users').then(users => {
        const filtered = users.filter(u => u.name.includes(query) || u.email.includes(query));
        const tbody = document.getElementById('users-results');
        if (tbody) tbody.innerHTML = filtered.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td></tr>`).join('');
    }).catch(err => {
        alert('Failed to search users: ' + err.message);
    });
}

// == STAFF & CUSTOMER LOGIC ==
async function initStaff() {
    window.showSection = (id) => {
        document.querySelectorAll('main > section').forEach(el => el.style.display = 'none');
        const section = document.getElementById(`sec-${id}`);
        if (section) section.style.display = 'block';
    };
    
    const leaveForm = document.getElementById('leave-form');
    if (leaveForm) {
        leaveForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                startDate: document.getElementById('leave-start').value,
                endDate: document.getElementById('leave-end').value,
                reason: document.getElementById('leave-reason').value
            };
            try {
                await postData('/api/leave', data);
                alert('Leave Requested!');
                e.target.reset();
            } catch (err) {
                alert('Failed to request leave: ' + err.message);
            }
        });
    }
    loadBookings();
}

async function initCustomer() {
    const bookings = await getData('/api/bookings');
    const tbody = document.getElementById('appointments-table');
    if (tbody && Array.isArray(bookings)) {
        tbody.innerHTML = bookings.map(b => `<tr><td>${b.service}</td><td>${new Date(b.date).toLocaleDateString()}</td><td>${b.status}</td></tr>`).join('');
    }
    const statVisits = document.getElementById('stat-visits');
    if (statVisits) statVisits.textContent = bookings ? bookings.length : 0;
}
