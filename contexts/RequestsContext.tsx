// contexts/RequestsContext.tsx
import React, { createContext, useContext, useState } from 'react';

const RequestsContext = createContext();

export const RequestsProvider = ({ children }) => {
  const [pendingRequests, setPendingRequests] = useState(0);

  return (
    <RequestsContext.Provider value={{ pendingRequests, setPendingRequests }}>
      {children}
    </RequestsContext.Provider>
  );
};

export const useRequests = () => useContext(RequestsContext);