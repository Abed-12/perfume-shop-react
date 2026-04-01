import { createSlice } from '@reduxjs/toolkit';

const CART_STORAGE_KEY = 'cart_items';

const loadCartFromStorage = () => {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
        return [];
    }
};

const saveCartToStorage = (items) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

const initialState = {
    items: loadCartFromStorage(),
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const newItem = action.payload;
            const existing = state.items.find(
                (item) =>
                    item.perfumeId === newItem.perfumeId &&
                    item.size === newItem.size
            );

            if (existing) {
                existing.quantity += newItem.quantity;
            } else {
                state.items.push(newItem);
            }

            saveCartToStorage(state.items);
        },

        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
            saveCartToStorage(state.items);
        },

        clearCart: (state) => {
            state.items = [];
            saveCartToStorage(state.items);
        },
    },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export default cartSlice.reducer;