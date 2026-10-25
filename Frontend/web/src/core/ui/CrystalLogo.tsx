import React from 'react';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../../assets/crystal-logo-dark.svg';
import logoLight from '../../assets/crystal-logo-light.svg';
import iconDark from '../../assets/crystal-icon.svg';

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
  height = 36,
  className,
  style,
  alt = 'Crystal Workspace',
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

  let src = logoDark;
  if (variant === 'icon') {
    src = iconDark;
  } else {
    src = resolvedTheme === 'light' ? logoLight : logoDark;
  }

  return (
    <img
      src={src}
      alt={alt}
      height={height}
      className={className}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
        userSelect: 'none',
        ...style,
      }}
    />
  );
};
