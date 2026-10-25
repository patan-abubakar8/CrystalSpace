import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../../core/context/ThemeContext';
import { CrystalLogo } from '../../../core/ui/CrystalLogo';
import {
  Eye,
  EyeOff,
  Moon,
  Sun,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import './LoginPage.css';

interface LoginPageProps {
  onNavigateToForgot?: () => void;
  onNavigateToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToForgot,
  onNavigateToLanding,
}) => {
  const { login, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('superadmin@organize.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    try {
      await login({ email, password });
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Invalid email or password');
    }
  };

  const handleForgotClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToForgot) {
      onNavigateToForgot();
    } else {
      window.location.hash = '#forgot';
    }
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
          id="btn-login-theme-toggle"
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
          <div className="auth-headline-block">
            <h1 className="auth-main-headline">
              Log in to your <br />
              <span className="auth-headline-gradient">crystal Account</span>
            </h1>

            <p className="auth-tagline">
              The unified workspace for enterprise governance.
            </p>
          </div>

          <a
            href="#landing"
            className="auth-learn-more-link auth-learn-more-desktop"
            onClick={handleLandingClick}
          >
            <span>Know more about crystal</span>
            <ArrowRight size={15} />
          </a>
        </div>

        {/* RIGHT SIDE: Clean Form sitting directly on page (NO CARD) */}
        <div className="auth-right-section animate-fade-in">
          {errorMsg && (
            <div className="auth-alert-box" role="alert">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-clean-form">
            {/* Email Address */}
            <div className="auth-form-group">
              <label htmlFor="login-email" className="auth-form-label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="auth-input-field"
                placeholder="superadmin@organize.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="auth-form-group">
              <label htmlFor="login-password" className="auth-form-label">
                Password
              </label>
              <div className="auth-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input-field auth-password-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Options: Remember me & Forget password */}
            <div className="auth-options-row">
              <label className="auth-remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="auth-remember-checkbox"
                />
                Remember me
              </label>

              <a
                href="#forgot"
                className="auth-forgot-link"
                onClick={handleForgotClick}
              >
                Forget password
              </a>
            </div>

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* Mobile bottom link */}
          <a
            href="#landing"
            className="auth-learn-more-link auth-learn-more-mobile"
            onClick={handleLandingClick}
          >
            <span>Know more about crystal</span>
            <ArrowRight size={15} />
          </a>
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
