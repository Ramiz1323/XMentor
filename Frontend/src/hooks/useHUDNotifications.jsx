import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import { toast } from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const useHUDNotifications = () => {
  const { user, isAuthenticated } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Connect to global socket
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('[HUD] Uplink established. Monitoring for transmissions...');
    });

    socketRef.current.on('new_task', (data) => {
      console.log('[HUD] Incoming Transmission:', data);
      
      // HUD-Style Sound (if possible, using the faah or similar)
      const alertSound = new Audio('/Congo.mp3'); // Using Congo for alert
      alertSound.volume = 0.4;
      alertSound.play().catch(e => console.log('Audio auto-play blocked'));

      // Browser Notification
      if (Notification.permission === 'granted') {
        new Notification(`INCOMING TRANSMISSION: Mentor ${data.mentorName}`, {
          body: `New Tactical Assessment detected in the ${data.subject} sector: ${data.title}`,
          icon: '/favicon.svg',
          tag: 'new-task-' + data.id
        });
      }

      // In-App HUD Toast
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
      ), {
        duration: 8000,
        position: 'top-right',
        style: {
          background: 'transparent',
          padding: 0,
          boxShadow: 'none'
        }
      });
    });

    // Request Browser Notification Permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return null;
};

export default useHUDNotifications;
