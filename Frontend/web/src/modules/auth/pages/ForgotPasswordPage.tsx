import React, { useState } from 'react';
import { useTheme } from '../../../core/context/ThemeContext';
import { useNotification } from '../../../core/context/NotificationContext';
import { CrystalLogo } from '../../../core/ui/CrystalLogo';
import {
  Moon,
  Sun,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Mail,
  ShieldCheck,
  KeyRound,
  Clock,
} from 'lucide-react';
import './LoginPage.css';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBackToLogin }) => {
  const { theme, toggleTheme } = useTheme();
  const { success } = useNotification();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsSubmitted(true);
      success('Recovery link sent to your email', undefined, 'Dismiss');
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to send recovery link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onBackToLogin();
  };

  return (
    <div className="auth-split-layout">
      {/* ====================================================================
          LEFT PANEL: Immersive Security Showcase
          ==================================================================== */}
      <aside className="auth-showcase-panel">
        <div className="auth-showcase-orb" />
        <div className="auth-showcase-grid" />

        {/* Brand Header */}
        <div className="auth-showcase-header">
          <CrystalLogo variant="full" height={38} theme={theme} />
        </div>

        {/* Narrative & Security Showcase */}
        <div className="auth-showcase-body">
          <div className="auth-showcase-pill">
            <ShieldCheck size={13} />
            <span>Account Recovery Protocol</span>
          </div>

          <h1 className="auth-showcase-title">
            Cryptographic <br />
            <span className="auth-headline-gradient">Identity Verification</span> &amp; Security.
          </h1>

          <p className="auth-showcase-desc">
            Protecting enterprise integrity with time-sensitive single-use tokens,
            cryptographic signatures, and strict audit logging.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon-wrap">
                <Clock size={18} />
              </div>
              <div className="auth-feature-text">
                <div className="auth-feature-name">Time-Bound Ephemeral Tokens</div>
                <div className="auth-feature-summary">
                  Recovery links expire automatically in 15 minutes and can only be used once.
                </div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-wrap">
                <KeyRound size={18} />
              </div>
              <div className="auth-feature-text">
                <div className="auth-feature-name">Multi-Layered Verification</div>
                <div className="auth-feature-summary">
                  Cryptographically signed link dispatched directly to your registered address.
                </div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-wrap">
                <ShieldCheck size={18} />
              </div>
              <div className="auth-feature-text">
                <div className="auth-feature-name">Audited Security Event</div>
                <div className="auth-feature-summary">
                  Password reset attempts are logged with client metadata in the organizational trail.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Status & Trust Footer */}
        <div className="auth-showcase-footer">
          <div className="auth-status-indicator">
            <span className="auth-status-dot" />
            <span>All Systems Operational · SOC2 Type II Certified</span>
          </div>
          <span>CrystalSpace v2.4</span>
        </div>
      </aside>

      {/* ====================================================================
          RIGHT PANEL: Focused Recovery Card
          ==================================================================== */}
      <main className="auth-form-panel">
        {/* Top Actions: Mobile Brand + Theme Switcher */}
        <header className="auth-top-actions">
          <div className="auth-mobile-logo">
            <CrystalLogo variant="full" height={32} theme={theme} />
          </div>

          <button
            id="btn-forgot-theme-toggle"
            onClick={toggleTheme}
            className="auth-theme-toggle"
            title="Toggle color theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {/* Center: Frosted Glass Auth Card */}
        <div className="auth-form-center">
          <div className="auth-card animate-fade-in">
            <a
              href="#login"
              className="auth-back-link"
              onClick={handleBackClick}
            >
              <ArrowLeft size={15} />
              <span>Back to login</span>
            </a>

            {!isSubmitted ? (
              <>
                <div className="auth-card-header">
                  <h2 className="auth-card-title">
                    Reset your <br />
                    <span className="auth-headline-gradient">Password</span>
                  </h2>
                  <p className="auth-card-subtitle">
                    Enter your registered email address and we&apos;ll send a secure password recovery link.
                  </p>
                </div>

                {errorMsg && (
                  <div className="auth-alert-box" role="alert">
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <div className="auth-form-group">
                    <label htmlFor="forgot-email" className="auth-form-label">
                      Email address
                    </label>
                    <div className="auth-input-wrapper">
                      <Mail size={16} className="auth-input-icon" />
                      <input
                        id="forgot-email"
                        type="email"
                        className="auth-input-field"
                        placeholder="name@organization.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <button
                    id="btn-forgot-submit"
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isSubmitting}
                    style={{ marginTop: '0.75rem' }}
                  >
                    {isSubmitting ? (
                      'Sending link...'
                    ) : (
                      <>
                        <span>Send reset link</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="auth-card-footer-info">
                    <span className="auth-security-badge">
                      <ShieldCheck size={14} />
                      <span>Cryptographically Signed Link · 15m Expiry</span>
                    </span>
                  </div>
                </form>
              </>
            ) : (
              <div className="auth-success-card animate-fade-in">
                <div className="auth-success-icon-wrap">
                  <Check size={28} strokeWidth={2.5} />
                </div>

                <h3 className="auth-success-title">Recovery Link Dispatched</h3>
                <p className="auth-success-desc">
                  If an account exists for <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{email}</span>,
                  you will receive password reset instructions shortly.
                </p>

                <button
                  id="btn-forgot-back-login"
                  type="button"
                  className="auth-submit-btn"
                  onClick={onBackToLogin}
                >
                  Return to login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Footer */}
        <footer className="auth-panel-footer">
          <span>© 2026 CrystalSpace Inc. All rights reserved.</span>
          <div className="auth-footer-links">
            <a href="#" className="auth-footer-link" onClick={(e) => e.preventDefault()}>
              Privacy Policy
            </a>
            <a href="#" className="auth-footer-link" onClick={(e) => e.preventDefault()}>
              Terms of Service
            </a>
            <a href="#" className="auth-footer-link" onClick={(e) => e.preventDefault()}>
              Security
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};
