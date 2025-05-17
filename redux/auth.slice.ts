import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { AppDispatch } from "./store";

// Base URL for API requests
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.12.74.108:3000/api/v1";

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: { id: string; name: string; email: string } | null;
        token: string | null;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = "succeeded";
      state.error = null;
      if (action.payload.token) {
        SecureStore.setItemAsync("authToken", action.payload.token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      SecureStore.deleteItemAsync("authToken");
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.status = action.payload ? "loading" : "idle";
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = "failed";
    },
  },
});

export const { setCredentials, logout, setLoading, setError } =
  authSlice.actions;
export const authReducer = authSlice.reducer;

// // Email validation regex
// const isValidEmail = (email: string): boolean => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };

// // Password validation (at least 8 chars, 1 number, 1 special char)
// const isValidPassword = (password: string): boolean => {
//   const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
//   return passwordRegex.test(password);
// };

// Name validation (at least 2 characters, letters and spaces only)
const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name);
};

// Register thunk
export const register =
  (name: string, email: string, password: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      dispatch(setLoading(true));

      // Input validation
      if (!name || !email || !password) {
        throw new Error("Name, email, and password are required");
      }
    //   if (!isValidName(name)) {
    //     throw new Error(
    //       "Name must be at least 2 characters long and contain only letters and spaces"
    //     );
    //   }
    //   if (!isValidEmail(email)) {
    //     throw new Error("Invalid email format");
    //   }
    //   if (!isValidPassword(password)) {
    //     throw new Error(
    //       "Password must be at least 8 characters long, include a number and a special character"
    //     );
    //   }

      // API call for registration
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-ID": "my-app",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Registration doesn't return a token, so set user to null
      dispatch(setCredentials({ user: null, token: null}));
    } catch (err: any) {
      const errorMessage =
        err.message || "An unexpected error occurred during registration";
      console.error("Registration error:", err);
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

// Login thunk
export const login =
  (email: string, password: string) =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      dispatch(setLoading(true));

      // Input validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
    //   if (!isValidEmail(email)) {
    //     throw new Error("Invalid email format");
    //   }
    //   if (!isValidPassword(password)) {
    //     throw new Error(
    //       "Password must be at least 8 characters long, include a number and a special character"
    //     );
    //   }

      // API call for login
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-ID": "my-app",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Fetch user details using /auth/me
      const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
      });

      const meData = await meResponse.json();
      if (!meResponse.ok) {
        throw new Error(meData.message || "Failed to fetch user details");
      }

      dispatch(
        setCredentials({
          user: meData.data,
          token: data.token,
        })
      );
    } catch (err: any) {
      const errorMessage =
        err.recipe || "An unexpected error occurred during login";
      console.error("Login error:", err);
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };
