import { createSlice } from "@reduxjs/toolkit"
import { toast } from "react-hot-toast"

const getCartKey   = (uid) => `cart_${uid}`
const getTotalKey  = (uid) => `total_${uid}`
const getItemsKey  = (uid) => `totalItems_${uid}`

export const loadCartForUser = (userId) => {
  if (!userId) return { cart: [], total: 0, totalItems: 0 }
  return {
    cart:       JSON.parse(localStorage.getItem(getCartKey(userId)))  || [],
    total:      JSON.parse(localStorage.getItem(getTotalKey(userId))) || 0,
    totalItems: JSON.parse(localStorage.getItem(getItemsKey(userId))) || 0,
  }
}

const saveToStorage = (userId, cart, total, totalItems) => {
  if (!userId) return
  localStorage.setItem(getCartKey(userId),   JSON.stringify(cart))
  localStorage.setItem(getTotalKey(userId),  JSON.stringify(total))
  localStorage.setItem(getItemsKey(userId),  JSON.stringify(totalItems))
}

const clearFromStorage = (userId) => {
  if (!userId) return
  localStorage.removeItem(getCartKey(userId))
  localStorage.removeItem(getTotalKey(userId))
  localStorage.removeItem(getItemsKey(userId))
}

const initialState = {
  cart:       JSON.parse(localStorage.getItem("cart"))       || [],
  total:      JSON.parse(localStorage.getItem("total"))      || 0,
  totalItems: JSON.parse(localStorage.getItem("totalItems")) || 0,
  userId: null,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartUser: (state, action) => {
      const userId = action.payload
      state.userId = userId
      const saved = loadCartForUser(userId)
      state.cart       = saved.cart
      state.total      = saved.total
      state.totalItems = saved.totalItems
    },
    addToCart: (state, action) => {
      const course = action.payload
      const index = state.cart.findIndex((item) => item._id === course._id)
      if (index >= 0) {
        toast.error("Course already in cart")
        return
      }
      state.cart.push(course)
      state.totalItems++
      state.total += course.price
      saveToStorage(state.userId, state.cart, state.total, state.totalItems)
      toast.success("Course added to cart")
    },
    removeFromCart: (state, action) => {
      const courseId = action.payload
      const index = state.cart.findIndex((item) => item._id === courseId)
      if (index >= 0) {
        state.totalItems--
        state.total -= state.cart[index].price
        state.cart.splice(index, 1)
        saveToStorage(state.userId, state.cart, state.total, state.totalItems)
        toast.success("Course removed from cart")
      }
    },
    resetCart: (state) => {
      clearFromStorage(state.userId)
      state.cart       = []
      state.total      = 0
      state.totalItems = 0
      state.userId     = null
    },
  },
})

export const { addToCart, removeFromCart, resetCart, setCartUser } = cartSlice.actions
export default cartSlice.reducer