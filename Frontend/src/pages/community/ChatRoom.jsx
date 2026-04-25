import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Users, Clock, ShieldCheck, MessageSquare, Trash2, AlertCircle } from 'lucide-react';
import useCommunityStore from '../../store/useCommunityStore';
import useAuthStore from '../../store/useAuthStore';
import useSocket from '../../hooks/useSocket';

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentCommunity, 
    fetchCommunityById, 
    messages: history, 
    fetchHistory, 
    deleteCommunity,
    isLoading, 
    error 
  } = useCommunityStore();

  const handleTerminated = useCallback(() => {
    alert('This anonymous hub has been terminated by the administrator.');
    navigate('/communities');
  }, [navigate]);

  const { isConnected, messages: liveMessages, setMessages, sendMessage } = useSocket(id, handleTerminated);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchCommunityById(id);
    fetchHistory(id);
  }, [id, fetchCommunityById, fetchHistory]);

  useEffect(() => {
    if (history?.length > 0) {
      setMessages(history);
    }
  }, [history, setMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;
    sendMessage(input);
    setInput('');
  };

  const handleDelete = async () => {
    if (window.confirm('CRITICAL: Terminate this community? This will permanently erase all messages and disconnect all members.')) {
      try {
        await deleteCommunity(id);
        navigate('/communities');
      } catch (err) {
        console.error('Termination failed:', err);
        alert(`Failed to terminate community: ${err.message || 'Unknown error'}`);
      }
    }
  };

  if (isLoading && !currentCommunity) return <div className="chat-loader">Establishing secure uplink...</div>;
  if (error) return <div className="chat-error">{error}</div>;
  if (!currentCommunity && !isLoading) {
    return (
      <div className="chat-error">
        <AlertCircle size={48} />
        <h2>Hub Not Found</h2>
        <p>The community you are looking for does not exist or has been terminated.</p>
        <button onClick={() => navigate('/communities')} className="btn-primary">Back to Discovery</button>
      </div>
    );
  }

  if (currentCommunity && !currentCommunity.isMember) {
    return (
      <div className="access-denied">
        <ShieldCheck size={48} />
        <h2>Access Denied</h2>
        <p>You must join this community to access the secure communication channel.</p>
        <button onClick={() => navigate('/communities')} className="btn-primary">Return to Hub</button>
      </div>
    );
  }

  const isCreator = user?.id === currentCommunity?.createdBy || user?._id === currentCommunity?.createdBy;

  return (
    <div className="chat-room-container">
      <header className="chat-header glass-card">
        <button onClick={() => navigate('/communities')} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <div className="community-info">
          <h3>{currentCommunity?.name}</h3>
          <div className="meta">
            <span className="type-badge">{currentCommunity?.type}</span>
            <span className="member-count"><Users size={14} /> {currentCommunity?.memberCount}</span>
            <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
          </div>
        </div>
        <div className="header-actions">
          <div className="my-alias-badge">
            Alias: <span>{currentCommunity?.myAlias}</span>
          </div>
          {isCreator && (
            <button onClick={handleDelete} className="delete-hub-btn" title="Terminate Community">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </header>

      <div className="messages-area">
        {Array.isArray(liveMessages) && liveMessages.map((msg, idx) => {
          const isMe = msg?.senderAlias === currentCommunity?.myAlias;
          const messageDate = msg?.createdAt ? new Date(msg.createdAt) : new Date();
          const timeString = isNaN(messageDate.getTime()) 
            ? 'Recent' 
            : messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={msg?._id || idx} className={`message-wrapper ${isMe ? 'own' : ''}`}>
              {!isMe && <div className="sender-alias">{msg?.senderAlias || 'Unknown'}</div>}
              <div className="message-bubble glass-card">
                <div className="content">{msg?.content}</div>
                <div className="time">{timeString}</div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form className="chat-input-area glass-card" onSubmit={handleSend}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Transmit anonymous message..."
          maxLength={1000}
        />
        <button type="submit" disabled={!input.trim() || !isConnected} className="send-btn">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
