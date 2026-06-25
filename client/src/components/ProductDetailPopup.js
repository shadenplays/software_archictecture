import { useState } from "react";
import { getImageUrl } from "../utils/imageHelper";  // ✅ ADD THIS IMPORT

export default function ProductDetailPopup({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  // Safety check - if no product, don't render
  if (!product) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "32px",
          width: "90%",
          maxWidth: 440,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          maxHeight: "90vh",
          overflowY: "auto",
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#666",
              padding: "4px 8px",
              borderRadius: "8px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            ← Back
          </button>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
              padding: "4px 8px",
              borderRadius: "8px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            ✕
          </button>
        </div>

        {/* Product Image - ✅ FIXED with getImageUrl */}
        <div
          style={{
            background: "#f8faf8",
            borderRadius: 12,
            height: 200,
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "12px",
            border: "1px solid #e8f0ea",
          }}
        >
          <img
            src={getImageUrl(product.image)}  // ✅ FIXED: Using getImageUrl helper
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
            onError={(e) => {
              e.target.src = "/images/default.png";  // ✅ FALLBACK to default image
            }}
          />
        </div>

        {/* Product Name */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#1a2e1a",
            margin: "0 0 6px 0",
            letterSpacing: "-0.3px",
            fontFamily: "'Inter','Segoe UI',sans-serif",
          }}
        >
          {product.name}
        </h2>

        {/* Price */}
        <p
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#2d6a4f",
            margin: "0 0 12px 0",
            fontFamily: "'Inter','Segoe UI',sans-serif",
          }}
        >
          RM {product.price?.toFixed(2) || "0.00"}
        </p>

        {/* Stock Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#5c7a5c",
              fontFamily: "'Inter','Segoe UI',sans-serif",
            }}
          >
            Stock:
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: product.stock > 0 ? "#2d6a4f" : "#e63946",
              fontFamily: "'Inter','Segoe UI',sans-serif",
            }}
          >
            {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
          </span>
          {product.stock > 0 && product.stock <= 5 && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#f4a429",
                background: "#fff7e6",
                padding: "2px 10px",
                borderRadius: "12px",
                fontFamily: "'Inter','Segoe UI',sans-serif",
              }}
            >
              Low Stock
            </span>
          )}
        </div>

        {/* Category */}
        <p
          style={{
            fontSize: "13px",
            color: "#5c7a5c",
            margin: "0 0 16px 0",
            fontFamily: "'Inter','Segoe UI',sans-serif",
          }}
        >
          Category: <span style={{ fontWeight: 600, color: "#1a2e1a" }}>{product.category || "Uncategorized"}</span>
        </p>

        {/* Description */}
        {product.description && (
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#1a2e1a",
                margin: "0 0 6px 0",
                fontFamily: "'Inter','Segoe UI',sans-serif",
              }}
            >
              Description:
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#5c7a5c",
                margin: 0,
                lineHeight: "1.6",
                fontFamily: "'Inter','Segoe UI',sans-serif",
              }}
            >
              {product.description}
            </p>
          </div>
        )}

        {/* Quantity Control */}
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#1a2e1a",
              margin: "0 0 10px 0",
              fontFamily: "'Inter','Segoe UI',sans-serif",
            }}
          >
            Quantity:
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={product.stock === 0}
              style={{
                width: "36px",
                height: "36px",
                border: "2px solid #2d6a4f",
                background: "#fff",
                borderRadius: "8px",
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
                fontSize: "18px",
                fontWeight: 700,
                color: "#2d6a4f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                opacity: product.stock === 0 ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (product.stock > 0) {
                  e.currentTarget.style.background = "#2d6a4f";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (product.stock > 0) {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#2d6a4f";
                }
              }}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              min="1"
              max={product.stock || 1}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQuantity(Math.max(1, Math.min(val, product.stock || 1)));
              }}
              style={{
                width: "60px",
                padding: "8px",
                border: "2px solid #e8f0ea",
                borderRadius: "8px",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a2e1a",
                outline: "none",
                fontFamily: "'Inter','Segoe UI',sans-serif",
              }}
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
              disabled={product.stock === 0 || quantity >= product.stock}
              style={{
                width: "36px",
                height: "36px",
                border: "2px solid #2d6a4f",
                background: "#fff",
                borderRadius: "8px",
                cursor: (product.stock === 0 || quantity >= product.stock) ? "not-allowed" : "pointer",
                fontSize: "18px",
                fontWeight: 700,
                color: "#2d6a4f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                opacity: (product.stock === 0 || quantity >= product.stock) ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (product.stock > 0 && quantity < product.stock) {
                  e.currentTarget.style.background = "#2d6a4f";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (product.stock > 0 && quantity < product.stock) {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#2d6a4f";
                }
              }}
            >
              +
            </button>
            <span
              style={{
                fontSize: "12px",
                color: "#8a9b8a",
                marginLeft: "4px",
                fontFamily: "'Inter','Segoe UI',sans-serif",
              }}
            >
              Max: {product.stock || 0}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          style={{
            width: "100%",
            padding: "14px",
            background: product.stock === 0 ? "#ccc" : "#2d6a4f",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: product.stock === 0 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            fontFamily: "'Inter','Segoe UI',sans-serif",
            letterSpacing: "0.3px",
          }}
          onMouseEnter={(e) => {
            if (product.stock > 0) {
              e.currentTarget.style.background = "#1f4a37";
            }
          }}
          onMouseLeave={(e) => {
            if (product.stock > 0) {
              e.currentTarget.style.background = "#2d6a4f";
            }
          }}
        >
          {product.stock === 0 ? "Out of Stock" : `Add to Cart (${quantity})`}
        </button>
      </div>
    </div>
  );
}