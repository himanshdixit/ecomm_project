import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getApiErrorMessage } from "@/lib/api-error";
import { cartService } from "@/services/api";

const initialState = {
  items: [],
  itemCount: 0,
  totalQuantity: 0,
  subtotal: 0,
  totalSavings: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalPrice: 0,
  status: "idle",
  error: "",
};

const applyCart = (state, cart) => {
  state.items = cart?.items || [];
  state.itemCount = cart?.itemCount || 0;
  state.totalQuantity = cart?.totalQuantity || 0;
  state.subtotal = cart?.subtotal || 0;
  state.totalSavings = cart?.totalSavings || 0;
  state.shippingPrice = cart?.shippingPrice || 0;
  state.taxPrice = cart?.taxPrice || 0;
  state.totalPrice = cart?.totalPrice || 0;
};

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, thunkAPI) => {
  try {
    return await cartService.getCart();
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error, "Unable to update cart right now."));
  }
});

export const addCartItem = createAsyncThunk("cart/addCartItem", async (payload, thunkAPI) => {
  try {
    return await cartService.addItem(payload);
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error, "Unable to update cart right now."));
  }
});

export const updateCartItemQuantity = createAsyncThunk("cart/updateQuantity", async ({ itemId, quantity }, thunkAPI) => {
  try {
    return await cartService.updateItemQuantity(itemId, quantity);
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error, "Unable to update cart right now."));
  }
});

export const removeCartItem = createAsyncThunk("cart/removeItem", async (itemId, thunkAPI) => {
  try {
    return await cartService.removeItem(itemId);
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error, "Unable to update cart right now."));
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: () => ({ ...initialState, items: [] }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        applyCart(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        applyCart(state, action.payload);
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        applyCart(state, action.payload);
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        applyCart(state, action.payload);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
