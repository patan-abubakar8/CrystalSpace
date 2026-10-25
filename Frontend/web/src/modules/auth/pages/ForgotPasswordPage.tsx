import React, { useState } from 'react';
import { useTheme } from '../../../core/context/ThemeContext';
import { useNotification } from '../../../core/context/NotificationContext';
import { CrystalLogo } from '../../../core/ui/CrystalLogo';
import { Moon, Sun, ArrowLeft, Check, AlertCircle } from 'lucide-react';
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
    // Simulate / execute password recovery request
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsSubmitted(true);
      success('Reset link sent to your email', undefined, 'Dismiss');
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to send reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Soft Ambient Neon Glow */}
      <div className="login-ambient-glow" />

      {/* TOP HEADER BAR: Brand Logo on Left, Theme Toggle on Right */}
      <header className="login-header-bar">
        <div className="login-logo-wrapper">
          <CrystalLogo variant="full" height={34} theme={theme} />
        </div>

        <button
          id="btn-forgot-theme-toggle"
          onClick={toggleTheme}
          className="login-theme-btn"
          title="Toggle color theme"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* TWO COLUMN RESPONSIVE CONTENT AREA */}
      <main className="login-content-wrapper">
        {/* LEFT COLUMN: Clean Headline */}
        <div className="login-headline-section animate-fade-in">
          <h1 className="login-main-headline">
            Reset your <br />
            <span className="login-headline-gradient">
              Crystal Password
            </span>
          </h1>
        </div>

        {/* RIGHT COLUMN: Reset Form or Confirmation */}
        <div className="login-form-section animate-fade-in">
          {errorMsg && (
            <div className="login-alert-box">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              {/* Input: Email */}
              <div className="login-form-group">
                <label htmlFor="forgot-email" className="login-form-label">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="login-input-field"
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Navigation Link: Back to login */}
              <div className="login-options-row">
                <a
                  href="#login"
                  className="login-forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    onBackToLogin();
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to login</span>
                </a>
              </div>

              {/* Gradient Primary Button */}
              <button
                id="btn-forgot-submit"
                type="submit"
                className="login-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending link...' : 'Send reset link'}
              </button>
            </form>
          ) : (
            <div className="animate-fade-in" style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  <Check size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                    Reset Link Sent
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    Instructions sent to <span style={{ color: 'var(--text-primary)' }}>{email}</span>
                  </div>
                </div>
              </div>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  marginBottom: '1.75rem',
                  fontWeight: 400,
                }}
              >
                If an account exists with this email address, you will receive password recovery instructions shortly.
              </p>

              <button
                id="btn-forgot-back-login"
                type="button"
                className="login-submit-button"
                onClick={onBackToLogin}
              >
                Back to login
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
