import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { UploadCloudIcon, WarningIcon, IconLabel } from "../components/Icons";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const CATEGORIES = ["Beverages", "Snacks", "Household", "Personal Care"];

export default function AddEditProduct({ product, onDone, onCancel, saving }) {
  const isEditMode = Boolean(product && product.id);
  const [form, setForm] = useState({
    name: "",
    category: CATEGORIES[0],
    price: "",
    stock: "",
    image: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  // ========== SET FORM DATA WHEN EDITING ==========
  useEffect(() => {
    if (product && product.id) {
      const imageValue = product.image || "";
      setForm({
        name: product.name || "",
        category: product.category || CATEGORIES[0],
        price: product.price ?? "",
        stock: product.stock ?? "",
        image: typeof imageValue === "string" ? imageValue : "",
        description: product.description || "",
      });
      
      if (product.image && typeof product.image === "string") {
        setImagePreview(product.image);
      } else {
        setImagePreview("");
      }
    } else {
      setForm({
        name: "",
        category: CATEGORIES[0],
        price: "",
        stock: "",
        image: "",
        description: "",
      });
      setImagePreview("");
    }
  }, [product]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ========== IMAGE UPLOAD ==========
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, GIF, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(`${API_URL}/api/admin/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const imageUrl = response.data.data.imageUrl;
        setForm({ ...form, image: imageUrl });
        setImagePreview(imageUrl);
        setError("");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ========== VALIDATE & SEND TO PARENT ==========
  const handleSave = async () => {
    setError("");

    const errors = [];
    if (!form.name || form.name.trim() === "") {
      errors.push("Product Name is required");
    }
    if (!form.price || form.price === "" || Number(form.price) < 0) {
      errors.push("Price is required and must be greater than 0");
    }
    if (!form.stock || form.stock === "" || Number(form.stock) < 0) {
      errors.push("Stock is required and must be greater than 0");
    }
    if (!form.image || form.image.trim() === "") {
      errors.push("Please upload an image");
    }

    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    // ✅ Pass validated form values to Parent (`ManageProducts.js`) to run the network request once
    onDone(form, product?.id);
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 6,
    border: "1.5px solid #d4e6d8",
    background: "#fff",
    fontSize: 13,
    color: "#1a2e1a",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 500,
    color: "#3d5a40",
    display: "block",
    marginBottom: 4,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "24px 28px",
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 700, color: "#1a2e1a" }}>
          {isEditMode ? "Edit Inventory" : "Add Inventory"}
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#5c7a5c" }}>
          {isEditMode ? "Update the product details" : "Fill in the details to add a new product"}
        </p>

        {error && (
          <div
            style={{
              background: "#fff0f0",
              border: "1px solid #f4b8b8",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              color: "#c0392b",
              marginBottom: 12,
            }}
          >
            <IconLabel icon={<WarningIcon size={14} color="#c0392b" />}>{error}</IconLabel>
          </div>
        )}

        {/* ========== IMAGE UPLOAD BOX ========== */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              border: imagePreview ? "2px solid #2d6a4f" : "2px dashed #d4e6d8",
              borderRadius: 8,
              padding: imagePreview ? "8px" : "14px 16px",
              textAlign: "center",
              background: "#fafffc",
              transition: "all 0.3s",
              cursor: "pointer",
            }}
            onClick={triggerFileUpload}
          >
            {imagePreview ? (
              <div style={{ position: "relative" }}>
                <img
                  src={
                    imagePreview && typeof imagePreview === "string"
                      ? imagePreview.startsWith("/uploads")
                        ? `${API_URL}${imagePreview}`
                        : imagePreview
                      : "/images/default.png"
                  }
                  alt="Product"
                  style={{
                    width: "100%",
                    maxHeight: 150,
                    objectFit: "contain",
                    borderRadius: 4,
                  }}
                  onError={(e) => {
                    e.target.src = "/images/default.png";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 10,
                  }}
                >
                  Click to change
                </div>
              </div>
            ) : (
              <>
                <UploadCloudIcon size={28} />
                <div
                  style={{
                    display: "inline-block",
                    padding: "5px 18px",
                    background: uploading ? "#9bbfaa" : "#2d6a4f",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: uploading ? "not-allowed" : "pointer",
                  }}
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                </div>
                <div style={{ color: "#8a9b8a", fontSize: 10, marginTop: 4 }}>
                  JPG, PNG (Recommended 500x500)
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* ========== FORM FIELDS ========== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={labelStyle}>
              Product Name <span style={{ color: "#e63946" }}>*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="Coca Cola 1.5L"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handle}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Current Stock <span style={{ color: "#e63946" }}>*</span>
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handle}
                placeholder="0"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>
                Price (RM) <span style={{ color: "#e63946" }}>*</span>
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handle}
                placeholder="0.00"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              placeholder="This is Coca Cola 1.5L."
              rows={2}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "inherit",
                minHeight: 50,
              }}
            />
          </div>
        </div>

        {/* ========== BUTTONS ========== */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 6,
              border: "1.5px solid #d4e6d8",
              background: "#fff",
              color: "#5c7a5c",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 6,
              border: "none",
              background: saving || uploading ? "#9bbfaa" : "#2d6a4f",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: saving || uploading ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : uploading ? "Uploading..." : isEditMode ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
