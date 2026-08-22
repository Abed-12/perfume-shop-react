import { useState, useCallback } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminRoute, CustomerRoute } from "./routes/RoleRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import NotFound from "./pages/NotFound";
import useAdminFcm from "./hooks/useAdminFcm";
// Admin Pages
import AdminLogin from "./pages/admin/auth/AdminLogin";
import AdminForgotPassword from "./pages/admin/auth/AdminForgotPassword";
import AdminResetPassword from "./pages/admin/auth/AdminResetPassword";
import AdminProfile from "./pages/admin/profile/AdminProfile";
import AdminCoupon from "./pages/admin/coupon/AdminCoupon";
import AdminPerfumes from "./pages/admin/perfume/AdminPerfumes";
import AdminPerfumeDetails from "./pages/admin/perfume/AdminPerfumeDetails";
import AdminOrders from "./pages/admin/order/AdminOrders";
import AdminOrderDetails from "./pages/admin/order/AdminOrderDetails";
import AdminCustomers from "./pages/admin/customer/AdminCustomers";
import AdminDevices from "./pages/admin/device/AdminDevices";

// Customer Pages
import CustomerRegister from "./pages/customer/auth/CustomerRegister";
import CustomerLogin from "./pages/customer/auth/CustomerLogin";
import CustomerForgotPassword from "./pages/customer/auth/CustomerForgotPassword";
import CustomerResetPassword from "./pages/customer/auth/CustomerResetPassword";
import CustomerProfile from "./pages/customer/profile/CustomerProfile";
import CustomerOrders from "./pages/customer/orders/CustomerOrders";
import CustomerOrderDetails from "./pages/customer/orders/CustomerOrderDetails";

// Perfume Pages
import Perfumes from "./pages/perfume/Perfumes";
import PerfumeDetails from "./pages/perfume/PerfumeDetails";

// Order Pages
import OrderConfirm from "./pages/order/OrderConfirm";
import OrderSuccess from "./pages/order/OrderSuccess";

const App = () => {
  const [liveNotifications, setLiveNotifications] = useState([]);
  const addLiveNotification = useCallback((notif) => {
    setLiveNotifications((prev) => [notif, ...prev]);
  }, []);

  useAdminFcm(addLiveNotification);

  return (
    <BrowserRouter>
      <Navbar liveNotifications={liveNotifications} />

      <Routes>
        {/* Admin */}
        <Route path="/admin-panel/login" element={<AdminLogin />} />
        <Route path="/admin-panel/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin-panel/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin-panel/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
        <Route path="/admin-panel/coupon" element={<AdminRoute><AdminCoupon /></AdminRoute>} />
        <Route path="/admin-panel/perfumes" element={<AdminRoute><AdminPerfumes /></AdminRoute>} />
        <Route path="/admin-panel/perfumes/:id" element={<AdminRoute><AdminPerfumeDetails /></AdminRoute>} />
        <Route path="/admin-panel/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin-panel/orders/:orderNumber" element={<AdminRoute><AdminOrderDetails /></AdminRoute>} />
        <Route path="/admin-panel/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
        <Route path="/admin-panel/devices" element={<AdminRoute><AdminDevices /></AdminRoute>} />

        {/* Customer */}
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/forgot-password" element={<CustomerForgotPassword />} />
        <Route path="/reset-password" element={<CustomerResetPassword />} />
        <Route path="/profile" element={<CustomerRoute><CustomerProfile /></CustomerRoute>} />
        <Route path="/my-orders" element={<CustomerRoute><CustomerOrders /></CustomerRoute>} />
        <Route path="/my-orders/:orderNumber" element={<CustomerRoute><CustomerOrderDetails /></CustomerRoute>} />

        {/* Public */}
        <Route path="/perfumes" element={<Perfumes />} />
        <Route path="/perfumes/:id" element={<PerfumeDetails />} />
        <Route path="/order/confirm" element={<OrderConfirm />} />
        <Route path="/order/success/:orderNumber" element={<OrderSuccess />} />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
      {/* <MobileBottomNav /> */}
      <ToastContainer />
    </BrowserRouter>
  )
};

export default App;
