import { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  getCart,
  removeCartItem,
  clearCart,
  updateCartItemQuantity,
} from "../services/firestore";
import { getImageUrl } from "../utils/imageHelper";
import { NavIcon, SearchIcon, CartIconHeader, UserIcon } from "./Icons";

const navItems = [
    { label: "Home", iconType: "home" },
    { label: "Categories", iconType: "categories" },
    { label: "My Cart", iconType: "cart", badge: true },
    { label: "Order", iconType: "order" },
    { label: "Profile", iconType: "profile" },
];

function EditModal({ item, onSave, onClose }) {
    const [qty, setQty] = useState(item.quantity);
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 12, padding: "28px 32px", minWidth: 300, maxWidth: "90%" }} onClick={e => e.stopPropagation()}>
                <h3 style={{ margin: "0 0 8px", fontSize: 17, color: "#1a2e1a" }}>Edit Item</h3>
                <p style={{ margin: "0 0 20px", color: "#5c7a5c", fontSize: 14 }}>{item.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #2d6a4f", background: "#fff", color: "#2d6a4f", fontSize: 20, cursor: "pointer", fontWeight: 600 }}>−</button>
                    <span style={{ fontSize: 20, fontWeight: 600, minWidth: 24, textAlign: "center" }}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #2d6a4f", background: "#fff", color: "#2d6a4f", fontSize: 20, cursor: "pointer", fontWeight: 600 }}>+</button>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontSize: 14, color: "#555" }}>Cancel</button>
                    <button onClick={() => onSave(item.id, qty)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "#2d6a4f", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default function ShoppingCart({ onGoToCatalogue, onCheckout, onGoToOrders, onGoToDashboard, onGoToProfile }) {
    const [cartItems, setCartItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [activeNav, setActiveNav] = useState("My Cart");
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("User");
    const [totalItems, setTotalItems] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

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

    const fetchCart = async () => {
        try {
            const userId = user?.uid;
            if (!userId) {
                setCartItems([]);
                setTotalItems(0);
                setGrandTotal(0);
                setLoading(false);
                return;
            }

            const items = await getCart(userId);
            setCartItems(items);
            setLoading(false);

            const totalQty = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
            const totalPrice = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0);
            setTotalItems(totalQty);
            setGrandTotal(totalPrice);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setCartItems([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            setUserName(user.displayName || "User");
            fetchCart();
        } else {
            setLoading(false);
            setCartItems([]);
        }
    }, [user]);

    const removeItem = async (id) => {
        try {
            const userId = user?.uid;
            if (!userId) return;
            await removeCartItem(userId, id);
            await fetchCart();
        } catch (err) {
            console.error("Error removing item:", err);
        }
    };

    const clearCartItems = async () => {
        try {
            const userId = user?.uid;
            if (!userId) return;
            if (!window.confirm("Are you sure you want to clear your cart?")) return;
            await clearCart(userId);
            setCartItems([]);
            setTotalItems(0);
            setGrandTotal(0);
        } catch (err) {
            console.error("Error clearing cart:", err);
        }
    };

    const saveEdit = async (id, qty) => {
        try {
            const userId = user?.uid;
            if (!userId) return;
            await updateCartItemQuantity(userId, id, qty);
            setEditingItem(null);
            await fetchCart();
        } catch (err) {
            console.error("Error updating item:", err);
        }
    };

    const handleNavClick = (label) => {
        setActiveNav(label);
        if (label === "Home" && onGoToDashboard) {
            onGoToDashboard();
        } else if (label === "Categories" && onGoToCatalogue) {
            onGoToCatalogue();
        } else if (label === "Order" && onGoToOrders) {
            onGoToOrders();
        } else if (label === "Profile") {
            if (onGoToProfile) onGoToProfile();
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
                    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><CartIconHeader size={isMobile ? 18 : 20} /></span>
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
                            {totalItems}
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
                                if (activeNav !== item.label) {
                                    e.currentTarget.style.background = "#e8f3eb";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeNav !== item.label) {
                                    e.currentTarget.style.background = "transparent";
                                }
                            }}
                        >
                            <div style={{ width: isMobile ? 16 : 18, height: isMobile ? 16 : 18 }}>
                                <NavIcon type={item.iconType} />
                            </div>
                            <span>{item.label}</span>
                            {item.badge && (
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
                                    {totalItems}
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
                    <div style={{ 
                        display: "flex", 
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "stretch" : "center", 
                        justifyContent: "space-between", 
                        gap: isMobile ? 12 : 0,
                        marginBottom: isMobile ? 16 : 24 
                    }}>
                        <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, color: "#1a2e1a" }}>
                            Your Shopping Cart
                        </h1>
                        <button
                            onClick={clearCartItems}
                            disabled={cartItems.length === 0}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                padding: isMobile ? "8px 16px" : "9px 18px",
                                borderRadius: 8,
                                border: "1.5px solid #e63946",
                                background: "#fff",
                                color: "#e63946",
                                fontSize: isMobile ? 13 : 14,
                                fontWeight: 600,
                                cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
                                opacity: cartItems.length === 0 ? 0.5 : 1,
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={e => {
                                if (cartItems.length > 0) e.currentTarget.style.background = "#fff0f0";
                            }}
                            onMouseLeave={e => {
                                if (cartItems.length > 0) e.currentTarget.style.background = "#fff";
                            }}
                        >
                            🗑 Clear Cart
                        </button>
                    </div>

                    <div style={{ 
                        background: "#fff", 
                        borderRadius: 14, 
                        padding: isMobile ? "0 16px 16px" : "0 28px 24px", 
                        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                        overflow: "hidden"
                    }}>
                        <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr 1fr", 
                            padding: isMobile ? "12px 0 8px" : "18px 0 12px", 
                            borderBottom: "1.5px solid #e8f0ea", 
                            color: "#5c7a5c", 
                            fontSize: isMobile ? 12 : 14, 
                            fontWeight: 600 
                        }}>
                            {isMobile ? (
                                <span>Product</span>
                            ) : (
                                <>
                                    <span>Product</span>
                                    <span style={{ textAlign: "right" }}>Price</span>
                                    <span style={{ textAlign: "center" }}>Quantity</span>
                                    <span style={{ textAlign: "right" }}>Total</span>
                                    <span style={{ textAlign: "right" }}>Action</span>
                                </>
                            )}
                        </div>

                        {loading ? (
                            <div style={{ textAlign: "center", padding: "48px 0", color: "#8fba9f" }}>Loading cart...</div>
                        ) : cartItems.length === 0 ? (
                            <div style={{ textAlign: "center", padding: isMobile ? "30px 0" : "48px 0", color: "#8fba9f", fontSize: isMobile ? 14 : 15 }}>
                                🛒 Your cart is empty.
                                <br />
                                <button
                                    onClick={() => onGoToCatalogue && onGoToCatalogue()}
                                    style={{
                                        marginTop: 12,
                                        padding: "8px 20px",
                                        background: "#2d6a4f",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        fontSize: isMobile ? 13 : 14,
                                        fontWeight: 600
                                    }}
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            cartItems.map(item => (
                                <div key={item.id} style={{ 
                                    display: "grid", 
                                    gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr 1fr", 
                                    alignItems: "center", 
                                    padding: isMobile ? "14px 0" : "18px 0", 
                                    borderBottom: "1px solid #f0f5f1",
                                    gap: isMobile ? 8 : 0
                                }}>
                                    {isMobile ? (
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <img
                                                    src={getImageUrl(item.image)}
                                                    alt={item.name}
                                                    style={{
                                                        width: 50,
                                                        height: 50,
                                                        borderRadius: 8,
                                                        objectFit: "cover",
                                                        background: "#f5f5f5",
                                                        border: "1px solid #e8f0ea"
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = "/images/default.png";
                                                    }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1a2e1a" }}>{item.name}</div>
                                                    <div style={{ fontSize: 12, color: "#5c7a5c" }}>
                                                        RM {item.price.toFixed(2)} × {item.quantity}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingLeft: 62 }}>
                                                <span style={{ fontWeight: 600, color: "#2d6a4f" }}>
                                                    RM {(item.price * item.quantity).toFixed(2)}
                                                </span>
                                                <div style={{ display: "flex", gap: 12 }}>
                                                    <button onClick={() => setEditingItem(item)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4 }}>✏️</button>
                                                    <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4, color: "#e63946" }}>🗑</button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                                <img
                                                    src={getImageUrl(item.image)}
                                                    alt={item.name}
                                                    style={{
                                                        width: 52,
                                                        height: 52,
                                                        borderRadius: 8,
                                                        objectFit: "cover",
                                                        background: "#f5f5f5",
                                                        border: "1px solid #e8f0ea"
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = "/images/default.png";
                                                    }}
                                                />
                                                <span style={{ fontSize: 14, color: "#1a2e1a", fontWeight: 500 }}>{item.name}</span>
                                            </div>
                                            <span style={{ textAlign: "right", fontSize: 14, color: "#3d5a40" }}>RM {item.price.toFixed(2)}</span>
                                            <span style={{ textAlign: "center", fontSize: 14, color: "#1a2e1a", fontWeight: 600 }}>{item.quantity}</span>
                                            <span style={{ textAlign: "right", fontSize: 14, color: "#3d5a40", fontWeight: 500 }}>RM {(item.price * item.quantity).toFixed(2)}</span>
                                            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                                                <button onClick={() => setEditingItem(item)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 4 }}>✏️</button>
                                                <span style={{ color: "#ccc" }}>|</span>
                                                <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 4 }}>🗑</button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}

                        {cartItems.length > 0 && (
                            <div style={{ 
                                display: "flex", 
                                flexDirection: isMobile ? "column" : "row",
                                justifyContent: "space-between", 
                                alignItems: isMobile ? "flex-start" : "center", 
                                paddingTop: 20, 
                                marginTop: 4,
                                gap: isMobile ? 8 : 0
                            }}>
                                <span style={{ fontSize: isMobile ? 13 : 14, color: "#5c7a5c", fontWeight: 500 }}>
                                    Total Items: {cartItems.length}
                                </span>
                                <span style={{ fontSize: isMobile ? 18 : 16, color: "#1a2e1a", fontWeight: 700 }}>
                                    Grand Total: RM{grandTotal.toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ 
                        display: "flex", 
                        flexDirection: isMobile ? "column" : "row",
                        gap: 12, 
                        marginTop: isMobile ? 16 : 28 
                    }}>
                        <button
                            onClick={() => onGoToCatalogue && onGoToCatalogue()}
                            style={{
                                padding: isMobile ? "12px 20px" : "13px 32px",
                                borderRadius: 8,
                                border: "1.5px solid #2d6a4f",
                                background: "#fff",
                                color: "#2d6a4f",
                                fontSize: isMobile ? 14 : 15,
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: isMobile ? "100%" : "auto",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f0f7f1"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                        >
                            Continue Shopping
                        </button>
                        <button
                            onClick={() => onCheckout && onCheckout()}
                            disabled={cartItems.length === 0}
                            style={{
                                padding: isMobile ? "12px 20px" : "13px 40px",
                                borderRadius: 8,
                                border: "none",
                                background: cartItems.length === 0 ? "#9bbfaa" : "#2d6a4f",
                                color: "#fff",
                                fontSize: isMobile ? 14 : 15,
                                fontWeight: 600,
                                cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                                width: isMobile ? "100%" : "auto",
                                textAlign: "center"
                            }}
                            disabled={cartItems.length === 0}
                            onMouseEnter={e => {
                                if (cartItems.length > 0) e.currentTarget.style.background = "#1f4a37";
                            }}
                            onMouseLeave={e => {
                                if (cartItems.length > 0) e.currentTarget.style.background = "#2d6a4f";
                            }}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </main>
            </div>

            {editingItem && <EditModal item={editingItem} onSave={saveEdit} onClose={() => setEditingItem(null)} />}
        </div>
    );
}