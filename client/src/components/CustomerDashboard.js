import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { subscribeToProducts, getCart, addToCart } from "../services/firestore";
import ProductDetailPopup from "./ProductDetailPopup";
import { NavIcon, SearchIcon, CartIconHeader, UserIcon } from "./Icons";
import { getImageUrl } from "../utils/imageHelper";

const CategoryIcon = ({ type }) => {
  const icons = {
    snacks: (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6H18L16 18H8L6 6Z" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 6L9 4H15L16 6" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    beverages: (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 4H16L15 14H9L8 4Z" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 18H19" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 14L9.5 18" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 14L14.5 18" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    household: (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 11L12 3L21 11V20H3V11Z" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V14H15V21" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    "personal-care": (
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C10.3431 2 9 3.34315 9 5C9 6.65685 10.3431 8 12 8C13.6569 8 15 6.65685 15 5C15 3.34315 13.6569 2 12 2Z" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 22V18C6 15.7909 7.79086 14 10 14H14C16.2091 14 18 15.7909 18 18V22" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  return icons[type] || icons.snacks;
};

export default function CustomerDashboard({ onGoToCart, onGoToCatalogue, onGoToDashboard, onGoToOrders, onGoToProfile }) {
  const [categories, setCategories] = useState([
    { name: "Snacks", type: "snacks" },
    { name: "Beverages", type: "beverages" },
    { name: "Household", type: "household" },
    { name: "Personal Care", type: "personal-care" },
  ]);

  const [products, setProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("John");
  const [activeNav, setActiveNav] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ========== MOBILE RESPONSIVE STATES ==========
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ========== CHECK MOBILE ==========
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ========== FETCH PRODUCTS FROM FIREBASE ==========
  useEffect(() => {
    if (auth.currentUser) {
      setUserName(auth.currentUser.displayName || "John");
    }

    const unsubscribeProducts = subscribeToProducts((data) => {
      setProducts(data);
      setPopularProducts(data.slice(0, 4));
      setFilteredProducts(data.slice(0, 4));
    });

    return () => {
      unsubscribeProducts();
    };
  }, []);

  // ========== SEARCH FUNCTION ==========
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(popularProducts);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered.slice(0, 8));
    }
  }, [searchTerm, products, popularProducts]);

  // ========== FETCH CART FROM FIRESTORE ==========
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          setCartCount(0);
          return;
        }
        const items = await getCart(userId);
        setCartCount(items.reduce((sum, item) => sum + (item.quantity || 0), 0));
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
    const interval = setInterval(fetchCart, 5000);
    return () => clearInterval(interval);
  }, []);

  // ========== ADD TO CART ==========
  const handleAddToCart = async (product, quantity = 1) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert("Please log in to add items to your cart.");
        return;
      }

      await addToCart(userId, product, quantity);
      const items = await getCart(userId);
      setCartCount(items.reduce((sum, item) => sum + (item.quantity || 0), 0));
      alert(`Added ${quantity} x ${product.name} to cart!`);
    } catch (error) {
      console.error("Add to cart failed:", error);
      alert(error.message || "Unable to add this item to the cart. Please try again.");
    }
  };

  const handleOpenProductDetail = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetail = () => {
    setSelectedProduct(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarOpen && !e.target.closest('.sidebar-nav')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const navButtonStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 12 : 14,
    padding: isMobile ? "12px 16px" : "14px 24px",
    margin: isMobile ? "2px 8px" : "0 12px",
    borderRadius: 10,
    border: "none",
    background: isActive ? "#2d6a4f" : "transparent",
    color: isActive ? "#fff" : "#1a2e1a",
    cursor: "pointer",
    fontSize: isMobile ? "14px" : "15px",
    fontWeight: isActive ? 700 : 600,
    transition: "all 0.2s",
    width: isMobile ? "calc(100% - 16px)" : "calc(100% - 24px)",
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const displayProducts = searchTerm.trim() !== "" ? filteredProducts : popularProducts;

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", fontFamily: "'Inter','Segoe UI',sans-serif", display: "flex", flexDirection: "column" }}>
      {/* ========== HEADER ========== */}
      <header style={{ 
        background: "#1e3d2f", 
        padding: isMobile ? "0 12px" : "0 28px", 
        height: isMobile ? 60 : 68, 
        display: "flex", 
        alignItems: "center", 
        gap: isMobile ? 10 : 20, 
        flexShrink: 0, 
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)" 
      }}>
        {isMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 24,
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              zIndex: 1001
            }}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        )}
        
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: isMobile ? 14 : 20, whiteSpace: "nowrap" }}>
            Your Local Shop
          </div>
          {!isMobile && (
            <div style={{ color: "#8fba9f", fontSize: 12 }}>Online Convenience Store</div>
          )}
        </div>

        <div style={{ flex: 1, maxWidth: isMobile ? 200 : 440, position: "relative", marginLeft: 12 }}>
          <span style={{ 
            position: "absolute", 
            left: 14, 
            top: "50%", 
            transform: "translateY(-50%)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            pointerEvents: "none"
          }}>
            <SearchIcon size={16} />
          </span>
          <input 
            placeholder="Search product…" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: "100%", 
              padding: isMobile ? "6px 12px 6px 34px" : "9px 16px 9px 40px", 
              borderRadius: 8, 
              border: "none", 
              background: "#fff", 
              fontSize: isMobile ? 12 : 14, 
              outline: "none" 
            }} 
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                color: "#999",
                padding: "2px 6px"
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: isMobile ? 12 : 18 }}>
          <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onGoToCart}>
            <CartIconHeader size={isMobile ? 18 : 20} />
            <span style={{ 
              position: "absolute", 
              top: -5, 
              right: -7, 
              background: "#e63946", 
              color: "#fff", 
              borderRadius: "50%", 
              width: isMobile ? 16 : 18, 
              height: isMobile ? 16 : 18, 
              fontSize: isMobile ? 9 : 11, 
              fontWeight: 700, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              {cartCount}
            </span>
          </div>
          
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: isMobile ? 4 : 8, 
              background: "#fff", 
              borderRadius: 20, 
              padding: isMobile ? "4px 8px 4px 4px" : "5px 14px 5px 8px",
              cursor: "pointer",
              transition: "opacity 0.2s"
            }}
            onClick={() => {
              if (onGoToProfile) {
                onGoToProfile();
              }
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            <div style={{ 
              width: isMobile ? 22 : 26, 
              height: isMobile ? 22 : 26, 
              borderRadius: "50%", 
              background: "#c3e6cb", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              <UserIcon size={isMobile ? 12 : 16} />
            </div>
            {!isMobile && (
              <>
                <span style={{ fontSize: 14, color: "#1a2e1a", fontWeight: 500 }}>{userName}</span>
                <span style={{ fontSize: 12, color: "#5c7a5c" }}>▾</span>
              </>
            )}
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        <nav 
          className="sidebar-nav"
          style={{ 
            width: isMobile ? 280 : 240, 
            background: "#f0f7f1", 
            padding: isMobile ? "16px 0" : "24px 0", 
            display: "flex", 
            flexDirection: "column", 
            gap: isMobile ? 4 : 8, 
            flexShrink: 0,
            position: isMobile ? "fixed" : "relative",
            top: isMobile ? 0 : "auto",
            left: isMobile ? (sidebarOpen ? 0 : "-280px") : "auto",
            height: isMobile ? "100vh" : "auto",
            zIndex: isMobile ? 1000 : "auto",
            transition: isMobile ? "left 0.3s ease" : "none",
            boxShadow: isMobile ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
            overflowY: "auto"
          }}
        >
          {isMobile && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 16px 16px 16px",
              borderBottom: "1px solid #e8f0ea"
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a2e1a" }}>Your Local Shop</h2>
                <p style={{ margin: 0, fontSize: 10, color: "#5c7a5c" }}>Online Convenience Store</p>
              </div>
              <button
                onClick={toggleSidebar}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#1a2e1a",
                  padding: "4px 8px"
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Nav Items */}
          <button
            onClick={() => {
              setActiveNav("home");
              onGoToDashboard();
              if (isMobile) setSidebarOpen(false);
            }}
            style={navButtonStyle(activeNav === "home")}
          >
            <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
              <NavIcon type="home" />
            </div>
            <span>Home</span>
            {activeNav === "home" && (
              <span style={{
                marginLeft: "auto",
                fontSize: 9,
                background: "rgba(255,255,255,0.25)",
                padding: "2px 8px",
                borderRadius: 10,
                color: "#fff"
              }}>
                Active
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveNav("categories");
              onGoToCatalogue("All");
              if (isMobile) setSidebarOpen(false);
            }}
            style={navButtonStyle(activeNav === "categories")}
          >
            <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
              <NavIcon type="categories" />
            </div>
            <span>Categories</span>
            {activeNav === "categories" && (
              <span style={{
                marginLeft: "auto",
                fontSize: 9,
                background: "rgba(255,255,255,0.25)",
                padding: "2px 8px",
                borderRadius: 10,
                color: "#fff"
              }}>
                Active
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveNav("cart");
              onGoToCart();
              if (isMobile) setSidebarOpen(false);
            }}
            style={navButtonStyle(activeNav === "cart")}
          >
            <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
              <NavIcon type="cart" />
            </div>
            <span>My Cart</span>
            <span style={{ 
              marginLeft: "auto", 
              background: "#e63946", 
              color: "#fff", 
              borderRadius: "50%", 
              width: isMobile ? 20 : 22, 
              height: isMobile ? 20 : 22, 
              fontSize: isMobile ? 10 : 12, 
              fontWeight: 700, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              {cartCount}
            </span>
            {activeNav === "cart" && (
              <span style={{
                marginLeft: "auto",
                fontSize: 9,
                background: "rgba(255,255,255,0.25)",
                padding: "2px 8px",
                borderRadius: 10,
                color: "#fff"
              }}>
                Active
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveNav("orders");
              onGoToOrders && onGoToOrders();
              if (isMobile) setSidebarOpen(false);
            }}
            style={navButtonStyle(activeNav === "orders")}
          >
            <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
              <NavIcon type="order" />
            </div>
            <span>Order</span>
            {activeNav === "orders" && (
              <span style={{
                marginLeft: "auto",
                fontSize: 9,
                background: "rgba(255,255,255,0.25)",
                padding: "2px 8px",
                borderRadius: 10,
                color: "#fff"
              }}>
                Active
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveNav("profile");
              onGoToProfile && onGoToProfile();
              if (isMobile) setSidebarOpen(false);
            }}
            style={navButtonStyle(activeNav === "profile")}
          >
            <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
              <NavIcon type="profile" />
            </div>
            <span>Profile</span>
            {activeNav === "profile" && (
              <span style={{
                marginLeft: "auto",
                fontSize: 9,
                background: "rgba(255,255,255,0.25)",
                padding: "2px 8px",
                borderRadius: 10,
                color: "#fff"
              }}>
                Active
              </span>
            )}
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={() => {
              setActiveNav("logout");
              auth.signOut();
              localStorage.removeItem("role");
              window.location.reload();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 10 : 14,
              padding: isMobile ? "12px 16px" : "14px 24px",
              margin: isMobile ? "2px 8px" : "0 12px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              color: "#e63946",
              cursor: "pointer",
              fontSize: isMobile ? "14px" : "15px",
              fontWeight: 600,
              transition: "all 0.2s",
              width: isMobile ? "calc(100% - 16px)" : "calc(100% - 24px)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
              <NavIcon type="logout" />
            </div>
            <span>Logout</span>
          </button>
        </nav>

        {isMobile && sidebarOpen && (
          <div
            onClick={toggleSidebar}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 999,
              animation: "fadeIn 0.3s ease"
            }}
          />
        )}

        <main style={{ 
          flex: 1, 
          padding: isMobile ? "12px" : "28px 36px", 
          background: "#f5f5f5", 
          overflowY: "auto",
          width: isMobile ? "100%" : "auto"
        }}>
          {/* Welcome Section */}
          <div style={{ 
            background: "#fff", 
            borderRadius: 14, 
            padding: isMobile ? "20px 16px" : "32px 36px", 
            marginBottom: isMobile ? 16 : 28, 
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)" 
          }}>
            <h1 style={{ 
              margin: "0 0 4px", 
              fontSize: isMobile ? 20 : 28, 
              fontWeight: 700, 
              color: "#1a2e1a" 
            }}>
              Good {getGreeting()}, {userName}
            </h1>
            <p style={{ margin: 0, fontSize: isMobile ? 12 : 14, color: "#5c7a5c" }}>
              What would you like to buy today?
            </p>
          </div>

          {/* Categories Grid Section */}
          <div style={{ marginBottom: isMobile ? 20 : 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 12 : 18 }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 700, color: "#1a2e1a" }}>
                Browse by Category
              </h2>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav("categories");
                  onGoToCatalogue("All");
                }}
                style={{ fontSize: isMobile ? "11px" : "13px", color: "#2d6a4f", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}
              >
                View all →
              </a>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gap: isMobile ? 10 : 16,
              }}
            >
              {categories.map((category) => (
                <div
                  key={category.name}
                  onClick={() => {
                    setActiveNav("categories");
                    onGoToCatalogue(category.name);
                  }}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: isMobile ? "20px 10px" : "40px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    border: "2px solid #d4e6d8",
                    transition: "all 0.3s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(45, 106, 79, 0.15)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "#2d6a4f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#d4e6d8";
                  }}
                >
                  <div style={{ fontSize: isMobile ? "32px" : "48px", marginBottom: isMobile ? "6px" : "12px" }}>
                    <CategoryIcon type={category.type} />
                  </div>
                  <h3 style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: 600, color: "#1a2e1a", margin: 0 }}>
                    {category.name}
                  </h3>
                </div>
              ))}
            </div>
            
            {searchTerm && (
              <div style={{
                marginTop: 12,
                padding: "8px 16px",
                background: "#e8f3eb",
                borderRadius: 8,
                fontSize: 13,
                color: "#2d6a4f"
              }}>
                Found {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''} for "{searchTerm}"
              </div>
            )}
          </div>

          {/* Popular Products Section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 12 : 18 }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 700, color: "#1a2e1a" }}>
                {searchTerm ? "Search Results" : "Popular Products"}
              </h2>
              {!searchTerm && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveNav("categories");
                    onGoToCatalogue("All");
                  }}
                  style={{ fontSize: isMobile ? "11px" : "13px", color: "#2d6a4f", fontWeight: 600, textDecoration: "none", cursor: "pointer" }}
                >
                  View all →
                </a>
              )}
            </div>

            {displayProducts.length === 0 && searchTerm ? (
              <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: "40px 20px",
                textAlign: "center",
                color: "#888"
              }}>
                <p style={{ fontSize: 18, marginBottom: 8 }}>🔍</p>
                <p>No products found for "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm("")}
                  style={{
                    marginTop: 12,
                    padding: "8px 24px",
                    background: "#2d6a4f",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                  gap: isMobile ? 10 : 16,
                }}
              >
                {displayProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleOpenProductDetail(product)}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                      transition: "all 0.3s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)";
                    }}
                  >
                    <div
                      style={{
                        background: "#f5f5f5",
                        height: isMobile ? "100px" : "160px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        padding: isMobile ? "8px" : "12px",
                        borderBottom: "1px solid #e8f0ea",
                      }}
                    >
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          e.target.src = "/images/default.png";
                        }}
                      />
                    </div>
                    <div style={{ padding: isMobile ? "10px" : "16px" }}>
                      <h3 style={{ 
                        fontSize: isMobile ? "11px" : "13px", 
                        fontWeight: 600, 
                        color: "#1a2e1a", 
                        margin: "0 0 4px 0", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis", 
                        whiteSpace: "nowrap" 
                      }}>
                        {product.name}
                      </h3>
                      <p style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 700, color: "#2d6a4f", margin: "0 0 2px 0" }}>
                        RM {product.price.toFixed(2)}
                      </p>
                      <p style={{ fontSize: isMobile ? "10px" : "12px", color: "#5c7a5c", margin: "0 0 8px 0" }}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        style={{
                          width: "100%",
                          padding: isMobile ? "6px 0" : "9px 0",
                          background: product.stock === 0 ? "#ccc" : "#2d6a4f",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: isMobile ? "10px" : "12px",
                          fontWeight: 600,
                          cursor: product.stock === 0 ? "not-allowed" : "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (product.stock > 0) e.target.style.background = "#1f4a37";
                        }}
                        onMouseLeave={(e) => {
                          if (product.stock > 0) e.target.style.background = "#2d6a4f";
                        }}
                        disabled={product.stock === 0}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      
      {selectedProduct && (
        <ProductDetailPopup
          product={selectedProduct}
          onClose={handleCloseProductDetail}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}