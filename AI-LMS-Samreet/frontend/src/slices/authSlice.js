import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  signupData: null,
  otpFromServer: null,
  loading: false,
  token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setSignupData(state, value) {
      state.signupData = value.payload;
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setToken(state, value) {
      state.token = value.payload;
    },
    setOtpFromServer(state, value) {
      state.otpFromServer = value.payload;
    },
  },
});

export const { setSignupData, setLoading, setToken, setOtpFromServer } = authSlice.actions;

export default authSlice.reducer;