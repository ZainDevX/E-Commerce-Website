# 🛍️ GlassCart — Premium E-Commerce Store

## 📋 Project Overview

**Project Name:** GlassCart  
**Tagline:** "Shop the Future, Today"  
**Type:** Multi-purpose E-Commerce Store (suitable for any business type)  
**Version:** 1.0.0  
**Date Created:** February 12, 2026  

GlassCart is a modern, fully responsive e-commerce storefront built with pure HTML, CSS, and JavaScript. It features a stunning glassmorphism UI design with smooth animations, light gradients, and a clean aesthetic. The store is designed to be adaptable for any type of business — fashion, electronics, home goods, beauty, or any retail category.

---

## 🎨 Design Philosophy

### Color Scheme — Professional Brand Palette
- **Primary:** `#2563EB` (Brand Blue) → `#60A5FA` (Light Blue)
- **Secondary:** `#10B981` (Emerald) → `#6EE7B7` (Soft Emerald)
- **Accent:** `#F59E0B` (Amber) → `#FCD34D` (Light Amber)
- **Warm/Error:** `#EF4444` (Red) → `#FCA5A5` (Soft Red)
- **Background:** `#F8FAFC` (Slate-50) — clean, neutral white
- **Surface/Glass:** `rgba(255, 255, 255, 0.25)` — `rgba(255, 255, 255, 0.45)`
- **Text Primary:** `#1E293B` (Slate-800)
- **Text Secondary:** `#64748B` (Slate-500)
- **Text Light:** `#94A3B8` (Slate-400)
- **Star Ratings:** `#F59E0B` (Amber)
- **NO purple, dark navy, or heavy dark colors are used**
- **Inspired by:** Tailwind CSS Slate/Blue/Emerald/Amber palette for a polished, enterprise-grade look

### Design Elements
- **Glassmorphism:** Frosted glass cards with `backdrop-filter: blur()` and subtle borders
- **Gradients:** Lightweight, pastel-to-vibrant gradients for buttons and accents
- **Shadows:** Soft, layered box shadows for depth
- **Border Radius:** Rounded corners (12px–24px) for modern feel
- **Typography:** "Inter" (headings) + "Poppins" (body) from Google Fonts
- **Icons:** Remix Icon (CDN-based icon library)
- **Animations:** CSS transitions, keyframe animations, Intersection Observer for scroll reveals

### Responsive Breakpoints
- **Desktop:** 1200px+
- **Tablet:** 768px – 1199px
- **Mobile:** below 768px
- **Small Mobile:** below 480px

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic markup & page structure |
| CSS3 | Styling, animations, glassmorphism, gradients, responsive design |
| Vanilla JavaScript | Interactivity, cart logic, DOM manipulation, animations |
| Google Fonts | Typography (Inter, Poppins) |
| Remix Icon | Icon library via CDN |
| LocalStorage | Cart data persistence, wishlist, user preferences |

**No frameworks, libraries, or build tools are used.** Everything is vanilla HTML/CSS/JS.

---

## 📁 Project File Structure

```
E-commerce website/
│
├── CONTEXT.md                  # This file — full project context
│
├── index.html                  # Landing / Home page
├── shop.html                   # All products / Shop page
├── product.html                # Single product detail page
├── cart.html                   # Shopping cart page
├── checkout.html               # Checkout / payment page
├── about.html                  # About us page
├── contact.html                # Contact us page
├── auth.html                   # Login & Register page
├── wishlist.html               # Wishlist page
├── 404.html                    # 404 Not Found page
│
├── css/
│   ├── style.css               # Global styles, variables, reset, glassmorphism
│   ├── animations.css          # All keyframe animations & scroll reveals
│   └── responsive.css          # All media queries & responsive adjustments
│
├── js/
│   ├── app.js                  # Main app logic, navigation, shared utilities
│   ├── products.js             # Product data store (JSON-like array of products)
│   ├── cart.js                 # Cart logic (add, remove, update, persist)
│   ├── animations.js           # Scroll animations, parallax, intersection observer
│   └── ui.js                   # UI interactions (modals, dropdowns, search, filters)
│
└── assets/
    └── images/                 # Placeholder — uses emoji/CSS gradients instead of images
```

---

## 📄 Pages & Their Purpose

### 1. `index.html` — Landing / Home Page
- **Hero Section:** Full-width gradient hero with animated text, CTA button, floating shapes
- **Featured Categories:** Glass cards showing product categories with hover effects
- **Trending Products:** Product card carousel/grid with quick-add-to-cart
- **Special Offers Banner:** Gradient banner with countdown timer
- **Testimonials:** Customer reviews in glass cards with star ratings
- **Newsletter Signup:** Glass form with gradient submit button
- **Footer:** Multi-column footer with links, social icons, payment badges

