import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserByToken } from "@/lib/auth"; // Import your `getUserByToken` function

// Define the shape of the user context
interface UserContextType {
  user: DecodedToken | null;
  loading: boolean;
  refreshUser: () => void;
}

// Default value for the context
const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: () => {},
});

// Context Provider Component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the user data and update the state
  const fetchUser = async () => {
    setLoading(true);
    const fetchedUser = await getUserByToken();
    setUser(fetchedUser);
    setLoading(false);
  };

  // Refresh user data manually
  const refreshUser = () => {
    fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook to use the User Context
export const useUser = () => useContext(UserContext);
