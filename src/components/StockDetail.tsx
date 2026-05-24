import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArviaPalette, Fonts } from '@/constants/theme';

export interface StockDetailData {
  name: string;
  ticker: string;
  exchange: string;
  sector: string;
  price: string;
  change: string;
  changePercent: string;
  changePositive: boolean;
  chartBars?: { height: number; color: string }[];
  chartLabels?: string[];
  indicators?: { label: string; value: string; status: string; statusColor: string; valueColor: string }[];
}

interface StockDetailProps {
  data?: StockDetailData;
}

export function StockDetail({ data }: StockDetailProps) {
  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>No stock selected</Text>
          <Text style={styles.emptySubtext}>Select a stock from the watchlist to view details</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stockHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.stockTitle}>{data.name}</Text>
          <Text style={styles.stockMeta}>{data.ticker} · {data.exchange} · {data.sector}</Text>
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.priceBig}>{data.price}</Text>
          <Text style={[styles.priceChange, { color: data.changePositive ? ArviaPalette.cyan : ArviaPalette.red }]}>
            {data.changePositive ? '▲' : '▼'} {data.change} ({data.changePercent}) today
          </Text>
        </View>
      </View>

      {data.chartBars && data.chartBars.length > 0 && (
        <View style={styles.miniChart}>
          {data.chartBars.map((bar, i) => (
            <View key={i} style={[styles.bar, { height: bar.height, backgroundColor: bar.color }]} />
          ))}
        </View>
      )}

      {data.indicators && data.indicators.length > 0 && (
        <View style={styles.indicators}>
          {data.indicators.map((ind, i) => (
            <View key={i} style={styles.indicator}>
              <Text style={styles.indLabel}>{ind.label}</Text>
              <Text style={[styles.indValue, { color: ind.valueColor }]}>{ind.value}</Text>
              <Text style={[styles.indStatus, { color: ind.statusColor }]}>{ind.status}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: ArviaPalette.cardSolid, borderWidth: 1, borderColor: ArviaPalette.border, borderRadius: 10, padding: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 14, color: ArviaPalette.text, fontWeight: '500' },
  emptySubtext: { fontSize: 12, color: ArviaPalette.muted, textAlign: 'center' },
  stockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  stockTitle: { fontSize: 20, fontWeight: '600', color: ArviaPalette.text },
  stockMeta: { fontSize: 11, color: ArviaPalette.muted, marginTop: 4 },
  priceSection: { alignItems: 'flex-end' },
  priceBig: { fontFamily: Fonts.mono, fontSize: 28, fontWeight: '700', color: ArviaPalette.gold },
  priceChange: { fontSize: 13, marginTop: 4 },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 60, marginBottom: 16 },
  bar: { flex: 1, borderTopLeftRadius: 3, borderTopRightRadius: 3, minHeight: 4 },
  indicators: { flexDirection: 'row', gap: 12, marginTop: 8 },
  indicator: { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: ArviaPalette.border, borderRadius: 6, padding: 12, alignItems: 'center' },
  indLabel: { fontFamily: Fonts.mono, fontSize: 9, color: ArviaPalette.muted, letterSpacing: 1 },
  indValue: { fontSize: 18, fontWeight: '600', marginVertical: 4 },
  indStatus: { fontSize: 10 },
});
