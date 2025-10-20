const palette = {
  background: '#E9E8E8',
  surface: '#0F2E32',
  surfaceMuted: '#1E5560',
  surfaceAlt: '#173A3F',
  primary: '#0E5258',
  primaryDark: '#0A3C42',
  primaryLight: '#147179',
  primaryText: '#FFFFFF',
  secondary: '#B59B6D',
  accent: '#C9A646',
  success: '#2E9E63',
  danger: '#D24A43',
  warning: '#D88C2B',
  info: '#1A7F99',
  border: '#1F4A50',
  outline: '#225B62',
  muted: '#5E7C80',
  mutedAlt: '#94A7AA',
  subtleText: '#0F3E48',
  solid: '#FFFFFF',
  overlay: 'rgba(7, 21, 23, 0.92)'
};

const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  full: 999
};

const typography = {
  display: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 40
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.3,
    lineHeight: 32
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 28
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.1,
    lineHeight: 26
  },
  body: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22
  },
  secondary: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22
  },
  caption: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18
  },
  micro: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16
  }
};

const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12
  },
  sheet: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 18
  }
};

export const theme = {
  palette,
  spacing,
  radius,
  typography,
  shadows
};

export default theme;
