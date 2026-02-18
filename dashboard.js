// front/dashboard.js
const API_URL = 'https://tasselapp-back.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initLogout();
    initProfile();
    initPageLogic();
});

// == AUTH & CORE ==
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const path = window.location.pathname;

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    if (path.includes('admin') && user.role !== 'admin') {
        alert('Access Denied'); window.location.href = 'customer.html';
    }
    if (path.includes('staff') && (user.role !== 'staff' && user.role !== 'admin')) {
        alert('Access Denied'); window.location.href = 'customer.html';
    }

    const userNameEl = document.getElementById('user-name');
    if (userNameEl && user) userNameEl.textContent = user.name;
}

function initLogout() {
    const btn = document.getElementById('logout-btn');
    if (btn) btn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

// == API HELPERS ==
async function getData(endpoint) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` }});
    return res.json();
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

            if (pass && pass !== passConfirm) {
                return alert('Passwords do not match!');
            }

            const updateData = { name, email };
            if (pass) updateData.password = pass;

            const res = await putData('/api/users/me', updateData);
            const data = await res.json();

            if (res.ok) {
                alert('Profile updated successfully!');
                localStorage.setItem('user', JSON.stringify(data.user)); // Update local storage
                document.getElementById('user-name').textContent = data.user.name; // Update UI
                closeProfileModal();
            } else {
                alert(data.error || 'Update failed');
            }
        });
    }
}

window.openProfileModal = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('profile-name').value = user.name;
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-pass').value = '';
    document.getElementById('profile-pass-confirm').value = '';
    document.getElementById('profile-modal').style.display = 'flex';
};

window.closeProfileModal = () => {
    document.getElementById('profile-modal').style.display = 'none';
};

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
    // Navigation
    window.showSection = (sectionId) => {
        document.querySelectorAll('main > section').forEach(el => el.style.display = 'none');
        document.getElementById(`sec-${sectionId}`).style.display = 'block';
        
        const titles = { 'dashboard': 'Dashboard', 'bookings': 'Bookings', 'staff-leave': 'Leave Requests', 'users': 'Users', 'products': 'Products', 'vouchers': 'Vouchers' };
        document.getElementById('page-title').textContent = titles[sectionId] || 'Dashboard';

        // Loaders
        if(sectionId === 'dashboard') loadAdminStats();
        if(sectionId === 'bookings') loadBookings();
        if(sectionId === 'staff-leave') loadLeaveRequests();
        if(sectionId === 'users') loadUsers();
        if(sectionId === 'products') loadProducts();
        if(sectionId === 'vouchers') loadVouchers();
    };

    // Admin Modal Logic
    const adminForm = document.getElementById('admin-form');
    if(adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = document.getElementById('admin-form').dataset.type;
            const id = document.getElementById('admin-form').dataset.id;
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            let res;
            if (type === 'product') {
                res = id ? await putData(`/api/products/${id}`, data) : await postData('/api/products', data);
            } else if (type === 'voucher') {
                res = id ? await putData(`/api/vouchers/${id}`, data) : await postData('/api/vouchers', data);
            }

            if (res.ok) {
                closeAdminModal();
                if (type === 'product') loadProducts();
                if (type === 'voucher') loadVouchers();
            } else {
                alert('Operation failed');
            }
        });
    }

    loadAdminStats();
}

async function loadAdminStats() {
    const stats = await getData('/api/stats');
    document.getElementById('stat-bookings').textContent = stats.bookings || 0;
    document.getElementById('stat-users').textContent = stats.users || 0;
    document.getElementById('stat-revenue').textContent = `R${stats.revenue || 0}`;

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

// == PRODUCTS ==
window.openProductModal = (product = {}) => {
    const form = document.getElementById('admin-form');
    form.dataset.type = 'product';
    form.dataset.id = product._id || '';
    document.getElementById('modal-title').textContent = product._id ? 'Edit Product' : 'Add Product';
    
    form.innerHTML = `
        <input type="text" name="name" placeholder="Product Name" value="${product.name || ''}" required style="width:100%; padding:8px; margin-bottom:10px;">
        <input type="number" name="price" placeholder="Price (R)" value="${product.price || ''}" required style="width:100%; padding:8px; margin-bottom:10px;">
        <input type="text" name="category" placeholder="Category" value="${product.category || ''}" required style="width:100%; padding:8px; margin-bottom:10px;">
        <input type="number" name="stock" placeholder="Stock Quantity" value="${product.stock || 0}" style="width:100%; padding:8px;">
        <button type="submit" class="btn btn-primary btn-block" style="margin-top:1rem;">Save Product</button>
    `;
    document.getElementById('admin-modal').style.display = 'flex';
};

async function loadProducts() {
    const products = await getData('/api/products');
    const tbody = document.getElementById('products-table');
    if(!tbody) return;
    tbody.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.image || 'https://via.placeholder.com/50'}" width="50"></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>R${p.price}</td>
            <td>${p.stock}</td>
            <td>
                <button class="btn-sm btn-primary" onclick='openProductModal(${JSON.stringify(p)})'>Edit</button>
                <button class="btn-sm btn-danger" onclick="deleteProduct('${p._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

window.deleteProduct = async (id) => {
    if(confirm('Delete this product?')) {
        await deleteData(`/api/products/${id}`);
        loadProducts();
    }
};

// == VOUCHERS ==
window.openVoucherModal = () => {
    const form = document.getElementById('admin-form');
    form.dataset.type = 'voucher';
    form.dataset.id = '';
    document.getElementById('modal-title').textContent = 'Create Voucher';
    form.innerHTML = `
        <input type="text" name="code" placeholder="Voucher Code (e.g. SAVE20)" required style="width:100%; padding:8px; margin-bottom:10px;">
        <input type="number" name="discount" placeholder="Discount Amount (R)" required style="width:100%; padding:8px; margin-bottom:10px;">
        <input type="date" name="expiry" required style="width:100%; padding:8px;">
        <button type="submit" class="btn btn-primary btn-block" style="margin-top:1rem;">Create</button>
    `;
    document.getElementById('admin-modal').style.display = 'flex';
};

async function loadVouchers() {
    const vouchers = await getData('/api/vouchers');
    const tbody = document.getElementById('vouchers-table');
    if(!tbody) return;
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

window.deleteVoucher = async (id) => {
    if(confirm('Delete this voucher?')) {
        await deleteData(`/api/vouchers/${id}`);
        loadVouchers();
    }
};

window.closeAdminModal = () => document.getElementById('admin-modal').style.display = 'none';

// == LEAVE & BOOKINGS (Shared with Staff) ==
async function loadLeaveRequests() {
    const leaves = await getData('/api/leave');
    const tbody = document.getElementById('leave-table');
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

window.approveLeave = async (id) => { await putData(`/api/leave/${id}`, { status: 'approved' }); loadLeaveRequests(); };

async function loadBookings() {
    const bookings = await getData('/api/bookings');
    const tbody = document.getElementById('appointments-table');
    if(!tbody) return;
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
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
        </tr>
    `).join('');
}

