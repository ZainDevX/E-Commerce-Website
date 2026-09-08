# GlassCart — Migration Master Plan

**Status:** living source of truth  
**Created:** 2026-09-08  
**Last updated:** 2026-09-08 (session: Phase 1 vanilla tag + Phase 2 Vite/React 19 client shell)  
**Current phase:** Phase 2 complete → next is Phase 3  
**Implementation started:** Yes. Vanilla frozen at local tag `v1-vanilla`. `client/` shell exists. Do not delete vanilla HTML until Phase 9.

This file is the persistent handoff document for every future session. Read it before changing anything. Do not rely on chat history.

---

## HOW TO USE THIS FILE IN A NEW SESSION

1. Read this entire file (or at least: Status Dashboard, Current Session Handoff, Decisions Log, Known Issues, and the current phase section).
2. Inspect the repository. This document describes the repo as of 2026-09-08; if files have changed, trust the files and then update this document.
3. Do not invent APIs, tables, env vars, or UI.
4. Do not use Prisma. Database work is PostgreSQL + Drizzle only.
5. Do not delete vanilla HTML/CSS/JS until Phase 9 visual parity is verified.
6. At the end of every implementation session, update: Status Dashboard, Current Session Handoff, Decisions Log, Files Changed, and any new env/API/route entries.

If information is missing from both this file and the repository, write `UNCERTAIN — repository evidence insufficient` and stop rather than guessing.

---

## 1. Project overview

**Project name:** GlassCart  
**Tagline (from `index.html` / `CONTEXT.md`):** "Shop the Future, Today"  
**Current implementation:** static multi-page storefront, vanilla HTML + CSS + JavaScript, no backend, no database, no build tool, no `package.json`.  
**Current version documented in `CONTEXT.md`:** 2.0.0 (dated February 2026).  
**GitHub (from `README.md`):** https://github.com/ZainDevX/E-Commerce-Website.git  
**Goal of this migration:** turn GlassCart into a professional PERN + TypeScript application (PostgreSQL, Express, React, Node) while preserving the existing glassmorphism UI, then add real auth, COD checkout, order tracking, and an admin portal that matches the same visual identity.

**What exists today (verified):** 10 HTML pages, 3 CSS files, 5 JS files, `CONTEXT.md`, `README.md`, `.gitignore`. Product catalog is a JS array (24 products, 6 categories, 4 testimonials). Cart and wishlist persist in `localStorage`. Auth, contact, newsletter, coupon, and checkout are UI demos.

**What does not exist today (verified):** no `package.json`, no React, no Express, no PostgreSQL, no ORM, no users, no orders, no admin, no order tracking, no real payments, no `assets/images` directory (mentioned in `CONTEXT.md` but absent from the tree).

---

## 2. Existing repository audit

### 2.1 Root tree (verified 2026-09-08)

```
/
├── index.html          30520 bytes   Home
├── shop.html           28297 bytes   Catalog
├── product.html        24232 bytes   Product detail (body mostly empty; JS fills it)
├── cart.html           16599 bytes   Cart (body mostly empty; JS fills it)
├── checkout.html       25138 bytes   Checkout (3-step form in HTML)
├── about.html          23917 bytes   About (mostly static)
├── contact.html        21028 bytes   Contact (mostly static)
├── auth.html           22761 bytes   Login/Register (both forms in DOM)
├── wishlist.html       14470 bytes   Wishlist (body mostly empty; JS fills it)
├── 404.html             9108 bytes   Not found
├── CONTEXT.md          17392 bytes   Project context (some claims diverge from code)
├── README.md            7492 bytes
├── .gitignore            206 bytes   already ignores node_modules/, dist/, build/
├── css/
│   ├── style.css       32541 bytes
│   ├── animations.css   8592 bytes
│   └── responsive.css  13386 bytes
└── js/
    ├── app.js          17286 bytes   nav/footer HTML strings + search overlay CSS string
    ├── products.js     24966 bytes   products, categories, testimonials (+ CommonJS export)
    ├── cart.js          9183 bytes   localStorage cart/wishlist, toast, product card HTML
    ├── ui.js           14321 bytes   search, accordion, tabs, ripple, sidebar, modal, fuzzy search
    └── animations.js    3795 bytes   IntersectionObserver reveal, parallax, counters
```

No `assets/` folder is present. Product images are remote Unsplash URLs. Avatars are `i.pravatar.cc`. Icons are Remix Icon CDN v4.1.0. Fonts are Google Fonts Inter + Poppins, imported at the top of `css/style.css`.

### 2.2 How every page is assembled (verified)

Every HTML page follows the same pattern:

1. `<head>` loads `css/style.css`, `css/animations.css`, `css/responsive.css`, Remix Icon CDN, then a large page-local `<style>` block.
2. Body starts with `<div id="nav-placeholder"></div>` and ends with `<div id="footer-placeholder"></div>`.
3. Scripts load in order: `products.js` → `cart.js` → `app.js` → `animations.js` → `ui.js` → page-inline `<script>`.
4. On `DOMContentLoaded` the page does:

```javascript
document.getElementById('nav-placeholder').innerHTML = getNavHTML() + getSearchOverlayCSS();
document.getElementById('footer-placeholder').innerHTML = getFooterHTML();
initNavbar(); initScrollTop(); initMobileMenu(); setActiveNavLink();
updateCartBadge(); updateWishlistBadge();
```

**Implication:** Navbar, mobile menu, search overlay, footer, and scroll-to-top do not live in the HTML files. Their source of truth is `js/app.js`.

### 2.3 CONTEXT.md vs actual files (do not blindly trust CONTEXT)

| CONTEXT.md claim | Actual files |
|------------------|--------------|
| Product gallery with thumbnail selector | `product.html` renders **one** `<img>` from `product.image`. No thumbnail array. |
| `assets/images/` placeholder directory | Directory **does not exist**. |
| Typewriter animation on hero heading | `typeText()` exists in `animations.js` but is **never called**. Hero `<h1>` is static text. |
| Desktop breakpoint 1200px+ | CSS media queries actually used: 1024, 768, 576, 480, 380, min-width 1400. |
| "No external images" then Unsplash | Images are Unsplash + Pravatar; internet required. |
| Category counts in `categories` array | Hardcoded counts are **stale**: electronics listed as 6 but 5 products; fashion listed as 5 but 4 products. Real total is 24. |
| Coupon GLASS15 | UI toast only. Totals never change (`cart.html` `applyCoupon()`). |

When CONTEXT and code disagree, **code wins**.

---

## 3. Existing page / functionality inventory

### 3.1 Page map

| Current file | Title | Static HTML vs JS-generated | React source of truth |
|--------------|-------|-----------------------------|------------------------|
| `index.html` | GlassCart — Shop the Future, Today | Hybrid. Hero, marquee, offers countdown, features, newsletter are in HTML. `#categoriesGrid`, `#trendingGrid`, `#newArrivalsGrid`, `#testimonialsGrid` filled by page script. | Lift static sections from HTML. Lift grids from the page script + `createProductCardHTML`. |
| `shop.html` | Shop — GlassCart | Hybrid. Filter chrome in HTML. `#categoryFilters`, `#shopGrid`, `#pagination`, `#activeFilters` filled by JS. | Lift chrome from HTML. Grid from `createProductCardHTML`. Filter logic from page script. |
| `product.html` | Product — GlassCart | Shell only. `#productDetail` and `#productTabs` empty. | Lift templates from the inline script (`renderProduct`, `renderTabs`, `renderRelated`). |
| `cart.html` | Shopping Cart | Shell only. `#cartContent` empty. | Lift `renderCart()` template (empty state + items + summary). |
| `wishlist.html` | Wishlist | Shell only. | Lift `renderWishlist()` — **different card markup than product cards**. |
| `checkout.html` | Checkout | 3-step form **is in the HTML**. `#checkoutItems` / totals filled by JS. Success modal in HTML. | Lift form 1:1. Lift summary from `renderCheckoutSummary()`. |
| `about.html` | About | Almost fully static. Stats use `data-count`. | 1:1 JSX lift. |
| `contact.html` | Contact | Static form, info cards, map placeholder, FAQ. | 1:1 JSX lift + form/FAQ state. |
| `auth.html` | Account | Login and register **both in the DOM**; tabs toggle `.active`. | 1:1 JSX lift + tab/validation state. |
| `404.html` | 404 | Static. Search redirects to `shop.html?search=`. | 1:1 JSX lift. |

### 3.2 Shared chrome (not in HTML files)

| Piece | Source | Notes |
|-------|--------|-------|
| Navbar | `js/app.js` `getNavHTML()` | Links: Home, Shop, About, Contact. Actions: search, wishlist, cart (badge), auth, hamburger. |
| Mobile menu | same | Duplicate of nav links plus Wishlist/Cart/Account. |
| Search overlay markup | `getNavHTML()` | `.search-overlay` inside the nav HTML string. |
| Search overlay CSS | `getNavHTML()` companion `getSearchOverlayCSS()` | Entire stylesheet is a JS string, including a `@media (max-width: 576px)` block. **Not in `css/`.** |
| Footer + scroll-top | `getFooterHTML()` | 4 columns: About, Quick Links, Customer Service, Newsletter. Payment badges VISA/MC/AMEX/PAYPAL are CSS-styled spans, not processors. Customer Service links are `href="#"`. |
| Product card | `js/cart.js` `createProductCardHTML()` | BEM: `.product-card`, `.product-card__image`, etc. |
| Toast | `js/cart.js` `showToast()` | Types: success, error, info. Auto-remove 3000ms. Container class `.toast-container` styled in `style.css`. |
| Stars | `generateStarsHTML()` / `generateStarsSmall()` | Remix Icon full / half / empty. |

### 3.3 Home-page dynamic rules (from `index.html` inline script)

- Categories: `categories.map` → `.category-card` linking to `shop.html?category=${slug}`.
- Trending: `products.sort((a,b) => b.reviews - a.reviews).slice(0, 8)` then `createProductCardHTML`.
- New arrivals: `products.filter(p => p.badge === 'New').slice(0, 4)`.
- Testimonials: `testimonials` array in `products.js`.
- Countdown: `new Date()` + 3 days, updates `#days #hours #minutes #seconds`. Client-only, resets on reload. **Preserve this behavior** (not a backend feature).

### 3.4 Shop behavior (from `shop.html` inline script)

