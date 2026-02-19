/* ============================================
   GlassCart — Cart Logic
   ============================================ */

const CART_KEY = 'glasscart_cart';
const WISHLIST_KEY = 'glasscart_wishlist';

// ---- Cart Functions ----
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
}

function addToCart(productId, quantity = 1, color = null, size = null) {
    const cart = getCart();
    const existing = cart.find(item => 
        item.productId === productId && 
        item.selectedColor === color && 
        item.selectedSize === size
    );

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ productId, quantity, selectedColor: color, selectedSize: size });
    }

    saveCart(cart);
    showToast('Added to cart!', 'success');
    animateCartIcon();
    return cart;
}

function removeFromCart(productId, color = null, size = null) {
    let cart = getCart();
    cart = cart.filter(item => 
        !(item.productId === productId && 
          item.selectedColor === color && 
          item.selectedSize === size)
    );
    saveCart(cart);
    showToast('Removed from cart', 'info');
    return cart;
}

function updateCartQuantity(productId, newQuantity, color = null, size = null) {
    const cart = getCart();
    const item = cart.find(item => 
        item.productId === productId && 
        item.selectedColor === color && 
        item.selectedSize === size
    );

    if (item) {
        if (newQuantity <= 0) {
            return removeFromCart(productId, color, size);
        }
        item.quantity = newQuantity;
        saveCart(cart);
    }
    return cart;
}

function getCartCount() {
    return getCart().reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            return total + (product.price * item.quantity);
        }
        return total;
    }, 0);
}

function getCartSubtotal() {
    return getCartTotal();
}

function getShippingCost(subtotal) {
    return subtotal >= 100 ? 0 : 9.99;
}

function getTax(subtotal) {
    return subtotal * 0.08; // 8% tax
}

function getCartGrandTotal() {
    const subtotal = getCartSubtotal();
    return subtotal + getShippingCost(subtotal) + getTax(subtotal);
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: [] } }));
}

function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-count');
    const count = getCartCount();
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

function animateCartIcon() {
    const cartIcons = document.querySelectorAll('.cart-icon');
    cartIcons.forEach(icon => {
        icon.classList.add('cart-bounce');
        setTimeout(() => icon.classList.remove('cart-bounce'), 500);
    });
}

// ---- Wishlist Functions ----
function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch {
        return [];
    }
}

function saveWishlist(wishlist) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    updateWishlistBadge();
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { wishlist } }));
}

function toggleWishlist(productId) {
    const wishlist = getWishlist();
    const index = wishlist.indexOf(productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('Removed from wishlist', 'info');
    } else {
        wishlist.push(productId);
        showToast('Added to wishlist!', 'success');
    }

    saveWishlist(wishlist);
    return wishlist;
}

function isInWishlist(productId) {
    return getWishlist().includes(productId);
}

function getWishlistCount() {
    return getWishlist().length;
}

function updateWishlistBadge() {
    const badges = document.querySelectorAll('.wishlist-count');
    const count = getWishlistCount();
    badges.forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    });
}

// ---- Toast Notifications ----
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'ri-check-line',
        error: 'ri-error-warning-line',
        info: 'ri-information-line'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ---- Product Card HTML Generator ----
function createProductCardHTML(product) {
    const wishlistClass = isInWishlist(product.id) ? 'wishlisted' : '';
    const wishlistIcon = isInWishlist(product.id) ? 'ri-heart-fill' : 'ri-heart-line';
    
    const starsHTML = generateStarsHTML(product.rating);
    
    let badgeHTML = '';
    if (product.badge) {
        const badgeClass = product.badge.toLowerCase();
        badgeHTML = `<span class="product-card__badge ${badgeClass}">${product.badge}</span>`;
    }

    return `
        <article class="product-card reveal" data-product-id="${product.id}">
            <div class="product-card__image" style="background: ${product.gradient};">
                <div class="product-bg" style="background: ${product.gradient};"></div>
                ${badgeHTML}
                <div class="product-card__actions">
                    <button class="product-card__action-btn wishlist-btn ${wishlistClass}" onclick="handleWishlistToggle(${product.id}, this)" title="Add to Wishlist">
                        <i class="${wishlistIcon}"></i>
                    </button>
                    <a href="product.html?id=${product.id}" class="product-card__action-btn" title="Quick View">
                        <i class="ri-eye-line"></i>
                    </a>
                </div>
                <img src="${product.image}" alt="${product.name}" class="product-card__img" loading="lazy">
            </div>
            <div class="product-card__info">
                <span class="product-card__category">${product.categoryLabel}</span>
                <h3 class="product-card__name">
                    <a href="product.html?id=${product.id}">${product.name}</a>
                </h3>
                <div class="product-card__rating">
                    <div class="product-card__stars">${starsHTML}</div>
                    <span class="product-card__reviews">(${product.reviews})</span>
                </div>
                <div class="product-card__bottom">
                    <div class="product-card__price">
                        <span class="product-card__current-price">$${product.price.toFixed(2)}</span>
                        ${product.originalPrice ? `<span class="product-card__original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                    </div>
                    <button class="product-card__add-btn" onclick="handleAddToCart(${product.id})" title="Add to Cart">
                        <i class="ri-add-line"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}

function generateStarsHTML(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="ri-star-fill"></i>';
        } else if (i - rating < 1 && i - rating > 0) {
            stars += '<i class="ri-star-half-fill"></i>';
        } else {
            stars += '<i class="ri-star-line empty"></i>';
        }
    }
    return stars;
}

function handleAddToCart(productId) {
    addToCart(productId);
}

function handleWishlistToggle(productId, btn) {
    toggleWishlist(productId);
    const icon = btn.querySelector('i');
    if (isInWishlist(productId)) {
        btn.classList.add('wishlisted');
        icon.className = 'ri-heart-fill';
    } else {
        btn.classList.remove('wishlisted');
        icon.className = 'ri-heart-line';
    }
}

// Init badges on load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    updateWishlistBadge();
});
