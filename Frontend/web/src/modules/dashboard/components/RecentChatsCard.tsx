import React, { useState } from 'react';
import {
  MessageSquare,
  ArrowRight,
  Send,
  X,
} from 'lucide-react';

export interface ChatMessageItem {
  id: string;
  name: string;
  avatarUrl: string;
  snippet: string;
  timeAgo: string;
  unreadCount?: number;
  isOnline?: boolean;
}

const RECENT_CHATS: ChatMessageItem[] = [
  {
    id: 'chat-1',
    name: 'Stephanie Meyer',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    snippet: 'PR review submitted for authentication flow 👏',
    timeAgo: '10m',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'chat-2',
    name: 'Design System Team',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    snippet: 'New minimal dark tokens pushed to Figma repository',
    timeAgo: '25m',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'chat-3',
    name: 'William Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    snippet: 'Database migration script verified against staging DB',
    timeAgo: '1h',
    isOnline: false,
  },
  {
    id: 'chat-4',
    name: 'Alex Rivera',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    snippet: 'Standup moved to 10:30 AM in Conference Room Aurora',
    timeAgo: '2h',
    isOnline: true,
  },
  {
    id: 'chat-5',
    name: 'Sarah Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    snippet: 'Sent the updated sprint requirements document 📄',
    timeAgo: '4h',
    isOnline: false,
  },
];

interface RecentChatsCardProps {
  onOpenChatsPage?: () => void;
}

export const RecentChatsCard: React.FC<RecentChatsCardProps> = ({ onOpenChatsPage }) => {
  const [selectedChat, setSelectedChat] = useState<ChatMessageItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState<Record<string, { sender: 'me' | 'them'; text: string; time: string }[]>>({
    'chat-1': [
      { sender: 'them', text: 'Hey Ahmed! Did you inspect the new token rotation PR?', time: '10:14 AM' },
      { sender: 'me', text: 'Yes, looking over the PR now. It looks clean and fast.', time: '10:18 AM' },
      { sender: 'them', text: 'PR review submitted for authentication flow 👏', time: '10:20 AM' },
    ],
    'chat-2': [
      { sender: 'them', text: 'New minimal dark tokens pushed to Figma repository', time: '09:45 AM' },
    ],
  });

  const handleOpenChat = (chat: ChatMessageItem) => {
    setSelectedChat(chat);
    setIsDrawerOpen(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedChat) return;

    const newMsg = {
      sender: 'me' as const,
      text: chatMessage.trim(),
      time: 'Just now',
    };

    setMessageHistory((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg],
    }));
    setChatMessage('');
  };

  return (
    <>
      <div
        className="card"
        id="dashboard-recent-chats"
        style={{
          borderRadius: '12px',
          padding: '1.25rem 1.4rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                color: '#4ade80',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquare size={14} />
            </div>
            <h3
              style={{
                fontSize: '0.92rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Team Messages
            </h3>
          </div>

          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 400,
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(74, 222, 128, 0.1)',
              color: '#4ade80',
              border: '1px solid rgba(74, 222, 128, 0.2)',
            }}
          >
            3 Unread
          </span>
        </div>

        {/* 5 Chat Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {RECENT_CHATS.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleOpenChat(chat)}
              style={{
                borderRadius: '8px',
                padding: '0.65rem 0.75rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                {/* Avatar with clean status dot */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={chat.avatarUrl}
                    alt={chat.name}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-subtle)',
                      display: 'block',
                    }}
                  />
                  {chat.isOnline && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        right: '-1px',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        border: '1.5px solid var(--bg-surface)',
                      }}
                    />
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.4rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 400,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {chat.name}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '0.1rem',
                    }}
                  >
                    {chat.snippet}
                  </div>
                </div>
              </div>

              {/* Time & Unread Badge */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '0.2rem',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                  {chat.timeAgo}
                </span>
                {chat.unreadCount && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 400,
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#4ade80',
                      color: '#0D0E12',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: View more in Chats */}
        <button
          type="button"
          onClick={() => {
            if (onOpenChatsPage) onOpenChatsPage();
            else handleOpenChat(RECENT_CHATS[0]);
          }}
          className="btn btn-ghost"
          style={{
            width: '100%',
            padding: '0.45rem',
            fontSize: '0.72rem',
            fontWeight: 400,
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            marginTop: '0.15rem',
          }}
        >
          View all in Chats <ArrowRight size={12} />
        </button>
      </div>

      {/* Modern Slide-Over Drawer */}
      {isDrawerOpen && selectedChat && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1000,
          }}
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '420px',
              height: '100%',
              backgroundColor: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-default)',
              boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface-elevated)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={selectedChat.avatarUrl}
                  alt={selectedChat.name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {selectedChat.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: selectedChat.isOnline ? '#10B981' : 'var(--text-tertiary)' }}>
                    {selectedChat.isOnline ? 'Active Now' : 'Offline'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: '6px', padding: '0.35rem' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                backgroundColor: 'var(--bg-app)',
              }}
            >
              {(messageHistory[selectedChat.id] || [
                { sender: 'them', text: selectedChat.snippet, time: selectedChat.timeAgo },
              ]).map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.65rem 0.95rem',
                      borderRadius: msg.sender === 'me' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                      backgroundColor: msg.sender === 'me' ? 'var(--text-primary)' : 'var(--bg-surface)',
                      color: msg.sender === 'me' ? 'var(--bg-surface)' : 'var(--text-primary)',
                      border: msg.sender === 'me' ? 'none' : '1px solid var(--border-subtle)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.45,
                    }}
                  >
                    {msg.text}
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-tertiary)',
                      alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '0.85rem 1rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="input"
                style={{ flex: 1, fontSize: '0.8125rem', height: '36px', borderRadius: '6px' }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '6px', padding: '0.5rem 0.85rem' }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
