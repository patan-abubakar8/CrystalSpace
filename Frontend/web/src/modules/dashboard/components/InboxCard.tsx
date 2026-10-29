import React from 'react';
import { MessageSquare, Pin } from 'lucide-react';

interface InboxMessage {
  id: string;
  name: string;
  avatarUrl: string;
  snippet: string;
  isHighlighted?: boolean;
  timeAgo: string;
}

const INBOX_ITEMS: InboxMessage[] = [
  {
    id: 'msg-1',
    name: 'Web Designing',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
    snippet: 'Hey tell me about progress of project? Waiting for your response',
    timeAgo: '10m ago',
  },
  {
    id: 'msg-2',
    name: 'Stephanie',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
    snippet: 'I got your first assignment. It was quite good 👏',
    isHighlighted: true, // Black/Accent card matching reference!
    timeAgo: '45m ago',
  },
  {
    id: 'msg-3',
    name: 'William',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces',
    snippet: 'I want some changes in previous work you sent me. Waiting for your reply.',
    timeAgo: '2h ago',
  },
];

export const InboxCard: React.FC = () => {
  return (
    <div
      className="card"
      style={{
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header: "Inbox" with count pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Inbox
          </h3>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <MessageSquare size={12} />
          </div>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.15rem 0.55rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(74, 222, 128, 0.12)',
            color: '#4ade80',
            border: '1px solid rgba(74, 222, 128, 0.3)',
          }}
        >
          3 New
        </span>
      </div>

      {/* Message List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {INBOX_ITEMS.map((item) => {
          if (item.isHighlighted) {
            // High-contrast featured black/dark card matching reference screenshot!
            return (
              <div
                key={item.id}
                style={{
                  borderRadius: '8px',
                  padding: '0.95rem 1rem',
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'inherit' }}>
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        opacity: 0.85,
                        marginTop: '0.15rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.snippet}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Pin size={13} style={{ transform: 'rotate(45deg)' }} />
                </div>
              </div>
            );
          }

          // Regular subtle message cards
          return (
            <div
              key={item.id}
              style={{
                borderRadius: '8px',
                padding: '0.85rem 1rem',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={item.avatarUrl}
                  alt={item.name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    border: '1px solid var(--border-default)',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.15rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.snippet}
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-tertiary)',
                  flexShrink: 0,
                }}
              >
                <Pin size={13} style={{ transform: 'rotate(45deg)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
