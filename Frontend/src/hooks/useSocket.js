import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const useSocket = (communityId, onTerminated) => {
  const { isAuthenticated } = useAuthStore();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !communityId) return;
    console.log('[Socket] Attempting connection to:', SOCKET_URL);

    socketRef.current = io(SOCKET_URL, {
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket] Connected to server');
      socketRef.current.emit('join_community', communityId);
    });

    socketRef.current.on('new_message', (message) => {
      console.log('[Socket] New message received:', message);
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('community_terminated', (data) => {
      console.log('[Socket] Community terminated:', data);
      if (onTerminated) onTerminated(data);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Socket] Disconnected from server');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, communityId, onTerminated]);

  const sendMessage = (content) => {
    if (socketRef.current && content.trim()) {
      socketRef.current.emit('send_message', {
        communityId,
        content
      });
    }
  };

  return { isConnected, messages, setMessages, sendMessage };
};

export default useSocket;
