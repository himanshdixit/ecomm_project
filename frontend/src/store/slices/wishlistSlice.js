import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getApiErrorMessage } from "@/lib/api-error";
import { wishlistService } from "@/services/api";

const initialState = {
  items: [],
  status: "idle",
  error: "",
};

export const fetchWishlist = createAsyncThunk("wishlist/fetchWishlist", async (_, thunkAPI) => {
  try {
    return (await wishlistService.getWishlist()) || [];
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error, "Unable to update wishlist right now."));
  }
});

export const toggleWishlistProduct = createAsyncThunk("wishlist/toggleProduct", async (productId, thunkAPI) => {
  try {
    return (await wishlistService.toggleProduct(productId)) || [];
  } catch (error) {
    return thunkAPI.rejectWithValue(getApiErrorMessage(error, "Unable to update wishlist right now."));
  }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: () => ({ ...initialState, items: [] }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(toggleWishlistProduct.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(toggleWishlistProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        state.items = action.payload;
      })
      .addCase(toggleWishlistProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
