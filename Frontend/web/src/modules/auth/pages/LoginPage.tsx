import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../../../core/context/ThemeContext';
import { Eye, EyeOff, Moon, Sun, Shield, UserCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin, isLoading } = useAuth();
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

  const handleSelectDemo = (role: 'SuperAdmin' | 'HR') => {
    if (role === 'SuperAdmin') {
      setEmail('superadmin@organize.com');
      setPassword('Admin@123');
    } else {
      setEmail('hr@organize.com');
      setPassword('HR@123');
    }
    setErrorMsg('');
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
      {/* Background Soft Ambient Gradient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '25%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(217, 70, 239, 0.08) 0%, rgba(147, 51, 234, 0.03) 50%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      {/* FIXED TOP LEFT: Theme Toggle Button */}
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

      {/* FIXED TOP RIGHT: Logo & Brand */}
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
          <svg width="34" height="34" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="50%" stopColor="#c026d3" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            <path d="M34 8L54 48H42L34 32L26 48H14L34 8Z" fill="url(#logoGradient)" />
            <path d="M34 24L46 48H38L34 40L30 48H22L34 24Z" fill="#0d0e12" />
            <path d="M34 36L40 48H28L34 36Z" fill="url(#logoGradient)" />
          </svg>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE LAYOUT */}
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          alignItems: 'center',
          gap: '4rem',
          padding: '6rem 2.5rem 4rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* LEFT COLUMN: Content & Instant Demos */}
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxWidth: '560px',
          }}
        >
          {/* Subtle Category Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(217, 70, 239, 0.1)',
              border: '1px solid rgba(217, 70, 239, 0.25)',
              color: '#d946ef',
              fontSize: '0.75rem',
              fontWeight: 400,
              marginBottom: '1.75rem',
              alignSelf: 'flex-start',
            }}
          >
            <Sparkles size={13} />
            <span>Enterprise Workforce Platform</span>
          </div>

          {/* Main Title (Strictly Non-Bold) */}
          <h1
            style={{
              fontSize: '2.5rem',
              lineHeight: 1.25,
              fontWeight: 400,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: '1.25rem',
            }}
          >
            Discover your dream job and embark on your journey today
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#94a3b8',
              fontWeight: 400,
              marginBottom: '2.5rem',
            }}
          >
            Start your career journey and unlock new opportunities with unified organization workflows, real-time leave administration, and high-performance operations.
          </p>

          {/* Feature Highlights List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              marginBottom: '3rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 400 }}>
              <CheckCircle2 size={16} color="#d946ef" />
              <span>Full N-Tier Go API architecture with PostgreSQL pgxpool</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 400 }}>
              <CheckCircle2 size={16} color="#d946ef" />
              <span>Role-based access control (SuperAdmin, HR, Manager, Employee)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 400 }}>
              <CheckCircle2 size={16} color="#d946ef" />
              <span>TanStack Query v5 server-state caching & background synchronization</span>
            </div>
          </div>

          {/* Instant Demo Persona Switchers */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '2rem',
            }}
          >
            <div
              style={{
                fontSize: '0.8125rem',
                color: '#94a3b8',
                fontWeight: 400,
                marginBottom: '1rem',
              }}
            >
              Instant Demo Access (Click to populate or sign in):
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                id="btn-demo-superadmin-left"
                type="button"
                onClick={() => {
                  handleSelectDemo('SuperAdmin');
                  demoLogin('SuperAdmin');
                }}
                disabled={isLoading}
                className="btn"
                style={{
                  backgroundColor: '#16171d',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '14px',
                  fontSize: '0.8125rem',
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d946ef';
                  e.currentTarget.style.backgroundColor = '#1c1d25';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.backgroundColor = '#16171d';
                }}
              >
                <Shield size={16} color="#d946ef" />
                <span>Sign in as SuperAdmin</span>
              </button>

              <button
                id="btn-demo-hr-left"
                type="button"
                onClick={() => {
                  handleSelectDemo('HR');
                  demoLogin('HR');
                }}
                disabled={isLoading}
                className="btn"
                style={{
                  backgroundColor: '#16171d',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '14px',
                  fontSize: '0.8125rem',
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#a855f7';
                  e.currentTarget.style.backgroundColor = '#1c1d25';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.backgroundColor = '#16171d';
                }}
              >
                <UserCheck size={16} color="#a855f7" />
                <span>Sign in as HR Manager</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Seamless Login Form (NO Card Box) */}
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '100%',
            maxWidth: '440px',
            margin: '0 auto',
          }}
        >
          {/* Header Title (Non-Bold) */}
          <div style={{ marginBottom: '2rem', width: '100%' }}>
            <h2
              style={{
                fontSize: '1.875rem',
                fontWeight: 400,
                color: '#ffffff',
                letterSpacing: '-0.015em',
                marginBottom: '0.4rem',
              }}
            >
              Login to your account
            </h2>
            <p
              style={{
                color: '#94a3b8',
                fontSize: '0.8125rem',
                fontWeight: 400,
                lineHeight: 1.5,
              }}
            >
              Enter your credentials to access the CrystalSpace workspace
            </p>
          </div>

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

          {/* Form Controls */}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            {/* Input 1: Email / Number */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
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
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
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

            {/* Checkbox and Forgot Password */}
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
                  alert('Default demo credentials: SuperAdmin is "Admin@123", HR is "HR@123"');
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

            {/* Vibrant Neon Purple/Magenta Gradient Button */}
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
                marginBottom: '1.5rem',
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Log in'}
            </button>
          </form>

          {/* Minimal Or Divider */}
          <div
            style={{
              width: '100%',
              position: 'relative',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              }}
            />
            <span
              style={{
                position: 'relative',
                backgroundColor: '#0d0e12',
                padding: '0 0.85rem',
                color: '#64748b',
                fontSize: '0.75rem',
                fontWeight: 400,
              }}
            >
              Or
            </span>
          </div>

          {/* Social Sign In Mockups (Matching Reference image) */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn"
              onClick={() => demoLogin('SuperAdmin')}
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: '#16171d',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                borderRadius: '14px',
                padding: '0.8rem 1rem',
                fontWeight: 400,
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign up with google</span>
            </button>
          </div>

          {/* Footer note */}
          <div
            style={{
              width: '100%',
              marginTop: '1.75rem',
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: '#64748b',
              fontWeight: 400,
            }}
          >
            <span>Don't have an account? </span>
            <a
              href="#signup"
              onClick={(e) => {
                e.preventDefault();
                demoLogin('SuperAdmin');
              }}
              style={{
                color: '#d946ef',
                fontWeight: 400,
                textDecoration: 'none',
              }}
            >
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
