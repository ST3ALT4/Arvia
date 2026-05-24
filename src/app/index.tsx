import React from 'react';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { StatsBar } from '@/components/StatsBar';
import { WatchList } from '@/components/WatchList';
import { ArviaPalette, BottomTabInset, Spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Platform.OS === 'web' ? Spacing.six : insets.bottom + BottomTabInset + Spacing.four },
      ]}
    >
      <Header />
      <SectionLabel title="MARKET OVERVIEW" />
      <StatsBar />
      <WatchList />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: ArviaPalette.bg,
  },
  content: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16,
    paddingTop: Platform.OS === 'web' ? 0 : 0,
    gap: 20,
  },
});
