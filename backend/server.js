const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const homeData = require("./data/homeData");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ========== ADMIN IMAGE UPLOAD SETUP ==========
// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Serve uploaded images statically
app.use("/uploads", express.static(uploadDir));

// ========== CUSTOMER ROUTES (UNCHANGED) ==========
const cartStore = {};
const orderStore = {};

const getCartForUser = (userId = "guest") => {
  if (!cartStore[userId]) {
    cartStore[userId] = [];
  }
  return cartStore[userId];
};

const getCartCount = (items) => items.reduce((sum, item) => sum + (item.quantity || 0), 0);

app.get("/api/home", (req, res) => {
  return res.json({
    success: true,
    data: {
      categories: homeData.categories,
      popularProducts: homeData.popularProducts,
    },
  });
});

app.get("/api/products", (req, res) => {
  const category = req.query.category;
  let products = homeData.products;

  if (category && category.toLowerCase() !== "all") {
    products = products.filter((product) => product.category.toLowerCase() === category.toLowerCase());
  }

  return res.json({
    success: true,
    data: {
      products,
    },
  });
});

app.get("/api/cart", (req, res) => {
  const userId = req.query.userId || "guest";
  const cartItems = getCartForUser(userId);

  return res.json({
    success: true,
    data: {
      cartItems,
      cartCount: getCartCount(cartItems),
    },
  });
});

app.post("/api/cart", (req, res) => {
  const { userId = "guest", product, quantity = 1 } = req.body;

  if (!product || !product.id || !product.name || typeof product.price !== "number") {
    return res.status(400).json({ success: false, message: "Product id, name, and price are required" });
  }

  const qty = Number(quantity);
  if (Number.isNaN(qty) || qty < 1) {
    return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
  }

  const cartItems = getCartForUser(userId);
  const existingItem = cartItems.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    cartItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category || "",
      image: product.image || "",
      quantity: qty,
    });
  }

  return res.json({
    success: true,
    data: {
      cartItems,
      cartCount: getCartCount(cartItems),
    },
  });
});

app.post("/api/checkout", (req, res) => {
  const { userId = "guest", items, total, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart items are required for checkout" });
  }

  const userCart = getCartForUser(userId);

  const insufficient = items.find((item) => {
    const product = homeData.products.find((p) => p.id === item.id);
    return !product || product.stock < item.quantity;
  });
  if (insufficient) {
    return res.status(400).json({ success: false, message: `Insufficient stock for ${insufficient.name}` });
  }

  items.forEach((item) => {
    const product = homeData.products.find((p) => p.id === item.id);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
    }
  });

  const orderId = `YLS-${Math.floor(1000 + Math.random() * 9000)}`;
  const createdAt = new Date().toISOString();
  if (!orderStore[userId]) orderStore[userId] = [];
  orderStore[userId].unshift({
    id: orderId,
    orderId,
    items,
    total,
    paymentMethod,
    status: "paid",
    createdAt,
  });

  cartStore[userId] = [];

  return res.json({
    success: true,
    data: {
      orderId,
      createdAt,
      cartItems: [],
      cartCount: 0,
      remainingStock: homeData.products.map((p) => ({ id: p.id, stock: p.stock })),
    },
  });
});

app.get("/api/orders", (req, res) => {
  const userId = req.query.userId || "guest";
  const orders = orderStore[userId] || [];

  return res.json({
    success: true,
    data: {
      orders,
    },
  });
});

app.patch("/api/cart", (req, res) => {
  const { userId = "guest", productId, quantity } = req.body;
  const qty = Number(quantity);

  if (!productId) {
    return res.status(400).json({ success: false, message: "productId is required" });
  }
  if (Number.isNaN(qty) || qty < 1) {
    return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
  }

  const cartItems = getCartForUser(userId);
  const existingItem = cartItems.find((item) => item.id === productId);
  if (!existingItem) {
    return res.status(404).json({ success: false, message: "Cart item not found" });
  }

  existingItem.quantity = qty;

  return res.json({
    success: true,
    data: {
      cartItems,
      cartCount: getCartCount(cartItems),
    },
  });
});

