/* ============================================
   GlassCart — UI Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initAccordion();
    initTabs();
    initRipple();
    initSidebar();
    initModal();
});

// ---- Search Overlay ----
function initSearch() {
    const searchBtn = document.querySelector('.search-trigger');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchClose = document.querySelector('.search-close');
    const searchInput = document.querySelector('.search-input');

    if (!searchBtn || !searchOverlay) return;

    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput?.focus(), 300);
    });

    searchClose?.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
    });

    searchOverlay?.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('active');
        }
    });

    // Live search
    searchInput?.addEventListener('input', debounce((e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            hideSearchResults();
            return;
        }
        const results = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
        showSearchResults(results);
    }, 300));
}

function showSearchResults(results) {
    let container = document.querySelector('.search-results');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = '<p class="search-no-results">No products found</p>';
        return;
    }

    container.innerHTML = results.slice(0, 6).map(p => `
        <a href="product.html?id=${p.id}" class="search-result-item">
            <img src="${p.image}" alt="${p.name}" class="search-result-img" loading="lazy">
            <div>
                <h4>${p.name}</h4>
                <span class="search-result-price">$${p.price.toFixed(2)}</span>
            </div>
        </a>
    `).join('');
}

function hideSearchResults() {
    const container = document.querySelector('.search-results');
    if (container) container.innerHTML = '';
}

// ---- Accordion / FAQ ----
function initAccordion() {
    const triggers = document.querySelectorAll('.accordion-trigger, .faq-question');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.closest('.accordion-item, .faq-item');
            const content = item.querySelector('.accordion-content, .faq-answer');
            const isOpen = item.classList.contains('active');

            // Close all others
            const parent = item.parentElement;
            parent.querySelectorAll('.accordion-item.active, .faq-item.active').forEach(openItem => {
                openItem.classList.remove('active');
                const openContent = openItem.querySelector('.accordion-content, .faq-answer');
                if (openContent) openContent.style.maxHeight = null;
            });

            // Toggle current
            if (!isOpen) {
                item.classList.add('active');
                if (content) content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

// ---- Tabs ----
function initTabs() {
    const tabContainers = document.querySelectorAll('.tabs');
    
    tabContainers.forEach(container => {
        const buttons = container.querySelectorAll('.tab-btn');
        const panels = container.querySelectorAll('.tab-panel');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;

                buttons.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                document.getElementById(target)?.classList.add('active');
            });
        });
    });
}

// ---- Ripple Effect on Buttons ----
function initRipple() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn, .btn-primary, .btn-secondary, .btn-accent');
        if (!btn) return;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        
        btn.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
}

// ---- Filter Sidebar (Shop Page) ----
function initSidebar() {
    const filterToggle = document.querySelector('.filter-toggle');
    const sidebar = document.querySelector('.shop-sidebar');
    const sidebarClose = document.querySelector('.sidebar-close');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');

    if (!filterToggle || !sidebar) return;

    filterToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        sidebarOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    const closeSidebar = () => {
        sidebar.classList.remove('active');
        sidebarOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    };

    sidebarClose?.addEventListener('click', closeSidebar);
    sidebarOverlay?.addEventListener('click', closeSidebar);
}

// ---- Modal ----
function initModal() {
    // Close on overlay click or close button
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target);
        }
        if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
            const overlay = e.target.closest('.modal-overlay');
            closeModal(overlay);
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) closeModal(activeModal);
        }
    });
}

function openModal(selector) {
    const modal = document.querySelector(selector);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(overlay) {
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ---- Debounce Utility ----
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ---- Format Currency ----
function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

// ---- Get URL Parameter ----
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
