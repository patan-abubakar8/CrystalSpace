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
}

export const CrystalLogo: React.FC<CrystalLogoProps> = ({
  variant = 'full',
  theme: explicitTheme = 'auto',
  height = 34,
  className,
  style,
  alt = 'CrystalSpace',
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

  const numericHeight = typeof height === 'number' ? height : parseInt(String(height), 10) || 34;
  const iconSize = Math.round(numericHeight * 0.95);
  const fontSize = Math.round(numericHeight * 0.58);

  if (variant === 'icon') {
    return (
      <img
        src={iconSrc}
        alt={alt}
        height={numericHeight}
        width={numericHeight}
        className={className}
        style={{
          height: `${numericHeight}px`,
          width: `${numericHeight}px`,
          display: 'block',
          objectFit: 'contain',
          userSelect: 'none',
          ...style,
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.max(6, Math.round(numericHeight * 0.22))}px`,
        textDecoration: 'none',
        userSelect: 'none',
        lineHeight: 1,
        ...style,
      }}
    >
      <img
        src={iconSrc}
        alt=""
        style={{
          height: `${iconSize}px`,
          width: `${iconSize}px`,
          display: 'block',
          objectFit: 'contain',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-family)',
          fontSize: `${fontSize}px`,
          letterSpacing: '-0.02em',
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
            marginLeft: '1px',
          }}
        >
          Space
        </span>
      </span>
    </div>
  );
};
