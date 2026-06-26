import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { getOrdersForUser, subscribeToOrders, getCart } from "../services/firestore";
import { getImageUrl } from "../utils/imageHelper";
import { NavIcon, SearchIcon, CartIconHeader, UserIcon } from "./Icons";

const navItems = [
  { label: "Home", iconType: "home" },
  { label: "Categories", iconType: "categories" },
  { label: "My Cart", iconType: "cart" },
  { label: "Order", iconType: "order" },
  { label: "Profile", iconType: "profile" },
];

function statusStyle(status) {
  if (status === "paid") return { bg: "#e8f5eb", color: "#2d6a4f", label: "Paid" };
  if (status === "pending") return { bg: "#fff7e6", color: "#f4a429", label: "Pending" };
  if (status === "cancelled") return { bg: "#fff0f0", color: "#e63946", label: "Cancelled" };
  return { bg: "#f0f0f0", color: "#555", label: status };
}

function formatDate(timestamp) {
  if (!timestamp) return "-";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-MY", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  });
}

export default function OrderHistoryPage({ onGoToCatalogue, onGoToCart, onGoToDashboard, onGoToProfile }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("Order");
  const [expandedId, setExpandedId] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("User");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = auth.currentUser;

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

  useEffect(() => {
    if (user) {
      setUserName(user.displayName || "User");
    }

    setLoading(true);

    const unsubscribe = subscribeToOrders((data) => {
      const userOrders = data.filter(order => order.userId === user?.uid);
      setOrders(userOrders);
      setLoading(false);
    });

    const fetchCart = async () => {
      try {
        const userId = user?.uid;
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

    return () => unsubscribe();
  }, [user]);

  const handleNavClick = (label) => {
    setActiveNav(label);

    if (label === "Home" && onGoToDashboard) {
      onGoToDashboard();
    } else if (label === "Categories" && onGoToCatalogue) {
      onGoToCatalogue();
    } else if (label === "My Cart" && onGoToCart) {
      onGoToCart();
    } else if (label === "Profile" && onGoToProfile) {
      onGoToProfile();
    }
    if (isMobile) setSidebarOpen(false);
  };

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

          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.label)}
              style={navButtonStyle(activeNav === item.label)}
              onMouseEnter={(e) => {
                if (activeNav !== item.label) e.currentTarget.style.background = "#e8f3eb";
              }}
              onMouseLeave={(e) => {
                if (activeNav !== item.label) e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
                <NavIcon type={item.iconType} />
              </div>
              <span>{item.label}</span>
              {item.label === "My Cart" && (
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
              )}
              {activeNav === item.label && (
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
          ))}

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

        <main style={{ 
          flex: 1, 
          padding: isMobile ? "12px" : "28px 36px", 
          background: "#f5f5f5", 
          overflowY: "auto",
          width: isMobile ? "100%" : "auto"
        }}>
          <div style={{ marginBottom: isMobile ? 16 : 28 }}>
            <h1 style={{ 
              margin: "0 0 4px 0", 
              fontSize: isMobile ? 22 : 28, 
              fontWeight: 700, 
              color: "#1a2e1a" 
            }}>
              Order History
            </h1>
            <p style={{ margin: 0, fontSize: isMobile ? 12 : 14, color: "#5c7a5c" }}>
              {orders.length > 0 ? `You have ${orders.length} order${orders.length > 1 ? 's' : ''}` : "View your past orders and their status"}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#5c7a5c", fontSize: 15 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: isMobile ? "40px 20px" : "80px 20px", color: "#8fba9f" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <p style={{ fontSize: isMobile ? 14 : 15, margin: 0, fontWeight: 500 }}>You haven't placed any orders yet.</p>
              <button
                onClick={() => {
                  setActiveNav("Categories");
                  if (onGoToCatalogue) onGoToCatalogue();
                }}
                style={{
                  marginTop: 16,
                  padding: isMobile ? "8px 20px" : "10px 24px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2d6a4f",
                  color: "#fff",
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.background = "#1f4a37"}
                onMouseLeave={(e) => e.target.style.background = "#2d6a4f"}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 16 }}>
              {orders.map(order => {
                const st = statusStyle(order.status);
                const orderKey = order.id || order.orderId;
                const isExpanded = expandedId === orderKey;
                return (
                  <div
                    key={orderKey}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      border: "1px solid #e8f0ea",
                      overflow: "hidden",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                    }}
                  >
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : orderKey)}
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        justifyContent: "space-between",
                        alignItems: isMobile ? "flex-start" : "center",
                        padding: isMobile ? "16px 20px" : "20px 28px",
                        cursor: "pointer",
                        background: "#f9faf9",
                        transition: "background 0.2s",
                        gap: isMobile ? 8 : 0,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7f1"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#f9faf9"}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#1a2e1a" }}>
                          Order #{order.orderId}
                        </p>
                        <p style={{ margin: "4px 0 0 0", fontSize: isMobile ? 11 : 13, color: "#5c7a5c" }}>
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: isMobile ? 12 : 20,
                        flexWrap: "wrap",
                        width: isMobile ? "100%" : "auto",
                        justifyContent: isMobile ? "space-between" : "flex-end"
                      }}>
                        <span
                          style={{
                            background: st.bg,
                            color: st.color,
                            fontSize: isMobile ? 11 : 12,
                            fontWeight: 600,
                            padding: "4px 12px",
                            borderRadius: 20,
                          }}
                        >
                          {st.label}
                        </span>
                        <span style={{ 
                          fontSize: isMobile ? 15 : 16, 
                          fontWeight: 700, 
                          color: "#2d6a4f", 
                          minWidth: isMobile ? 70 : 90 
                        }}>
                          RM{order.total.toFixed(2)}
                        </span>
                        <span style={{ color: "#999", fontSize: isMobile ? 14 : 16, minWidth: 20, textAlign: "right" }}>
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ borderTop: "1px solid #f0f5f1", padding: isMobile ? "16px 20px" : "20px 28px", background: "#fff" }}>
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ margin: "0 0 12px 0", fontSize: isMobile ? 12 : 13, fontWeight: 600, color: "#1a2e1a" }}>
                            Order Items
                          </p>
                          {order.items && order.items.map((item, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 10,
                                fontSize: isMobile ? 13 : 14,
                                color: "#3d5a40",
                                paddingBottom: 10,
                                borderBottom: i < order.items.length - 1 ? "1px solid #f0f5f1" : "none",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <img
                                  src={getImageUrl(item.image)}
                                  alt={item.name}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 6,
                                    objectFit: "cover",
                                    background: "#f5f5f5",
                                    border: "1px solid #e8f0ea"
                                  }}
                                  onError={(e) => {
                                    e.target.src = "/images/default.png";
                                  }}
                                />
                                <span>
                                  <span style={{ fontWeight: 500, color: "#1a2e1a" }}>{item.name}</span>
                                  <span style={{ color: "#8fba9f" }}> × {item.quantity}</span>
                                </span>
                              </div>
                              <span style={{ fontWeight: 500 }}>RM{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ background: "#f9faf9", padding: "12px 16px", borderRadius: 8 }}>
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            marginBottom: 6, 
                            fontSize: isMobile ? 12 : 13, 
                            color: "#5c7a5c" 
                          }}>
                            <span>Subtotal</span>
                            <span>RM{order.total.toFixed(2)}</span>
                          </div>
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            fontSize: isMobile ? 12 : 13, 
                            color: "#5c7a5c" 
                          }}>
                            <span>Payment Method</span>
                            <span style={{ fontWeight: 500, color: "#1a2e1a" }}>{order.paymentMethod || "N/A"}</span>
                          </div>
                          {order.customerName && (
                            <div style={{ 
                              display: "flex", 
                              justifyContent: "space-between", 
                              fontSize: isMobile ? 12 : 13, 
                              color: "#5c7a5c",
                              marginTop: 4
                            }}>
                              <span>Customer</span>
                              <span style={{ fontWeight: 500, color: "#1a2e1a" }}>{order.customerName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}