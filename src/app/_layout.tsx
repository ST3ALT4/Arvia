import { DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { ArviaPalette } from '@/constants/theme';

const arviaTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: ArviaPalette.bg,
    card: ArviaPalette.bg2,
    text: ArviaPalette.text,
    border: ArviaPalette.border,
    primary: ArviaPalette.gold,
  },
};

export default function TabLayout() {
  return (
    <ThemeProvider value={arviaTheme}>
      <StatusBar style="light" />
      <AppTabs />
    </ThemeProvider>
  );
}