app.delete("/api/cart", (req, res) => {
  const userId = req.query.userId || req.body.userId || "guest";
  const productId = req.query.productId || req.body.productId;

  const cartItems = getCartForUser(userId);

  if (productId) {
    const updatedItems = cartItems.filter((item) => item.id !== (typeof productId === "string" ? Number(productId) : productId));
    cartStore[userId] = updatedItems;
    return res.json({
      success: true,
      data: {
        cartItems: updatedItems,
        cartCount: getCartCount(updatedItems),
      },
    });
  }

  cartStore[userId] = [];
  return res.json({
    success: true,
    data: {
      cartItems: [],
      cartCount: 0,
    },
  });
});

// ========== ADMIN ROUTES (WITH IMAGE UPLOAD) ==========

// ADMIN: Image Upload
app.post("/api/admin/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADMIN: Get all products
app.get("/api/admin/products", (req, res) => {
  res.json({
    success: true,
    data: homeData.products
  });
});

// ADMIN: Add product
app.post("/api/admin/products", (req, res) => {
  const { name, price, stock, category, image, description } = req.body;
  
  const newProduct = {
    id: homeData.products.length + 1,
    name,
    price: Number(price),
    stock: Number(stock),
    category: category || "Uncategorized",
    image: image || "",
    description: description || ""
  };
  
  homeData.products.push(newProduct);
  
  res.json({
    success: true,
    data: newProduct
  });
});

// ADMIN: Update product
app.put("/api/admin/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, price, stock, category, image, description } = req.body;
  
  const productIndex = homeData.products.findIndex(p => p.id === parseInt(id));
  
  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  
  homeData.products[productIndex] = {
    ...homeData.products[productIndex],
    name: name || homeData.products[productIndex].name,
    price: price !== undefined ? Number(price) : homeData.products[productIndex].price,
    stock: stock !== undefined ? Number(stock) : homeData.products[productIndex].stock,
    category: category || homeData.products[productIndex].category,
    image: image || homeData.products[productIndex].image,
    description: description || homeData.products[productIndex].description
  };
  
  res.json({
    success: true,
    data: homeData.products[productIndex]
  });
});

// ADMIN: Delete product
app.delete("/api/admin/products/:id", (req, res) => {
  const { id } = req.params;
  const productIndex = homeData.products.findIndex(p => p.id === parseInt(id));
  
  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  
  const deleted = homeData.products.splice(productIndex, 1);
  
  res.json({
    success: true,
    data: deleted[0]
  });
});

// ADMIN: Get all orders
app.get("/api/admin/orders", (req, res) => {
  let allOrders = [];
  Object.values(orderStore).forEach(orders => {
    allOrders = allOrders.concat(orders);
  });
  
  res.json({
    success: true,
    data: allOrders
  });
});

// ADMIN: Update order status
app.put("/api/admin/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  let found = false;
  Object.keys(orderStore).forEach(userId => {
    const orderIndex = orderStore[userId].findIndex(o => o.orderId === id || o.id === id);
    if (orderIndex !== -1) {
      orderStore[userId][orderIndex].status = status;
      found = true;
    }
  });
  
  if (!found) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  
  res.json({
    success: true,
    message: "Order updated"
  });
});

// ADMIN: Dashboard stats
app.get("/api/admin/dashboard", (req, res) => {
  let totalOrders = 0;
  let totalRevenue = 0;
  let customers = new Set();

  Object.values(orderStore).forEach(list => {
    totalOrders += list.length;
    list.forEach(o => {
      totalRevenue += o.total || 0;
      customers.add(o.userId || "guest");
    });
  });

  res.json({
    success: true,
    data: {
      totalProducts: homeData.products.length,
      totalOrders,
      totalRevenue,
      lowStock: homeData.products.filter(p => p.stock < 5).length,
      totalCustomers: customers.size
    }
  });
});

app.get("/api/profile", (req, res) => {
  const userId = req.query.userId || "guest";

  res.json({
    success: true,
    data: {
      userId,
      name: "Demo User",
      email: "demo@shop.com",
      role: "customer"
    }
  });
});

app.get("/", (req, res) => {
  res.send("Backend API is running");
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
  console.log(`📁 Admin uploads directory: ${uploadDir}`);
});