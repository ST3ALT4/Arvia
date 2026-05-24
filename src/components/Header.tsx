import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArviaPalette, Fonts } from '@/constants/theme';

export function Header() {
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 16 : insets.top + 8 }]}>
      <View>
        <Text style={styles.logo}>ARVIA</Text>
        <Text style={styles.logoSub}>SIGNAL CONFLICT EXPLANATION SYSTEM</Text>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
          <Text style={styles.liveBadgeText}>NSE LIVE</Text>
        </View>
        <View style={styles.sebiBadge}>
          <Text style={styles.sebiBadgeText}>⚖ SEBI COMPLIANT · EXPLANATORY ONLY</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: ArviaPalette.border,
    backgroundColor: 'rgba(6,10,16,0.92)',
  },
  logo: {
    fontFamily: Fonts.sans,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 3,
    color: ArviaPalette.gold,
  },
  logoSub: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: ArviaPalette.muted,
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(6,214,160,0.3)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ArviaPalette.cyan,
  },
  liveBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: ArviaPalette.cyan,
  },
  sebiBadge: {
    borderWidth: 1,
    borderColor: ArviaPalette.border,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  sebiBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: ArviaPalette.muted,
  },
});