- `ITEMS_PER_PAGE = 9`.
- URL params: `?category=` (pre-checks a category checkbox), `?search=` (fills `#shopSearchInput`, uses `fuzzySearchProducts`).
- Filters: categories (multi checkbox), price min/max (defaults 0 and 500), rating radios (0 / 4 / 4.5), sort select.
- Sort keys: `popular` (reviews desc), `newest` (id desc), `price-low`, `price-high`, `rating`.
- Grid/list toggle: class `list-view` on `#shopGrid`. Hidden below 480px via page CSS.
- Mobile drawer: `.shop-sidebar.active` + `.sidebar-overlay.active` + `body.style.overflow`.
- **Duplicate handlers:** `ui.js` `initSidebar()` AND inline `onclick` on the same drawer controls. React must use **one** state flag.

### 3.5 Product detail behavior (from `product.html` inline script)

- `?id=` parsed as integer; missing/invalid id falls back to `1`; unknown id redirects to `shop.html`.
- Default color = `product.colors?.[0]`; default size = `product.sizes?.[0]`.
- Quantity 1–99, readonly input, `+/-` buttons.
- Related: same `category`, exclude self, `slice(0, 4)`.
- Tabs: Description, Specifications (`Object.entries(specifications)`), Reviews.
- **Reviews are not product data.** The script always injects the same 3 hardcoded reviews (Sarah J., Mike R., Emma L.) on every product. The `reviews` field on a product is only a **count** shown in the tab label.
- Gallery: single image, gradient background. No thumbnails in code.

### 3.6 Cart / wishlist / checkout (verified)

**localStorage keys**

- `glasscart_cart` → `[{ productId, quantity, selectedColor, selectedSize }]`
- `glasscart_wishlist` → `number[]` (product ids)

**Pricing (from `js/cart.js`)**

- Subtotal = sum of `product.price * quantity` (sale price, not `originalPrice`).
- Shipping = `subtotal >= 100 ? 0 : 9.99`.
- Tax = `subtotal * 0.08`.
- Grand total = subtotal + shipping + tax.
- Free-shipping note in cart UI: "Add $X more for free shipping" vs "You qualify for free shipping!".
- Savings row shown when any line has `originalPrice`.

**Coupon (from `cart.html`)**

- Input exists. Code `GLASS15` shows success toast and **does not change totals**. Any other code shows "Invalid coupon code".
- **Final product decision (overrides vanilla demo):** do not implement coupons. Do not keep the fake success path. See Deferred Features.

**Checkout (from `checkout.html`)**

- Empty cart → `window.location.href = 'cart.html'`.
- Steps: Shipping → Payment → Review. Classes `.step.active` / `.step.completed` / `.step-content.active`.
- Shipping fields: firstName, lastName, email, phone, address, city, state, zip, country (US/Canada/UK/Australia/Germany).
- Payment fields: card number (grouped in 4s), cardholder, expiry `MM/YY`, CVV. Card brand boxes VISA/MC/AMEX are decorative.
- `goToStep(3)` does **not** validate. Empty shipping is displayed as John / Doe / 123 Main St / New York / NY / 10001.
- `placeOrder()` generates `'GC-' + Math.random().toString(36).substr(2, 6).toUpperCase()`, calls `clearCart()`, opens `#successModal`. Nothing is persisted.

**Wishlist (from `wishlist.html`)**

- Empty state `.wishlist-empty` (not `.empty-state`).
- Cards use `.wishlist-card` — different from `.product-card`.
- `moveAllToCart` adds in-stock items, does **not** remove them from wishlist.
- `addToCartFromWishlist` adds qty 1 with no color/size.
- `clearWishlist` uses `confirm()`.

### 3.7 Auth / contact / newsletter (verified demos)

**Auth (`auth.html`)**

- Login: email regex `/\S+@\S+\.\S+/`, password required. Success toast: `'Signed in successfully! (UI Demo)'`.
- Register: name, email, password min 8, confirm match, terms checkbox. Success toast: `'Account created successfully! (UI Demo)'` then switches to login tab.
- Password strength: length≥8; mixed case; digit AND special. Classes `strength-weak|medium|strong`.
- Social buttons: Google, Apple, Facebook — no handlers.
- Forgot password: `href="#"`.
- Remember me: checkbox, no persistence.

**Contact (`contact.html`)**

- Fields: full name*, email*, phone optional, subject select* (`order|product|return|partnership|feedback|other`), message*.
- Submit: hides form, shows `#formSuccess`. No network request.
- FAQ: class toggle `.faq-item.active` via `toggleFAQ` (NOT the `maxHeight` path in `ui.js` `initAccordion`). React must follow the Contact page path.
- Map: styled placeholder, link to `https://maps.google.com`.
- Display copy: office 1234 Commerce Blvd, Suite 200, San Francisco, CA 94102; emails support@glasscart.com / business@glasscart.com; phone +1 (800) 123-4567 Mon–Fri 9am–6pm PST.

**Newsletter**

- Home large form and footer form: `preventDefault` + toast. No storage.

### 3.8 Footer dead links (verified)

Customer Service: FAQ, Shipping Info, Returns & Exchanges, Privacy Policy, Terms of Service — all `href="#"`.  
Social icons: `href="#"`.  
Do not invent those legal pages. Track Order will be a **new** real route; footer/nav should gain a working Track Order link when that feature is built.

### 3.9 FAQ copy vs future payments

`contact.html` FAQ currently says Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay are accepted. After COD-only checkout that sentence will be **wrong**. Update that FAQ answer when checkout becomes real (content change, not a redesign).

---

## 4. Existing CSS architecture

### 4.1 Three layers

**Layer A — global files (must copy byte-for-byte)**

1. `css/style.css` — Google Fonts `@import`, `:root` tokens, reset, utilities, `.glass-card`, buttons, navbar, product card, forms, footer, toast, floating shapes, scroll-top, skeleton, page-header, empty-state, modal, stars, quantity-control, tags, price-range.
2. `css/animations.css` — keyframes (`fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`, `scaleIn`, `float`, `pulse`, `shimmer`, `cartBounce`, etc.) and `.reveal*` helpers.
3. `css/responsive.css` — breakpoints 1024 / 768 / 576 / 480 / 380 / min 1400 / `prefers-reduced-motion` / print. **This file already targets page-specific classes** that are defined in HTML `<style>` blocks, not in `style.css` (examples: `.hero-visual`, `.shop-sidebar`, `.product-detail`, `.cart-item`, `.checkout-layout`, `.auth-container`, `.faq-question`).

**Layer B — page `<style>` blocks (must extract byte-for-byte, including their own `@media`)**

Approximate line ranges (inclusive of `<style>` … `</style>`):

| File | Style block ends ~line |
|------|------------------------|
| `index.html` | 448 |
| `shop.html` | 378 |
| `about.html` | 301 |
| `auth.html` | 296 |
| `checkout.html` | 261 |
| `product.html` | 343 |
| `contact.html` | 244 |
| `cart.html` | 182 |
| `wishlist.html` | 207 |
| `404.html` | 163 |

**Layer C — CSS inside JavaScript**

`js/app.js` `getSearchOverlayCSS()` (~lines 164–375): full overlay stylesheet plus `@media (max-width: 576px)`. Currently injected into the body with the nav HTML, so it loads **last**.

### 4.2 Current cascade order (must be preserved)

1. `style.css`
2. `animations.css`
3. `responsive.css`
4. page `<style>` (wins over `responsive.css` at equal specificity because it comes later)
5. search-overlay `<style>` injected at runtime (last)

### 4.3 Duplicated shop-drawer CSS — do not merge

At `max-width: 768px`:

- `responsive.css`: `.shop-sidebar` `background: rgba(255,255,255,0.95)`, `padding: var(--space-xl)`, no `!important`.
- `shop.html` inline: `position: fixed !important`, `background: rgba(255,255,255,0.97)`, `padding-top: 60px`, extra box-shadow.

Both blocks stay. "Cleaning up" this duplication **will** change the drawer.

### 4.4 SPA selector collisions (vanilla cannot hit these; React SPA can)

Vanilla loads one HTML document, so page CSS never meets another page. A React SPA keeps CSS in the document after navigation.

Documented collisions:

- `css/style.css` `.form-group` / `.form-input`
- `auth.html` redefines `.form-group` / `.form-group input` (icon wrappers, `.has-error`)
- `contact.html` redefines `.form-group input|select|textarea` (padding 12px 16px vs global 14px 18px)

**Mitigation (required):** wrap each storefront page root with `className="page-<name>"` and mechanically prefix every selector in that page's extracted CSS (e.g. `.page-auth .form-group`). This is a specificity lock, not a visual rewrite.

Do **not** use CSS Modules (would hash classes and break `responsive.css`).  
Do **not** use Tailwind or styled-components.

### 4.5 Target CSS folder

```
client/src/styles/
  index.css                 # import graph, cascade order only
  style.css                 # copy of css/style.css
  animations.css
  responsive.css
  search-overlay.css        # extracted from app.js
  pages/
    home.css
    shop.css
    product.css
    cart.css
    checkout.css
    about.css
    contact.css
    auth.css
    wishlist.css
    not-found.css
    track-order.css         # new, created in the order-tracking phase, matching existing tokens
    admin.css               # new, created in the admin phase, matching existing tokens
```

`client/src/styles/index.css` import order:

```css
@import './style.css';
@import './animations.css';
@import './responsive.css';
@import './pages/home.css';
@import './pages/shop.css';
@import './pages/product.css';
@import './pages/cart.css';
@import './pages/checkout.css';
@import './pages/about.css';
@import './pages/contact.css';
@import './pages/auth.css';
@import './pages/wishlist.css';
@import './pages/not-found.css';
@import './search-overlay.css';
```

`track-order.css` and `admin.css` are added in their phases, still imported **before** `search-overlay.css` to keep overlay last.

---

## 5. Existing JS behavior inventory

Classify every current JS unit. Do not run vanilla DOM code in parallel with React.

### 5.1 A — Pure logic → TypeScript utilities

| Symbol | File | Preserve |
|--------|------|----------|
| `products`, `categories`, `testimonials` | `js/products.js` | Exact objects. File already ends with `module.exports` for Node. |
| `fuzzyMatch`, `levenshtein`, `fuzzySearchProducts`, `highlightMatch` | `js/ui.js` | Same scoring/weights (name×3, categoryLabel×2, category×1.5, description×1, features×1). |
| `debounce` | `js/ui.js` | Search overlay uses 200ms. |
| `formatCurrency` | `js/ui.js` | `'$' + amount.toFixed(2)` |
| `getShippingCost`, `getTax`, subtotal math | `js/cart.js` | 100 / 9.99 / 0.08 |
| `generateStarsHTML` / `generateStarsSmall` | `cart.js` / `ui.js` | Star component |
| `checkPasswordStrength` | `auth.html` | Same score rules and CSS classes |
| Shop constants | `shop.html` | `ITEMS_PER_PAGE = 9`, sort keys, price defaults 0–500 |

