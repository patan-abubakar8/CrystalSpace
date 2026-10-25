import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../../core/context/ThemeContext';
import { CrystalLogo } from '../../../core/ui/CrystalLogo';
import { Eye, EyeOff, Moon, Sun, AlertCircle } from 'lucide-react';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
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

  return (
    <div className="login-page-container">
      {/* Soft Ambient Neon Glow */}
      <div className="login-ambient-glow" />

      {/* TOP HEADER BAR: Theme Toggle on Left, Brand Logo on Right */}
      <header className="login-header-bar">
        <button
          id="btn-login-theme-toggle"
          onClick={toggleTheme}
          className="login-theme-btn"
          title="Toggle color theme"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="login-logo-wrapper">
          <CrystalLogo variant="full" height={34} theme={theme} />
        </div>
      </header>

      {/* TWO COLUMN RESPONSIVE CONTENT AREA */}
      <main className="login-content-wrapper">
        {/* LEFT COLUMN: Clean Headline */}
        <div className="login-headline-section animate-fade-in">
          <h1 className="login-main-headline">
            Login to your <br />
            <span className="login-headline-gradient">
              Crystal Account
            </span>
          </h1>
        </div>

        {/* RIGHT COLUMN: Just Login Form with Forget Password */}
        <div className="login-form-section animate-fade-in">
          {errorMsg && (
            <div className="login-alert-box">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {/* Input 1: Email / Number */}
            <div className="login-form-group">
              <label htmlFor="login-email" className="login-form-label">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                className="login-input-field"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* Input 2: Password with Eye Toggle */}
            <div className="login-form-group">
              <label htmlFor="login-password" className="login-form-label">
                Enter your password
              </label>
              <div className="login-password-container">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input-field login-password-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forget Password */}
            <div className="login-options-row">
              <label className="login-remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="login-remember-checkbox"
                />
                Remember me
              </label>

              <a
                href="#forgot"
                className="login-forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Demo accounts:\n• SuperAdmin: superadmin@organize.com / Admin@123\n• HR Manager: hr@organize.com / HR@123');
                }}
              >
                Forget password
              </a>
            </div>

            {/* Gradient Primary Button */}
            <button
              id="btn-login-submit"
              type="submit"
              className="login-submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Log in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

