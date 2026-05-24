import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ArviaPalette, Fonts } from '@/constants/theme';

export interface SentimentModelData {
  name: string;
  type: string;
  fillPercent: number;
  fillColor: string;
  label: string;
  labelColor: string;
}

interface SentimentModelsProps {
  models?: SentimentModelData[];
  agreementPercent?: string;
  agreementNote?: string;
}

function SentimentBar({ fillPercent, fillColor }: { fillPercent: number; fillColor: string }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: fillPercent,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [fillPercent, widthAnim]);

  return (
    <View style={styles.barBg}>
      <Animated.View
        style={[
          styles.barFill,
          {
            backgroundColor: fillColor,
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

export function SentimentModels({ models, agreementPercent, agreementNote }: SentimentModelsProps) {
  const isEmpty = !models || models.length === 0;

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>SENTIMENT MODELS</Text>
      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤖</Text>
          <Text style={styles.emptyText}>No model data</Text>
          <Text style={styles.emptySubtext}>Sentiment analysis results will appear here</Text>
        </View>
      ) : (
        <>
          {models.map((model, i) => (
            <View key={i} style={[styles.modelRow, i === models.length - 1 && styles.modelRowLast]}>
              <View style={styles.modelInfo}>
                <Text style={styles.modelName}>{model.name}</Text>
                <Text style={styles.modelType}>{model.type}</Text>
              </View>
              <View style={styles.barWrap}>
                <SentimentBar fillPercent={model.fillPercent} fillColor={model.fillColor} />
              </View>
              <Text style={[styles.sentimentLabel, { color: model.labelColor }]}>{model.label}</Text>
            </View>
          ))}
          {agreementPercent && (
            <View style={styles.agreementBox}>
              <Text style={styles.agreementLabel}>MODEL AGREEMENT</Text>
              <Text style={styles.agreementValue}>{agreementPercent}</Text>
              {agreementNote && <Text style={styles.agreementNote}>{agreementNote}</Text>}
            </View>
          )}
        </>
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
  modelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: ArviaPalette.border },
  modelRowLast: { borderBottomWidth: 0 },
  modelInfo: { width: 80 },
  modelName: { fontSize: 12, fontWeight: '500', color: ArviaPalette.text },
  modelType: { fontSize: 10, color: ArviaPalette.muted },
  barWrap: { flex: 1, marginHorizontal: 12 },
  barBg: { height: 4, borderRadius: 2, backgroundColor: ArviaPalette.border, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  sentimentLabel: { fontFamily: Fonts.mono, fontSize: 10, minWidth: 60, textAlign: 'right' },
  agreementBox: { marginTop: 14, padding: 10, backgroundColor: 'rgba(240,180,41,0.05)', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(240,180,41,0.2)' },
  agreementLabel: { fontFamily: Fonts.mono, fontSize: 10, color: ArviaPalette.gold, marginBottom: 4 },
  agreementValue: { fontSize: 22, fontWeight: '700', color: ArviaPalette.gold },
  agreementNote: { fontSize: 10, color: ArviaPalette.muted, marginTop: 2 },
});
