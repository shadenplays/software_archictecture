import { useState } from "react";
import { UploadCloudIcon } from "../components/Icons";

function ProductModal({ item, onClose }) {
  const [form, setForm] = useState(
    item || {
      name: "",
      category: "",
      stock: "",
      price: "",
      image: "",
      description: ""
    }
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div style={overlay}>
      <div style={modal}>

        {/* TITLE */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>
            {item ? "Edit Inventory" : "Add Inventory"}
          </h2>
        </div>

        {/* IMAGE UPLOAD BOX */}
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>

          <div style={uploadBox}>
            <UploadCloudIcon size={30} />
            <button style={uploadBtn}>Upload Image</button>
            <small style={{ color: "#777" }}>
              JPG, PNG (Recommended 500x500)
            </small>
          </div>

        </div>

        {/* FORM GRID */}
        <div style={grid}>

          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            style={input}
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            style={input}
          />

          <input
            name="stock"
            placeholder="Current Stock"
            value={form.stock}
            onChange={handleChange}
            style={input}
          />

          <input
            name="price"
            placeholder="Price (RM)"
            value={form.price}
            onChange={handleChange}
            style={input}
          />
        </div>

        {/* DESCRIPTION */}
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={textarea}
        />

        {/* BUTTONS */}
        <div style={btnRow}>
          <button onClick={onClose} style={cancelBtn}>
            Cancel
          </button>

          <button style={saveBtn}>
            {item ? "Save" : "Add"}
          </button>
        </div>

      </div>
    </div>
  );
}