### 2. `shop.html` — Products / Shop Page
- **Filter Sidebar:** Category, price range, rating filters in glass panel
- **Sort Dropdown:** Sort by price, popularity, newest
- **Product Grid:** Responsive grid of product cards (image placeholder, name, price, rating, add-to-cart)
- **Pagination:** Numbered pagination with glass buttons
- **Search Bar:** Live search with glass input styling

### 3. `product.html` — Product Detail Page
- **Product Gallery:** Large image area with thumbnail selector (CSS gradient placeholders)
- **Product Info:** Name, price, description, rating, stock status
- **Size/Color Selector:** Interactive option buttons
- **Quantity Selector:** +/- buttons
- **Add to Cart / Buy Now:** Gradient glass buttons
- **Tabs:** Description, Specifications, Reviews tabs
- **Related Products:** Grid of similar products

### 4. `cart.html` — Shopping Cart Page
- **Cart Items List:** Product cards with quantity controls, remove button
- **Order Summary:** Subtotal, shipping, tax, total in glass card
- **Coupon Code Input:** Glass input with apply button
- **Continue Shopping / Checkout buttons**
- **Empty Cart State:** Illustrated empty state with CTA

### 5. `checkout.html` — Checkout Page
- **Multi-step form:** Shipping → Payment → Review (step indicator)
- **Shipping Form:** Glass form inputs for address details
- **Payment Form:** Card number, expiry, CVV (UI only, no real processing)
- **Order Summary Sidebar:** Final order details
- **Place Order Button:** Animated gradient button
- **Success Modal:** Order confirmation overlay

### 6. `about.html` — About Us Page
- **Hero:** Company mission statement with background animation
- **Our Story:** Timeline or card-based story sections
- **Team Section:** Team member cards with glass effect
- **Stats Counter:** Animated counters (customers served, products, etc.)
- **Values:** Icon + text cards for company values

### 7. `contact.html` — Contact Us Page
- **Contact Form:** Glass form with name, email, subject, message
- **Contact Info Cards:** Phone, email, address in glass cards with icons
- **Map Placeholder:** Styled div resembling a map area
- **FAQ Accordion:** Common questions with animated expand/collapse

### 8. `auth.html` — Login & Register Page
- **Toggle Form:** Switch between Login and Register with smooth animation
- **Login Form:** Email, password, remember me, forgot password link
- **Register Form:** Name, email, password, confirm password
- **Social Login Buttons:** Google, Facebook, Apple (UI only)
- **Glass card container** with gradient accents

### 9. `wishlist.html` — Wishlist Page
- **Wishlist Grid:** Product cards with remove and add-to-cart options
- **Empty State:** Attractive empty wishlist state
- **Move All to Cart:** Bulk action button

### 10. `404.html` — Not Found Page
- **Animated 404 text** with floating elements
- **Search bar** for finding products
- **Back to Home button**

---

## 🎬 Animations Inventory

| Animation | Type | Used On |
|-----------|------|---------|
| fadeInUp | Scroll reveal | Cards, sections |
| fadeInLeft / fadeInRight | Scroll reveal | Alternating content |
| slideInFromTop | Page load | Navigation |
| scaleIn | Hover / Load | Product cards, buttons |
| float | Continuous | Decorative shapes |
| pulse | Continuous | CTAs, notifications |
| shimmer | Continuous | Loading states, glass borders |
| slideToggle | Interaction | Mobile menu, accordions |
| countUp | Scroll trigger | Statistics numbers |
| typewriter | Page load | Hero heading text |
| ripple | Click | Buttons |
| cartBounce | Interaction | Cart icon on add |
| glassglow | Hover | Glass cards |
| gradientShift | Continuous | Background gradients |

---

## 🧩 Shared Components

### Navigation Bar
- Fixed/sticky top navigation
- Glass background with blur
- Logo (text-based)
- Nav links: Home, Shop, About, Contact
- Icons: Search, Wishlist (heart), Cart (with item count badge), User/Auth
- Mobile: Hamburger menu with slide-in glass panel

### Footer
- 4-column layout: About, Quick Links, Customer Service, Newsletter
- Social media icons
- Payment method badges (CSS-styled)
- Copyright text
- Glass background with subtle gradient

### Product Card (Component)
- Gradient placeholder image area
- Product name, category tag
- Price (with sale price strikethrough option)
- Star rating display
- Add to Cart button (glass)
- Wishlist heart icon
- Hover: scale up, show quick actions, glow effect

### Glass Card (Utility)
```css
.glass-card {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}
```

### Gradient Button
```css
.btn-gradient {
    background: linear-gradient(135deg, #2563EB 0%, #60A5FA 100%);
    border: none;
    border-radius: 50px;
    color: white;
    padding: 12px 32px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.35);
}
```

---

## 🛒 Product Data Structure

Products are stored in `js/products.js` as a JavaScript array:

