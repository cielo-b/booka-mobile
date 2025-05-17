import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "./store";

// Book interface
interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  userId: string;
  photo?: string;
}

// Book state
interface BookState {
  books: Book[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: BookState = {
  books: [],
  status: "idle",
  error: null,
};

const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    setBooks: (state, action: PayloadAction<Book[]>) => {
      state.books = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    addBook: (state, action: PayloadAction<Book>) => {
      state.books.push(action.payload);
      state.status = "succeeded";
      state.error = null;
    },
    updateBook: (state, action: PayloadAction<Book>) => {
      const index = state.books.findIndex(
        (book) => book.id === action.payload.id
      );
      if (index !== -1) {
        state.books[index] = action.payload;
        state.status = "succeeded";
        state.error = null;
      }
    },
    deleteBook: (state, action: PayloadAction<string>) => {
      state.books = state.books.filter((book) => book.id !== action.payload);
      state.status = "succeeded";
      state.error = null;
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

export const {
  setBooks,
  addBook,
  updateBook,
  deleteBook,
  setLoading,
  setError,
} = bookSlice.actions;
export const bookReducer = bookSlice.reducer;

// Base URL for API requests
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.12.74.108:3000/api/v1/books";

// Thunk to fetch books
export const fetchBooks =
  () =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    try {
      dispatch(setLoading(true));
      const token = getState().auth.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch books");
      }

      dispatch(setBooks(data.data));
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      console.error("Fetch books error:", err);
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

// Thunk to add a book
export const addNewBook =
  (book: {
    title: string;
    author: string;
    description: string;
    photo?: File;
  }) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("title", book.title);
      formData.append("author", book.author);
      formData.append("description", book.description);
      if (book.photo) {
        formData.append("picture", book.photo);
      }

      dispatch(setLoading(true));
      const token = getState().auth.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add book");
      }

      dispatch(addBook(data.data));
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      console.error("Add book error:", err);
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

// Thunk to update a book
export const updateExistingBook =
  (
    id: string,
    book: { title: string; author: string; description: string; photo?: File }
  ) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    try {
      dispatch(setLoading(true));
      const token = getState().auth.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(book),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update book");
      }

      dispatch(updateBook(data.data));
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      console.error("Update book error:", err);
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

// Thunk to delete a book
export const deleteExistingBook =
  (id: string) =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    try {
      dispatch(setLoading(true));
      const token = getState().auth.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete book");
      }

      dispatch(deleteBook(id));
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      console.error("Delete book error:", err);
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };
