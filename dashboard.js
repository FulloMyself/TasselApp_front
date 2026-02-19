// front/dashboard.js
const API_URL = 'https://tasselapp-back.onrender.com';

// Global store
let productsData = [];
let vouchersData = [];

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

// Profile Modal Functions
window.openProfileModal = function () {
    try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user) {
            alert('Please login again.');
            return;
        }

        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        const passInput = document.getElementById('profile-pass');
        const passConfirmInput = document.getElementById('profile-pass-confirm');
        const modal = document.getElementById('profile-modal');

        if (!nameInput || !emailInput || !modal) {
            console.error('Profile modal elements not found');
            alert('Profile modal elements not found in the DOM');
            return;
        }

        nameInput.value = user.name || '';
        emailInput.value = user.email || '';
        if (passInput) passInput.value = '';
        if (passConfirmInput) passConfirmInput.value = '';

        modal.classList.add('active');
    } catch (e) {
        console.error('Error opening profile modal:', e);
        alert("Error opening profile: " + e.message);
    }
};

window.closeProfileModal = function () {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.remove('active');
    }
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

            console.log('Form submission:', { type, id, data }); // Debug log

            // Convert types
            if (type === 'product') {
                data.price = parseFloat(data.price);
                data.stock = parseInt(data.stock) || 0;
            } else if (type === 'voucher') {
                data.discount = parseFloat(data.discount);
                data.isActive = data.isActive === 'on';

                // Ensure discount type is set
                if (!data.discountType) {
                    data.discountType = 'fixed';
                }

                console.log('Processed voucher data:', data); // Debug log
            }

            try {
                let res;
                let url;

                if (type === 'product') {
                    url = id ? `/api/products/${id}` : '/api/products';
                    res = id ? await putData(url, data) : await postData(url, data);
                } else if (type === 'voucher') {
                    url = id ? `/api/vouchers/${id}` : '/api/vouchers';
                    console.log('Sending request to:', url); // Debug log
                    res = id ? await putData(url, data) : await postData(url, data);
                }

                if (res && res.ok) {
                    closeAdminModal();
                    if (type === 'product') {
                        await loadProducts();
                    } else if (type === 'voucher') {
                        await loadVouchers();
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

    // Load initial data
    loadAdminStats();
    loadProducts();
    loadVouchers();
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
                    label: 'Revenue (R)',
                    data: [1200, 1900, 3000, 2500, 4200, 3900],
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
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// == PRODUCT MANAGEMENT ==
async function loadProducts() {
    productsData = await getData('/api/products');
    const tbody = document.getElementById('products-table');
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

// == VOUCHER MANAGEMENT ==
async function loadVouchers() {
    vouchersData = await getData('/api/vouchers');
    const tbody = document.getElementById('vouchers-table');
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
            console.log('Loading voucher for edit:', voucher); // Debug log
        }

        form.dataset.type = 'voucher';
        form.dataset.id = voucher._id || '';
        title.textContent = voucher._id ? 'Edit Voucher' : 'Create New Voucher';

        // Set default values
        const discountType = voucher.discountType || 'fixed';
        const isPercentage = discountType === 'percentage';

        // Format expiry date for input field
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

        // Add event listener to toggle max attribute based on discount type
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
    if (modal) {
        modal.classList.remove('active');
    }
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

// == BOOKING MANAGEMENT ==
async function loadBookings() {
    const bookings = await getData('/api/bookings');
    const tbody = document.getElementById('bookings-table');
    if (!tbody || !Array.isArray(bookings)) return;

    tbody.innerHTML = bookings.map(b => {
        const date = b.date ? new Date(b.date).toLocaleDateString() : 'N/A';
        return `
            <tr>
                <td>${b.name || 'N/A'}</td>
                <td>${b.service || 'N/A'}</td>
                <td>${date} at ${b.time || 'N/A'}</td>
                <td><span class="status-badge status-${b.status || 'pending'}">${b.status || 'pending'}</span></td>
                <td>
                    <button class="btn-sm btn-success" onclick="window.updateBookingStatus('${b._id}', 'confirmed')">Confirm</button>
                    <button class="btn-sm btn-danger" onclick="window.updateBookingStatus('${b._id}', 'cancelled')">Cancel</button>
                </td>
            </tr>
        `;
    }).join('');
}

window.updateBookingStatus = async function (id, status) {
    if (!id) return;
    if (confirm(`Mark this booking as ${status}?`)) {
        try {
            const res = await putData(`/api/bookings/${id}`, { status });
            if (res.ok) {
                await loadBookings();
                alert(`Booking marked as ${status}!`);
            } else {
                alert('Failed to update booking');
            }
        } catch (err) {
            console.error('Update booking error:', err);
            alert('Error: ' + err.message);
        }
    }
};

// == USER MANAGEMENT ==
async function loadUsers() {
    const users = await getData('/api/users');
    const tbody = document.getElementById('users-table');
    if (!tbody || !Array.isArray(users)) return;

    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.name || 'N/A'}</td>
            <td>${u.email || 'N/A'}</td>
            <td><span class="status-badge status-${u.role || 'customer'}">${u.role || 'customer'}</span></td>
            <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
        </tr>
    `).join('');
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
                        <td><button class="btn-sm btn-primary" onclick="alert('View bookings for ${u.name}')">View Bookings</button></td>
                    </tr>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Search error:', err);
        alert('Failed to search users: ' + err.message);
    }
};

// == STAFF LOGIC ==
async function initStaff() {
    window.showSection = (id) => {
        document.querySelectorAll('main > section').forEach(el => el.style.display = 'none');
        const section = document.getElementById(`sec-${id}`);
        if (section) section.style.display = 'block';

        if (id === 'schedule') loadStaffSchedule();
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

            if (!data.startDate || !data.endDate || !data.reason) {
                alert('Please fill in all fields');
                return;
            }

            try {
                const res = await postData('/api/leave', data);
                if (res.ok) {
                    alert('Leave Request Submitted!');
                    e.target.reset();
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
    loadStaffSchedule();
}

async function loadStaffSchedule() {
    const bookings = await getData('/api/bookings');
    const tbody = document.getElementById('appointments-table');
    if (tbody && Array.isArray(bookings)) {
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter(b => {
            const bookingDate = b.date ? new Date(b.date).toISOString().split('T')[0] : '';
            return bookingDate === today;
        });

        if (todayBookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No appointments today</td></tr>';
        } else {
            tbody.innerHTML = todayBookings.map(b => `
                <tr>
                    <td>${b.name || 'N/A'}</td>
                    <td>${b.service || 'N/A'}</td>
                    <td>${b.time || 'N/A'}</td>
                    <td><span class="status-badge status-${b.status || 'pending'}">${b.status || 'pending'}</span></td>
                </tr>
            `).join('');
        }
    }
}

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

    // Find next appointment
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

// Make all functions globally available
window.showSection = window.showSection;
window.openProfileModal = window.openProfileModal;
window.closeProfileModal = window.closeProfileModal;
window.openProductModal = window.openProductModal;
window.deleteProduct = window.deleteProduct;
window.openVoucherModal = window.openVoucherModal;
window.deleteVoucher = window.deleteVoucher;
window.closeAdminModal = window.closeAdminModal;
window.approveLeave = window.approveLeave;
window.rejectLeave = window.rejectLeave;
window.updateBookingStatus = window.updateBookingStatus;
window.searchUsers = window.searchUsers;