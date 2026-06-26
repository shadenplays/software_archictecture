import { useState, useEffect } from "react";
import { getImageUrl } from "../utils/imageHelper";
import { 
  subscribeToProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} from "../services/firestore";
import AddEditProduct from "./AddEditProduct";
import {
  SearchIcon,
  CloseIcon,
  EditIcon,
  TrashIcon,
  SpinnerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  IconLabel,
} from "../components/Icons";

const CATEGORIES = ["All", "Beverages", "Snacks", "Household", "Personal Care"];

// ================= MAIN COMPONENT =================
export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // ========== SEARCH & FILTER STATES ==========
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ========== SUBSCRIBE TO FIREBASE REALTIME ==========
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToProducts((data) => {
      // ✅ Sort products by productId (P101, P102, P103...)
      const sortedProducts = data.sort((a, b) => {
        const idA = a.productId || `P${999}`;
        const idB = b.productId || `P${999}`;
        return idA.localeCompare(idB);
      });
      setProducts(sortedProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ========== OPEN MODALS ==========
  const openAddModal = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // ========== SAVE PRODUCT (ADD/EDIT) - FIREBASE ==========
  const handleSave = async (formData, productId) => {
    setSaving(true);
    try {
      if (productId) {
        // UPDATE existing product in Firebase
        await updateProduct(productId, formData);
      } else {
        // ADD new product to Firebase
        await addProduct(formData);
      }
      setShowModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Error saving product:", err);
      alert(err.message || "Failed to save product. Please try again.");
    }
    setSaving(false);
  };

  // ========== DELETE PRODUCT - FIREBASE ==========
  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product. Please try again.");
    }
    setDeletingId(null);
  };

  // ========== GET STOCK STATUS ==========
  const getStockStatus = (stock) => {
    const stockNum = Number(stock);
    if (stockNum === 0) {
      return { label: "Out of Stock", color: "#dc2626", bg: "#fee2e2" };
    } else if (stockNum <= 5) {
      return { label: "Low Stock", color: "#f59e0b", bg: "#fef3c7" };
    } else if (stockNum <= 20) {
      return { label: "In Stock", color: "#16a34a", bg: "#dcfce7" };
    } else {
      return { label: "High Stock", color: "#2563eb", bg: "#dbeafe" };
    }
  };

  // ========== FORMAT PRODUCT ID ==========
  const formatId = (index) => `P${101 + index}`;

  // ========== GET IMAGE URL ==========
  const getImageUrl = (image) => {
    if (!image) return "/images/default.png";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads/")) {
      return `http://localhost:5000${image}`;
    }
    if (image.startsWith("/images/")) {
      return image;
    }
    return `/images/${image}`;
  };

  // ========== FILTER PRODUCTS ==========
  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (product.name && product.name.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.toLowerCase().includes(searchLower));
    
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // ========== PAGINATION ==========
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
        Loading products...
      </div>
    );
  }

  return (
    <div style={pageContainer}>
      {/* Header Section */}
      <div style={headerSection}>
        <div>
          <h1 style={pageTitle}>Inventory Management</h1>
          <p style={pageSubtitle}>{products.length} products in catalogue</p>
        </div>
        <button onClick={openAddModal} style={addBtn}>
          + Add Product
        </button>
      </div>

      {/* ========== SEARCH & FILTER BAR ========== */}
      <div style={filterBar}>
        <div style={searchWrapper}>
          <span style={searchIcon}><SearchIcon size={14} color="#999" /></span>
          <input
            type="text"
            placeholder="Search product by name or category..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
            style={searchInput}
          />
          {searchTerm && (
            <button 
              onClick={() => handleFilterChange(setSearchTerm, "")}
              style={clearBtn}
            >
              <CloseIcon size={14} color="#999" />
            </button>
          )}
        </div>

        <div style={filterWrapper}>
          <label style={filterLabel}>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => handleFilterChange(setSelectedCategory, e.target.value)}
            style={filterSelect}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <span style={resultsCount}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* ========== PRODUCTS TABLE ========== */}
      <div style={tableBox}>
        <div style={tableHeader}>
          <span>Image</span>
          <span>ID</span>
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>

        {paginatedProducts.length === 0 ? (
          <div style={emptyState}>
            {searchTerm || selectedCategory !== "All" 
              ? "No products match your search criteria." 
              : "No products yet. Click 'Add Product' to create one."}
          </div>
        ) : (
          paginatedProducts.map((p, i) => {
            const status = getStockStatus(p.stock);
            return (
              <div key={p.id || i} style={row}>
                {/* Image */}
                <div style={imgBox}>
                  <img
                    src={getImageUrl(p.image)}
                    alt={p.name || "Product"}
                    onError={(e) => {
                      e.target.src = "/images/default.png";
                    }}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* ID */}
                <span style={idStyle}>{p.productId || formatId(i)}</span>

                {/* Name */}
                <span style={nameStyle}>{p.name || "Unnamed"}</span>

                {/* Category */}
                <span style={categoryStyle}>{p.category || "Uncategorized"}</span>

                {/* Price */}
                <span style={priceStyle}>RM{Number(p.price || 0).toFixed(2)}</span>

                {/* Stock */}
                <span style={stockStyle}>{p.stock || 0}</span>

                {/* Status Badge */}
                <span style={{
                  ...statusBadge,
                  background: status.bg,
                  color: status.color
                }}>
                  {status.label}
                </span>

                {/* Actions */}
                <div style={actionBox}>
                  <button 
                    onClick={() => openEditModal(p)} 
                    title="Edit" 
                    style={actionBtn}
                  >
                    <EditIcon size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p)} 
                    title="Delete" 
                    style={actionBtn}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? <SpinnerIcon size={16} /> : <TrashIcon size={16} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========== PAGINATION ========== */}
      {filteredProducts.length > itemsPerPage && (
        <div style={paginationContainer}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              ...paginationBtn,
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? "not-allowed" : "pointer"
            }}
          >
            <IconLabel icon={<ChevronLeftIcon size={14} />}>Previous</IconLabel>
          </button>
          
          <span style={pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              ...paginationBtn,
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer"
            }}
          >
            <IconLabel icon={<ChevronRightIcon size={14} />} gap={6} style={{ flexDirection: "row-reverse" }}>Next</IconLabel>
          </button>
        </div>
      )}
      
      {/* ========== SHOW PAGINATION INFO ========== */}
      {filteredProducts.length > 0 && (
        <div style={{
          marginTop: "12px",
          textAlign: "center",
          fontSize: "13px",
          color: "#888"
        }}>
          Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
        </div>
      )}

      {/* ========== ADD/EDIT PRODUCT MODAL ========== */}
      {showModal && (
        <AddEditProduct
          product={selectedProduct}
          onDone={handleSave}
          onCancel={() => setShowModal(false)}
          saving={saving}
        />
      )}
    </div>
  );
}

