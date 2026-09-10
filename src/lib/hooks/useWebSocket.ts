import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotificationStore } from '@/lib/store/notificationStore';
import { Notification } from '@/types';

export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    
    newSocket.on('notification', (notification: Notification) => {
      addNotification(notification);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [addNotification]);

  return { socket, connected };
};
