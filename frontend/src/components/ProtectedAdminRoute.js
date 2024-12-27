import { Outlet, Navigate, useLocation } from "react-router-dom";

const ProtectedAdminRoute = () => {
  const token = sessionStorage.getItem("token"); // Use sessionStorage here
  const role = sessionStorage.getItem("role"); // Use sessionStorage here
  const location = useLocation();

  const isAuthenticated = token && (role === "product_manager" || role === "sales_manager");

  const roleBasedAccess = {
    "/admin/product_management": "product_manager",
    "/admin/sales_management": "sales_manager",
  };

  const currentPath = location.pathname;
  const allowedRole = roleBasedAccess[currentPath];

  if (isAuthenticated) {
    if (allowedRole && role !== allowedRole) {
      console.warn(`Unauthorized access attempt to ${currentPath}`);
      return <Navigate to="/admin/main_page" replace={true} />;
    }
    return <Outlet />;
  }

  return <Navigate to="/admin/login" replace={true} />;
};

export default ProtectedAdminRoute;