export type ThemeOption = {
  id: string
  name: string
  colors: Partial<{
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    border: string
    input: string
    ring: string
    [key: string]: string
  }>
  radius: {
    default: string
    large: string
    medium: string
    small: string
  }
}

export const themes: ThemeOption[] = [
  {
    id: 'default',
    name: '默认主题',
    colors: {
      // primary: '221.2 83.2% 53.3%',
      // secondary: '210 40% 96.1%',
      // accent: '210 40% 96.1%',
      // background: '0 0% 100%',
      // foreground: '222.2 84% 4.9%',
      // card: '0 0% 100%',
      // cardForeground: '222.2 84% 4.9%',
      // border: '214.3 31.8% 91.4%',
      // input: '214.3 31.8% 91.4%',
      // ring: '221.2 83.2% 53.3%',
    },
    radius: {
      default: '0.5rem',
      large: '0.75rem',
      medium: '0.5rem',
      small: '0.25rem',
    },
  },
  {
    id: 'modern',
    name: '现代主题',
    colors: {
      // primary: '262.1 83.3% 57.8%', // Purple
      // secondary: '262.1 49.7% 94.1%',
      // accent: '262.1 49.7% 94.1%',
      // background: '0 0% 100%',
      // foreground: '224 71.4% 4.1%',
      // card: '0 0% 100%',
      // cardForeground: '224 71.4% 4.1%',
      // border: '220 13% 91%',
      // input: '220 13% 91%',
      // ring: '262.1 83.3% 57.8%',
    },
    radius: {
      default: '1rem',
      large: '1.5rem',
      medium: '1rem',
      small: '0.5rem',
    },
  },
  {
    id: 'minimal',
    name: '极简主题',
    colors: {
      // primary: '0 0% 0%', // Black
      // secondary: '0 0% 96.1%',
      // accent: '0 0% 96.1%',
      // background: '0 0% 100%',
      // foreground: '0 0% 3.9%',
      // card: '0 0% 100%',
      // cardForeground: '0 0% 3.9%',
      // border: '0 0% 89.8%',
      // input: '0 0% 89.8%',
      // ring: '0 0% 0%',
    },
    radius: {
      default: '0',
      large: '0',
      medium: '0',
      small: '0',
    },
  },
  {
    id: 'colorful',
    name: '多彩主题',
    colors: {
      // primary: '142.1 76.2% 36.3%', // Green
      // secondary: '142.1 76.2% 90.1%',
      // accent: '26 83.3% 53.9%', // Orange
      // background: '0 0% 100%',
      // foreground: '20 14.3% 4.1%',
      // card: '0 0% 100%',
      // cardForeground: '20 14.3% 4.1%',
      // border: '220 13% 91%',
      // input: '220 13% 91%',
      // ring: '142.1 76.2% 36.3%',
    },
    radius: {
      default: '0.75rem',
      large: '1rem',
      medium: '0.75rem',
      small: '0.375rem',
    },
  },
  {
    id: 'soft',
    name: '柔和主题',
    colors: {
      // primary: '199 89% 48%', // Soft blue
      // secondary: '199 89% 94%',
      // accent: '199 89% 94%',
      // background: '210 40% 98%',
      // foreground: '222.2 47.4% 11.2%',
      // card: '0 0% 100%',
      // cardForeground: '222.2 47.4% 11.2%',
      // border: '214.3 31.8% 91.4%',
      // input: '214.3 31.8% 91.4%',
      // ring: '199 89% 48%',
    },
    radius: {
      default: '1.5rem',
      large: '2rem',
      medium: '1.5rem',
      small: '1rem',
    },
  },
]

export function getTheme(themeId: string): ThemeOption {
  return themes.find((theme) => theme.id === themeId) || themes[0]
}