Target: `client/src/lib/`.

### 5.2 B — Application state → React context / hooks

| State | Current | Target |
|-------|---------|--------|
| Cart | `localStorage` + `cartUpdated` event | `CartProvider` |
| Wishlist | `localStorage` + `wishlistUpdated` event | `WishlistProvider` |
| Auth | none (demo toast) | `AuthProvider` (Phase 14) |
| Shop filters / page / view | DOM + `currentPage` | `useShopFilters` + URL search params |
| Product color/size/qty | script locals | component state |
| Checkout step | `currentStep` | component state |
| Mobile menu / search overlay / shop drawer | `.active` classes | booleans that toggle those same classes |
| Toasts | DOM create/remove | `ToastProvider` |

Keep storage keys `glasscart_cart` and `glasscart_wishlist` through the UI-only phases so a browser that used the vanilla site can be compared against React.

### 5.3 C — DOM manipulation → React components

`getNavHTML`, `getFooterHTML`, `createProductCardHTML`, `showToast`, `showSearchResults`, `renderCart`, `renderWishlist`, `renderProduct`, `renderTabs`, `renderRelated`, `renderCheckoutSummary`, `renderProducts`, `renderPagination`, home grid populators.

### 5.4 D — Event listeners → React handlers / effects

`initNavbar` (`.scrolled` after 50px), `initScrollTop` (`.visible` after 400px), `initMobileMenu`, `initSearch` (Escape, overlay click, Enter → shop search param), `initRipple`, `initModal`, `initTabs`, shop `applyFilters`, checkout card-number/expiry formatters, auth submit validators.

Shop drawer: drop the duplicate `initSidebar` + inline onclick pair; one React boolean.

Contact FAQ: use `toggleFAQ` behavior (exclusive `.active`), not `initAccordion` `maxHeight`.

### 5.5 E — HTML string templates → TSX

Listed in §3. Wishlist card is **not** ProductCard.

### 5.6 F — localStorage → context + storage helpers

`CART_KEY`, `WISHLIST_KEY`, JSON parse with try/catch (already defensive in `cart.js`).

After Phase 15, logged-in users sync cart/wishlist to PostgreSQL. Guests remain on localStorage. Merge strategy: on login, union by (`productId`, `selectedColor`, `selectedSize`) summing quantities; wishlist union by product id.

### 5.7 G — Animations → hooks

| Function | File | React |
|----------|------|-------|
| `initScrollReveal` | `animations.js` | `useReveal` — observe `.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children`, add `.active` |
| `initCounters` | `animations.js` | `useCountUp` — `data-count`, `data-suffix`, `data-prefix`, 2000ms, `toLocaleString` |
| `initParallax` | `animations.js` | Only if `.parallax-element` exists in markup. **UNCERTAIN whether any HTML currently has that class** — grep during Phase 8; if unused, skip. |
| `typeText` | `animations.js` | **Dead code. Do not port.** |
| `staggerReveal` | `animations.js` | **Never called. Do not port.** CSS `.stagger-children` still exists; IntersectionObserver path is enough. |
| `animateCartIcon` | `cart.js` | Toggle `.cart-bounce` on `.cart-icon` for 500ms |
| Countdown timer | `index.html` | `useEffect` interval, 3 days from mount (parity) |
| Ripple | `ui.js` | Optional `useRipple` matching `.btn .ripple` CSS |

---

## 6. Target architecture

Monorepo with two packages, vanilla files kept at repo root until Phase 9:

```
/
  MIGRATION_MASTER_PLAN.md
  CONTEXT.md
  README.md
  package.json                 # npm workspaces: client, server
  .gitignore
  client/                      # Vite + React + TypeScript
  server/                      # Express + TypeScript + Drizzle + PostgreSQL
  index.html … 404.html        # VANILLA — do not delete before Phase 9 sign-off
  css/  js/                    # VANILLA
```

After Phase 9, move vanilla into `_vanilla_archive/` in one dedicated commit (still recoverable). Do not delete in the same commit as a React change.

**Why not Next.js:** CSS cascade is load-order sensitive; Express is the required API; interview story stays a classic PERN split.  
**Why not Turborepo:** unnecessary layer. npm workspaces are enough.  
**Why not Redux:** cart/wishlist/auth are three contexts.  
**Why not Prisma:** explicit project requirement. Use Drizzle.

**Process model**

- Browser: React SPA (Vite) on Vercel.
- API: Express on a persistent Node host (Azure preferred).
- DB: PostgreSQL on a persistent provider (Azure Database for PostgreSQL preferred). Avoid sleeping free DBs.

---

## 7. Technology stack

### Frontend (`client/`)

| Library | Role |
|---------|------|
| React 19 | UI (latest; see D29). Installed `react@19.2.8` / `react-dom@19.2.8` |
| Vite 8 | bundler / dev server. Installed `vite@8.2.2` |
| TypeScript 6 | types. Installed `typescript@6.0.3` (`~6.0.2`, Vite 8 template line) |
| React Router DOM 7 | SPA routing. Installed `react-router-dom@7.18.3` |
| Existing CSS | visual system (copied in Phase 3; not yet) |
| Remix Icon CDN v4.1.0 | icons (same as vanilla; linked in `client/index.html`) |

Use `fetch`. Do not add Axios unless a later session has a concrete need.

### Backend (`server/`)

| Library | Role |
|---------|------|
| Node.js | runtime |
| Express | HTTP API |
| TypeScript | types |
| Drizzle ORM | schema, queries, migrations |
| drizzle-kit | generate/run SQL migrations |
| `postgres` (postgres.js) | PostgreSQL driver used by Drizzle |
| Zod | request validation |
| bcryptjs | password hashing |
| jsonwebtoken | JWT access tokens |
| cors | CORS |
| dotenv | env loading |
| cookie-parser | only if cookie auth is chosen; default plan uses `Authorization: Bearer` because frontend and API are on different hosts (Vercel + Azure) |

Do **not** install Prisma, Tailwind, styled-components, CSS Modules as a design system, Next.js, Redux, Stripe, PayPal SDKs.

### Database

PostgreSQL. All DDL via Drizzle migrations. Seed from `js/products.js`.

---

## 8. Why each technology was selected

| Choice | Why (this project, not generic fashion) |
|--------|------------------------------------------|
| React 19 + Vite 8 + TS 6 | Required stack, on current library majors (D29). Vite is the simplest SPA toolchain; existing CSS imports cleanly. |
| React Router DOM 7 | Current site is 10 HTML files + query params (`shop.html?category=`, `product.html?id=`, `shop.html?search=`). SPA routes replace files; search params stay. `BrowserRouter` + `Routes` (library mode, not the RR framework). |
| Express + TS | Required. Matches the author's PERN skill and interview explanation. |
| PostgreSQL | Required. Relational orders/users/products. |
| Drizzle | Required by this plan (not Prisma). SQL-shaped, migration files are real SQL, easy to explain. |
| Zod | Single validation language on the server; maps cleanly to Drizzle insert types. |
| JWT Bearer | Cross-origin SPA + API. HttpOnly cookies across Vercel→Azure need `SameSite=None; Secure` plus CSRF; Bearer is simpler and interview-explainable. |
| bcryptjs | Standard password hashing. |
| Existing CSS | Months of glassmorphism/responsive work. Rewriting is the highest visual-risk path. |
| COD only | Explicit requirement. Card UI stays visible and disabled. |

---

## 9. Folder structure (target)

```
client/
  index.html
  package.json
  tsconfig.json
  tsconfig.app.json
  vite.config.ts
  public/
  src/
    main.tsx
    App.tsx
    vite-env.d.ts
    styles/                  # §4.5
    types/
      product.ts
      cart.ts
      user.ts
      order.ts
    data/
      products.ts            # Phase 5–12 only; removed after API integration
      categories.ts
      testimonials.ts
    lib/
      search.ts
      pricing.ts
      passwordStrength.ts
      format.ts
      storage.ts
    context/
      CartContext.tsx
      WishlistContext.tsx
      AuthContext.tsx
      ToastContext.tsx
    hooks/
      useReveal.ts
      useCountUp.ts
      useRipple.ts
      useShopFilters.ts
    api/
      client.ts              # fetch wrapper, VITE_API_URL, auth header
      products.ts
      auth.ts
      cart.ts
      orders.ts
      contact.ts
    components/
      layout/Navbar.tsx Footer.tsx Layout.tsx ScrollTop.tsx SearchOverlay.tsx
      product/ProductCard.tsx Stars.tsx WishlistCard.tsx
      cart/CartItem.tsx OrderSummary.tsx
      ui/Toast.tsx Modal.tsx EmptyState.tsx
    pages/
      Home.tsx Shop.tsx Product.tsx Cart.tsx Checkout.tsx
      About.tsx Contact.tsx Auth.tsx Wishlist.tsx NotFound.tsx
      TrackOrder.tsx
    admin/
      AdminLayout.tsx
      AdminLogin.tsx
      AdminProducts.tsx
      AdminProductForm.tsx
      AdminOrders.tsx
      AdminOrderDetail.tsx

server/
  package.json
  tsconfig.json
  drizzle.config.ts
  src/
    index.ts                 # listen
    app.ts                   # express app, cors, json, routes
    env.ts                   # validated env
    db/
      index.ts               # drizzle client
      schema/
        users.ts
        categories.ts
        products.ts
        cartItems.ts
        wishlistItems.ts
        orders.ts
        orderItems.ts
        contactMessages.ts
        newsletterSubscribers.ts
      seed.ts
    middleware/
      auth.ts                # requireAuth, requireAdmin
      errorHandler.ts
      validate.ts            # zod wrapper
    validation/              # zod schemas
    routes/
    controllers/
    services/
    utils/
      jwt.ts
      password.ts
      orderPublicId.ts       # GC-XXXXXX
  drizzle/                   # generated SQL migrations (committed)
```

Root `package.json` scripts (to be added in Phase 2 / 10):

- `dev` — concurrently `dev:client` `dev:server`
- `dev:client` / `dev:server`
- `db:generate` — `drizzle-kit generate`
- `db:migrate` — `drizzle-kit migrate`
- `db:seed` — `tsx server/src/db/seed.ts`
- `build` — build both

---

## 10. Frontend migration strategy

**Rule:** lift markup, do not rewrite visuals. Class names stay. CSS stays.

### 10.1 What to lift from where

1. Shared chrome from `js/app.js` and `js/cart.js` templates.
2. Static pages from HTML bodies (about, contact, auth, 404, checkout form, home static sections).
3. Dynamic pages from JS templates (product, cart, wishlist, shop grid, home grids).
4. Behavior from JS → hooks/context.
5. Data from `products.js` → TS modules, later API.

