// Theme configuration for consistent design
export const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    accent: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    glow: '0 0 20px rgba(14, 165, 233, 0.4)',
  },
  animations: {
    fadeIn: 'fadeIn 0.5s ease-in-out',
    slideUp: 'slideUp 0.4s ease-out',
    slideDown: 'slideDown 0.4s ease-out',
    scaleIn: 'scaleIn 0.3s ease-out',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
};

export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
};
