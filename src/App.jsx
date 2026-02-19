import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminRoute, CustomerRoute } from "./routes/RoleRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import NotFound from "./pages/NotFound";
// Admin Pages
import AdminLogin from "./pages/admin/auth/AdminLogin";
import AdminForgotPassword from "./pages/admin/auth/AdminForgotPassword";
import AdminResetPassword from "./pages/admin/auth/AdminResetPassword";
import AdminProfile from "./pages/admin/profile/AdminProfile";
import AdminCoupon from "./pages/admin/coupon/AdminCoupon";
import AdminPerfumes from "./pages/admin/perfume/AdminPerfumes";
import AdminPerfumeDetails from "./pages/admin/perfume/AdminPerfumeDetails";

// Customer Pages
import CustomerRegister from "./pages/customer/auth/CustomerRegister";
import CustomerLogin from "./pages/customer/auth/CustomerLogin";
import CustomerForgotPassword from "./pages/customer/auth/CustomerForgotPassword";
import CustomerResetPassword from "./pages/customer/auth/CustomerResetPassword";
import CustomerProfile from "./pages/customer/profile/CustomerProfile";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Admin */}
        <Route path="/admin-panel/login" element={<AdminLogin />} />
        <Route path="/admin-panel/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin-panel/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin-panel/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
        <Route path="/admin-panel/coupon" element={<AdminRoute><AdminCoupon /></AdminRoute>} />
        <Route path="/admin-panel/perfume" element={<AdminRoute><AdminPerfumes /></AdminRoute>} />
        <Route path="/admin-panel/perfume/:id" element={<AdminRoute><AdminPerfumeDetails /></AdminRoute>} />

        {/* Customer */}
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/forgot-password" element={<CustomerForgotPassword />} />
        <Route path="/reset-password" element={<CustomerResetPassword />} />
        <Route path="/profile" element={<CustomerRoute><CustomerProfile /></CustomerRoute>} />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
      {/* <MobileBottomNav /> */}
    </BrowserRouter>
  )
};

export default App;