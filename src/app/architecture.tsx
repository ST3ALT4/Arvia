import React from 'react';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionLabel } from '@/components/SectionLabel';
import { BlockDiagram } from '@/components/BlockDiagram';
import { ArviaPalette, BottomTabInset, Spacing } from '@/constants/theme';

export default function ArchitectureScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === 'web' ? Spacing.five : insets.top + Spacing.three,
          paddingBottom: Platform.OS === 'web' ? Spacing.six : insets.bottom + BottomTabInset + Spacing.four,
        },
      ]}
    >
      <SectionLabel title="SYSTEM BLOCK DIAGRAM" />
      <BlockDiagram />
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
    gap: 16,
  },
});
