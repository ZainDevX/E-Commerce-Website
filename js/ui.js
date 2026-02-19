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

// ---- Fuzzy Search Utility ----
function fuzzyMatch(text, query) {
    text = text.toLowerCase();
    query = query.toLowerCase();

    // Exact substring match — highest score
    if (text.includes(query)) {
        const idx = text.indexOf(query);
        // Boost if match is at the beginning
        const positionBonus = idx === 0 ? 30 : (idx < 5 ? 15 : 0);
        return { match: true, score: 100 + positionBonus };
    }

    // Word-start matching — each query word starts a word in text
    const queryWords = query.split(/\s+/);
    const textWords = text.split(/\s+/);
    let wordMatches = 0;
    for (const qw of queryWords) {
        if (textWords.some(tw => tw.startsWith(qw))) wordMatches++;
    }
    if (wordMatches === queryWords.length && queryWords.length > 0) {
        return { match: true, score: 80 };
    }

    // Fuzzy character-by-character matching
    let qi = 0;
    let consecutiveBonus = 0;
    let lastMatchIdx = -2;
    for (let ti = 0; ti < text.length && qi < query.length; ti++) {
        if (text[ti] === query[qi]) {
            if (ti === lastMatchIdx + 1) consecutiveBonus += 5;
            lastMatchIdx = ti;
            qi++;
        }
    }
    if (qi === query.length) {
        const coverage = query.length / text.length;
        const score = 40 + (coverage * 30) + consecutiveBonus;
        return { match: true, score: Math.min(score, 79) }; // Cap below word-match
    }

    // Levenshtein for short queries (typo tolerance)
    if (query.length >= 3 && query.length <= 12) {
        for (const tw of textWords) {
            const dist = levenshtein(tw.substring(0, query.length + 2), query);
            if (dist <= Math.floor(query.length / 3)) {
                return { match: true, score: 30 - dist * 5 };
            }
        }
    }

    return { match: false, score: 0 };
}

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

function fuzzySearchProducts(query) {
    if (!query || query.length < 1) return [];
    const results = [];

    for (const p of products) {
        let bestScore = 0;

        // Search across multiple fields with different weights
        const fields = [
            { text: p.name, weight: 3 },
            { text: p.categoryLabel, weight: 2 },
            { text: p.category, weight: 1.5 },
            { text: p.description, weight: 1 },
            { text: (p.features || []).join(' '), weight: 1 }
        ];

        for (const field of fields) {
            const result = fuzzyMatch(field.text, query);
            if (result.match) {
                bestScore = Math.max(bestScore, result.score * field.weight);
            }
        }

        if (bestScore > 0) {
            results.push({ product: p, score: bestScore });
        }
    }

    results.sort((a, b) => b.score - a.score);
    return results.map(r => r.product);
}

// ---- Highlight matched text ----
function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// ---- Search Overlay ----
function initSearch() {
    const searchBtn = document.querySelector('.search-trigger');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchClose = document.querySelector('.search-close');
    const searchInput = document.querySelector('.search-input');

    if (!searchBtn || !searchOverlay) return;

    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => searchInput?.focus(), 300);
    });

    function closeSearch() {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    searchClose?.addEventListener('click', closeSearch);

    searchOverlay?.addEventListener('click', (e) => {
        if (e.target === searchOverlay) closeSearch();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });

    // Live fuzzy search
    searchInput?.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim();
        if (query.length < 1) {
            hideSearchResults();
            return;
        }
        const results = fuzzySearchProducts(query);
        showSearchResults(results, query);
    }, 200));

    // Enter key navigates to shop with search param
    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                closeSearch();
                window.location.href = 'shop.html?search=' + encodeURIComponent(query);
            }
        }
    });
}

function generateStarsSmall(rating) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) s += '<i class="ri-star-fill"></i>';
        else if (i - 0.5 <= rating) s += '<i class="ri-star-half-fill"></i>';
        else s += '<i class="ri-star-line"></i>';
    }
    return s;
}

function showSearchResults(results, query) {
    let container = document.querySelector('.search-results');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = `
            <div class="search-no-results">
                <i class="ri-search-eye-line" style="font-size:2.5rem;display:block;margin-bottom:8px;color:#CBD5E1;"></i>
                <p>No products found for "<strong>${query}</strong>"</p>
                <span style="font-size:0.8rem;color:#94A3B8;">Try a different keyword or check the spelling</span>
            </div>`;
        return;
    }

    const count = results.length;
    let html = `<div class="search-results-header">
        <span class="search-results-count">${count} product${count !== 1 ? 's' : ''} found</span>
        ${count > 8 ? `<a href="shop.html?search=${encodeURIComponent(query)}" class="search-view-all">View all <i class="ri-arrow-right-line"></i></a>` : ''}
    </div>`;

    html += '<div class="search-results-list">';
    html += results.slice(0, 8).map(p => {
        const hasDiscount = p.originalPrice && p.originalPrice > p.price;
        const discountPercent = hasDiscount ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
        return `
        <a href="product.html?id=${p.id}" class="search-result-item">
            <div class="search-result-img-wrap">
                <img src="${p.image}" alt="${p.name}" class="search-result-img" loading="lazy">
                ${p.badge ? `<span class="search-result-badge badge-${p.badge.toLowerCase()}">${p.badge}</span>` : ''}
            </div>
            <div class="search-result-info">
                <h4>${highlightMatch(p.name, query)}</h4>
                <span class="search-result-category">${p.categoryLabel}</span>
                <div class="search-result-meta">
                    <div class="search-result-rating">${generateStarsSmall(p.rating)} <span>${p.rating}</span></div>
                    <div class="search-result-prices">
                        <span class="search-result-price">$${p.price.toFixed(2)}</span>
                        ${hasDiscount ? `<span class="search-result-original">$${p.originalPrice.toFixed(2)}</span>` : ''}
                        ${hasDiscount ? `<span class="search-result-discount">-${discountPercent}%</span>` : ''}
                    </div>
                </div>
            </div>
            <i class="ri-arrow-right-s-line search-result-arrow"></i>
        </a>`;
    }).join('');
    html += '</div>';

    if (count > 8) {
        html += `<a href="shop.html?search=${encodeURIComponent(query)}" class="search-see-all-btn">
            See all ${count} results <i class="ri-arrow-right-line"></i>
        </a>`;
    }

    container.innerHTML = html;
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
