import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getCart } from "../services/firestore";
import { getImageUrl } from "../utils/imageHelper";
import { NavIcon, SearchIcon, CartIconHeader, UserIcon } from "./Icons";

const navItems = [
  { label: "Home", iconType: "home" },
  { label: "Categories", iconType: "categories" },
  { label: "My Cart", iconType: "cart" },
  { label: "Order", iconType: "order" },
  { label: "Profile", iconType: "profile" },
];

export default function ProfilePage({ onGoToDashboard, onGoToCatalogue, onGoToCart, onGoToOrders }) {
  const user = auth.currentUser;
  const [activeNav, setActiveNav] = useState("Profile");
  const [cartCount, setCartCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("User");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      setFormData({
        displayName: user.displayName || "",
        email: user.email || "",
        phone: "",
        address: "",
      });

      const fetchUserData = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData(prev => ({
              ...prev,
              phone: data.phone || "",
              address: data.address || "",
            }));
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      };
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const userId = user?.uid;
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
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (user) {
        await updateProfile(user, {
          displayName: formData.displayName,
        });

        await updateDoc(doc(db, "users", user.uid), {
          displayName: formData.displayName,
          phone: formData.phone,
          address: formData.address,
          updatedAt: new Date(),
        });

        setMessage("✅ Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("❌ Error updating profile. Please try again.");
    }
    setLoading(false);
  };

  const handleNavClick = (label) => {
    setActiveNav(label);

    if (label === "Profile") {
      if (isMobile) setSidebarOpen(false);
      return;
    }

    if (label === "Home" && onGoToDashboard) {
      onGoToDashboard();
    } else if (label === "Categories" && onGoToCatalogue) {
      onGoToCatalogue();
    } else if (label === "My Cart" && onGoToCart) {
      onGoToCart();
    } else if (label === "Order" && onGoToOrders) {
      onGoToOrders();
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

  const inputStyle = {
    width: "100%",
    padding: isMobile ? "10px 12px" : "12px 14px",
    borderRadius: 8,
    border: "1.5px solid #d4e6d8",
    background: "#fff",
    fontSize: isMobile ? 13 : 14,
    color: "#1a2e1a",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

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
              Profile
            </h1>
            <p style={{ margin: 0, fontSize: isMobile ? 12 : 14, color: "#5c7a5c" }}>
              Manage your account information
            </p>
          </div>

          {message && (
            <div style={{
              background: message.includes("Error") ? "#fff0f0" : "#e8f5eb",
              color: message.includes("Error") ? "#e63946" : "#2d6a4f",
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: isMobile ? 13 : 14,
              fontWeight: 500,
            }}>
              {message}
            </div>
          )}

          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{
              background: "linear-gradient(135deg, #1e3d2f 0%, #2d6a4f 100%)",
              padding: isMobile ? "20px 16px" : "32px 28px",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "center" : "center",
              gap: isMobile ? 12 : 20,
              textAlign: isMobile ? "center" : "left",
            }}>
              <div style={{
                width: isMobile ? 60 : 80,
                height: isMobile ? 60 : 80,
                borderRadius: "50%",
                background: "#c3e6cb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? 30 : 40,
                fontWeight: 700,
                color: "#2d6a4f",
                flexShrink: 0,
              }}>
                {user?.displayName?.charAt(0) || "U"}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#fff" }}>
                  {user?.displayName || "User"}
                </h2>
                <p style={{ margin: "4px 0 0 0", fontSize: isMobile ? 12 : 14, color: "#c3e6cb" }}>
                  {user?.email || "email@example.com"}
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    marginLeft: isMobile ? 0 : "auto",
                    padding: isMobile ? "8px 16px" : "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#c3e6cb",
                    color: "#1e3d2f",
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    width: isMobile ? "100%" : "auto",
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#b3d9bb"}
                  onMouseLeave={(e) => e.target.style.background = "#c3e6cb"}
                >
                  ✎ Edit Profile
                </button>
              )}
            </div>

            <div style={{ padding: isMobile ? "20px 16px" : "32px 28px" }}>
              {isEditing ? (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: isMobile ? 12 : 14, fontWeight: 600, color: "#1a2e1a", marginBottom: 6 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "#2d6a4f"}
                      onBlur={(e) => e.target.style.borderColor = "#d4e6d8"}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: isMobile ? 12 : 14, fontWeight: 600, color: "#1a2e1a", marginBottom: 6 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      style={{ ...inputStyle, background: "#f5f5f5", color: "#999" }}
                    />
                    <p style={{ margin: "4px 0 0 0", fontSize: isMobile ? 10 : 12, color: "#8fba9f" }}>Email cannot be changed</p>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: isMobile ? 12 : 14, fontWeight: 600, color: "#1a2e1a", marginBottom: 6 }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "#2d6a4f"}
                      onBlur={(e) => e.target.style.borderColor = "#d4e6d8"}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: isMobile ? 12 : 14, fontWeight: 600, color: "#1a2e1a", marginBottom: 6 }}>
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter your address"
                      style={{
                        ...inputStyle,
                        minHeight: isMobile ? 80 : 100,
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#2d6a4f"}
                      onBlur={(e) => e.target.style.borderColor = "#d4e6d8"}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12 }}>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: isMobile ? "10px 0" : "12px 0",
                        borderRadius: 8,
                        border: "none",
                        background: loading ? "#9bbfaa" : "#2d6a4f",
                        color: "#fff",
                        fontSize: isMobile ? 14 : 15,
                        fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.target.style.background = "#1f4a37";
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) e.target.style.background = "#2d6a4f";
                      }}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      style={{
                        flex: 1,
                        padding: isMobile ? "10px 0" : "12px 0",
                        borderRadius: 8,
                        border: "1.5px solid #d4e6d8",
                        background: "#fff",
                        color: "#1a2e1a",
                        fontSize: isMobile ? 14 : 15,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
                      onMouseLeave={(e) => e.target.style.background = "#fff"}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
                    gap: isMobile ? 16 : 24, 
                    marginBottom: isMobile ? 16 : 24 
                  }}>
                    <div>
                      <p style={{ margin: "0 0 6px 0", fontSize: isMobile ? 11 : 13, fontWeight: 600, color: "#5c7a5c" }}>
                        FULL NAME
                      </p>
                      <p style={{ margin: 0, fontSize: isMobile ? 14 : 15, fontWeight: 500, color: "#1a2e1a" }}>
                        {formData.displayName || "-"}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 6px 0", fontSize: isMobile ? 11 : 13, fontWeight: 600, color: "#5c7a5c" }}>
                        EMAIL
                      </p>
                      <p style={{ margin: 0, fontSize: isMobile ? 14 : 15, fontWeight: 500, color: "#1a2e1a" }}>
                        {formData.email}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 6px 0", fontSize: isMobile ? 11 : 13, fontWeight: 600, color: "#5c7a5c" }}>
                        PHONE NUMBER
                      </p>
                      <p style={{ margin: 0, fontSize: isMobile ? 14 : 15, fontWeight: 500, color: "#1a2e1a" }}>
                        {formData.phone || "-"}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 6px 0", fontSize: isMobile ? 11 : 13, fontWeight: 600, color: "#5c7a5c" }}>
                        MEMBER SINCE
                      </p>
                      <p style={{ margin: 0, fontSize: isMobile ? 14 : 15, fontWeight: 500, color: "#1a2e1a" }}>
                        {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString("en-MY") : "-"}
                      </p>
                    </div>
                  </div>

                  {formData.address && (
                    <div style={{ paddingTop: 16, borderTop: "1px solid #f0f5f1" }}>
                      <p style={{ margin: "0 0 6px 0", fontSize: isMobile ? 11 : 13, fontWeight: 600, color: "#5c7a5c" }}>
                        ADDRESS
                      </p>
                      <p style={{ margin: 0, fontSize: isMobile ? 14 : 15, color: "#1a2e1a", lineHeight: "1.6" }}>
                        {formData.address}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            marginTop: isMobile ? 16 : 28, 
            background: "#fff", 
            borderRadius: 14, 
            padding: isMobile ? "16px" : "28px", 
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)" 
          }}>
            <h3 style={{ 
              margin: "0 0 16px 0", 
              fontSize: isMobile ? 16 : 18, 
              fontWeight: 700, 
              color: "#1a2e1a" 
            }}>
              Account Security
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                style={{
                  padding: isMobile ? "10px 14px" : "12px 16px",
                  borderRadius: 8,
                  border: "1.5px solid #d4e6d8",
                  background: "#fff",
                  color: "#2d6a4f",
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
                onMouseLeave={(e) => e.target.style.background = "#fff"}
              >
                🔐 Change Password
              </button>
              <button
                style={{
                  padding: isMobile ? "10px 14px" : "12px 16px",
                  borderRadius: 8,
                  border: "1.5px solid #d4e6d8",
                  background: "#fff",
                  color: "#2d6a4f",
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
                onMouseLeave={(e) => e.target.style.background = "#fff"}
              >
                📱 Two-Factor Authentication
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}