### 10.2 JSX mechanical conversions

| HTML | JSX |
|------|-----|
| `class` | `className` |
| `for` | `htmlFor` |
| `onclick` / `onchange` / `oninput` / `onsubmit` | React events |
| `style="a:b"` | `style={{ a: 'b' }}` |
| `<img>`, `<input>` | self-closing |
| `href="shop.html"` | `<Link to="/shop">` |
| `href="product.html?id=N"` | `<Link to={/product/${id}}>` |
| `href="shop.html?category=slug"` | `<Link to={/shop?category=slug}>` |
| `href="index.html"` | `<Link to="/">` |

Do not use `dangerouslySetInnerHTML` for pages. The only acceptable tiny use is search result `<mark>` highlighting, matching `highlightMatch()` in `ui.js`.

### 10.3 Component split (not giant pages)

- `Home`: Hero, Marquee, CategoryGrid, ProductGrid, OffersBanner, Testimonials, FeatureRow, Newsletter.
- `Shop`: FilterSidebar, ShopHeader, ActiveFilters, ProductGrid, Pagination.
- `Product`: gallery, info, options, tabs, related grid.
- `Checkout`: steps indicator, shipping form, payment step (COD + disabled cards), review, success modal.
- `Auth`: tabs wrapping existing login/register markup.

### 10.4 Visual parity testing

For each page, compare vanilla (live-server / file) vs React at widths **1400, 1024, 768, 576, 480, 380**. Check: nav, footer, glass cards, product cards, shop drawer, forms, 404.

---

## 11. Backend architecture

Layering (interview-simple, not a framework):

```
HTTP → routes → (validate zod) → controllers → services → Drizzle → PostgreSQL
                 ↘ middleware (auth, admin, error)
```

- **Routes:** wire paths and middleware only.
- **Controllers:** parse request, call service, shape JSON `{ data }` or `{ error, message }`.
- **Services:** business rules (pricing, stock decrement, status transitions, cart merge).
- **Middleware:** `requireAuth`, `requireAdmin`, `errorHandler`.
- **Validation:** Zod schemas, fail 400 with field errors.

**JSON envelope**

Success: `{ "data": ... }`  
Error: `{ "error": "CODE", "message": "human readable", "details": optional }`

HTTP codes: 400 validation, 401 unauthenticated, 403 not admin / not owner, 404 missing, 409 conflict (email taken, illegal status transition, insufficient stock), 500 unexpected.

No giant `routes/index.ts`. Split by domain: `auth`, `products`, `cart`, `wishlist`, `orders`, `contact`, `newsletter`, `admin/products`, `admin/orders`, `admin/messages`.

---

## 12. PostgreSQL schema strategy

Designed from **actual product objects** plus features this plan adds (users, orders, COD, tracking, admin). Not a generic e-commerce dump.

### 12.1 Product object (verbatim fields from `js/products.js`)

```ts
{
  id: number
  name: string
  category: string          // slug: electronics | fashion | home | beauty | sports | books
  categoryLabel: string
  price: number
  originalPrice: number | null
  rating: number
  reviews: number           // display count only; not a reviews table
  description: string
  badge: "New" | "Sale" | "Hot" | null
  colors: string[] | null   // hex strings
  sizes: string[] | null    // heterogeneous: clothing S–XXL, shoe EU, volume ml/L
  inStock: boolean
  features: string[]
  specifications: Record<string, string>
  gradient: string          // CSS linear-gradient(...)
  image: string             // Unsplash URL
}
```

Category object: `{ slug, name, icon, count, gradient, image }`.  
`count` in the current array is stale; **seed must compute count from products**.

Testimonial object: `{ id, name, role, avatar, rating, text, product }`. Stored as seed-only content in the frontend data module unless a testimonials table is needed later. **No testimonials table in v1** (home page can keep seeded frontend data or a simple JSON column later). Decision: keep testimonials as frontend static data copied from `products.js` (they are marketing copy, not user-generated). Revisit only if admin must edit them.

### 12.2 Tables

**users**

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name | varchar(120) not null | |
| email | varchar(255) not null unique | citext preferred if extension available; else lowercase in service |
| password_hash | varchar(255) not null | bcrypt |
| role | varchar(20) not null default `'customer'` | check: `customer` \| `admin` |
| created_at | timestamptz default now() | |
| updated_at | timestamptz default now() | |

No password-reset columns (feature deferred).

**categories**

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| slug | varchar(64) not null unique | |
| name | varchar(120) not null | |
| icon | varchar(64) not null | Remix Icon class e.g. `ri-computer-line` |
| gradient | text not null | |
| image | text not null | Unsplash URL |
| created_at | timestamptz default now() | |

**products**

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | keep ids 1–24 on seed so old links/`localStorage` still resolve |
| name | varchar(200) not null | |
| category_id | int not null FK categories(id) | |
| price | numeric(10,2) not null check > 0 | |
| original_price | numeric(10,2) null | |
| rating | numeric(2,1) not null default 0 | display; not computed from a reviews table |
| reviews_count | int not null default 0 | display count from current data |
| description | text not null | |
| badge | varchar(16) null | check null\|New\|Sale\|Hot |
| colors | jsonb null | `string[]` |
| sizes | jsonb null | `string[]` |
| stock_quantity | int not null default 0 check >= 0 | **extension:** current data only has boolean `inStock`. All 24 products are `inStock: true`. Seed `stock_quantity = 100`. Storefront `inStock` = `stock_quantity > 0`. |
| features | jsonb not null default `[]` | |
| specifications | jsonb not null default `{}` | |
| gradient | text not null | |
| image | text not null | single URL; **no product_images table** (repo has one image per product) |
| created_at | timestamptz default now() | |
| updated_at | timestamptz default now() | |

No separate `product_images` table. Evidence: one `image` field.

**cart_items** (logged-in only)

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | int not null FK users on delete cascade | |
| product_id | int not null FK products | |
| quantity | int not null check 1–99 | matches product page max 99 |
| selected_color | varchar(32) null | |
| selected_size | varchar(32) null | |
| unique (user_id, product_id, selected_color, selected_size) | | same merge key as `addToCart` |

**wishlist_items**

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| user_id | int not null FK users on delete cascade | |
| product_id | int not null FK products | |
| unique (user_id, product_id) | | |

**orders**

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | internal |
| public_id | varchar(16) not null unique | `GC-` + 6 uppercase alphanumeric, matching `placeOrder()` |
| user_id | int null FK users | null = guest |
| email | varchar(255) not null | always stored (guest and user) for tracking lookup |
| status | varchar(32) not null | see §17 |
| payment_method | varchar(16) not null | only `'cod'` in v1 |
| payment_status | varchar(16) not null default `'unpaid'` | COD: unpaid until delivered; then `paid` or remain unpaid — see §17 |
| subtotal | numeric(10,2) not null | |
| shipping | numeric(10,2) not null | |
| tax | numeric(10,2) not null | |
| total | numeric(10,2) not null | |
| shipping_first_name, shipping_last_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country | text/varchar | snapshot at checkout (no addresses table in v1; checkout never saved addresses) |
| created_at, updated_at | timestamptz | |

**No `addresses` table in v1.** Evidence: checkout writes fields onto the order only. Adding an address book would be a new product feature.

**order_items**

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| order_id | int not null FK orders on delete cascade | |
| product_id | int not null FK products | keep even if product later deleted? **Restrict product delete if order_items exist.** |
| name | varchar(200) not null | snapshot |
| image | text not null | snapshot |
| unit_price | numeric(10,2) not null | snapshot of `price` at purchase |
| quantity | int not null | |
| selected_color | varchar(32) null | |
| selected_size | varchar(32) null | |
| line_total | numeric(10,2) not null | |

**contact_messages**

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| name, email, phone, subject, message | as form | subject: the select values |
| created_at | timestamptz | |

**newsletter_subscribers**

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | |
| email | varchar(255) not null unique | |
| created_at | timestamptz | |

### 12.3 Indexes

- users(email)
- products(category_id)
- products(badge)
- orders(public_id)
- orders(email)
- orders(user_id)
- orders(status)
- cart_items(user_id)
- wishlist_items(user_id)

### 12.4 Intentionally omitted tables

| Prompt suggested | Verdict |
|------------------|---------|
| product_images | Omit. One URL field. |
| addresses | Omit. Checkout snapshots onto orders. |
| reviews | Omit. Hardcoded 3-review template is marketing copy, identical on every product. Keep as frontend static array. |
| coupons | Omit. Deferred. |
| payments / stripe customers | Omit. COD only. |

---

## 13. Drizzle strategy

- Schema in `server/src/db/schema/*.ts`.
- `server/drizzle.config.ts` reads `DATABASE_URL` from `server/.env`.
- Commands (names only; not Prisma):
  - `npm run db:generate` → `drizzle-kit generate` (SQL files under `server/drizzle/`)
  - `npm run db:migrate` → `drizzle-kit migrate`
  - `npm run db:seed` → runs `seed.ts`
