// shop.js - Shopping page functionality

document.addEventListener('DOMContentLoaded', function() {
    loadAllProducts();
});

async function loadAllProducts() {
    try {
        const API_URL = 'https://tasselapp-back.onrender.com';
        const res = await fetch(`${API_URL}/api/products/public`);
        if (!res.ok) throw new Error('Failed to load products');
        
        const products = await res.json();
        const container = document.getElementById('products-list');
        if (!container) return;

        container.innerHTML = '';

        products.forEach(p => {
            let imageUrl = p.image || './assets/images/product-default.jpg';
            
            if (imageUrl && !imageUrl.startsWith('./') && !imageUrl.startsWith('http')) {
                if (imageUrl.startsWith('/')) {
                    imageUrl = '.' + imageUrl;
                } else {
                    imageUrl = './' + imageUrl;
                }
            }

            const onSale = p.salePrice && p.salePrice > 0 && p.salePrice < p.price;
            const displayPrice = onSale ? p.salePrice : p.price;

            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-id', p._id);

            card.innerHTML = `
            <div class="product-image">
                <img src="${imageUrl}" alt="${p.name}" onerror="this.onerror=null; this.src='./assets/images/product-default.jpg';">
                ${onSale ? '<div class="sale-badge">SALE</div>' : ''}
            </div>
            <div class="product-content">
                <h4 class="product-name">${p.name}</h4>
                <div class="product-price-container">
                    ${onSale ? `<span class="original-price">R${p.price.toFixed(2)}</span>` : ''}
                    <span class="product-price">R${displayPrice.toFixed(2)}</span>
                </div>
                <div class="product-category">${p.category || ''}</div>
                <button class="btn btn-sm btn-primary add-to-cart-btn" 
                        data-product='${JSON.stringify({
                id: p._id,
                name: p.name,
                price: p.price,
                salePrice: p.salePrice || 0,
                image: imageUrl,
                category: p.category || ''
            }).replace(/'/g, '&apos;')}'>
                    Add to Cart
                </button>
            </div>
        `;

            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart-btn')) {
                    showProductPopup(p);
                }
            });

            container.appendChild(card);
        });

        // Add cart button listeners
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productData = JSON.parse(btn.dataset.product);
                if (window.tasselCart) {
                    window.tasselCart.addItem(productData);
                    showNotification('Added to cart!', 'success');
                }
            });
        });

    } catch (err) {
        console.error('Failed to load products', err);
    }
}

function showProductPopup(product) {
    const existingPopup = document.querySelector('.product-popup-overlay');
    if (existingPopup) existingPopup.remove();

    const onSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.price;
    const displayPrice = onSale ? product.salePrice : product.price;
    
    let imageUrl = product.image || './assets/images/product-default.jpg';
    if (imageUrl && !imageUrl.startsWith('./') && !imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('/')) {
            imageUrl = '.' + imageUrl;
        } else {
            imageUrl = './' + imageUrl;
        }
    }

    const popup = document.createElement('div');
    popup.className = 'product-popup-overlay';
    popup.innerHTML = `
    <div class="product-popup">
        <button class="popup-close">&times;</button>
        <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null; this.src='./assets/images/product-default.jpg';">
        <h3>${product.name}</h3>
        <p>${product.description || 'No description available.'}</p>
        <div class="product-price-container">
            ${onSale ? `<span class="original-price">R${product.price.toFixed(2)}</span>` : ''}
            <span class="product-price">R${displayPrice.toFixed(2)}</span>
        </div>
        <button class="btn btn-primary add-to-cart-popup">Add to Cart</button>
    </div>
`;

    document.body.appendChild(popup);

    popup.addEventListener('click', (e) => {
        if (e.target === popup) popup.remove();
    });

    popup.querySelector('.popup-close').addEventListener('click', () => popup.remove());

    popup.querySelector('.add-to-cart-popup').addEventListener('click', () => {
        if (window.tasselCart) {
            window.tasselCart.addItem({
                id: product._id,
                name: product.name,
                price: product.price,
                salePrice: product.salePrice || 0,
                image: imageUrl
            });
            showNotification('Added to cart!', 'success');
            popup.remove();
        }
    });
}

function showNotification(message, type = 'info') {
    // Use the same notification function from scripts.js
    if (window.showNotification) {
        window.showNotification(message, type);
    }
}