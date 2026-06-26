import { useEffect, useState, useCallback } from "react";
import { auth } from "../firebase";
import { getCart } from "../services/firestore";

// Returns [cartCount, refreshCartCount]. Reads straight from Firestore
// (users/{uid}/cart subcollection) instead of polling an Express endpoint.
export default function useCartCount() {
  const [cartCount, setCartCount] = useState(0);

  const refresh = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setCartCount(0);
      return;
    }
    try {
      const items = await getCart(uid);
      setCartCount(items.reduce((sum, item) => sum + (item.quantity || 0), 0));
    } catch (err) {
      console.error("Unable to fetch cart count:", err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return [cartCount, refresh];
}
