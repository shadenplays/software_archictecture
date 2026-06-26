export default function PaymentSuccess({ onContinue, onViewInvoice, orderInfo }) {
  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, border: "3px solid #2d6a4f", padding: "48px 40px", width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

        {/* Check icon */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0f7f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
          ✅
        </div>

        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#2d6a4f" }}>Payment Successful!</h2>
          <p style={{ margin: 0, fontSize: 14, color: "#5c7a5c" }}>Thank you for your purchase.</p>
        </div>

        {/* Order details */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, padding: "16px 0", borderTop: "1px solid #e8f0ea", borderBottom: "1px solid #e8f0ea" }}>
          {[
            { label: "Order ID", value: orderInfo?.orderId ? `#${orderInfo.orderId}` : "-" },
            { label: "Payment Method", value: orderInfo?.method || "-" },
            { label: "Total Payment", value: orderInfo?.total != null ? `RM${orderInfo.total.toFixed(2)}` : "-" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "#5c7a5c" }}>{row.label}</span>
              <span style={{ color: "#1a2e1a", fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onViewInvoice}
          style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: "#2d6a4f", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          View Invoice
        </button>

        <button
          onClick={onContinue}
          style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "1.5px solid #2d6a4f", background: "#fff", color: "#2d6a4f", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
