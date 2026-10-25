import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../../core/context/ThemeContext';
import { CrystalLogo } from '../../../core/ui/CrystalLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Moon,
  Sun,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import './LoginPage.css';

interface LoginPageProps {
  onNavigateToForgot?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToForgot }) => {
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

  return (
    <div className="auth-page-container">
      {/* Centered Ambient Aura behind Card */}
      <div className="auth-ambient-aura" />
      <div className="auth-bg-grid" />

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

      {/* CENTER VIEWPORT: Pure Focused Auth Card */}
      <main className="auth-center-stage">
        <div className="auth-card animate-fade-in">
          <div className="auth-card-header">
            <h1 className="auth-card-title">
              Login to your <br />
              <span className="auth-headline-gradient">Crystal Account</span>
            </h1>
            <p className="auth-card-subtitle">
              Enter your organizational credentials to sign in.
            </p>
          </div>

          {errorMsg && (
            <div className="auth-alert-box" role="alert">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {/* Email Address */}
            <div className="auth-form-group">
              <label htmlFor="login-email" className="auth-form-label">
                Email address
              </label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="login-email"
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

            {/* Password with Eye Toggle */}
            <div className="auth-form-group">
              <label htmlFor="login-password" className="auth-form-label">
                Password
              </label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
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

            {/* Remember me & Forget Password */}
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

            {/* Primary Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Log in</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Security Badge */}
            <div className="auth-card-footer-info">
              <span className="auth-security-badge">
                <ShieldCheck size={14} />
                <span>End-to-End Encrypted Session</span>
              </span>
            </div>
          </form>
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