// ================= STYLES =================

const pageContainer = {
  minHeight: "100vh",
  background: "#f5f5f5",
  fontFamily: "'Inter','Segoe UI',sans-serif",
  padding: "20px 24px",
  maxWidth: "100%",
  overflowX: "hidden"
};

const headerSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  flexWrap: "wrap",
  gap: 10
};

const pageTitle = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  color: "#1a2e1a"
};

const pageSubtitle = {
  margin: "2px 0 0",
  fontSize: 13,
  color: "#5c7a5c"
};

const addBtn = {
  padding: "8px 20px",
  background: "#2d6a4f",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.2s",
  whiteSpace: "nowrap"
};

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

const tableBox = {
  background: "#fff",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  width: "100%",
  overflowX: "auto"
};

const tableHeader = {
  display: "grid",
  gridTemplateColumns: "60px 70px 1fr 1fr 0.8fr 0.6fr 0.8fr 0.8fr",
  padding: "12px 18px",
  borderBottom: "1.5px solid #e8f0ea",
  color: "#5c7a5c",
  fontSize: 12,
  fontWeight: 600,
  backgroundColor: "#f8faf8",
  minWidth: "700px"
};

const row = {
  display: "grid",
  gridTemplateColumns: "60px 70px 1fr 1fr 0.8fr 0.6fr 0.8fr 0.8fr",
  padding: "10px 18px",
  alignItems: "center",
  borderBottom: "1px solid #f0f5f1",
  transition: "background 0.2s",
  minWidth: "700px"
};

const imgBox = {
  width: 36,
  height: 36,
  borderRadius: 6,
  overflow: "hidden",
  background: "#f5f5f5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #e8f0ea",
  flexShrink: 0
};

const idStyle = {
  fontWeight: 600,
  fontSize: 12,
  color: "#5c7a5c"
};

const nameStyle = {
  fontSize: 13,
  color: "#1a2e1a",
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

const categoryStyle = {
  fontSize: 12,
  color: "#5c7a5c",
  backgroundColor: "#f0f5f1",
  padding: "3px 8px",
  borderRadius: 10,
  display: "inline-block",
  width: "fit-content"
};

const priceStyle = {
  fontSize: 13,
  color: "#1a2e1a",
  fontWeight: 600
};

const stockStyle = {
  fontSize: 13
};

const statusBadge = {
  padding: "3px 10px",
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 600,
  display: "inline-block",
  width: "fit-content"
};

const actionBox = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 6
};

const actionBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  padding: "3px 6px",
  borderRadius: 4,
  transition: "all 0.2s"
};

const emptyState = {
  textAlign: "center",
  padding: "40px 0",
  color: "#8fba9f",
  fontSize: 13
};

const paginationContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
  marginTop: "20px",
  padding: "12px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
};

const paginationBtn = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "1px solid #d4e6d8",
  background: "#fff",
  fontSize: "13px",
  fontWeight: 500,
  color: "#1a2e1a",
  transition: "all 0.2s",
  cursor: "pointer"
};

const pageInfo = {
  fontSize: "13px",
  color: "#5c7a5c"
};