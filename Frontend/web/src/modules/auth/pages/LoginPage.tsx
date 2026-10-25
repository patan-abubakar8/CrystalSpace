import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../../core/context/ThemeContext';
import { Eye, EyeOff, Moon, Sun, AlertCircle } from 'lucide-react';

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
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#0d0e12',
        color: '#f8fafc',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* Soft Ambient Neon Glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(217, 70, 239, 0.07) 0%, rgba(147, 51, 234, 0.02) 50%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      {/* TOP LEFT: Theme Toggle Button */}
      <div
        style={{
          position: 'fixed',
          top: '2rem',
          left: '2.5rem',
          zIndex: 50,
        }}
      >
        <button
          id="btn-login-theme-toggle"
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title="Toggle color theme"
          aria-label="Toggle theme"
          style={{
            background: '#16171d',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
            borderRadius: '12px',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* TOP RIGHT: CrystalSpace Brand & Logo */}
      <div
        style={{
          position: 'fixed',
          top: '2rem',
          right: '2.5rem',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span
          style={{
            fontSize: '1rem',
            color: '#f8fafc',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}
        >
          CrystalSpace
        </span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoTopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="50%" stopColor="#c026d3" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            <path d="M34 8L54 48H42L34 32L26 48H14L34 8Z" fill="url(#logoTopGradient)" />
            <path d="M34 24L46 48H38L34 40L30 48H22L34 24Z" fill="#0d0e12" />
            <path d="M34 36L40 48H28L34 36Z" fill="url(#logoTopGradient)" />
          </svg>
        </div>
      </div>

      {/* TWO COLUMN MINIMAL LAYOUT */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          alignItems: 'center',
          gap: '4rem',
          padding: '6rem 3rem 4rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* LEFT COLUMN: Clean Minimal Headline */}
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxWidth: '520px',
          }}
        >
          <h1
            style={{
              fontSize: '3.25rem',
              lineHeight: 1.2,
              fontWeight: 400,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            Login to your <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #e879f9 0%, #c026d3 50%, #9333ea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Crystal Account
            </span>
          </h1>
        </div>

        {/* RIGHT COLUMN: Just Login Form with Forget Password */}
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '420px',
            margin: '0 auto',
          }}
        >
          {errorMsg && (
            <div
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                backgroundColor: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: '#f43f5e',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 400,
              }}
            >
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {/* Input 1: Email / Number */}
            <div className="form-group" style={{ marginBottom: '1.35rem' }}>
              <label
                htmlFor="login-email"
                style={{
                  fontSize: '0.8125rem',
                  color: '#94a3b8',
                  fontWeight: 400,
                  marginBottom: '0.45rem',
                  display: 'block',
                }}
              >
                Your number & email address
              </label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={{
                  backgroundColor: '#16171d',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 400,
                }}
              />
            </div>

            {/* Input 2: Password with Eye Toggle */}
            <div className="form-group" style={{ marginBottom: '1.35rem' }}>
              <label
                htmlFor="login-password"
                style={{
                  fontSize: '0.8125rem',
                  color: '#94a3b8',
                  fontWeight: 400,
                  marginBottom: '0.45rem',
                  display: 'block',
                }}
              >
                Enter your password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{
                    backgroundColor: '#16171d',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#f8fafc',
                    borderRadius: '14px',
                    padding: '0.85rem 2.75rem 0.85rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 400,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forget Password */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.75rem',
                fontSize: '0.8125rem',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontWeight: 400,
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#d946ef',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
                Remember me
              </label>

              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Demo accounts:\n• SuperAdmin: superadmin@organize.com / Admin@123\n• HR Manager: hr@organize.com / HR@123');
                }}
                style={{
                  color: '#d946ef',
                  fontWeight: 400,
                  textDecoration: 'none',
                }}
              >
                Forget password
              </a>
            </div>

            {/* Gradient Primary Button */}
            <button
              id="btn-login-submit"
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '14px',
                fontWeight: 500,
                fontSize: '0.9375rem',
                border: 'none',
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
