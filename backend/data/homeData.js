const products = [
  {
    id: 1,
    name: "Milo 3in1",
    price: 15.99,
    category: "Beverages",
    image: "/images/milo.jpg",
    stock: 20,
    description: "Classic chocolate malt beverage for breakfast or snack time."
  },
  {
    id: 2,
    name: "Maggi Kari",
    price: 2.50,
    category: "Snacks",
    image: "/images/maggi.jpg",
    stock: 15,
    description: "Spicy instant noodles for quick and tasty meals."
  },
  {
    id: 3,
    name: "Gardenia Bread",
    price: 5.50,
    category: "Household",
    image: "/images/gardenia.png",
    stock: 10,
    description: "Fresh bakery bread loaf perfect for sandwiches and toast."
  },
  {
    id: 4,
    name: "Coca Cola 1.5 L",
    price: 4.30,
    category: "Beverages",
    image: "/images/cocacola.jpg",
    stock: 25,
    description: "Refreshing soda to enjoy with meals or snacks."
  },
  {
    id: 5,
    name: "Dettol Body Wash",
    price: 12.50,
    category: "Personal Care",
    image: "/images/dettol.jpg",
    stock: 8,
    description: "Gentle body wash for clean, refreshed skin."
  },
  {
    id: 6,
    name: "Dove Shampoo",
    price: 11.50,
    category: "Personal Care",
    image: "/images/dove.jpg",
    stock: 12,
    description: "Nourishing shampoo for smooth, healthy hair."
  },
  {
    id: 7,
    name: "Kinder Bueno",
    price: 3.90,
    category: "Snacks",
    image: "/images/kinder.jpg",
    stock: 30,
    description: "Creamy hazelnut chocolate snack bar."
  },
  {
    id: 8,
    name: "Pringles Original",
    price: 6.50,
    category: "Snacks",
    image: "/images/pringles.jpg",
    stock: 18,
    description: "Crispy potato chips with a classic original flavor."
  }
];

const popularProducts = [
  products[0],
  products[1],
  products[2],
  products[3],
];

const categories = [
  { id: "snacks", name: "Snacks", icon: "🍿" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
  { id: "household", name: "Household", icon: "🏠" },
  { id: "personal-care", name: "Personal Care", icon: "💄" }
];

module.exports = {
  categories,
  products,
  popularProducts,
};
