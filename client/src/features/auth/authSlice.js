import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const loadInitialState = () => {
  try {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const parsedAuth = JSON.parse(savedAuth);
      return {
        user: parsedAuth.user,
        isAuthenticated: parsedAuth.isAuthenticated,
        employee: parsedAuth.employee,
        isEmployeeAuthenticated: parsedAuth.isEmployeeAuthenticated,
      };
    }
  } catch (error) {
    console.log('Error loading auth state from localStorage:', error);
  }
  return {
    user: null,
    isAuthenticated: false,
    employee: null,
    isEmployeeAuthenticated: false,
  };
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      console.log("userLoggedIn reducer called with payload:", action.payload);
      state.user = action.payload.user;
      state.isAuthenticated = true;
      console.log("State updated - user:", state.user, "isAuthenticated:", state.isAuthenticated);
      // Save to localStorage
      try {
        localStorage.setItem('auth', JSON.stringify({
          user: action.payload.user,
          isAuthenticated: true,
          employee: state.employee,
          isEmployeeAuthenticated: state.isEmployeeAuthenticated,
        }));
        console.log("Auth state saved to localStorage");
      } catch (error) {
        console.log('Error saving auth state to localStorage:', error);
      }
    },
    userLoggedOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      // Clear from localStorage
      try {
        localStorage.removeItem('auth');
      } catch (error) {
        console.log('Error clearing auth state from localStorage:', error);
      }
    },
    employeeLoggedIn: (state, action) => {
      state.employee = action.payload.employee;
      state.isEmployeeAuthenticated = true;
      // Save to localStorage
      try {
        localStorage.setItem('auth', JSON.stringify({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          employee: action.payload.employee,
          isEmployeeAuthenticated: true,
        }));
      } catch (error) {
        console.log('Error saving auth state to localStorage:', error);
      }
    },
    employeeLoggedOut: (state) => {
      state.employee = null;
      state.isEmployeeAuthenticated = false;
      // Save to localStorage
      try {
        localStorage.setItem('auth', JSON.stringify({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          employee: null,
          isEmployeeAuthenticated: false,
        }));
      } catch (error) {
        console.log('Error saving auth state to localStorage:', error);
      }
    },
  },
});

export const { userLoggedIn, userLoggedOut, employeeLoggedIn, employeeLoggedOut } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectEmployeeRole = (state) => state.auth.employee?.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsEmployeeAuthenticated = (state) => state.auth.isEmployeeAuthenticated;

export default authSlice.reducer;
