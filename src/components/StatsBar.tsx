import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ArviaPalette, Fonts } from '@/constants/theme';

interface StatCardData {
  label: string;
  value: string;
  subtitle: string;
  accentColor: string;
}

interface StatsBarProps {
  stats?: StatCardData[];
}

const emptyStats: StatCardData[] = [
  { label: 'CONFLICTS DETECTED', value: '—', subtitle: 'No data available', accentColor: ArviaPalette.gold },
  { label: 'SIGNALS ALIGNED', value: '—', subtitle: 'No data available', accentColor: ArviaPalette.cyan },
  { label: 'MODEL AGREEMENT', value: '—', subtitle: 'No data available', accentColor: ArviaPalette.red },
  { label: 'HEADLINES ANALYSED', value: '—', subtitle: 'No data available', accentColor: ArviaPalette.blue },
];

export function StatsBar({ stats }: StatsBarProps) {
  const data = stats && stats.length > 0 ? stats : emptyStats;

  return (
    <View style={styles.container}>
      {data.map((stat, index) => (
        <View key={index} style={styles.card}>
          <View style={[styles.accentBar, { backgroundColor: stat.accentColor }]} />
          <Text style={styles.label}>{stat.label}</Text>
          <Text style={[styles.value, { color: stat.accentColor }]}>{stat.value}</Text>
          <Text style={styles.subtitle}>{stat.subtitle}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: Platform.OS === 'web' ? 1 : undefined,
    width: Platform.OS === 'web' ? undefined : '47%' as unknown as number,
    minWidth: Platform.OS === 'web' ? 160 : undefined,
    backgroundColor: ArviaPalette.cardSolid,
    borderWidth: 1,
    borderColor: ArviaPalette.border,
    borderRadius: 8,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: ArviaPalette.muted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: Fonts.sans,
  },
  subtitle: {
    fontSize: 11,
    color: ArviaPalette.muted,
    fontFamily: Fonts.sans,
  },
});