- Commit generated SQL. Never hand-edit production DB without a migration.
- `strict` TypeScript. Infer types with Drizzle `$inferSelect` / `$inferInsert`.
- Seed:
  1. Upsert 6 categories from `js/products.js` (ignore stale `count`).
  2. Upsert products 1–24 with `stock_quantity = 100`.
  3. Upsert one admin user from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` created at seed time from `ADMIN_PASSWORD`).
- Idempotent seed (on conflict by email / product id / category slug).

Local Postgres: Docker is recommended if available; otherwise a local PostgreSQL 16 install. Connection string only in `server/.env`.

---

## 14. Authentication strategy

**Replace** the UI-demo toasts. Do not leave "Signed in successfully! (UI Demo)" in production UI.

- Register: name, email, password ≥ 8, confirm, terms required — same client checks, plus server Zod + unique email.
- Login: email + password. bcrypt compare. Return JWT + public user `{ id, name, email, role }`.
- JWT payload: `{ sub: userId, role }`. Expiry: 7 days (simple; no refresh-token rotation in v1).
- Client stores token in `localStorage` key `glasscart_token` (new key). Send `Authorization: Bearer`.
- `GET /api/auth/me` for session restore.
- Logout: client discards token. Server has no denylist in v1 (stateless JWT). Document this limitation.
- `requireAuth` on cart-sync, wishlist-sync, place-order-as-user, my-orders.
- `requireAdmin` on `/api/admin/*` and `/admin` UI (client also redirects non-admins).
- Guest checkout allowed (matches current checkout, which has no login gate). Order stores email + `user_id` null.
- Social login buttons remain visible and **disabled**, with toast: "Social login is not available yet."
- Forgot password link remains visible and **does not navigate to a fake flow**. Toast: "Password reset is not available yet."

Seed admin: from env, role `admin`. Never commit the password.

---

## 15. Cart / wishlist strategy

**Phase 5–14 (UI):** localStorage only, same keys/shape as vanilla.

**Phase 15 (logged-in persistence):**

- Guest: localStorage only.
- Logged in: PostgreSQL is source of truth; Context hydrates from `GET /api/cart` and `GET /api/wishlist` after login; writes go to API.
- Login merge: described in §5.6. Then overwrite localStorage with server result so badges match.
- Logout: keep a local copy of the last guest cart empty (start fresh guest cart). Do not leave the user's server cart in localStorage.

Quantity rules stay 1–99. Out-of-stock products: wishlist page already disables add-to-cart; API must reject cart add when `stock_quantity < 1`.

---

## 16. Checkout / COD strategy

**Cash on Delivery is the only functional payment method.**

Checkout keeps the existing 3-step layout (Shipping → Payment → Review) so CSS `.checkout-steps` / `.step-content` still apply.

**Payment step changes (content, not a redesign):**

- Add a payment-method choice at the top of the existing payment card:
  - **Cash on Delivery** — selected by default, enabled.
  - **Card** — visible because VISA/MC/AMEX UI already exists; marked **"Temporarily Unavailable"**; inputs disabled; cannot continue to Review if card is selected.
- Do not call Stripe/PayPal/Visa APIs.
- `payment_method` persisted as `'cod'` only.

**Pricing at order creation (server recomputes; never trust client totals):**

```
subtotal = sum(current product.price * qty)
shipping = subtotal >= 100 ? 0 : 9.99
tax = round(subtotal * 0.08, 2)
total = subtotal + shipping + tax
```

Use current catalog prices, not client-sent prices.

**Stock:** for each line, require `stock_quantity >= quantity`, then decrement in a transaction with the order insert.

**Validation:** unlike vanilla `goToStep`, React **must** validate shipping required fields before step 2, and require COD selected before step 3. This is an intentional behavior fix (vanilla silently invented "John Doe"). Documented in Decisions Log.

**Success modal:** keep existing markup/classes. Order number = `public_id` with `#` prefix as today (`#GC-XXXXXX`). Add a button/link to `/track-order?id=GC-XXXXXX` when tracking exists.

**Coupons:** the coupon box on the **cart** page stays in the markup for visual parity but Apply must not fake GLASS15. Show toast: "Coupons are not available yet." Do not send coupon codes to the API.

---

## 17. Order tracking strategy

New customer feature. Admin updates status.

### 17.1 Status values

Vanilla has no statuses (only a success modal). The list below is the COD lifecycle for this project:

| Status | Meaning |
|--------|---------|
| `pending` | Order placed, COD, awaiting admin confirmation |
| `confirmed` | Admin accepted the order |
| `processing` | Packing / warehouse |
| `shipped` | Handed to carrier |
| `out_for_delivery` | Local delivery |
| `delivered` | Complete |
| `cancelled` | Terminal; not fulfilled |

### 17.2 Transition rules (admin only)

```
pending           → confirmed | cancelled
confirmed         → processing | cancelled
processing        → shipped | cancelled
shipped           → out_for_delivery
out_for_delivery  → delivered
delivered         → (none)
cancelled         → (none)
```

Illegal transitions → 409. No customer-initiated cancel in v1 (not in current UI). Admin cancel restores `stock_quantity` for the order items.

`payment_status`: `unpaid` from pending through out_for_delivery; set `paid` when status becomes `delivered` (COD collected). If cancelled, `unpaid`.

### 17.3 Customer tracking behavior

- Route `/track-order`.
- UI: existing `page-header` + `glass-card` form: Order ID + Email (email prevents guessing `GC-` ids).
- Prefill Order ID from `?id=` (success modal / email).
- Result: public_id, date, status stepper (reuse visual language of `.checkout-steps`), item list (name, qty, line total), shipping city/country (not full street — **PII minimization**). If email+id mismatch → generic 404 "Order not found".
- Also: logged-in `GET /api/orders` list on a simple "My orders" area. **PENDING DECISION if a full `/account/orders` page is wanted.** Minimum for v1: Track Order page is enough; authenticated users can still use Track Order with their email. Optional `/account/orders` can be added if approved.

### 17.4 Admin update behavior

- `/admin/orders` table: public_id, email, total, status, created_at.
- `/admin/orders/:publicId` detail: items, shipping snapshot, status dropdown limited to **legal next statuses** (+ current).
- PATCH updates status; writes `updated_at`.

### 17.5 Database representation

`orders.status` varchar + check constraint of the 7 values. Optional later: `order_status_events` audit table. **v1: no events table** (keep simple). Status history is not shown to customers beyond current status.

### 17.6 API

See §19.

### 17.7 UI

New page using existing tokens. New `track-order.css` only for the stepper/result layout; colors from `:root`. Nav/footer: add "Track Order" under Customer Service (replacing the dead `#` "FAQ" is **not** required; add a new link rather than silently repurposing).

---

## 18. Admin portal strategy

There is **no admin UI today**. Build one that reuses `style.css` tokens, `.glass-card`, `.btn-primary`, Inter/Poppins, Remix icons. Do not introduce a dashboard kit.

### 18.1 Access

- `/admin/login` — same glass auth card language as `auth.html`, but posts to admin login (role must be `admin` or 403).
- All `/admin/*` client routes wrapped in `AdminLayout` that calls `/api/auth/me` and redirects if `role !== 'admin'`.
- Do not reuse customer JWT with a missing role check.

### 18.2 Modules (only what the store needs)

| Module | Capabilities |
|--------|----------------|
| Products | list, create, edit, delete (blocked if order_items reference the product), toggle/set stock_quantity, all product fields from §12.1 |
| Categories | list, create, edit (slug immutable after create recommended), delete only if no products |
| Orders | list, detail, status transition |
| Messages | list contact form submissions (otherwise persisted messages are invisible) |

No coupon admin, no CMS for About/FAQ, no analytics, no image upload pipeline (image is a URL field, matching Unsplash usage).

### 18.3 Product form fields

Match the data model: name, category, price, originalPrice, description, badge, colors (comma/hex list), sizes (comma list), stock_quantity, features (one per line), specifications (key: value lines), gradient CSS, image URL. rating/reviews_count: editable display fields (they are display-only in the current catalog, not computed).

---

## 19. API design

Base path: `/api`. All timestamps ISO-8601.

### Public / customer

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | no | liveness |
| GET | `/api/categories` | no | list |
| GET | `/api/products` | no | list; query: `category`, `search`, `minPrice`, `maxPrice`, `minRating`, `sort`, `page`, `limit` (default limit 9) |
| GET | `/api/products/:id` | no | detail |
| POST | `/api/auth/register` | no | create customer |
| POST | `/api/auth/login` | no | JWT |
| GET | `/api/auth/me` | yes | current user |
| POST | `/api/auth/logout` | yes | client-side discard; 204 |
| GET/PUT | `/api/cart` | yes | get / replace cart lines |
| GET | `/api/wishlist` | yes | |
| PUT | `/api/wishlist` | yes | replace id list |
| POST | `/api/orders` | optional | place COD order (guest or user) |
| GET | `/api/orders` | yes | my orders |
| POST | `/api/orders/track` | no | `{ publicId, email }` |
| POST | `/api/contact` | no | persist message |
| POST | `/api/newsletter` | no | persist email |

### Admin (`requireAdmin`)

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/admin/products` | list all / create |
| PATCH/DELETE | `/api/admin/products/:id` | update / delete |
| GET/POST | `/api/admin/categories` | |
| PATCH/DELETE | `/api/admin/categories/:id` | |
| GET | `/api/admin/orders` | list, filter by status |
| GET | `/api/admin/orders/:publicId` | detail |
| PATCH | `/api/admin/orders/:publicId/status` | `{ status }` |
| GET | `/api/admin/messages` | contact messages |

Do not add endpoints for coupons, social login, password reset, or card charges.

---

## 20. React route map

| Path | Page | Source |
|------|------|--------|
| `/` | Home | `index.html` |
| `/shop` | Shop | `shop.html` + `?category` `?search` |
| `/product/:id` | Product | `product.html?id=` |
| `/cart` | Cart | `cart.html` |
| `/checkout` | Checkout | `checkout.html` |
| `/about` | About | `about.html` |
| `/contact` | Contact | `contact.html` |
| `/auth` | Auth | `auth.html` (optional `?tab=register`) |
| `/wishlist` | Wishlist | `wishlist.html` |
| `/track-order` | Track Order | **new** (Phase 17) |
| `/admin/login` | Admin login | **new** (Phase 18) |
| `/admin` | redirect → `/admin/products` | new |
| `/admin/products` | Product list | new |
| `/admin/products/new` | Create | new |
| `/admin/products/:id/edit` | Edit | new |
| `/admin/orders` | Orders | new |
| `/admin/orders/:publicId` | Order detail | new |
| `/admin/messages` | Contact messages | new |
| `*` | NotFound | `404.html` |

Not in v1 unless approved: `/account`, `/account/orders`, `/forgot-password`, `/admin/categories` as a separate page (categories can be a section on products or a small page — implement as `/admin` products with category dropdown; dedicated `/admin/categories` is justified if create/edit is awkward inline). **Decision: include `/admin/categories` as a small page** because products need categories and seed has 6.

---

## 21. Environment variables & secrets

Never commit real secrets. Never put secrets in `VITE_*` except the public API URL.

### 21.1 `client/.env` (Vite, public)

| Variable | Phase | Public/secret | Purpose | Local | Production |
|----------|-------|---------------|---------|-------|------------|
| `VITE_API_URL` | 13 | public | Express origin, no trailing slash, e.g. `http://localhost:3001` | `client/.env` | Vercel env |

Do not add other `VITE_*` until a phase needs them.

### 21.2 `server/.env` (secret)

| Variable | Phase | Public/secret | Purpose | Local | Production |
|----------|-------|---------------|---------|-------|------------|
| `PORT` | 10 | public-ish | API port. Default `3001` | `server/.env` | Azure App Setting |
| `DATABASE_URL` | 11 | **secret** | `postgres://USER:PASSWORD@HOST:5432/DB` | `server/.env` | Azure App Setting / Key Vault |
| `JWT_SECRET` | 14 | **secret** | HMAC key. `<GENERATE_A_STRONG_SECRET>` | `server/.env` | Azure |
| `JWT_EXPIRES_IN` | 14 | public-ish | e.g. `7d` | `server/.env` | Azure |
| `CORS_ORIGIN` | 10 | public-ish | frontend origin. Local: `http://localhost:5173`. Prod: Vercel URL | `server/.env` | Azure |
| `NODE_ENV` | 10 | public-ish | `development` \| `production` | `server/.env` | Azure |
| `ADMIN_EMAIL` | 12 | secret-ish | seed admin login | `server/.env` | Azure (seed once) |
| `ADMIN_PASSWORD` | 12 | **secret** | seed admin password; bcrypt at seed time. `<SET_A_STRONG_ADMIN_PASSWORD>` | `server/.env` | Azure, then remove from env after first seed if desired |
| `CLIENT_URL` | 16 | public-ish | used if emails/links are added later; Track Order URL base | optional | Azure |

Placeholders only:

```
DATABASE_URL=<YOUR_POSTGRES_CONNECTION_STRING>
JWT_SECRET=<GENERATE_A_STRONG_SECRET>
ADMIN_EMAIL=<YOUR_ADMIN_EMAIL>
ADMIN_PASSWORD=<SET_A_STRONG_ADMIN_PASSWORD>
```

### 21.3 Files

- `client/.env` and `server/.env` are gitignored.
- `client/.env.example` and `server/.env.example` contain keys with placeholders, committed.

No payment provider keys. No OAuth client ids.

---

## 22. Deployment strategy

**Intent (from requirements):** frontend on Vercel; backend on a persistent Node host, preferably Azure; PostgreSQL on a persistent provider, preferably Azure Database for PostgreSQL. Avoid sleeping free databases.

**Not finalized from this repo** (no Azure/Vercel config exists today). Treat the following as the **recommended** production shape, to be confirmed when Phase 19 starts and credentials/credits are known.

### 22.1 Pieces

| Piece | Recommended | Fallback if Azure credits insufficient |
|-------|-------------|----------------------------------------|
| Frontend | Vercel (Vite static) | Netlify |
| Backend | Azure App Service (Node) | Railway / Fly.io (paid persistent) |
| Database | Azure Database for PostgreSQL Flexible Server | Neon **paid** or Railway Postgres — **not** a free sleeping instance |

### 22.2 Build / start

- Client: `npm run build` in `client/` → `dist/`. Vercel root directory `client`, output `dist`, Node build.
- Server: `npm run build` → `dist/` JS. Start: `node dist/index.js` or `npm start`.
- Production migrate: run `npm run db:migrate` as a release command **before** traffic. Then `db:seed` **once**.

### 22.3 CORS / URLs

- `CORS_ORIGIN=https://<vercel-project>.vercel.app` (and custom domain if any).
- `VITE_API_URL=https://<azure-api-host>` baked in at **frontend build time**.
- If the API URL changes, rebuild the client.

### 22.4 Order of first production deploy

1. Provision PostgreSQL (persistent).
2. Set `DATABASE_URL`, `JWT_SECRET`, `ADMIN_*`, `CORS_ORIGIN` (temporary `*` only for a smoke test, then lock).
3. Deploy API, run migrations + seed.
4. Confirm `GET /api/health` and `GET /api/products`.
5. Set `VITE_API_URL`, deploy Vercel.
6. Browser CORS check, register, COD order, admin login.

### 22.5 UNKNOWN pending Phase 19

- Exact Azure SKU / region
- Custom domain
- Whether student credits cover Flexible Server
- Whether to use Azure Key Vault vs App Settings

---

## 23. Testing strategy

No test runner exists today. Do not block migration on a full Jest rewrite. Each phase has a **manual checklist**. Optional later: Vitest for `lib/pricing.ts` and `lib/search.ts` (pure functions with known vanilla behavior).

**Always-on comparison:** vanilla via `npx live-server` (as README) vs `client` Vite, same viewport widths.

**Backend:** Thunder Client / curl against `/api/health`, products, register, login, COD order, illegal status transition (expect 409).

**Do not claim "tested" in the dashboard unless the phase checklist was actually executed.**

---

## 24. Security checklist (Phase 20 + ongoing)

- [ ] bcrypt cost factor ≥ 10
- [ ] JWT secret long random, not in git
- [ ] Zod on every mutating endpoint
- [ ] SQL only via Drizzle params (no string-concat SQL)
- [ ] CORS locked to frontend origin
- [ ] Helmet + rate limit on auth and contact (Phase 20)
- [ ] Track-order requires email + public_id
- [ ] Admin routes check `role === 'admin'`
- [ ] Disable product delete when order_items exist
- [ ] No secrets in `VITE_*`
- [ ] Card fields never sent to API
- [ ] XSS: React default escaping; only search `<mark>` is inner HTML from a regex on user query
- [ ] `stock_quantity` decrement in a transaction
- [ ] Do not log passwords or JWT

---

## 25. Migration phases

Legend for files: "vanilla files are read, not deleted".

### Phase 0 — Repository audit and baseline

- **Objective:** understand the real repo; write this file.
- **Prerequisites:** none.
- **Files affected:** `MIGRATION_MASTER_PLAN.md` (create).
- **Work:** full read of HTML/CSS/JS/docs (done 2026-09-08).
- **Env / DB:** none.
- **Test:** this document matches the files.
- **Completion:** this file exists and is internally consistent with the repo.
- **Status:** `[x] Complete`
- **Rollback:** delete this file only if abandoning the migration.

### Phase 1 — Git safety / vanilla baseline

- **Objective:** freeze vanilla so it can always be restored.
- **Prerequisites:** Phase 0.
- **Work:**
  1. Ensure working tree is clean or stash unrelated edits.
  2. `git tag -a v1-vanilla -m "GlassCart vanilla HTML/CSS/JS baseline"`
  3. Push tag when remote is available.
- **Files affected:** git tag only (no code).
- **Test:** `git checkout v1-vanilla` shows the 10 HTML pages.
- **Completion:** tag exists locally (and remote if possible).
- **Failure:** tagging over dirty unrelated files — commit or stash first.
- **Rollback:** `git tag -d v1-vanilla`.
- **Status:** `[x] Complete` (local tag only; not pushed to origin)

### Phase 2 — React/Vite/TypeScript scaffold

- **Objective:** `client/` Vite React TS app boots next to vanilla, without removing vanilla.
- **Prerequisites:** Phase 1.
- **Work:**
  - Root `package.json` workspaces `client`.
  - Scaffold Vite `react-ts` inside `client/`.
  - React Router placeholder routes.
  - Remix Icon + fonts via existing CSS import.
  - `.env.example` with `VITE_API_URL` unused until Phase 13.
- **Files:** `package.json`, `client/**`, `.gitignore` updates (`client/dist`, `.env`).
- **Test:** `npm run dev -w client` shows a blank layout at `/`. Vanilla `index.html` still opens.
- **Do not** import all pages yet.
- **Completion:** empty shell app runs in parallel with vanilla.
- **Status:** `[x] Complete`
- **Verified 2026-09-08:** `npm run build -w client` succeeded; `npm run dev -w client` served `http://localhost:5173/` (Vite 8.2.2). GET `/`, `/shop`, `/product/1`, `/cart`, `/checkout`, `/about`, `/contact`, `/auth`, `/wishlist`, `*` all 200 (SPA `index.html`). Vanilla `index.html` / `css/` / `js/` still at repo root. Remix Icon 4.1.0 in `client/index.html`. `client/.env.example` has `VITE_API_URL`. Fonts still come from `css/style.css` in Phase 3.

### Phase 3 — CSS migration pipeline

- **Objective:** CSS cascade in React equals vanilla, with SPA collision guards.
- **Prerequisites:** Phase 2.
- **Work:**
  - Copy `css/style.css`, `animations.css`, `responsive.css` unchanged.
  - Extract 10 `<style>` blocks to `client/src/styles/pages/*.css` unchanged.
  - Extract `getSearchOverlayCSS()` to `search-overlay.css`.
  - Prefix page CSS selectors with `.page-<name>`.
  - `styles/index.css` import order per §4.5.
  - `main.tsx` imports `styles/index.css`.
- **Test:** temporarily render a fixture that uses `.glass-card` and `.btn-primary`; inspect computed styles. Compare `--primary` token `#2563EB`.
- **Failure:** CSS Modules enabled by accident; `@import` order wrong; prefix missed on `@media` selectors.
- **Do not** merge shop-drawer duplicates.
- **Completion:** all CSS present, prefixed, ordered.

### Phase 4 — Shared React shell

- **Objective:** Navbar, Footer, Search overlay markup, Scroll-top, Layout, Toast container.
- **Source:** `getNavHTML`, `getFooterHTML`, `getSearchOverlayCSS` markup, toast DOM from `cart.js`.
- **Work:** class names identical; `Link` instead of `.html` hrefs; cart/wishlist badges read 0 until Phase 5.
- **Test:** overlay open/close, hamburger, scrolled navbar after 50px, footer columns at 1024/768/480 vs vanilla.
- **Completion:** every placeholder route wrapped in `Layout`.

### Phase 5 — Data / types / context foundation

- **Objective:** TS types + ported `products.js` + Cart/Wishlist/Toast contexts on localStorage.
- **Work:**
  - Port `products`, `categories` (do not trust `count`; compute), `testimonials`.
  - `lib/pricing.ts`, `lib/search.ts`, `lib/storage.ts`.
  - Cart/Wishlist providers, same keys.
- **Test:** in React DevTools, add to cart from a throwaway button; `localStorage.glasscart_cart` matches vanilla shape.
- **Completion:** no API yet.

### Phase 6 — Static pages

- **Objective:** About, Contact (client-only success state still OK until Phase 13), Auth UI (still no API), 404.
- **Source:** HTML bodies 1:1.
- **Test:** parity at listed breakpoints; FAQ accordion; auth tabs; password strength classes; 404 search navigates to `/shop?search=`.
- **Auth:** keep forms; submit still local validation only; do **not** show "UI Demo" success as if real — show nothing network-related until Phase 14, or disable submit with helper text "Accounts go live in a later phase" **if** we have not reached Phase 14. **Better:** Phase 6 leaves submit wired to validation only and a non-fake message "Backend not connected yet" during development, replaced in Phase 14. Do not toast fake login success.
- **Completion:** four pages visually match.

### Phase 7 — Dynamic pages

- **Objective:** Home, Shop, Product, Cart, Wishlist, Checkout (COD UI + disabled cards). Wire to local data + contexts.
- **Order inside phase:** Home → Wishlist → Cart → Product → Shop → Checkout (Shop is hardest).
- **Checkout:** implement validation + COD default; disable card path; coupon apply on cart = "not available yet".
- **Test:** URL params, fuzzy search, pagination 9, related products, empty states, drawer, list/grid, qty 1–99, guest checkout success modal with `GC-` id **local-only** until Phase 16 (if checkout is reached before API, do not pretend the order was stored — disable Place Order with "Checkout connects in a later phase" **OR** keep a local-only modal clearly labeled. **Decision: in Phase 7, Place Order shows the existing success modal and clears local cart, but displays a note that the order is not yet saved to a server.** Phase 16 removes that note and calls the API.
- **Completion:** all current storefront pages exist in React.

### Phase 8 — React behavior / hooks

- **Objective:** reveal, counters, ripple, countdown, cart bounce, search Enter, Escape closes overlays.
- **Skip** `typeText`, `staggerReveal` function, and parallax unless markup uses `.parallax-element`.
- **Test:** About stats count up once; Home countdown ticks; add-to-cart bounces bag icon.

### Phase 9 — Frontend visual parity / testing

- **Objective:** sign-off before backend coupling.
- **Work:** side-by-side vanilla vs React, all routes, all breakpoints in §10.4. Fix CSS prefix mistakes only.
- **Completion criteria:** no intentional visual regressions except documented behavior changes (no fake login toast, coupon honesty, COD/card unavailable, checkout validation).
- **Then:** move vanilla HTML/CSS/JS to `_vanilla_archive/` in a dedicated commit. Keep `v1-vanilla` tag.

### Phase 10 — Express / TypeScript backend

- **Objective:** `server/` boots, `/api/health`, CORS from env, error handler.
- **Env:** `PORT`, `CORS_ORIGIN`, `NODE_ENV`.
- **No DB required yet** (health only).
- **Test:** `curl localhost:3001/api/health`.

### Phase 11 — PostgreSQL + Drizzle schema / migrations

- **Objective:** schema in §12 created via Drizzle generate + migrate.
- **Env:** `DATABASE_URL`.
- **Work:** schema files, `drizzle.config.ts`, first migration committed.
- **Test:** `\dt` in psql shows tables. No Prisma config anywhere.
- **Completion:** empty tables, constraints in place.

### Phase 12 — Seed existing data

- **Objective:** 6 categories, 24 products ids 1–24, admin user.
- **Env:** `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- **Work:** port objects from `js/products.js`; `stock_quantity = 100`; compute category product counts in API responses, do not store stale counts.
- **Test:** `GET` will wait for Phase 13; until then, query with Drizzle or psql `SELECT count(*) FROM products` = 24.
- **Testimonials:** remain in `client/src/data/testimonials.ts` (not DB).

### Phase 13 — API integration (catalog, contact, newsletter)

- **Objective:** React catalog reads API; contact/newsletter persist.
- **Env:** `VITE_API_URL`.
- **Work:** `GET /api/products`, categories, product by id; shop query params map to API; `POST /api/contact`, `POST /api/newsletter`. Remove client `products.ts` as source of truth (can keep as fallback only if API down — **Decision: no silent fallback to stale data**; show error empty-state).
- **Test:** Shop filters match previous client-side results for the same 24 rows (server must use the same sort keys and fuzzy algorithm **or** a documented simpler `ILIKE` search). **Decision: Phase 13 catalog search uses SQL `ILIKE` on name/description/category; fuzzy typo-tolerance stays client-side on the current page's fetched list OR we port fuzzy to server later.** **Safer interview story: server filter/sort/paginate; search `ILIKE`. Document that this is slightly different from vanilla levenshtein.** See Decisions Log.

### Phase 14 — Real authentication

- **Objective:** register/login/me; AuthContext; protect nothing that was public before; hide fake toasts.
- **Env:** `JWT_SECRET`, `JWT_EXPIRES_IN`.
- **Test:** register duplicate email 409; login wrong password 401; me with bad token 401.

### Phase 15 — Cart / wishlist persistence

- **Objective:** logged-in sync as §15. Guests unchanged.
- **Test:** two browsers, same user, cart converges. Guest cart does not hit API.

### Phase 16 — Orders + COD

- **Objective:** `POST /api/orders`, transaction, stock decrement, success modal uses server `public_id`. Remove "not saved" note.
- **Env:** `CLIENT_URL` optional.
- **Test:** empty cart 400; oversell 409; totals match `lib/pricing.ts`; card payload rejected if somehow sent.

### Phase 17 — Order tracking

- **Objective:** `/track-order` + `POST /api/orders/track`. Footer link. Success modal link.
- **Test:** wrong email 404; correct email shows stepper.

### Phase 18 — Admin portal

- **Objective:** admin login, products CRUD, categories, orders status, contact messages.
- **Test:** customer JWT on `/api/admin/products` → 403. Illegal status 409. Delete product with orders 409.

### Phase 19 — Production deployment

- **Objective:** Vercel + Azure (or confirmed fallback) + persistent Postgres.
- **Work:** env on hosts, migrate, seed once, CORS, rebuild client with production `VITE_API_URL`.
- **UNKNOWN:** exact SKUs/credits — confirm with user before spending money.

### Phase 20 — Final security / testing / documentation

- **Objective:** helmet, rate limit, README rewrite (PERN + Drizzle, how to run, env examples), security checklist, interview README architecture paragraph.
- **Update CONTEXT.md** to describe the new stack without lying about vanilla-only.

---

## 26. Progress tracker

### STATUS DASHBOARD

| Phase | Name | Status |
|-------|------|--------|
| 0 | Repository audit and baseline | [x] Complete |
| 1 | Git safety / vanilla baseline | [x] Complete (local tag; not pushed) |
| 2 | React/Vite/TypeScript scaffold | [x] Complete |
| 3 | CSS migration pipeline | [ ] Not started |
| 4 | Shared React shell | [ ] Not started |
| 5 | Data/types/context foundation | [ ] Not started |
| 6 | Static pages | [ ] Not started |
| 7 | Dynamic pages | [ ] Not started |
| 8 | React behavior/hooks/state | [ ] Not started |
| 9 | Frontend visual parity/testing | [ ] Not started |
| 10 | Express/TypeScript backend | [ ] Not started |
| 11 | PostgreSQL + Drizzle schema/migrations | [ ] Not started |
| 12 | Seed existing data | [ ] Not started |
| 13 | API integration | [ ] Not started |
| 14 | Real authentication | [ ] Not started |
| 15 | Cart/wishlist persistence | [ ] Not started |
| 16 | Orders + COD | [ ] Not started |
| 17 | Order tracking | [ ] Not started |
| 18 | Admin portal | [ ] Not started |
| 19 | Production deployment | [ ] Not started |
| 20 | Final security/testing/documentation | [ ] Not started |

**Current Phase:** 2 (complete)  
**Current Task:** none — waiting to start Phase 3  
**Last Completed Task:** Phase 2 client shell (`npm run build -w client` + Vite on :5173)  
**Known Issues:** see §28  
**Decisions Made:** see §27  
**Pending Decisions:** see §27.2  
**Files Changed this session:** `MIGRATION_MASTER_PLAN.md` (updated); `package.json`; `package-lock.json`; `.gitignore`; `client/**` (Vite React TS shell); git tag `v1-vanilla`  
**Environment Variables Added:** `client/.env.example` → `VITE_API_URL` (placeholder, unused until Phase 13). No real `.env` committed.  
**Database Migrations Added:** none  
**API Endpoints Added:** none  
**Routes Added:** placeholder React Router paths `/`, `/shop`, `/product/:id`, `/cart`, `/checkout`, `/about`, `/contact`, `/auth`, `/wishlist`, `*` → NotFound. No Track Order / admin yet.  
**Admin Features Added:** none  
**Tests Completed:** Phase 1 tag tree listing; Phase 2 production build; Phase 2 Vite HTTP 200 on listed routes. No browser-tool click-through (no browser MCP).  
**Deployment Status:** not started  

---

## 27. Decisions log

### 27.1 Decisions made (do not silently change)

| ID | Decision | Why |
|----|----------|-----|
| D1 | Drizzle + PostgreSQL, never Prisma | Explicit requirement. |
| D2 | Vite SPA + Express, not Next.js | CSS cascade control; required Express. |
| D3 | Preserve vanilla CSS byte-for-byte; page wrapper prefixes for SPA isolation | Collision of `.form-group` across auth/contact/global. |
| D4 | Do not merge duplicated shop-drawer CSS | Values differ (`0.95` vs `0.97`, `padding-top: 60px`, `!important`). |
| D5 | WishlistCard ≠ ProductCard | Different markup in `wishlist.html`. |
| D6 | No `product_images` table | Single `image` URL per product. |
| D7 | No `addresses` table in v1 | Checkout snapshots onto the order. |
| D8 | No reviews table | Same 3 hardcoded reviews on every product; `reviews` is a display count. |
| D9 | Testimonials stay frontend static | Marketing copy in `products.js`, not user-generated. |
| D10 | `stock_quantity` integer; UI `inStock` derived | Needed for real orders; all current products in stock. Seed 100. |
| D11 | Guest checkout allowed; `orders.user_id` nullable | Current checkout has no auth gate. |
| D12 | JWT in `Authorization: Bearer` + `localStorage` key `glasscart_token` | Split Vercel/Azure hosts. |
| D13 | COD only; card UI visible but unavailable | Explicit requirement. |
| D14 | Coupons not implemented; no fake GLASS15 success | Explicit requirement to not fake features. |
| D15 | Social login and forgot-password visible but inert with honest toasts | Explicit deferred list. |
| D16 | Order `public_id` format `GC-XXXXXX` | Matches `placeOrder()`. |
| D17 | Track order with **public_id + email** | Prevents enumerating orders. |
| D18 | Status model: pending → confirmed → processing → shipped → out_for_delivery → delivered; plus cancelled | No vanilla statuses; COD-appropriate. |
| D19 | Cancel restores stock; delivered sets `payment_status=paid` | COD collected on delivery. |
| D20 | Checkout **will** validate shipping (vanilla did not) | Intentional fix. |
| D21 | Category `count` computed, not seeded from stale array | electronics 5 not 6; fashion 4 not 5. |
| D22 | Admin portal reuses GlassCart CSS tokens | Requirement: same visual identity. |
| D23 | Image admin field is URL, not file upload | Catalog already uses Unsplash URLs; no asset pipeline. |
| D24 | Vanilla remains at repo root until Phase 9 | Never delete unverified UI. |
| D25 | Phase 13 search is SQL `ILIKE`, not vanilla levenshtein | Keep server simple; document the delta. |
| D26 | npm workspaces `client` + `server` | Interview-simple monorepo. |
| D27 | Contact FAQ payment answer will be updated when COD ships | Current FAQ claims card brands that will be unavailable. |
| D28 | No Prisma terminology in commands or docs going forward | Requirement. |
| D29 | Client scaffold uses **current latest majors**, not the original “React 18” line: React 19.2.x, React Router DOM 7.18.x, Vite 8.2.x, TypeScript 6.0.x (Vite 8 `create-vite` template), `@vitejs/plugin-react` 6.1.x, oxlint 1.82.x | User requested latest tech stack on 2026-09-08. TypeScript 7.0.x exists on npm but is **not** the Vite 8 official template line; stay on TS 6 until Vite’s template moves. Backend package versions are chosen in Phase 10, also latest-at-that-time. |

### 27.2 Pending decisions (ask before implementing the affected phase)

| ID | Question | Needed by | Recommendation |
|----|----------|-----------|----------------|
| P1 | Confirm Azure student credits vs fallback host | Phase 19 | Azure if it stays awake and affordable |
| P2 | Custom domain? | Phase 19 | Optional |
| P3 | Dedicated `/account/orders` for logged-in users, or Track Order only? | Phase 17 | Track Order only in v1 |
| P4 | Admin seed email identity | Phase 12 | User sets `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` |
| P5 | International free shipping FAQ says $150 but `getShippingCost` only uses $100 and has no country logic | Phase 16 | **Keep code rule $100 / $9.99** (code is source of truth). Update FAQ to match code, do not invent international shipping logic. |
| P6 | Should Place Order in Phase 7 show a local-only modal? | Phase 7 | Yes, with "not saved on a server yet" until Phase 16 |

---

## 28. Known issues (vanilla, carry forward)

1. Category counts in `js/products.js` do not match products (electronics 6 vs 5, fashion 5 vs 4).
2. `GLASS15` does not discount.
3. Checkout `goToStep(3)` fabricates an address.
4. Auth/contact/newsletter/checkout persist nothing.
5. Shop sidebar initialized twice (`initSidebar` + inline onclick).
6. Contact FAQ vs `ui.js` accordion implementations differ.
7. `typeText` / `staggerReveal` unused.
8. Product "gallery" is one image; CONTEXT.md is wrong.
9. `assets/images` documented, missing.
10. Footer Customer Service links are `#`.
11. Reviews tab is dummy data unrelated to the product.
12. Wishlist "Move All to Cart" does not remove wishlist items.
13. `addToCartFromWishlist` drops color/size.
14. FAQ claims card/PayPal/Apple Pay/Google Pay; code has no processors.
15. FAQ international free shipping $150 not implemented.
16. Home countdown resets every page load (3 days from now).
17. All 24 products `inStock: true` — out-of-stock UI exists but is unused in data.
18. `initParallax` may have no targets — verify before porting.

---

## 29. Deferred features

Do not build until explicitly requested:

- Forgot password / reset / 2FA / OTP
- Social login OAuth
- Coupon system / discount engine (remove fake GLASS15 success)
- Stripe/PayPal/Visa/Mastercard charging
- Address book
- User-generated reviews
- Product image uploads / multi-image gallery
- International shipping rules
- Legal pages (Privacy, Terms, Returns) — unless requested
- Refresh-token rotation / JWT denylist
- Email sending (order confirmation)
- Advanced account settings

When a deferred control is visible (coupon box, social buttons, forgot password, card form), it must look like the current design but **must not pretend to succeed**.

---

## 30. CURRENT SESSION HANDOFF

**Date:** 2026-09-08  
**Session type:** implementation — Phase 1 + Phase 2

### Completed this session

- Re-verified the vanilla tree against §2.1 (10 HTML pages, 3 CSS, 5 JS, docs). Byte sizes still match the audit. No `package.json` existed before this session; none of the vanilla files were deleted.
- **Phase 1:** annotated tag `v1-vanilla` on commit `e03200f` (`Delete CNAME`). Tag tree includes all 10 HTML pages + `css/` + `js/`. **Not pushed** to origin (plan: push only if the user asks).
- **Phase 2:** npm workspaces root + Vite React TS app in `client/` beside vanilla.
  - Installed (resolved): `react@19.2.8`, `react-dom@19.2.8`, `react-router-dom@7.18.3`, `vite@8.2.2`, `typescript@6.0.3`, `@vitejs/plugin-react@6.1.1`, `oxlint@1.82.0`, `@types/react@19.2.18`, `@types/react-dom@19.2.7`.
  - Placeholder routes for the 10 storefront pages (no HTML lift, no CSS copy).
  - Remix Icon CDN 4.1.0 in `client/index.html`.
  - `client/.env.example` with `VITE_API_URL=http://localhost:3001`.
- Logged **D29**: use current latest client majors (React 19 / RR 7 / Vite 8 / TS 6).
- First `npm install` hit `ECONNRESET`; retry with extra fetch retries succeeded.

### Incomplete

- Phases 3–20.
- Tag `v1-vanilla` is local only.
- Phase 2 HTTP checks hit the SPA `index.html` shell (200). No browser MCP, so no click-through of hydrated placeholder titles.

### Currently being worked on

- Nothing. Stopped after Phase 2 verification and this handoff update.

### Errors / blockers

- None blocking Phase 3.
- Deployment SKUs and admin password remain UNKNOWN (Phases 12 and 19).

### Exact next recommended task

**Phase 3 — CSS migration pipeline.** Copy vanilla CSS into `client/src/styles/` with SPA collision prefixes. Do **not** lift page markup yet (that is Phase 4–7). Do **not** merge the duplicated shop-drawer CSS (D4).

Work order from §25 Phase 3 + §4.5:

1. Copy `css/style.css`, `css/animations.css`, `css/responsive.css` unchanged into `client/src/styles/`.
2. Extract each page `<style>` block into `client/src/styles/pages/*.css`.
3. Extract `getSearchOverlayCSS()` from `js/app.js` into `client/src/styles/search-overlay.css`.
4. Prefix every selector in each page CSS file with `.page-<name>` (including selectors inside `@media`).
5. `client/src/styles/index.css` import order **exactly** as §4.5 (search-overlay last).
6. `main.tsx` imports `styles/index.css` (replace the Phase 2 stub `index.css`).
7. Temporarily render a fixture using `.glass-card` and `.btn-primary`; confirm `--primary` is `#2563EB`.

Do not enable CSS Modules. Do not add Tailwind.

### Important files changed

- `MIGRATION_MASTER_PLAN.md` (updated)
- `package.json` (workspaces: `client`)
- `package-lock.json`
- `.gitignore` (`.env`, `client/dist`)
- `client/` (new Vite app: `index.html`, `src/App.tsx`, `src/main.tsx`, `src/pages/*`, `src/vite-env.d.ts`, `tsconfig*.json`, `vite.config.ts`, `.env.example`, `.gitignore`)
- git tag `v1-vanilla` (no file change)

Vanilla HTML/CSS/JS at repo root: **unchanged**.

### Commands that need to be run

```bash
npm run dev -w client
```

Vanilla still opens as files / live-server from repo root.

Optional: `git push origin v1-vanilla` only if the user wants the tag on GitHub.

### Decisions that still require user approval

- P1–P6 in §27.2, especially Azure vs fallback (Phase 19) and P3 account orders page (Phase 17).
- P5 recommendation (FAQ vs $100 shipping rule) before rewriting FAQ copy.
- Whether to push `v1-vanilla`.

### Note for the next Grok session

You are not allowed to use Prisma. You are not allowed to rewrite CSS in Tailwind. You are not allowed to delete vanilla HTML until Phase 9. Read §26 and §30 first, then execute only **Phase 3**. Keep class names; prefix page CSS with `.page-<name>`; preserve cascade order in §4.5.

---

## Appendix A — Product id list (seed must keep these ids)

| id | name | category slug | badge | inStock (source) |
|----|------|---------------|-------|------------------|
| 1 | Wireless ANC Headphones Pro | electronics | Hot | true |
| 2 | Minimalist Canvas Sneakers | fashion | New | true |
| 3 | Smart Fitness Watch Ultra | electronics | Sale | true |
| 4 | Organic Cotton T-Shirt | fashion | Sale | true |
| 5 | Ceramic Pour-Over Coffee Set | home | New | true |
| 6 | Vitamin C Brightening Serum | beauty | Sale | true |
| 7 | Ergonomic Office Chair | home | Hot | true |
| 8 | Portable Bluetooth Speaker | electronics | null | true |
| 9 | Yoga Mat Premium 6mm | sports | New | true |
| 10 | Leather Crossbody Bag | fashion | Sale | true |
| 11 | Indoor Herb Garden Kit | home | New | true |
| 12 | Retinol Night Cream 2.5% | beauty | Sale | true |
| 13 | Stainless Steel Water Bottle | sports | Hot | true |
| 14 | Wireless Charging Pad | electronics | null | true |
| 15 | Bestselling Novel Collection | books | Sale | true |
| 16 | Aromatherapy Candle Set | home | null | true |
| 17 | Running Shoes CloudFlex | sports | Hot | true |
| 18 | Mechanical Keyboard RGB | electronics | null | true |
| 19 | Sunscreen SPF 50+ Glow | beauty | Hot | true |
| 20 | Denim Jacket Classic Fit | fashion | null | true |
| 21 | Science Fiction Epic Novel | books | New | true |
| 22 | Resistance Bands Set Pro | sports | Sale | true |
| 23 | Minimalist Desk Lamp | home | New | true |
| 24 | Face Mask Sheet Bundle | beauty | Sale | true |

Real category totals: electronics 5, fashion 4, home 5, beauty 4, sports 4, books 2.

### Category metadata to seed (from `js/products.js`, ignore `count`)

| slug | name | icon |
|------|------|------|
| electronics | Electronics | ri-computer-line |
| fashion | Fashion | ri-t-shirt-line |
| home | Home & Living | ri-home-smile-line |
| beauty | Beauty | ri-heart-pulse-line |
| sports | Sports | ri-basketball-line |
| books | Books | ri-book-open-line |

Gradients and images: copy from `js/products.js` `categories` array.

### Testimonials (frontend static)

1. Sarah Johnson — Wireless ANC Headphones Pro  
2. Michael Chen — Smart Fitness Watch Ultra  
3. Emily Rodriguez — Ceramic Pour-Over Coffee Set  
4. David Kim — Organic Cotton T-Shirt  

---

## Appendix B — Vanilla localStorage contract (do not change in Phases 1–14)

```json
// glasscart_cart
[{ "productId": 1, "quantity": 2, "selectedColor": "#2d3436", "selectedSize": null }]

// glasscart_wishlist
[1, 5, 9]
```

---

## Appendix C — Libraries that are forbidden unless the user explicitly approves

Prisma, Next.js, Redux, Tailwind, styled-components, CSS Modules as the design system, Turborepo, Stripe, PayPal SDKs, OAuth social SDKs, Axios (unless fetch is proven insufficient).

---

*End of master plan. Update this file at the end of every session.*
