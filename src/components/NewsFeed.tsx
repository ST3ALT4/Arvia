import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArviaPalette, Fonts } from '@/constants/theme';

export interface NewsItemData {
  headline: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  source: string;
  time: string;
}

interface NewsFeedProps {
  items?: NewsItemData[];
}

const sentimentStyles: Record<string, { bg: string; color: string }> = {
  POSITIVE: { bg: 'rgba(6,214,160,0.1)', color: ArviaPalette.cyan },
  NEGATIVE: { bg: 'rgba(239,68,68,0.1)', color: ArviaPalette.red },
  NEUTRAL: { bg: 'rgba(100,116,139,0.1)', color: ArviaPalette.muted },
};

export function NewsFeed({ items }: NewsFeedProps) {
  const isEmpty = !items || items.length === 0;

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>LATEST NEWS</Text>
      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📰</Text>
          <Text style={styles.emptyText}>No news available</Text>
          <Text style={styles.emptySubtext}>Latest headlines will appear here</Text>
        </View>
      ) : (
        items.map((item, i) => {
          const sStyle = sentimentStyles[item.sentiment] || sentimentStyles.NEUTRAL;
          return (
            <View key={i} style={[styles.newsItem, i === items.length - 1 && styles.newsItemLast]}>
              <Text style={styles.headline}>{item.headline}</Text>
              <View style={styles.meta}>
                <View style={[styles.sentimentBadge, { backgroundColor: sStyle.bg }]}>
                  <Text style={[styles.sentimentText, { color: sStyle.color }]}>{item.sentiment}</Text>
                </View>
                <Text style={styles.sourceText}>{item.source} · {item.time}</Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: ArviaPalette.cardSolid, borderWidth: 1, borderColor: ArviaPalette.border, borderRadius: 10, padding: 20 },
  panelTitle: { fontFamily: Fonts.mono, fontSize: 11, letterSpacing: 2, color: ArviaPalette.muted, textTransform: 'uppercase', marginBottom: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 14, color: ArviaPalette.text, fontWeight: '500' },
  emptySubtext: { fontSize: 12, color: ArviaPalette.muted, textAlign: 'center' },
  newsItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: ArviaPalette.border },
  newsItemLast: { borderBottomWidth: 0 },
  headline: { fontSize: 12, lineHeight: 18, color: ArviaPalette.text, marginBottom: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sentimentBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 3 },
  sentimentText: { fontFamily: Fonts.mono, fontSize: 9 },
  sourceText: { fontSize: 10, color: ArviaPalette.muted },
});
