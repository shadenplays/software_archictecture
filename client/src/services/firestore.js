import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";

import { db } from "../firebase";

/* =========================================================
   USERS
========================================================= */

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, data) {
  return updateDoc(doc(db, "users", uid), data);
}

/* =========================================================
   PRODUCT ID GENERATOR (P101, P102...)
========================================================= */

async function generateProductId() {
  const snap = await getDocs(collection(db, "products"));
  return `P${101 + snap.size}`;
}

/* =========================================================
   PRODUCTS
========================================================= */

export async function getAllProducts() {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getProduct(productId) {
  const snap = await getDoc(doc(db, "products", productId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/* ---------- ADD PRODUCT (FIXED) ---------- */
export async function addProduct(product) {
  const productId = await generateProductId();

  const ref = await addDoc(collection(db, "products"), {
    ...product,
    productId,
    price: Number(product.price),
    stock: Number(product.stock),
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

/* ---------- UPDATE PRODUCT ---------- */
export async function updateProduct(productId, product) {
  const payload = {
    ...product,
    price: Number(product.price),
    stock: Number(product.stock),
  };

  return updateDoc(doc(db, "products", productId), payload);
}

/* ---------- DELETE PRODUCT ---------- */
export async function deleteProduct(productId) {
  return deleteDoc(doc(db, "products", productId));
}

/* ---------- REALTIME PRODUCTS ---------- */
export function subscribeToProducts(callback) {
  return onSnapshot(collection(db, "products"), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/* =========================================================
   IMAGE HELPER (VERY IMPORTANT FOR YOUR UI BUG)
========================================================= */

export function getImagePath(image) {
  if (!image) return "/images/default.png";
  if (image.startsWith("http")) return image;
  return `/images/${image}`;
}

/* =========================================================
   CART
========================================================= */

function cartRef(uid) {
  return collection(db, "users", uid, "cart");
}

export async function getCart(uid) {
  const snap = await getDocs(cartRef(uid));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addToCart(uid, product, quantity = 1) {
  const ref = doc(db, "users", uid, "cart", product.id);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    return updateDoc(ref, {
      quantity: existing.data().quantity + Number(quantity),
    });
  }

  return setDoc(ref, {
    name: product.name,
    price: Number(product.price),
    category: product.category || "",
    image: product.image || "",
    quantity: Number(quantity),
  });
}

export async function updateCartItemQuantity(uid, productId, quantity) {
  return updateDoc(doc(db, "users", uid, "cart", productId), {
    quantity: Number(quantity),
  });
}

export async function removeCartItem(uid, productId) {
  return deleteDoc(doc(db, "users", uid, "cart", productId));
}

export async function clearCart(uid) {
  const items = await getCart(uid);
  await Promise.all(
    items.map(item =>
      deleteDoc(doc(db, "users", uid, "cart", item.id))
    )
  );
}

/* =========================================================
   ORDERS
========================================================= */

export async function createOrder({
  uid,
  customerName,
  items,
  total,
  paymentMethod
}) {
  const orderId = `YLS-${Math.floor(1000 + Math.random() * 9000)}`;

  await runTransaction(db, async (tx) => {

    const productDocs = await Promise.all(
      items.map(item =>
        tx.get(doc(db, "products", item.id))
      )
    );

    productDocs.forEach((snap, i) => {
      if (!snap.exists()) {
        throw new Error(`Product missing: ${items[i].name}`);
      }

      if (snap.data().stock < items[i].quantity) {
        throw new Error(`Not enough stock: ${items[i].name}`);
      }
    });

    productDocs.forEach((snap, i) => {
      tx.update(doc(db, "products", items[i].id), {
        stock: snap.data().stock - items[i].quantity,
      });
    });

    const orderRef = doc(collection(db, "orders"));

    tx.set(orderRef, {
      orderId,
      userId: uid,
      customerName: customerName || "Customer",
      items,
      total: Number(total),
      paymentMethod,
      status: "Paid",
      createdAt: serverTimestamp(),
    });
  });

  await clearCart(uid);

  return orderId;
}

/* ---------- ORDERS ---------- */

export async function getAllOrders() {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getOrdersForUser(uid) {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateOrderStatus(orderId, status) {
  return updateDoc(doc(db, "orders", orderId), { status });
}

export function subscribeToOrders(callback) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

