import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArviaPalette, Fonts } from '@/constants/theme';

export interface ConflictData {
  type: 'warning' | 'clear';
  title: string;
  subtitle: string;
  explanation: string;
  disclaimer: string;
  priceTrend: string;
  newsSentiment: string;
}

interface ConflictBoxProps {
  data?: ConflictData;
}

export function ConflictBox({ data }: ConflictBoxProps) {
  if (!data) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚡</Text>
          <Text style={styles.emptyText}>No conflicts detected</Text>
          <Text style={styles.emptySubtext}>Signal conflict analysis will appear here</Text>
        </View>
      </View>
    );
  }

  const isWarning = data.type === 'warning';
  return (
    <View style={[styles.container, isWarning ? styles.warning : styles.clear]}>
      <View style={styles.header}>
        <Text style={styles.icon}>⚡</Text>
        <View>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>{data.subtitle}</Text>
        </View>
      </View>
      <Text style={styles.explanation}>{data.explanation}</Text>
      <Text style={styles.disclaimer}>{data.disclaimer}</Text>
      <View style={styles.signalRow}>
        <View style={[styles.pill, styles.pillUp]}>
          <Text style={styles.pillUpText}>{data.priceTrend}</Text>
        </View>
        <Text style={styles.conflictSymbol}>⚡</Text>
        <View style={[styles.pill, styles.pillDown]}>
          <Text style={styles.pillDownText}>{data.newsSentiment}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 10, padding: 20, borderWidth: 1, overflow: 'hidden' },
  warning: { backgroundColor: 'rgba(240,180,41,0.05)', borderColor: 'rgba(240,180,41,0.4)' },
  clear: { backgroundColor: 'rgba(6,214,160,0.05)', borderColor: 'rgba(6,214,160,0.3)' },
  emptyContainer: { backgroundColor: ArviaPalette.cardSolid, borderColor: ArviaPalette.border },
  emptyState: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 14, color: ArviaPalette.text, fontWeight: '500' },
  emptySubtext: { fontSize: 12, color: ArviaPalette.muted, textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  icon: { fontSize: 20 },
  title: { fontFamily: Fonts.mono, fontSize: 13, fontWeight: '600', color: ArviaPalette.text },
  subtitle: { fontSize: 10, color: ArviaPalette.muted, marginTop: 2 },
  explanation: { fontSize: 13, lineHeight: 20, color: '#94a3b8', marginBottom: 16 },
  disclaimer: { fontSize: 10, color: ArviaPalette.muted, fontStyle: 'italic', marginBottom: 8 },
  signalRow: { flexDirection: 'row', gap: 10, marginTop: 14, alignItems: 'center' },
  pill: { flex: 1, padding: 8, borderRadius: 6, alignItems: 'center', borderWidth: 1 },
  pillUp: { backgroundColor: 'rgba(6,214,160,0.1)', borderColor: 'rgba(6,214,160,0.3)' },
  pillUpText: { fontFamily: Fonts.mono, fontSize: 11, color: ArviaPalette.cyan },
  pillDown: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' },
  pillDownText: { fontFamily: Fonts.mono, fontSize: 11, color: ArviaPalette.red },
  conflictSymbol: { fontSize: 18, color: ArviaPalette.gold },
});
