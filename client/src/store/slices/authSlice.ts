import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthState, LoginResponse } from "@/types";

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
            state.user = action.payload.user
            state.accessToken = action.payload.accessToken
            state.isAuthenticated = true
            state.loading = false;
        },
        clearCredentials: (state) => {
            state.user = null
            state.accessToken = null
            state.isAuthenticated = false
            state.loading = false
        },
        setAuthLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        }
    }
})

export const { setCredentials, clearCredentials, setAuthLoading } = authSlice.actions
export default authSlice.reducer
