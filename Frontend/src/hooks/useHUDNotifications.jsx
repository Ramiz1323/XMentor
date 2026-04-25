import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const VAPID_PUBLIC_KEY = 'BFwaQpPXgchhlTC7aaZuFyWAcb51cfFWSAStFJAwegcF892Jlbghlp6aZMc2pKesRJgfc_3cX-sTQvQkhLZYWEc';

const useHUDNotifications = () => {
  const { user, isAuthenticated } = useAuthStore();
  const socketRef = useRef(null);

  // Helper to convert base64 to Uint8Array for VAPID
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async (registration) => {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      console.log('[Push] Tactical Uplink secured. Sending coordinates to server...');
      
      await axios.post(`${SOCKET_URL}/api/user/push-subscribe`, subscription, {
        withCredentials: true
      });
      
      console.log('[Push] Server handshaking complete. Device registered.');
    } catch (err) {
      console.error('[Push] Deployment failed:', err.message);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // 1. Initialize Socket Uplink
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('[HUD] Uplink established. Monitoring for transmissions...');
    });

    socketRef.current.on('new_task', (data) => {
      // ... (existing toast logic)
      const alertSound = new Audio('/Congo.mp3');
      alertSound.volume = 0.4;
      alertSound.play().catch(e => console.log('Audio auto-play blocked'));

      toast((t) => (
        <div className="hud-notification-toast">
          <div className="hud-header">
            <span className="pulse-dot"></span>
            <span className="type">INCOMING TRANSMISSION</span>
            <span className="source">FROM: MENTOR {data.mentorName.toUpperCase()}</span>
          </div>
          <div className="hud-body">
             <p className="sector">SECTOR: {data.subject.toUpperCase()}</p>
             <p className="task">{data.title}</p>
          </div>
          <button onClick={() => {
             toast.dismiss(t.id);
             window.location.href = `/mcq/test/${data.id}`;
          }} className="hud-action">
            ESTABLISH LINK
          </button>
        </div>
      ), { duration: 8000, position: 'top-right', style: { background: 'transparent', padding: 0, boxShadow: 'none' } });
    });

    // 2. Mobile Push (Web Push API)
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        // Request permission and subscribe
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            subscribeToPush(registration);
          }
        });
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [isAuthenticated, user]);

  return null;
};

export default useHUDNotifications;
