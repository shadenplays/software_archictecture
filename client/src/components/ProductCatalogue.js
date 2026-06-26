import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { subscribeToProducts, getCart, addToCart } from "../services/firestore";
import { getImageUrl } from "../utils/imageHelper";
import ProductDetailPopup from "./ProductDetailPopup";
import { NavIcon, SearchIcon, CartIconHeader, UserIcon } from "./Icons";

export default function ProductCatalogue({ selectedCategory: initialCategory = "All", onGoToCart, onGoToOrders, onGoToDashboard, onGoToProfile }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "All");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories] = useState(["All", "Beverages", "Snacks", "Household", "Personal Care"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [activeNav, setActiveNav] = useState("Categories");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

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

  // ========== TOGGLE SIDEBAR ==========
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // ========== CLOSE SIDEBAR OUTSIDE CLICK ==========
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarOpen && !e.target.closest('.sidebar-nav')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    setSelectedCategory(initialCategory || "All");
  }, [initialCategory]);

  // ========== FETCH PRODUCTS FROM FIREBASE ==========
  useEffect(() => {
    if (auth.currentUser) {
      setUserName(auth.currentUser.displayName || "User");
    }

    setLoading(true);
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ========== FETCH CART COUNT ==========
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          setCartCount(0);
          return;
        }
        const items = await getCart(userId);
        setCartCount(items.reduce((sum, item) => sum + (item.quantity || 0), 0));
      } catch (error) {
        console.error("Unable to fetch cart count:", error);
      }
    };

    fetchCartCount();
    const interval = setInterval(fetchCartCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // ========== FILTER AND SORT PRODUCTS ==========
  useEffect(() => {
    filterAndSortProducts(products, selectedCategory, sortBy, searchTerm);
  }, [products, selectedCategory, sortBy, searchTerm]);

  const filterAndSortProducts = (data, category, sort, search) => {
    let filtered = data;

    if (category !== "All") {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === "popular") {
      filtered.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    } else if (sort === "low-high") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "high-low") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterAndSortProducts(products, category, sortBy, searchTerm);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    filterAndSortProducts(products, selectedCategory, sort, searchTerm);
  };

  const handleSearchChange = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    filterAndSortProducts(products, selectedCategory, sortBy, search);
  };

  // ========== ADD TO CART ==========
  const handleAddToCart = async (product, quantity) => {
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

  // ========== NAV BUTTON STYLE ==========
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
            onChange={handleSearchChange}
            style={{ 
              width: "100%", 
              padding: isMobile ? "6px 12px 6px 34px" : "9px 16px 9px 40px", 
              borderRadius: 8, 
              border: "none", 
              background: "#fff", 
              fontSize: isMobile ? 12 : 14, 
              outline: "none",
              boxSizing: "border-box"
            }} 
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                filterAndSortProducts(products, selectedCategory, sortBy, "");
              }}
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
            onClick={() => { if (onGoToProfile) onGoToProfile(); }}
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
              setActiveNav("Home");
              if (onGoToDashboard) onGoToDashboard();
              if (isMobile) setSidebarOpen(false);
            }}
            style={navButtonStyle(activeNav === "Home")}
          >
            <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
              <NavIcon type="home" />
            </div>
            <span>Home</span>
            {activeNav === "Home" && (
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
              setActiveNav("Categories");
              if (isMobile) setSidebarOpen(false);
            }}
            style={navButtonStyle(activeNav === "Categories")}
          >
            <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
              <NavIcon type="categories" />
            </div>
            <span>Categories</span>
            {activeNav === "Categories" && (
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
              setActiveNav("My Cart");
              if (onGoToCart) onGoToCart();
              if (isMobile) setSidebarOpen(false);
            }}
            style={navButtonStyle(activeNav === "My Cart")}
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
            {activeNav === "My Cart" && (
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
              setActiveNav("Order");
              if (onGoToOrders) onGoToOrders();
              if (isMobile) setSidebarOpen(false);
            }}
            style={navButtonStyle(activeNav === "Order")}
          >
            <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
              <NavIcon type="order" />
            </div>
            <span>Order</span>
            {activeNav === "Order" && (
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
              setActiveNav("Profile");
              if (onGoToProfile) onGoToProfile();
              if (isMobile) setSidebarOpen(false);
            }}
            style={navButtonStyle(activeNav === "Profile")}
          >
            <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
              <NavIcon type="profile" />
            </div>
            <span>Profile</span>
            {activeNav === "Profile" && (
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
              setActiveNav("Logout");
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

        {/* ========== MAIN CONTENT ========== */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? "12px" : "28px 36px", 
          background: "#f5f5f5", 
          overflowY: "auto",
          width: isMobile ? "100%" : "auto"
        }}>
          <div style={{ marginBottom: isMobile ? 16 : 24 }}>
            <h1 style={{ 
              margin: "0 0 4px 0", 
              fontSize: isMobile ? 22 : 26, 
              fontWeight: 700, 
              color: "#1a2e1a" 
            }}>
              Product Catalogue
            </h1>
            <p style={{ margin: 0, fontSize: isMobile ? 12 : 14, color: "#5c7a5c" }}>
              Browse and add products to your cart
            </p>
          </div>

          {/* Filters Card */}
          <div style={{ 
            background: "#fff", 
            borderRadius: 14, 
            padding: isMobile ? "14px 16px" : "18px 28px", 
            marginBottom: isMobile ? 16 : 28, 
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)", 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between", 
            alignItems: isMobile ? "stretch" : "center", 
            gap: isMobile ? 12 : 20, 
            flexWrap: "wrap" 
          }}>
            <div style={{ 
              display: "flex", 
              gap: 12, 
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 600, color: "#1a2e1a" }}>Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{
                  padding: isMobile ? "6px 10px" : "8px 12px",
                  borderRadius: 6,
                  border: "1.5px solid #2d6a4f",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: isMobile ? "12px" : "13px",
                  fontWeight: 600,
                  color: "#2d6a4f",
                  outline: "none",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ 
              display: "flex", 
              gap: 12, 
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 600, color: "#1a2e1a" }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{
                  padding: isMobile ? "6px 10px" : "8px 12px",
                  borderRadius: 6,
                  border: "1.5px solid #999",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: isMobile ? "12px" : "13px",
                  outline: "none",
                }}
              >
                <option value="popular">Popular</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>

            <div style={{ 
              fontSize: isMobile ? "12px" : "13px", 
              color: "#5c7a5c", 
              fontWeight: 500,
              marginLeft: isMobile ? 0 : "auto"
            }}>
              Showing {filteredProducts.length} products
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#5c7a5c" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              Loading products...
            </div>
          ) : filteredProducts.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(180px, 1fr))",
                gap: isMobile ? 12 : 20,
              }}
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => product.stock > 0 && setSelectedProduct(product)}
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    cursor: product.stock > 0 ? "pointer" : "not-allowed",
                    transition: "all 0.3s",
                    opacity: product.stock > 0 ? 1 : 0.6,
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
                      position: "relative",
                    }}
                  >
                    {product.stock === 0 && (
                      <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(0,0,0,0.7)",
                        color: "#fff",
                        padding: isMobile ? "4px 10px" : "8px 16px",
                        borderRadius: 6,
                        fontSize: isMobile ? "10px" : "12px",
                        fontWeight: 600,
                        zIndex: 10,
                      }}>
                        Out of Stock
                      </div>
                    )}
                    {/* ✅ FIXED: Using getImageUrl helper */}
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
                        if (product.stock > 0) {
                          setSelectedProduct(product);
                        }
                      }}
                      disabled={product.stock === 0}
                      style={{
                        width: "100%",
                        padding: isMobile ? "6px 0" : "9px 0",
                        background: product.stock === 0 ? "#ccc" : "#2d6a4f",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        fontSize: isMobile ? "11px" : "13px",
                        fontWeight: 600,
                        cursor: product.stock === 0 ? "not-allowed" : "pointer",
                        transition: "background 0.2s",
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#5c7a5c" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
              <p style={{ fontSize: isMobile ? "14px" : "16px", margin: 0, fontWeight: 500 }}>No products found</p>
              <p style={{ fontSize: isMobile ? "12px" : "13px", margin: "8px 0 0 0", color: "#8fba9f" }}>Try adjusting your filters or search term</p>
            </div>
          )}
        </main>
      </div>

      {selectedProduct && (
        <ProductDetailPopup
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}