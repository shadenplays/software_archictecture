const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, query } = require("firebase/firestore");
// const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyB4jLlw1zGyYBrmoQyhNdq3l2znvEbzvME",
  authDomain: "software-architecture-505f8.firebaseapp.com",
  projectId: "software-architecture-505f8",
  storageBucket: "software-architecture-505f8.firebasestorage.app",
  messagingSenderId: "542503151859",
  appId: "1:542503151859:web:1703d69a54674fc8492f86",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = getAuth(app);

const products = [
  { 
    name: "Milo 3in1", 
    price: 4.30, 
    category: "Beverages", 
    image: "/images/milo.jpg", 
    stock: 20, 
    description: "Classic chocolate malt beverage for breakfast or snack time.",
    productId: "P101"  // ✅ Added productId
  },
  { 
    name: "Maggi Kari", 
    price: 2.50, 
    category: "Snacks", 
    image: "/images/maggi.jpg", 
    stock: 15, 
    description: "Spicy instant noodles for quick and tasty meals.",
    productId: "P102"  // ✅ Added productId
  },
  { 
    name: "Gardenia Bread", 
    price: 5.50, 
    category: "Household", 
    image: "/images/gardenia.png", 
    stock: 10, 
    description: "Fresh bakery bread loaf perfect for sandwiches and toast.",
    productId: "P103"  // ✅ Added productId
  },
  { 
    name: "Coca Cola 1.5L", 
    price: 4.30, 
    category: "Beverages", 
    image: "/images/cocacola.jpg", 
    stock: 25, 
    description: "Refreshing soda to enjoy with meals or snacks.",
    productId: "P104"  // ✅ Added productId
  },
  { 
    name: "Dettol Body Wash", 
    price: 12.50, 
    category: "Personal Care", 
    image: "/images/dettol.jpg", 
    stock: 8, 
    description: "Gentle body wash for clean, refreshed skin.",
    productId: "P105"  // ✅ Added productId
  },
  { 
    name: "Dove Shampoo", 
    price: 11.50, 
    category: "Personal Care", 
    image: "/images/dove.jpg", 
    stock: 12, 
    description: "Nourishing shampoo for smooth, healthy hair.",
    productId: "P106"  // ✅ Added productId
  },
  { 
    name: "Kinder Bueno", 
    price: 3.90, 
    category: "Snacks", 
    image: "/images/kinder.jpg", 
    stock: 30, 
    description: "Creamy hazelnut chocolate snack bar.",
    productId: "P107"  // ✅ Added productId
  },
  { 
    name: "Pringles Original", 
    price: 6.50, 
    category: "Snacks", 
    image: "/images/pringles.jpg", 
    stock: 18, 
    description: "Crispy potato chips with a classic original flavor.",
    productId: "P108"  // ✅ Added productId
  },
];

async function seed() {
  // Uncomment if your security rules require auth to write products:
  // await signInWithEmailAndPassword(auth, "admin@example.com", "your-admin-password");

  try {
    // Check if products already exist
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    
    if (!snapshot.empty) {
      console.log(`⚠️ Products already exist in Firebase (${snapshot.size} products).`);
      console.log("Skipping seed to avoid duplicates.");
      console.log("If you want to re-seed, delete the existing products from Firebase Console first.");
      process.exit(0);
    }

    console.log(`🌱 Seeding ${products.length} products into Firestore...`);
    console.log("");
    
    for (const product of products) {
      const ref = await addDoc(collection(db, "products"), {
        ...product,
        createdAt: new Date().toISOString()
      });
      console.log(`  ✅ ${product.productId} - ${product.name} -> ${ref.id}`);
    }
    
    console.log("");
    console.log("✅ All products seeded successfully!");
    console.log(`📦 ${products.length} products added to Firebase Firestore.`);
    console.log("");
    console.log("You can now close this script (Ctrl+C).");
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
  
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});