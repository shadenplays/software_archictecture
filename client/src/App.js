import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import LoginPage from "./components/LoginPage";
import CheckingRole from "./components/CheckingRole";
import CustomerDashboard from "./components/CustomerDashboard";
import ProductCatalogue from "./components/ProductCatalogue";
import ShoppingCart from "./components/ShoppingCart";
import PaymentPage from "./components/PaymentPage";
import PaymentSuccess from "./components/PaymentSuccess";
import OrderHistoryPage from "./components/OrderHistoryPage";
import ProfilePage from "./components/ProfilePage";

// 🛠 ADMIN IMPORTS
import AdminDashboard from "./admin/AdminDashboard";

function App() {
  const [page, setPage] = useState("login");
  const [role, setRole] = useState(null);
  const [catalogueCategory, setCatalogueCategory] = useState("All");
  const [orderInfo, setOrderInfo] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginRole, setLoginRole] = useState(null);

  const goToCatalogue = (category = "All") => {
    setCatalogueCategory(category);
    setPage("catalogue");
  };

  // 🔐 AUTH CHECK
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const savedRole = localStorage.getItem("role") || "customer";
        setRole(savedRole);
        setLoginRole(savedRole);
        setPage("checking");
      } else {
        setPage("login");
        setRole(null);
        setLoginRole(null);
      }
      setAuthChecked(true);
    });

    return () => unsub();
  }, []);

  if (!authChecked)
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    );

  // 🔐 LOGIN
  if (page === "login")
    return (
      <LoginPage 
        onLogin={(selectedRole) => {
          const roleToUse = selectedRole || localStorage.getItem("role") || "customer";
          setLoginRole(roleToUse);
          localStorage.setItem("role", roleToUse);
          setPage("checking");
        }} 
      />
    );

  // 🔄 CHECKING ROLE (5 seconds)
  if (page === "checking") {
    return (
      <CheckingRole 
        role={loginRole}
        onDone={() => {
          const finalRole = loginRole || localStorage.getItem("role") || "customer";
          setRole(finalRole);
          setPage(finalRole === "admin" ? "admin" : "dashboard");
        }} 
      />
    );
  }

  // 🛠 ADMIN PANEL
  if (page === "admin")
    return (
      <AdminDashboard
        onLogout={() => {
          auth.signOut();
          localStorage.removeItem("role");
          setPage("login");
        }}
      />
    );

  // 👤 CUSTOMER FLOW
  if (page === "dashboard")
    return (
      <CustomerDashboard
        onGoToCart={() => setPage("cart")}
        onGoToCatalogue={goToCatalogue}
        onGoToOrders={() => setPage("orders")}
        onGoToProfile={() => setPage("profile")}
      />
    );

  if (page === "catalogue")
    return (
      <ProductCatalogue
        selectedCategory={catalogueCategory}
        onGoToCart={() => setPage("cart")}
        onGoToDashboard={() => setPage("dashboard")}
        onGoToOrders={() => setPage("orders")}
        onGoToProfile={() => setPage("profile")}
      />
    );

  if (page === "cart")
    return (
      <ShoppingCart
        onCheckout={() => setPage("payment")}
        onGoToCatalogue={goToCatalogue}
        onGoToDashboard={() => setPage("dashboard")}
        onGoToOrders={() => setPage("orders")}
        onGoToProfile={() => setPage("profile")}
      />
    );

  if (page === "payment")
    return (
      <PaymentPage
        onBack={() => setPage("cart")}
        onPaySuccess={(info) => {
          setOrderInfo(info);
          setPage("success");
        }}
      />
    );

  if (page === "success")
    return (
      <PaymentSuccess
        orderInfo={orderInfo}
        onContinue={() => setPage("catalogue")}
        onViewInvoice={() => setPage("orders")}
      />
    );

  if (page === "orders")
    return (
      <OrderHistoryPage
        onGoToCatalogue={() => setPage("catalogue")}
        onGoToCart={() => setPage("cart")}
        onGoToDashboard={() => setPage("dashboard")}
        onGoToProfile={() => setPage("profile")}
      />
    );

  if (page === "profile")
    return (
      <ProfilePage
        onGoToDashboard={() => setPage("dashboard")}
        onGoToCatalogue={() => setPage("catalogue")}
        onGoToCart={() => setPage("cart")}
        onGoToOrders={() => setPage("orders")}
      />
    );

  return null;
}

export default App;