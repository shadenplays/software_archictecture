import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { getCart, createOrder } from "../services/firestore";
import { CartIconHeader, BellIcon, UserIcon } from "./Icons";

const paymentMethods = ["Credit / Debit Card", "Touch 'n Go eWallet", "Online Banking"];

export default function PaymentPage({ onBack, onPaySuccess }) {
  const [method, setMethod] = useState("Credit / Debit Card");
  const [form, setForm] = useState({ name: "", card: "", expiry: "", cvv: "" });
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    fetchCart();
  }, []);
  const fetchCart = async () => {
    try {
      const userId = user?.uid;
      if (!userId) {
        setCartItems([]);
        return;
      }
      const items = await getCart(userId);
      setCartItems(items);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCartItems([]);
    }
    setLoading(false);
  };

  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePay = async () => {
    setPaying(true);
    try {
      const userId = user?.uid;
      if (!userId) {
        throw new Error("Please log in to complete checkout.");
      }
      if (cartItems.length === 0) {
        throw new Error("Your cart is empty.");
      }

      const orderId = await createOrder({
        uid: userId,
        customerName: user?.displayName || form.name || "Customer",
        items: cartItems,
        total,
        paymentMethod: method,
      });

      setCartItems([]);
      onPaySuccess && onPaySuccess({ orderId, total, method });
    } catch (err) {
      console.error("Payment error:", err);
      alert(err.message || "Payment failed");
    }
    setPaying(false);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1.5px solid #d4e6d8", background: "#fff", fontSize: 14,
    color: "#1a2e1a", outline: "none", boxSizing: "border-box",
  };

  return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
        <header style={{ background: "#1e3d2f", padding: "0 28px", height: 68, display: "flex", alignItems: "center", gap: 20 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>Your Local Shop</div>
            <div style={{ color: "#8fba9f", fontSize: 12 }}>Online Convenience Store</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><CartIconHeader size={20} /></span>
            <span style={{ color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><BellIcon size={20} /></span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 20, padding: "5px 14px 5px 8px" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#c3e6cb", display: "flex", alignItems: "center", justifyContent: "center" }}><UserIcon size={16} /></div>
              <span style={{ fontSize: 14, color: "#1a2e1a", fontWeight: 500 }}>{user?.displayName || "User"}</span>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: 820, margin: "36px auto", background: "#fff", borderRadius: 16, overflow: "hidden", display: "flex", minHeight: 500 }}>
          <div style={{ width: 320, borderRight: "1px solid #e8f0ea", padding: "32px 28px", flexShrink: 0 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#1a2e1a", marginBottom: 20, padding: 0 }}>←</button>
            <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700, color: "#1a2e1a" }}>Order Summary</h2>

            {loading ? (
                <p style={{ color: "#8fba9f", fontSize: 14 }}>Loading...</p>
            ) : (
                cartItems.map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 14, color: "#3d5a40" }}>
                      <span>{item.name} x{item.quantity}</span>
                      <span>RM{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))
            )}

            <div style={{ borderTop: "2px dashed #c8e6c9", margin: "20px 0", paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1a2e1a" }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1a2e1a" }}>RM{total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ flex: 1, padding: "32px 28px" }}>
            <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700, color: "#1a2e1a" }}>Payment Method</h2>

            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              {paymentMethods.map(m => (
                  <div key={m} onClick={() => setMethod(m)}
                       style={{ flex: 1, border: method === m ? "2px solid #2d6a4f" : "1.5px solid #d4e6d8", borderRadius: 10, padding: "14px 10px 10px", cursor: "pointer", background: method === m ? "#f0f7f1" : "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
                  >
                    <div style={{ width: "100%", height: 40, background: "#e8f5eb", borderRadius: 6 }} />
                    <span style={{ fontSize: 12, color: "#1a2e1a", fontWeight: method === m ? 600 : 400, textAlign: "center" }}>{m}</span>
                  </div>
              ))}
            </div>

            {method === "Credit / Debit Card" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#3d5a40", display: "block", marginBottom: 6 }}>Cardholder Name</label>
                    <input name="name" value={form.name} onChange={handle} placeholder="Full name on card" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: "#3d5a40", display: "block", marginBottom: 6 }}>Card Number</label>
                    <input name="card" value={form.card} onChange={handle} placeholder="1234 **** **** 1234" style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: "#3d5a40", display: "block", marginBottom: 6 }}>Expiry (MM/YY)</label>
                      <input name="expiry" value={form.expiry} onChange={handle} placeholder="12/27" style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: "#3d5a40", display: "block", marginBottom: 6 }}>CVV</label>
                      <input name="cvv" value={form.cvv} onChange={handle} placeholder="123" style={inputStyle} />
                    </div>
                  </div>
                </div>
            )}

            {method !== "Credit / Debit Card" && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#8fba9f", fontSize: 14 }}>
                  You will be redirected to {method} to complete payment.
                </div>
            )}

            <button onClick={handlePay} disabled={paying}
                    style={{ width: "100%", marginTop: 28, padding: "13px 0", borderRadius: 8, border: "none", background: paying ? "#9bbfaa" : "#2d6a4f", color: "#fff", fontSize: 15, fontWeight: 600, cursor: paying ? "not-allowed" : "pointer" }}
            >
              {paying ? "Processing..." : "Pay Securely"}
            </button>
          </div>
        </div>
      </div>
  );
}