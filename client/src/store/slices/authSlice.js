import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    accesstoken: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'Auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user
            state.accesstoken = action.payload.accesstoken
            state.isAuthenticated = true
        },
        clearCredentials: (state, action) => {
            state.user = null
            state.accessToken = null
            state.isAuthenticated = false
        }
    }
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
