import React from 'react';
import { useTheme } from '../context/ThemeContext';
import iconDark from '../../assets/crystal-icon-dark.svg';
import iconLight from '../../assets/crystal-icon-light.svg';

export interface CrystalLogoProps {
  variant?: 'full' | 'icon';
  theme?: 'dark' | 'light' | 'auto';
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  showBadge?: boolean;
}

export const CrystalLogo: React.FC<CrystalLogoProps> = ({
  variant = 'full',
  theme: explicitTheme = 'auto',
  height = 36,
  className,
  style,
  alt = 'CrystalSpace',
  showBadge = true,
}) => {
  let activeTheme: 'dark' | 'light' = 'dark';
  try {
    const themeContext = useTheme();
    activeTheme = themeContext.theme;
  } catch {
    // Fallback if rendered outside ThemeProvider
    activeTheme = 'dark';
  }

  const resolvedTheme = explicitTheme === 'auto' ? activeTheme : explicitTheme;
  const isLight = resolvedTheme === 'light';
  const iconSrc = isLight ? iconLight : iconDark;

  const numericHeight = typeof height === 'number' ? height : parseInt(String(height), 10) || 36;
  const badgeSize = numericHeight;
  const innerIconSize = showBadge ? Math.round(badgeSize * 0.62) : Math.round(numericHeight * 0.95);
  const fontSize = Math.round(numericHeight * 0.44);
  const borderRadius = Math.min(8, Math.max(4, Math.round(badgeSize * 0.28)));

  const renderBadge = () => {
    if (!showBadge) {
      return (
        <img
          src={iconSrc}
          alt={alt}
          height={numericHeight}
          width={numericHeight}
          style={{
            height: `${numericHeight}px`,
            width: `${numericHeight}px`,
            display: 'block',
            objectFit: 'contain',
            userSelect: 'none',
          }}
        />
      );
    }

    return (
      <div
        className="crystal-logo-badge"
        style={{
          width: `${badgeSize}px`,
          height: `${badgeSize}px`,
          borderRadius: `${borderRadius}px`,
          background: isLight
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 240, 255, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(217, 70, 239, 0.14) 50%, rgba(147, 51, 234, 0.08) 100%)',
          border: isLight
            ? '1px solid rgba(192, 38, 211, 0.24)'
            : '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: isLight
            ? '0 4px 12px -2px rgba(192, 38, 211, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            : '0 4px 16px -2px rgba(192, 38, 211, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all var(--transition-fast)',
        }}
      >
        <img
          src={iconSrc}
          alt=""
          style={{
            height: `${innerIconSize}px`,
            width: `${innerIconSize}px`,
            display: 'block',
            objectFit: 'contain',
            userSelect: 'none',
          }}
        />
      </div>
    );
  };

  if (variant === 'icon') {
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          ...style,
        }}
      >
        {renderBadge()}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.max(8, Math.round(numericHeight * 0.28))}px`,
        textDecoration: 'none',
        userSelect: 'none',
        lineHeight: 1,
        ...style,
      }}
    >
      {renderBadge()}
      <span
        style={{
          fontFamily: 'var(--font-family)',
          fontSize: `${fontSize}px`,
          letterSpacing: '-0.025em',
          display: 'inline-flex',
          alignItems: 'center',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontWeight: 400,
            color: isLight ? '#0f172a' : '#ffffff',
            transition: 'color var(--transition-normal)',
          }}
        >
          Crystal
        </span>
        <span
          style={{
            fontWeight: 500,
            background: 'linear-gradient(90deg, #e879f9 0%, #c026d3 50%, #9333ea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginLeft: '1.5px',
          }}
        >
          Space
        </span>
      </span>
    </div>
  );
};
