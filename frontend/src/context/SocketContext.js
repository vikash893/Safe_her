import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketInstance = null;

    if (user) {
      socketInstance = io('http://localhost:8000');
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        setSocket(null);
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
