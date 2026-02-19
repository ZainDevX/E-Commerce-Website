/* ============================================
   GlassCart — Main App Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollTop();
    initMobileMenu();
    setActiveNavLink();
});

// ---- Sticky Navbar on Scroll ----
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ---- Scroll To Top Button ----
function initScrollTop() {
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (!scrollTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ---- Mobile Menu ----
function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-overlay');
    const links = document.querySelectorAll('.mobile-menu a');

    if (!toggle || !menu) return;

    const closeMenu = () => {
        toggle.classList.remove('active');
        menu.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.contains('active');
        if (isOpen) {
            closeMenu();
        } else {
            toggle.classList.add('active');
            menu.classList.add('active');
            overlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    overlay?.addEventListener('click', closeMenu);
    links.forEach(link => link.addEventListener('click', closeMenu));
}

// ---- Active Nav Link ----
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ---- Generate Navigation HTML ----
function getNavHTML() {
    return `
    <nav class="navbar" id="navbar">
        <div class="container">
            <a href="index.html" class="nav-logo">
                <i class="ri-shopping-bag-3-line"></i>
                <span>GlassCart</span>
            </a>
            
            <div class="nav-links">
                <a href="index.html">Home</a>
                <a href="shop.html">Shop</a>
                <a href="about.html">About</a>
                <a href="contact.html">Contact</a>
            </div>

            <div class="nav-actions">
                <button class="nav-action-btn search-trigger" title="Search">
                    <i class="ri-search-line"></i>
                </button>
                <a href="wishlist.html" class="nav-action-btn" title="Wishlist">
                    <i class="ri-heart-line"></i>
                    <span class="badge wishlist-count" style="display:none;">0</span>
                </a>
                <a href="cart.html" class="nav-action-btn cart-icon" title="Cart">
                    <i class="ri-shopping-cart-2-line"></i>
                    <span class="badge cart-count" style="display:none;">0</span>
                </a>
                <a href="auth.html" class="nav-action-btn" title="Account">
                    <i class="ri-user-line"></i>
                </a>
                <div class="nav-toggle" aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    </nav>

    <!-- Mobile Menu -->
    <div class="mobile-overlay"></div>
    <div class="mobile-menu">
        <a href="index.html"><i class="ri-home-line"></i> Home</a>
        <a href="shop.html"><i class="ri-store-2-line"></i> Shop</a>
        <a href="about.html"><i class="ri-information-line"></i> About</a>
        <a href="contact.html"><i class="ri-mail-line"></i> Contact</a>
        <a href="wishlist.html"><i class="ri-heart-line"></i> Wishlist</a>
        <a href="cart.html"><i class="ri-shopping-cart-2-line"></i> Cart</a>
        <a href="auth.html"><i class="ri-user-line"></i> Account</a>
    </div>

    <!-- Search Overlay -->
    <div class="search-overlay">
        <div class="search-overlay-content">
            <button class="search-close"><i class="ri-close-line"></i></button>
            <h2>Search Products</h2>
            <div class="search-input-wrapper">
                <i class="ri-search-line"></i>
                <input type="text" class="search-input" placeholder="Type to search..." autocomplete="off">
            </div>
            <div class="search-results"></div>
        </div>
    </div>
    `;
}

// ---- Search Overlay Styles (inline since it's generated) ----
function getSearchOverlayCSS() {
    return `
    <style>
        .search-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 9999;
            display: none;
            align-items: flex-start;
            justify-content: center;
            padding-top: 15vh;
        }
        .search-overlay.active { display: flex; }
        .search-overlay-content {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 40px;
            width: 90%;
            max-width: 600px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.15);
            position: relative;
        }
        .search-overlay-content h2 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #2563EB, #60A5FA);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .search-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            cursor: pointer;
            border: none;
            transition: 0.3s ease;
        }
        .search-close:hover { background: rgba(0,0,0,0.1); }
        .search-input-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(0,0,0,0.04);
            border: 2px solid rgba(37,99,235,0.15);
            border-radius: 50px;
            padding: 14px 20px;
            transition: 0.3s ease;
        }
        .search-input-wrapper:focus-within {
            border-color: #2563EB;
            box-shadow: 0 0 0 4px rgba(37,99,235,0.08);
        }
        .search-input-wrapper i { color: #94A3B8; font-size: 1.2rem; }
        .search-input {
            flex: 1;
            background: none;
            border: none;
            font-size: 1rem;
            color: #1E293B;
            outline: none;
        }
        .search-results { margin-top: 20px; }
        .search-result-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 12px 16px;
            border-radius: 12px;
            transition: 0.2s ease;
            text-decoration: none;
            color: inherit;
        }
        .search-result-item:hover {
            background: rgba(37,99,235,0.06);
        }
        .search-result-img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
        .search-result-item h4 { font-size: 0.95rem; margin-bottom: 2px; }
        .search-result-price { font-size: 0.85rem; color: #2563EB; font-weight: 600; }
        .search-no-results { color: #94A3B8; text-align: center; padding: 20px; }

        @media (max-width: 576px) {
            .search-overlay { padding-top: 10vh; }
            .search-overlay-content {
                padding: 24px;
                width: 94%;
                border-radius: 16px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .search-overlay-content h2 { font-size: 1.2rem; margin-bottom: 14px; }
            .search-input-wrapper { padding: 12px 16px; }
            .search-input { font-size: 0.9rem; }
            .search-result-item { gap: 12px; padding: 10px 12px; }
            .search-result-img { width: 40px; height: 40px; border-radius: 8px; }
            .search-result-item h4 { font-size: 0.85rem; }
            .search-close { width: 34px; height: 34px; top: 12px; right: 12px; font-size: 1.2rem; }
        }
    </style>
    `;
}

// ---- Generate Footer HTML ----
function getFooterHTML() {
    return `
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <a href="index.html" class="nav-logo" style="margin-bottom:16px;display:inline-flex;">
                        <i class="ri-shopping-bag-3-line"></i>
                        <span>GlassCart</span>
                    </a>
                    <p>Your premium destination for quality products. We bring you the best from around the world with free shipping on orders over $100.</p>
                    <div class="footer-social">
                        <a href="#" aria-label="Facebook"><i class="ri-facebook-fill"></i></a>
                        <a href="#" aria-label="Twitter"><i class="ri-twitter-x-fill"></i></a>
                        <a href="#" aria-label="Instagram"><i class="ri-instagram-fill"></i></a>
                        <a href="#" aria-label="YouTube"><i class="ri-youtube-fill"></i></a>
                    </div>
                </div>
                <div class="footer-col">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="shop.html">Shop</a></li>
                        <li><a href="about.html">About Us</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Customer Service</h3>
                    <ul>
                        <li><a href="#">FAQ</a></li>
                        <li><a href="#">Shipping Info</a></li>
                        <li><a href="#">Returns & Exchanges</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Newsletter</h3>
                    <p>Subscribe and get 15% off your first order!</p>
                    <div class="footer-newsletter">
                        <form class="newsletter-form" onsubmit="event.preventDefault(); showToast('Subscribed successfully!', 'success'); this.reset();">
                            <input type="email" placeholder="Your email" required>
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 GlassCart. All rights reserved.</p>
                <div class="footer-payments">
                    <span>VISA</span>
                    <span>MC</span>
                    <span>AMEX</span>
                    <span>PAYPAL</span>
                </div>
            </div>
        </div>
    </footer>

    <!-- Scroll to Top -->
    <button class="scroll-top" aria-label="Scroll to top">
        <i class="ri-arrow-up-line"></i>
    </button>
    `;
}
