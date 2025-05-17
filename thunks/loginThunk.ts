import { setLoading, setCredentials, setError } from "@/redux/auth.slice";
import { AppDispatch } from "@/redux/store";

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

      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-ID": "my-app",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      dispatch(
        setCredentials({
          user: data.user,
          token: data.token,
        })
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      dispatch(setError(errorMessage));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };
