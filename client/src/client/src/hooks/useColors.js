import { useTheme } from '../context/ThemeContext';

export const useColors = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return {
    bg: dark ? '#0f0f1a' : '#f0f4ff',
    surface: dark ? '#13131f' : '#ffffff',
    border: dark ? '#2a2a3d' : '#e0e0e0',
    text: dark ? '#e2e8f0' : '#1a1a2e',
    subtext: dark ? '#6b7280' : '#888888',
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    error: dark ? '#1f1520' : '#fff0f0',
    errorText: '#e53e3e',
    cardBg: dark ? '#13131f' : '#ffffff',
    inputBg: dark ? '#0f0f1a' : '#ffffff',
    navBg: dark ? '#13131f' : '#ffffff',
    shadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
  };
};