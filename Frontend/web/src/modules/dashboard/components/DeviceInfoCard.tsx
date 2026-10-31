import React, { useState, useEffect } from 'react';
import {
  Laptop,
  LifeBuoy,
  X,
  Send,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { useNotification } from '../../../core/context/NotificationContext';

export interface DeviceMetadata {
  os: string;
  browser: string;
  screenResolution: string;
  networkStatus: string;
  sessionSecurity: string;
}

export const getClientDeviceMetadata = (): DeviceMetadata => {
  const userAgent = navigator.userAgent;
  let os = 'Windows 11 (x64)';
  if (userAgent.indexOf('Mac') !== -1) os = 'macOS Sonoma';
  else if (userAgent.indexOf('Linux') !== -1) os = 'Linux Enterprise';
  else if (userAgent.indexOf('Android') !== -1) os = 'Android Mobile';
  else if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) os = 'Apple iOS';
  else if (userAgent.indexOf('Windows') !== -1) os = 'Windows 11 (x64)';

  let browser = 'Chrome (V8)';
  if (userAgent.indexOf('Edg') !== -1) browser = 'Microsoft Edge';
  else if (userAgent.indexOf('Firefox') !== -1) browser = 'Mozilla Firefox';
  else if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) browser = 'Apple Safari';
  else if (userAgent.indexOf('Chrome') !== -1) browser = 'Google Chrome 124';

  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const networkStatus = navigator.onLine ? 'Office LAN' : 'Offline';
  const sessionSecurity = window.location.protocol === 'https:' ? 'TLS 1.3 (Secure)' : 'Localhost Dev';

  return { os, browser, screenResolution, networkStatus, sessionSecurity };
};

interface DeviceInfoCardProps {
  compact?: boolean;
}

export const DeviceInfoCard: React.FC<DeviceInfoCardProps> = ({ compact = false }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceMetadata>(getClientDeviceMetadata());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error } = useNotification();

  useEffect(() => {
    setDeviceInfo(getClientDeviceMetadata());
  }, []);

  const [ticketCategory, setTicketCategory] = useState<'Hardware' | 'Network' | 'Software' | 'Access'>('Hardware');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      error('Subject Required', 'Please enter a brief summary of the issue.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setSubject('');
      setDescription('');
      const randomTicketId = `IT-${Math.floor(1000 + Math.random() * 9000)}`;
      success(
        'Ticket Created',
        `Support ticket #${randomTicketId} was dispatched to IT Support with device telemetry.`
      );
    }, 500);
  };

  if (compact) {
    return (
      <>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
                boxShadow: 'var(--glow-success)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontWeight: 400, color: 'var(--text-primary)' }}>
              {deviceInfo.os}
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>{deviceInfo.browser}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.75rem',
              borderRadius: '6px',
              gap: '0.35rem',
              fontWeight: 400,
              border: '1px solid var(--border-default)',
            }}
          >
            <LifeBuoy size={13} /> Raise Ticket
          </button>
        </div>

        {isModalOpen && (
          <TicketModal
            deviceInfo={deviceInfo}
            ticketCategory={ticketCategory}
            setTicketCategory={setTicketCategory}
            priority={priority}
            setPriority={setPriority}
            subject={subject}
            setSubject={setSubject}
            description={description}
            setDescription={setDescription}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitTicket}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        borderRadius: '10px',
        backgroundColor: 'var(--bg-surface-primary)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-info-bg)',
              color: 'var(--color-info)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-info-bg)',
            }}
          >
            <Laptop size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>
              Workstation Telemetry
            </h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              Endpoint verification & hardware health
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-sm"
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            borderRadius: '6px',
            gap: '0.35rem',
            fontWeight: 400,
          }}
        >
          <LifeBuoy size={14} /> Raise Ticket
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr)))',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: '0.85rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
        }}
      >
        <div>
          <div style={{ color: 'var(--text-tertiary)', marginBottom: '0.15rem' }}>OS Platform</div>
          <div style={{ fontWeight: 400, color: 'var(--text-primary)' }}>{deviceInfo.os}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-tertiary)', marginBottom: '0.15rem' }}>Browser Engine</div>
          <div style={{ fontWeight: 400, color: 'var(--text-primary)' }}>{deviceInfo.browser}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-tertiary)', marginBottom: '0.15rem' }}>Screen Matrix</div>
          <div style={{ fontWeight: 400, color: 'var(--text-primary)' }}>{deviceInfo.screenResolution}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-tertiary)', marginBottom: '0.15rem' }}>Session Shield</div>
          <div style={{ fontWeight: 400, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldCheck size={13} /> Compliant
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TicketModal
          deviceInfo={deviceInfo}
          ticketCategory={ticketCategory}
          setTicketCategory={setTicketCategory}
          priority={priority}
          setPriority={setPriority}
          subject={subject}
          setSubject={setSubject}
          description={description}
          setDescription={setDescription}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitTicket}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

interface TicketModalProps {
  deviceInfo: DeviceMetadata;
  ticketCategory: 'Hardware' | 'Network' | 'Software' | 'Access';
  setTicketCategory: (c: 'Hardware' | 'Network' | 'Software' | 'Access') => void;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  setPriority: (p: 'Low' | 'Medium' | 'High' | 'Urgent') => void;
  subject: string;
  setSubject: (s: string) => void;
  description: string;
  setDescription: (d: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({
  deviceInfo,
  ticketCategory,
  setTicketCategory,
  priority,
  setPriority,
  subject,
  setSubject,
  description,
  setDescription,
  isSubmitting,
  onSubmit,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-overlay)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-surface-primary)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LifeBuoy size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>
                Raise IT & Support Ticket
              </h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                Direct Helpdesk escalation with verified system telemetry
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '6px', padding: '0.35rem' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Issue Category
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value as any)}
                className="input"
                style={{ width: '100%', fontSize: '0.8125rem', height: '36px', borderRadius: '6px' }}
              >
                <option value="Hardware">🖥️ Hardware / Workstation</option>
                <option value="Network">🌐 Network / VPN / WiFi</option>
                <option value="Software">💻 Software & Licenses</option>
                <option value="Access">🔑 Access & Authentication</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                Urgency Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="input"
                style={{ width: '100%', fontSize: '0.8125rem', height: '36px', borderRadius: '6px' }}
              >
                <option value="Low">Low - Inquiry</option>
                <option value="Medium">Medium - Normal</option>
                <option value="High">High - Blocker</option>
                <option value="Urgent">Urgent - Critical Outage</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Summary
            </label>
            <input
              type="text"
              placeholder="e.g. Second monitor not detected via USB-C dock"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input"
              style={{ width: '100%', fontSize: '0.8125rem', height: '36px', borderRadius: '6px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 400, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea
              placeholder="Describe error codes, symptoms, or steps to reproduce..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              style={{ width: '100%', fontSize: '0.8125rem', height: '70px', resize: 'vertical', borderRadius: '6px' }}
            />
          </div>

          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 400, color: 'var(--text-primary)' }}>
              <Cpu size={12} /> Auto-Attached Telemetry:
            </div>
            <div>
              {deviceInfo.os} • {deviceInfo.browser} • Res: {deviceInfo.screenResolution} • {deviceInfo.sessionSecurity}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ borderRadius: '6px', fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: '6px', fontSize: '0.8125rem', padding: '0.45rem 1.15rem', gap: '0.4rem' }}
              disabled={isSubmitting}
            >
              <Send size={14} /> {isSubmitting ? 'Submitting...' : 'Dispatch Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
