import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArviaPalette, Fonts } from '@/constants/theme';

interface SectionLabelProps {
  title: string;
}

export function SectionLabel({ title }: SectionLabelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  text: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 3,
    color: ArviaPalette.gold,
    textTransform: 'uppercase',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(240,180,41,0.3)',
  },
});