```javascript
const products = [
    {
        id: 1,
        name: "Product Name",
        category: "category-slug",
        price: 99.99,
        originalPrice: 129.99,  // null if no sale
        rating: 4.5,
        reviews: 128,
        description: "Short description text",
        badge: "New",          // "New", "Sale", "Hot", or null
        colors: ["#2563EB", "#10B981", "#F59E0B"],
        sizes: ["S", "M", "L", "XL"],
        inStock: true,
        features: ["Feature 1", "Feature 2"],
        specifications: { "Material": "Cotton", "Weight": "200g" },
        gradient: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
        image: "https://images.unsplash.com/photo-...?w=400&h=400&fit=crop&q=80"
    }
];
```

### Product Categories
1. **Electronics** — Phones, Laptops, Accessories
2. **Fashion** — Clothing, Shoes, Accessories
3. **Home & Living** — Furniture, Decor, Kitchen
4. **Beauty** — Skincare, Makeup, Fragrances
5. **Sports** — Equipment, Apparel, Outdoor
6. **Books** — Fiction, Non-Fiction, Academic

---

## 🔧 Cart Logic (LocalStorage)

```javascript
// Cart stored as JSON in localStorage
// Key: "glasscart_cart"
// Structure: [{ productId, quantity, selectedColor, selectedSize }]

// Functions:
// - addToCart(productId, quantity, color, size)
// - removeFromCart(productId)
// - updateQuantity(productId, newQuantity)
// - getCart()
// - getCartTotal()
// - getCartCount()
// - clearCart()
```

---

## 🚀 Key Implementation Notes

1. **No backend** — All data is client-side. Product data lives in `products.js`.
2. **LocalStorage** is used for cart, wishlist, and theme preference persistence.
3. **CSS Custom Properties** are used extensively for theming consistency.
4. **Intersection Observer API** handles scroll-triggered animations efficiently.
5. **Event Delegation** is used for dynamic content event handling.
6. **BEM-like naming** is used for CSS classes (e.g., `.product-card__title`).
7. **Semantic HTML** — proper use of `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`.
8. **Accessibility** — ARIA labels, keyboard navigation, focus states, alt text.
9. **Performance** — CSS containment, will-change for animated elements, debounced scroll handlers.
10. **No external images** — Product images use high-quality photos from Unsplash (`images.unsplash.com`) and avatars from Pravatar (`i.pravatar.cc`). Category icons use Remix Icon classes. The project requires an internet connection for images to load.

---

## 📝 Session Continuation Instructions

When starting a new session with this project:

1. **Read this `CONTEXT.md` first** to understand the full scope and design system.
2. **Check existing files** to see what has already been built.
3. **Follow the design tokens** (colors, fonts, spacing) defined in `css/style.css`.
4. **Maintain consistency** with the glassmorphism and gradient patterns established.
5. **Test responsiveness** at all breakpoints listed above.
6. **Ensure animations** are smooth (60fps) and non-intrusive.
7. **Keep product data** in sync with `js/products.js`.
8. **Cart/Wishlist state** persists via LocalStorage — test accordingly.

---

## ✅ Completion Checklist

- [x] Context documentation (this file)
- [x] Global CSS (variables, reset, glassmorphism, components) — `css/style.css`
- [x] Animation CSS (keyframes, scroll reveals) — `css/animations.css`
- [x] Responsive CSS (media queries) — `css/responsive.css`
- [x] Product data store — `js/products.js` (24 products, 6 categories, testimonials)
- [x] Core app logic — `js/app.js` (navbar, scroll-top, mobile menu, getNavHTML, getFooterHTML)
- [x] Cart logic — `js/cart.js` (cart CRUD, wishlist, toasts, product card generator)
- [x] UI interactions — `js/ui.js` (search overlay, accordion, tabs, ripple, modals)
- [x] Animation JS — `js/animations.js` (scroll reveal, parallax, counters, typing)
- [x] Landing page — `index.html` (hero, categories, trending, offers countdown, testimonials, newsletter)
- [x] Shop page — `shop.html` (filter sidebar, sort, grid/list toggle, pagination, URL params)
- [x] Product detail — `product.html` (gallery, color/size selectors, qty, tabs, related products)
- [x] Cart page — `cart.html` (items list, qty controls, order summary, coupon GLASS15)
- [x] Checkout page — `checkout.html` (3-step: shipping → payment → review, success modal)
- [x] About page — `about.html` (mission, story, stats counters, values, timeline, team cards)
- [x] Contact page — `contact.html` (form + success state, info cards, map, FAQ accordion)
- [x] Auth page — `auth.html` (login/register tabs, password strength, social auth, validation)
- [x] Wishlist page — `wishlist.html` (dynamic grid from localStorage, move-to-cart, clear all)
- [x] 404 page — `404.html` (animated 404, floating emojis, search bar, quick links)

**Status: ✅ PROJECT COMPLETE — All 10 pages, 3 CSS files, 5 JS files built and functional.**
