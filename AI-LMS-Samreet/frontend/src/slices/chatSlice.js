import { createSlice } from "@reduxjs/toolkit"

const chatSlice = createSlice({
  name: "chat",
  initialState: { isOpen: false },
  reducers: {
    openChat: (state) => { state.isOpen = true },
    closeChat: (state) => { state.isOpen = false },
    toggleChat: (state) => { state.isOpen = !state.isOpen },
  },
})

export const { openChat, closeChat, toggleChat } = chatSlice.actions
export default chatSlice.reducer