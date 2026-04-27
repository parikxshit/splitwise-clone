import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthState, LoginResponse } from "@/types";

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
            state.user = action.payload.user
            state.accessToken = action.payload.accessToken
            state.isAuthenticated = true
        },
        clearCredentials: (state) => {
            state.user = null
            state.accessToken = null
            state.isAuthenticated = false
        }
    }
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
