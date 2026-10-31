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
  /** 'surface' = light card tile (default). 'inverted' = the glyph sits on a
      solid text-colored tile, so it reads as a dark brand square in light
      theme and a light one in dark theme — the reference sidebar mark. */
  tone?: 'surface' | 'inverted';
}

export const CrystalLogo: React.FC<CrystalLogoProps> = ({
  variant = 'full',
  theme: explicitTheme = 'auto',
  height = 36,
  className,
  style,
  alt = 'CrystalSpace',
  showBadge = true,
  tone = 'surface',
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
  // An inverted tile flips which glyph works: the white glyph goes on the
  // dark tile (light theme), the dark glyph on the light tile (dark theme).
  const iconSrc = tone === 'inverted' ? (isLight ? iconDark : iconLight) : isLight ? iconLight : iconDark;

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
          background: tone === 'inverted' ? 'var(--text-primary)' : 'var(--bg-surface-primary)',
          border: tone === 'inverted' ? '1px solid transparent' : '1px solid var(--border-default)',
          boxShadow: tone === 'inverted' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
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
            color: 'var(--text-primary)',
            transition: 'color var(--transition-normal)',
          }}
        >
          Crystal
        </span>
        <span
          style={{
            fontWeight: 500,
            color: 'var(--color-accent)',
            marginLeft: '1.5px',
          }}
        >
          Space
        </span>
      </span>
    </div>
  );
};
