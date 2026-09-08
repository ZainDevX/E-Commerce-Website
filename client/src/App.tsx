import { Route, Routes } from 'react-router-dom'
import About from './pages/About.tsx'
import Auth from './pages/Auth.tsx'
import Cart from './pages/Cart.tsx'
import Checkout from './pages/Checkout.tsx'
import Contact from './pages/Contact.tsx'
import Home from './pages/Home.tsx'
import NotFound from './pages/NotFound.tsx'
import Product from './pages/Product.tsx'
import Shop from './pages/Shop.tsx'
import Wishlist from './pages/Wishlist.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
