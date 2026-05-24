import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ArviaPalette, Fonts } from '@/constants/theme';

export interface WatchListStock {
  ticker: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  changePositive: boolean;
  hasConflict: boolean;
  iconColor: string;
}

interface WatchListProps {
  stocks?: WatchListStock[];
  onStockPress?: (stock: WatchListStock) => void;
}

export function WatchList({ stocks, onStockPress }: WatchListProps) {
  const isEmpty = !stocks || stocks.length === 0;

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>WATCHLIST</Text>
        <Text style={styles.panelBadge}>NSE</Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No stocks in watchlist</Text>
          <Text style={styles.emptySubtext}>Stocks will appear here when data is available</Text>
        </View>
      ) : (
        stocks.map((stock, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.stockItem,
              pressed && styles.stockItemPressed,
              index === stocks.length - 1 && styles.stockItemLast,
            ]}
            onPress={() => onStockPress?.(stock)}
          >
            <View style={styles.stockLeft}>
              <View
                style={[
                  styles.conflictDot,
                  { backgroundColor: stock.hasConflict ? ArviaPalette.gold : ArviaPalette.cyan },
                ]}
              />
              <View style={[styles.stockIcon, { backgroundColor: stock.iconColor + '1A' }]}>
                <Text style={[styles.stockIconText, { color: stock.iconColor }]}>
                  {stock.ticker}
                </Text>
              </View>
              <View>
                <Text style={styles.stockName}>{stock.name}</Text>
                <Text style={styles.stockSector}>{stock.sector}</Text>
              </View>
            </View>
            <View style={styles.stockRight}>
              <Text style={styles.stockPrice}>{stock.price}</Text>
              <Text
                style={[
                  styles.stockChange,
                  { color: stock.changePositive ? ArviaPalette.cyan : ArviaPalette.red },
                ]}
              >
                {stock.change}
              </Text>
            </View>
          </Pressable>
        ))
      )}

      {!isEmpty && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>LEGEND</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: ArviaPalette.gold }]} />
              <Text style={styles.legendText}>Conflict</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: ArviaPalette.cyan }]} />
              <Text style={styles.legendText}>Aligned</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: ArviaPalette.cardSolid,
    borderWidth: 1,
    borderColor: ArviaPalette.border,
    borderRadius: 10,
    padding: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: ArviaPalette.muted,
    textTransform: 'uppercase',
  },
  panelBadge: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: ArviaPalette.gold,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: ArviaPalette.text,
    fontWeight: '500',
  },
  emptySubtext: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: ArviaPalette.muted,
    textAlign: 'center',
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ArviaPalette.border,
  },
  stockItemPressed: {
    paddingLeft: 8,
  },
  stockItemLast: {
    borderBottomWidth: 0,
  },
  stockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  conflictDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockIcon: {
    width: 34,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockIconText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '700',
  },
  stockName: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '500',
    color: ArviaPalette.text,
  },
  stockSector: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: ArviaPalette.muted,
    marginTop: 2,
  },
  stockRight: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: ArviaPalette.text,
  },
  stockChange: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    marginTop: 2,
  },
  legend: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ArviaPalette.border,
  },
  legendTitle: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: ArviaPalette.muted,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: ArviaPalette.muted,
  },
});