// == STAFF & CUSTOMER LOGIC (Keep previous logic or simplify) ==
async function initStaff() {
    window.showSection = (id) => {
        document.querySelectorAll('main > section').forEach(el => el.style.display = 'none');
        document.getElementById(`sec-${id}`).style.display = 'block';
    };
    document.getElementById('leave-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { startDate: document.getElementById('leave-start').value, endDate: document.getElementById('leave-end').value, reason: document.getElementById('leave-reason').value };
        await postData('/api/leave', data);
        alert('Leave Requested!');
        e.target.reset();
    });
    loadBookings();
}

async function initCustomer() {
    const bookings = await getData('/api/bookings');
    const tbody = document.getElementById('appointments-table');
    if(tbody) tbody.innerHTML = bookings.map(b => `<tr><td>${b.service}</td><td>${new Date(b.date).toLocaleDateString()}</td><td>${b.status}</td></tr>`).join('');
    document.getElementById('stat-visits').textContent = bookings.length;
}

window.searchUsers = async () => {
    const query = document.getElementById('search-input').value;
    const users = await getData('/api/users');
    const filtered = users.filter(u => u.name.includes(query) || u.email.includes(query));
    const tbody = document.getElementById('users-results');
    tbody.innerHTML = filtered.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td></tr>`).join('');
};
