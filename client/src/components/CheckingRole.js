import { useEffect } from "react";
import { NavIcon } from "./Icons";

export default function CheckingRole({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone && onDone(), 5000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, border: "3px solid #2d6a4f", padding: "60px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, minWidth: 320 }}>
        {/* Cart icon circle */}
        <div style={{ width: 140, height: 140, borderRadius: "50%", background: "#f0f7f1", border: "6px solid #2d6a4f", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <NavIcon type="cart" size={56} color="#2d6a4f" />
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#1a2e1a" }}>Checking your account role...</p>
          <p style={{ margin: 0, fontSize: 13, color: "#5c7a5c" }}>Please wait a moment</p>
        </div>

        {/* Dots animation */}
        <div style={{ display: "flex", gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 10, height: 10, borderRadius: "50%", background: "#2d6a4f",
                animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
