# GlassCart — Premium E-Commerce Store

A modern, fully responsive e-commerce storefront built with pure **HTML**, **CSS**, and **JavaScript**. Featuring a stunning **glassmorphism UI** with smooth animations, professional brand colors, and a clean aesthetic — designed for any retail business.

> **Shop the Future, Today**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## Preview

![GlassCart Preview](https://img.shields.io/badge/Status-Live-10B981?style=flat-square)

---

## Features

- **Glassmorphism UI** — Frosted glass cards with `backdrop-filter: blur()` and subtle borders
- **Fully Responsive** — Optimized for desktop, tablet, and mobile devices
- **Product Catalog** — 24 products across 6 categories with real Unsplash images
- **Shopping Cart** — Add, remove, update quantities with LocalStorage persistence
- **Wishlist** — Save favorite products with persistent storage
- **Search** — Live search with instant results
- **Checkout Flow** — Multi-step checkout (Shipping → Payment → Review)
- **User Authentication** — Login & Register UI with form validation
- **Smooth Animations** — Scroll reveals, hover effects, floating shapes, and more
- **Professional Color Palette** — Tailwind-inspired brand colors
- **No Frameworks** — 100% vanilla HTML, CSS, and JavaScript

---

## Pages

| # | Page | Description |
|---|------|-------------|
| 1 | **Home** | Hero section, featured categories, trending products, testimonials, newsletter |
| 2 | **Shop** | Product grid with filters, sorting, search bar, and pagination |
| 3 | **Product Detail** | Image gallery, size/color selectors, reviews, related products |
| 4 | **Cart** | Cart items, quantity controls, coupon input, order summary |
| 5 | **Checkout** | Multi-step form with order confirmation |
| 6 | **About** | Company story, team section, animated stats, values |
| 7 | **Contact** | Contact form, info cards, FAQ accordion |
| 8 | **Auth** | Login/Register toggle with social login buttons |
| 9 | **Wishlist** | Saved products grid with bulk actions |
| 10 | **404** | Animated not-found page with search |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic markup & page structure |
| **CSS3** | Glassmorphism, animations, gradients, responsive design |
| **Vanilla JS** | Cart logic, DOM manipulation, interactivity |
| **Google Fonts** | Inter (headings) + Poppins (body) |
| **Remix Icon** | CDN icon library (v4.1.0) |
| **LocalStorage** | Cart & wishlist data persistence |

---

## Project Structure

```
GlassCart/
│
├── index.html              # Home / Landing page
├── shop.html               # Products listing page
├── product.html            # Single product detail
├── cart.html               # Shopping cart
├── checkout.html           # Checkout flow
├── about.html              # About us
├── contact.html            # Contact us
├── auth.html               # Login & Register
├── wishlist.html           # Wishlist
├── 404.html                # Not Found page
│
├── css/
│   ├── style.css           # Global styles, variables, glassmorphism
│   ├── animations.css      # Keyframe animations & scroll reveals
│   └── responsive.css      # Media queries & responsive adjustments
│
├── js/
│   ├── app.js              # Navigation, shared utilities
│   ├── products.js         # Product data store (24 products)
│   ├── cart.js             # Cart add/remove/update/persist
│   ├── animations.js       # Scroll animations & Intersection Observer
│   └── ui.js               # Modals, dropdowns, search, filters
│
├── CONTEXT.md              # Full project documentation
└── README.md               # This file
```

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| 🔵 Brand Blue | `#2563EB` | Primary buttons, links, accents |
| 🔵 Light Blue | `#60A5FA` | Hover states, gradients |
| 🟢 Emerald | `#10B981` | Success, secondary actions |
| 🟡 Amber | `#F59E0B` | Star ratings, warnings, highlights |
| 🔴 Red | `#EF4444` | Errors, sale badges |
| ⬜ Slate-50 | `#F8FAFC` | Background |
| ⬛ Slate-800 | `#1E293B` | Primary text |

---

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/ZainDevX/E-Commerce-Website.git
   ```

2. **Navigate to the project folder**
   ```bash
   cd E-Commerce-Website
   ```

3. **Open in browser**
   
   Simply open `index.html` in your browser — no build tools or server required.

   Or use a live server:
   ```bash
   npx live-server
   ```

---

## Animations

| Animation | Trigger | Used On |
|-----------|---------|---------|
| `fadeInUp` | Scroll | Cards, sections |
| `scaleIn` | Hover / Load | Product cards, buttons |
| `float` | Continuous | Decorative shapes |
| `pulse` | Continuous | CTAs, notifications |
| `shimmer` | Continuous | Glass borders, loading |
| `countUp` | Scroll | Statistics numbers |
| `ripple` | Click | Buttons |
| `glassglow` | Hover | Glass cards |
| `gradientShift` | Continuous | Background gradients |

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| Opera | ✅ Full |

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## Author

**Zain** — [@ZainDevX](https://github.com/ZainDevX)

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using pure HTML, CSS & JavaScript
</p>
