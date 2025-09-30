import * as SecureStore from "expo-secure-store";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import Constants from "expo-constants";
import { usePushToken } from "@/contexts/PushTokenContext";
import {useAuth } from "@clerk/clerk-expo";

interface DecodedToken {
  email: string;
  user_id: string;
  exp?: number; // Optional: Token expiration time, if applicable
  [key: string]: any; // To handle any other properties in the payload
}

// Secure storage keys
const AUTH_TOKEN_KEY = "authToken";

/**
 * Save the authentication token securely.
 * @param token - The token to be saved.
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    console.log("Token saved successfully.");
  } catch (error) {
    console.error("Error saving token:", error);
  }
};

/**
 * Retrieve the authentication token from secure storage.
 * @returns The token, or null if not found.
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

/**
 * Delete the authentication token from secure storage.
 */
export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    console.log("Token deleted successfully.");
  } catch (error) {
    console.error("Error deleting token:", error);
  }
};

/**
 * Check if the user is authenticated by validating the token.
 * @returns True if authenticated, otherwise false.
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token; // Returns true if token exists, false otherwise
};

export const fetchWithAuth = async (
  url: string,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse> => {
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found.");
  }

  const headers = {
    ...config.headers,
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await axios({
      url,
      ...config,
      headers,
    });
    return response;
  } catch (error) {
    console.error("Error in fetchWithAuth:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};
export const getUserByToken = async (): Promise<DecodedToken | null> => {
  try {
    const token = await getToken();
    console.log("Raw Token:", token);

    if (!token) {
      console.warn("No token found.");
      return null;
    }

    // Decode the payload part of the JWT
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) {
      console.error("Invalid token format.");
      return null;
    }

    const decodedPayload = JSON.parse(atob(payloadBase64));

    // Validate if the token is expired
    if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
      console.warn("Token has expired.");
      await logout();
      return null;
    }

    return decodedPayload as DecodedToken;
  } catch (error) {
    console.error("Unexpected error in getUserByToken:", error);
    return null;
  }
};


export const logout = async (redirectCallback?: () => void): Promise<void> => {
  try {
    await deleteToken();
    console.log("User logged out.");
    if (redirectCallback) {
      redirectCallback();
    }
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
//   try {
//     const pushToken = await SecureStore.getItemAsync("expoPushToken");
//     if (!pushToken) {
//       console.warn("No push token found.");
//       return;
//     }

//     const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/deletePushToken`, {

//     })

//     if (response.status === 200) {
//       console.log("Push token deleted successfully from backend.");
//       await SecureStore.deleteItemAsync("expoPushToken");
//     } else {
//       console.error("Failed to delete push token from backend.");
//     }
//   } catch (error) {
//     console.error("Error deleting push token:", error);
//   }
// };
