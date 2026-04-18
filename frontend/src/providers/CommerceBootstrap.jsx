"use client";

import { useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { clearCart, fetchCart } from "@/store/slices/cartSlice";
import { clearWishlist, fetchWishlist } from "@/store/slices/wishlistSlice";

export default function CommerceBootstrap() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      dispatch(clearCart());
      dispatch(clearWishlist());
      return;
    }

    dispatch(fetchCart());
    dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated, isLoading]);

  return null;
}
