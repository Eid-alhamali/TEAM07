// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import Cart from './components/Cart';
import ProductsPage from './components/ProductsPage/ProductsPage';
import ProductDetail from './components/ProductDetail/ProductDetail'; // Import ProductDetail
import { CartProvider } from './CartContext'; // Import CartProvider
import Navbar from './components/Navbar/Navbar';
import LoginForm from "./components/LoginForm";
import Register from "./components/Register";
import WriteReview from './components/WriteReview'; 
import ReviewAdminPage from './components/ReviewAdminPage';
import MainAdminPage from './components/MainAdminPage'; 
import About from './components/About';
import AdminLoginPage from './components/AdminLoginPage'; 
import Checkout from './components/Checkout'; 
import OrderFailed from './components/OrderFailed';
import OrderSuccess from './components/OrderSuccess';
import SidebarLayout from './components/SidebarLayout'; 
import OrderPage from "./components/OrdersPage";
import WishlistPage from './components/WishlistPage/WishlistPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminProductMgmt from './components/AdminProductMgmt';
import AdminSalesMgmt from './components/AdminSalesMgmt';
import AdminCategoryPage from './components/AdminCategoryPage';
import AddProductPage from './components/AddProductPage';
import ViewProductsPage from './components/ViewProductsPage';
import AdminDeliveryPage from './components/AdminDeliveryPage';
import RefundList from "./components/RefundList";
import InvoiceOrders from './components/InvoiceOrders';
import ProfilePage from './components/ProfilePage';
import SetPricesDiscounts from "./components/SetPricesDiscounts";
import './index.css'; 

function App() {
  // Use the products state, for example by passing it to a component
  return (
    <CartProvider> {/* Wrap the app with CartProvider */}
      <Router>
        <div className="main-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/search" element={<ProductsPage />} />  
            <Route path="/product/:variant_id" element={<ProductDetail />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<Register/>} />
            <Route path="/reviews/write/:product_id" element={<WriteReview />} />
            <Route path="/about" element={<About />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-failed" element={<OrderFailed/>} />
            <Route path="/order-success" element={<OrderSuccess/>} />
            <Route path="/my-orders" element={<SidebarLayout><OrderPage /></SidebarLayout>} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile_page" element={<SidebarLayout><ProfilePage/></SidebarLayout>} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<ProtectedAdminRoute />}>
              <Route path="review_management" element={<ReviewAdminPage />} />
              <Route path="main_page" element={<MainAdminPage />} />
              <Route path="product_management" element={<AdminProductMgmt />} />
              <Route path="sales_management" element={<AdminSalesMgmt />} />
              <Route path="set_prices_discounts" element={<SetPricesDiscounts />} />
              <Route path="view_products" element={<ViewProductsPage />} />
              <Route path="add_product" element={<AddProductPage />} />
              <Route path="categories" element={<AdminCategoryPage />} />
              <Route path="delivery_list" element={<AdminDeliveryPage />} />
              <Route path="invoice_list" element={<InvoiceOrders/>} />
              <Route path="refund-list" element={<RefundList/>} />


         
            </Route>
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;