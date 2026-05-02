import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const useSocket = (communityId, onTerminated) => {
  const { isAuthenticated } = useAuthStore();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  const onTerminatedRef = useRef(onTerminated);

  // Update ref when onTerminated changes
  useEffect(() => {
    onTerminatedRef.current = onTerminated;
  }, [onTerminated]);

  useEffect(() => {
    if (!isAuthenticated || !communityId) {
      setMessages([]);
      return;
    }
    
    // Reset messages when starting a new connection/communityId
    setMessages([]);
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
      setMessages((prev) => {
        if (message.clientId) {
          const index = prev.findIndex(m => m.clientId === message.clientId);
          if (index !== -1) {
            const newMessages = [...prev];
            newMessages[index] = { ...message, isOptimistic: false };
            return newMessages;
          }
        }
        
        // Deduplicate just in case
        if (prev.some(m => m._id === message._id)) return prev;
        
        return [...prev, message];
      });
    });

    socketRef.current.on('error', (err) => {
      console.error('[Socket] Error:', err.message);
      if (err.clientId) {
        setMessages((prev) => prev.filter(m => m.clientId !== err.clientId));
      }
    });

    socketRef.current.on('community_terminated', (data) => {
      console.log('[Socket] Community terminated:', data);
      if (onTerminatedRef.current) onTerminatedRef.current(data);
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
  }, [isAuthenticated, communityId]);

  const sendMessage = (content, extraData = {}) => {
    if (socketRef.current && content.trim()) {
      const clientId = Date.now().toString() + Math.random().toString(36).substring(2);
      
      // Optimistic Update
      const optimisticMsg = {
        _id: clientId,
        clientId,
        content: content.trim(),
        sender: extraData.userId,
        senderAlias: extraData.userAlias,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      socketRef.current.emit('send_message', {
        communityId,
        content: content.trim(),
        clientId
      });
    }
  };

  return { isConnected, messages, setMessages, sendMessage };
};

export default useSocket;
