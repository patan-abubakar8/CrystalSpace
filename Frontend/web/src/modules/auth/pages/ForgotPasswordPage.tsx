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
} from 'lucide-react';
import './LoginPage.css';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
  onNavigateToLanding?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onBackToLogin,
  onNavigateToLanding,
}) => {
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

  const handleLandingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToLanding) {
      onNavigateToLanding();
    } else {
      window.location.hash = '#landing';
    }
  };

  return (
    <div className="auth-page-container">
      {/* Soft Ambient Crystal Glow */}
      <div className="auth-ambient-aura" />

      {/* TOP HEADER BAR: Brand Logo on Left, Theme Toggle on Right */}
      <header className="auth-header-bar">
        <div className="auth-logo-wrap">
          <CrystalLogo variant="full" height={36} theme={theme} />
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

      {/* TWO-COLUMN UNBOXED CONTENT (NO CARD CONTAINER) */}
      <main className="auth-split-content">
        {/* LEFT SIDE: Headline + Tagline + Know more about crystal */}
        <div className="auth-left-section animate-fade-in">
          <h1 className="auth-main-headline">
            Reset your <br />
            <span className="auth-headline-gradient">crystal Password</span>
          </h1>

          <p className="auth-tagline">
            Enter your registered organizational email address and we&apos;ll dispatch a secure recovery link.
          </p>

          <a
            href="#landing"
            className="auth-learn-more-link"
            onClick={handleLandingClick}
          >
            <span>Know more about crystal</span>
            <ArrowRight size={15} />
          </a>
        </div>

        {/* RIGHT SIDE: Clean Form sitting directly on page (NO CARD) */}
        <div className="auth-right-section animate-fade-in">
          <a
            href="#login"
            className="auth-back-link"
            onClick={handleBackClick}
          >
            <ArrowLeft size={15} />
            <span>Back to login</span>
          </a>

          {errorMsg && (
            <div className="auth-alert-box" role="alert">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="auth-clean-form">
              <div className="auth-form-group">
                <label htmlFor="forgot-email" className="auth-form-label">
                  Email
                </label>
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

              <button
                id="btn-forgot-submit"
                type="submit"
                className="auth-submit-btn"
                disabled={isSubmitting}
                style={{ marginTop: '0.5rem' }}
              >
                {isSubmitting ? 'Sending link...' : 'Send reset link'}
              </button>
            </form>
          ) : (
            <div className="auth-success-state animate-fade-in">
              <div className="auth-success-icon-wrap">
                <Check size={24} strokeWidth={2.5} />
              </div>

              <h2 className="auth-success-title">Recovery Link Dispatched</h2>
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
      </main>

      {/* BOTTOM FOOTER */}
      <footer className="auth-footer-bar">
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
    </div>
  );
};
