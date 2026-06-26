import { useState, useEffect } from "react";
import axios from "axios";
import { subscribeToOrders, updateOrderStatus } from "../services/firestore";
import {
  SearchIcon,
  CloseIcon,
  WarningIcon,
  IconLabel,
} from "../components/Icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function statusStyle(status) {
  const s = (status || "").toLowerCase();

  if (s === "paid") return { bg: "#e8f5eb", color: "#2d6a4f" };
  if (s === "pending") return { bg: "#fff7e6", color: "#f4a429" };
  if (s === "cancelled") return { bg: "#fff0f0", color: "#e63946" };

  return { bg: "#f0f0f0", color: "#555" };
}

function formatDate(timestamp) {
  if (!timestamp) return "-";

  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);

  return date.toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ========== LOAD ORDERS FROM FIREBASE ==========
  useEffect(() => {
    setLoading(true);
    
    const unsub = subscribeToOrders((data) => {
      const mappedOrders = data.map(order => ({
        ...order,
        orderId: order.orderId || order.id || "N/A",
        // ✅ FIXED: Check customerName first, then userName, then name, then fallback to Guest
        customerName: order.customerName || order.userName || order.name || "Guest",
        userId: order.userId || order.userID || "guest",
        total: order.total || 0,
        status: order.status || "Pending",
        createdAt: order.createdAt || order.addedAt || new Date(),
        items: order.items || [],
        paymentMethod: order.paymentMethod || "N/A",
        userName: order.userName,
        userID: order.userID,
        addedAt: order.addedAt
      }));
      
      setOrders(mappedOrders);
      setLoading(false);
      setBackendError(false);
    });

    const checkBackend = async () => {
      try {
        await axios.get(`${API_URL}/api/admin/orders`);
        setBackendError(false);
      } catch (err) {
        console.log("Backend not available, using Firebase only");
        setBackendError(true);
      }
    };
    
    checkBackend();

    return () => unsub();
  }, []);

  // ========== FILTER ORDERS ==========
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
      (order.orderId && order.orderId.toLowerCase().includes(searchLower)) ||
      (order.userId && order.userId.toLowerCase().includes(searchLower)) ||
      (order.userName && order.userName.toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === "All" || 
                          (order.status && order.status.toLowerCase() === statusFilter.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
        Loading orders...
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 10 }}>Manage Orders</h2>
      <p style={{ marginBottom: 20, color: "#5c7a5c" }}>
        {orders.length} total orders
      </p>

      {/* ========== SEARCH & FILTER BAR ========== */}
      <div style={filterBar}>
        <div style={searchWrapper}>
          <span style={searchIcon}><SearchIcon size={14} color="#999" /></span>
          <input
            type="text"
            placeholder="Search by customer or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInput}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              style={clearBtn}
            >
              <CloseIcon size={14} color="#999" />
            </button>
          )}
        </div>

        <div style={filterWrapper}>
          <label style={filterLabel}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={filterSelect}
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <span style={resultsCount}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
        </span>

        {backendError && (
          <IconLabel icon={<WarningIcon size={14} color="#f59e0b" />} style={backendStatus}>
            Backend offline
          </IconLabel>
        )}
      </div>

      {/* ========== TABLE ========== */}
      <div style={{
        background: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 1fr",
          padding: "16px 24px",
          borderBottom: "1px solid #eee",
          fontSize: 13,
          fontWeight: 600,
          color: "#5c7a5c",
          backgroundColor: "#f8faf8"
        }}>
          <span>Order ID</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Total</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>

        {filteredOrders.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#8fba9f" }}>
            {searchTerm || statusFilter !== "All" 
              ? "No orders match your search criteria." 
              : "No orders yet."}
          </div>
        )}

        {filteredOrders.map((order) => {
          const st = statusStyle(order.status);

          return (
            <div
              key={order.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 1fr",
                padding: "14px 24px",
                alignItems: "center",
                borderBottom: "1px solid #f0f0f0",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f8faf8"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
            >
              <span style={{ fontWeight: 600 }}>{order.orderId}</span>
              <span style={{ fontWeight: 500, color: "#1a2e1a" }}>
                {order.customerName}
              </span>
              <span style={{ fontSize: 13, color: "#666" }}>
                {formatDate(order.createdAt)}
              </span>
              <span style={{ fontWeight: 600 }}>
                RM{Number(order.total).toFixed(2)}
              </span>

              {/* Status Badge */}
              <span style={{
                padding: "5px 14px",
                borderRadius: 12,
                background: st.bg,
                color: st.color,
                fontWeight: 600,
                fontSize: 13,
                display: "inline-block",
                width: "fit-content"
              }}>
                {order.status || "Pending"}
              </span>

              {/* ACTION - View Button */}
              <div style={{ textAlign: "right" }}>
                <button
                  onClick={() => setViewingOrder(order)}
                  style={{
                    padding: "5px 16px",
                    border: "1px solid #2d6a4f",
                    borderRadius: 6,
                    background: "transparent",
                    color: "#2d6a4f",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#2d6a4f";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#2d6a4f";
                  }}
                >
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========== CAPTION / LEGEND ========== */}
      <div style={{
        marginTop: 16,
        padding: "12px 20px",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        {/* Status Legend */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap"
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#5c7a5c" }}>
            Status Legend:
          </span>
          
          {/* Paid */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: "#e8f5eb",
              border: "1px solid #2d6a4f"
            }} />
            <span style={{ fontSize: 12, color: "#2d6a4f", fontWeight: 500 }}>
              Paid
            </span>
          </div>
          
          {/* Pending */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: "#fff7e6",
              border: "1px solid #f4a429"
            }} />
            <span style={{ fontSize: 12, color: "#f4a429", fontWeight: 500 }}>
              Pending
            </span>
          </div>
          
          {/* Cancelled */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: "#fff0f0",
              border: "1px solid #e63946"
            }} />
            <span style={{ fontSize: 12, color: "#e63946", fontWeight: 500 }}>
              Cancelled
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap"
        }}>
          <span style={{ fontSize: 12, color: "#888" }}>
            Total Orders: <strong style={{ color: "#1a2e1a" }}>{orders.length}</strong>
          </span>
          <span style={{ fontSize: 12, color: "#888" }}>
            Paid: <strong style={{ color: "#2d6a4f" }}>
              {orders.filter(o => (o.status || "").toLowerCase() === "paid").length}
            </strong>
          </span>
          <span style={{ fontSize: 12, color: "#888" }}>
            Pending: <strong style={{ color: "#f4a429" }}>
              {orders.filter(o => (o.status || "").toLowerCase() === "pending").length}
            </strong>
          </span>
          <span style={{ fontSize: 12, color: "#888" }}>
            Cancelled: <strong style={{ color: "#e63946" }}>
              {orders.filter(o => (o.status || "").toLowerCase() === "cancelled").length}
            </strong>
          </span>
        </div>
      </div>

      {/* ========== DETAILED VIEW ORDER MODAL ========== */}
      {viewingOrder && (
        <div
          onClick={() => setViewingOrder(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 16,
              width: 500,
              maxWidth: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 12px 48px rgba(0,0,0,0.2)"
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              borderBottom: "2px solid #e8f0ea",
              paddingBottom: 16
            }}>
              <h3 style={{ margin: 0, fontSize: 20, color: "#1a2e1a" }}>
                Order Details
              </h3>
              <span style={{
                ...statusStyle(viewingOrder.status),
                padding: "4px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600
              }}>
                {viewingOrder.status || "Pending"}
              </span>
            </div>

            {/* Order Info Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px 20px",
              marginBottom: 20,
              background: "#f8faf8",
              padding: 16,
              borderRadius: 10
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#8a9b8a" }}>Order ID</p>
                <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 600, color: "#1a2e1a" }}>
                  {viewingOrder.orderId}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#8a9b8a" }}>Customer</p>
                <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 600, color: "#1a2e1a" }}>
                  {viewingOrder.customerName}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#8a9b8a" }}>User ID</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#5c7a5c", wordBreak: "break-all" }}>
                  {viewingOrder.userId}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#8a9b8a" }}>Payment Method</p>
                <p style={{ margin: "2px 0 0", fontSize: 14, color: "#1a2e1a" }}>
                  {viewingOrder.paymentMethod}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#8a9b8a" }}>Order Date</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#5c7a5c" }}>
                  {formatDate(viewingOrder.createdAt)}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#8a9b8a" }}>Total Amount</p>
                <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: "#2d6a4f" }}>
                  RM{Number(viewingOrder.total).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Order Items */}
            {viewingOrder.items && viewingOrder.items.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 15, color: "#1a2e1a" }}>
                  Order Items ({viewingOrder.items.length})
                </h4>
                <div style={{
                  border: "1px solid #e8f0ea",
                  borderRadius: 10,
                  overflow: "hidden"
                }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    padding: "10px 14px",
                    background: "#f8faf8",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#5c7a5c",
                    borderBottom: "1px solid #e8f0ea"
                  }}>
                    <span>Product</span>
                    <span>Price</span>
                    <span>Qty</span>
                    <span style={{ textAlign: "right" }}>Subtotal</span>
                  </div>
                  
                  {viewingOrder.items.map((item, index) => (
                    <div 
                      key={index} 
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr",
                        padding: "10px 14px",
                        borderBottom: index < viewingOrder.items.length - 1 ? "1px solid #f0f0f0" : "none",
                        fontSize: 13
                      }}
                    >
                      <span style={{ fontWeight: 500, color: "#1a2e1a" }}>
                        {item.name || item.productName || `Item ${index + 1}`}
                        <div style={{ fontSize: 11, color: "#8a9b8a", fontWeight: 400 }}>
                          ID: {item.id || item.productId || "N/A"}
                        </div>
                      </span>
                      <span style={{ color: "#5c7a5c" }}>
                        RM{Number(item.price || 0).toFixed(2)}
                      </span>
                      <span style={{ color: "#5c7a5c" }}>
                        ×{item.quantity || 1}
                      </span>
                      <span style={{ textAlign: "right", fontWeight: 600, color: "#1a2e1a" }}>
                        RM{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Summary */}
            <div style={{
              borderTop: "2px solid #e8f0ea",
              paddingTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20
            }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#1a2e1a" }}>
                Grand Total
              </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#2d6a4f" }}>
                RM{Number(viewingOrder.total || 0).toFixed(2)}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setViewingOrder(null)}
              style={{
                width: "100%",
                padding: "12px 0",
                background: "#2d6a4f",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#1e3d2f"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#2d6a4f"}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= STYLES =================

const filterBar = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "20px",
  background: "#fff",
  padding: "12px 20px",
  borderRadius: "12px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  flexWrap: "wrap"
};

const searchWrapper = {
  flex: 1,
  minWidth: "200px",
  display: "flex",
  alignItems: "center",
  position: "relative",
  background: "#f5f5f5",
  borderRadius: "8px",
  padding: "0 12px"
};

const searchIcon = {
  fontSize: "14px",
  color: "#999",
  marginRight: "8px"
};

const searchInput = {
  flex: 1,
  padding: "8px 12px",
  border: "none",
  background: "transparent",
  fontSize: "14px",
  outline: "none",
  color: "#333"
};

const clearBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  color: "#999",
  padding: "4px 8px"
};

const filterWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const filterLabel = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#555"
};

const filterSelect = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #d4e6d8",
  background: "#fff",
  fontSize: "13px",
  color: "#1a2e1a",
  outline: "none",
  cursor: "pointer"
};

const resultsCount = {
  fontSize: "13px",
  color: "#888",
  marginLeft: "auto"
};

const backendStatus = {
  fontSize: "12px",
  color: "#dc2626",
  background: "#fee2e2",
  padding: "4px 12px",
  borderRadius: "12px"
};