import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { ArviaPalette, Fonts } from '@/constants/theme';

interface DiagramBlock {
  title: string;
  sub: string;
  type: 'data' | 'process' | 'core' | 'output' | 'ui';
}

interface DiagramLayer {
  title: string;
  type: 'data' | 'process' | 'core' | 'output' | 'ui';
  groups?: { label: string; blocks: DiagramBlock[] }[];
  blocks?: DiagramBlock[];
}

interface BlockDiagramProps {
  layers?: DiagramLayer[];
}

const typeColors: Record<string, { bg: string; border: string; titleBg: string; titleColor: string }> = {
  data: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.4)', titleBg: 'rgba(59,130,246,0.2)', titleColor: '#93c5fd' },
  process: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.4)', titleBg: 'rgba(139,92,246,0.2)', titleColor: '#c4b5fd' },
  core: { bg: 'rgba(240,180,41,0.1)', border: 'rgba(240,180,41,0.5)', titleBg: 'rgba(240,180,41,0.2)', titleColor: ArviaPalette.gold },
  output: { bg: 'rgba(6,214,160,0.08)', border: 'rgba(6,214,160,0.4)', titleBg: 'rgba(6,214,160,0.2)', titleColor: ArviaPalette.cyan },
  ui: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.4)', titleBg: 'rgba(99,102,241,0.2)', titleColor: '#a5b4fc' },
};

const legendItems = [
  { color: 'rgba(59,130,246,0.6)', label: 'Data Layer' },
  { color: 'rgba(139,92,246,0.6)', label: 'AI Processing' },
  { color: 'rgba(240,180,41,0.6)', label: 'Core Innovation' },
  { color: 'rgba(6,214,160,0.6)', label: 'Explanation' },
  { color: 'rgba(99,102,241,0.6)', label: 'User Interface' },
];

function Block({ block }: { block: DiagramBlock }) {
  const colors = typeColors[block.type];
  return (
    <View style={[styles.block, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.blockTitle, { color: colors.titleColor }]}>{block.title}</Text>
      <Text style={styles.blockSub}>{block.sub}</Text>
    </View>
  );
}

function Arrow() {
  return <Text style={styles.arrow}>→</Text>;
}

function BigArrow() {
  return <Text style={styles.bigArrow}>↓</Text>;
}

export function BlockDiagram({ layers }: BlockDiagramProps) {
  const isEmpty = !layers || layers.length === 0;

  return (
    <View style={styles.outerContainer}>
      <ScrollView horizontal={Platform.OS !== 'web'} showsHorizontalScrollIndicator={false}>
        <View style={styles.diagram}>
          {isEmpty ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏗️</Text>
              <Text style={styles.emptyText}>Architecture diagram</Text>
              <Text style={styles.emptySubtext}>System architecture will be displayed here</Text>
            </View>
          ) : (
            layers.map((layer, li) => {
              const colors = typeColors[layer.type];
              return (
                <React.Fragment key={li}>
                  {li > 0 && <BigArrow />}
                  <View style={[styles.section, { borderColor: colors.border }]}>
                    <View style={[styles.sectionTitleBg, { backgroundColor: colors.titleBg }]}>
                      <Text style={[styles.sectionTitle, { color: colors.titleColor }]}>{layer.title}</Text>
                    </View>
                    <View style={styles.sectionContent}>
                      {layer.groups
                        ? layer.groups.map((group, gi) => (
                            <React.Fragment key={gi}>
                              {gi > 0 && <Arrow />}
                              <View style={styles.group}>
                                <Text style={styles.groupLabel}>{group.label}</Text>
                                <View style={styles.groupRow}>
                                  {group.blocks.map((block, bi) => (
                                    <Block key={bi} block={block} />
                                  ))}
                                </View>
                              </View>
                            </React.Fragment>
                          ))
                        : layer.blocks?.map((block, bi) => (
                            <React.Fragment key={bi}>
                              {bi > 0 && <Arrow />}
                              <Block block={block} />
                            </React.Fragment>
                          ))}
                    </View>
                  </View>
                </React.Fragment>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        {legendItems.map((item, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { backgroundColor: ArviaPalette.cardSolid, borderWidth: 1, borderColor: ArviaPalette.border, borderRadius: 12, padding: 24 },
  diagram: { minWidth: 700, gap: 0 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 16, color: ArviaPalette.text, fontWeight: '500' },
  emptySubtext: { fontSize: 12, color: ArviaPalette.muted },
  section: { borderWidth: 1, borderRadius: 10, padding: 16, position: 'relative', marginTop: 12 },
  sectionTitleBg: { position: 'absolute', top: -10, left: 16, paddingVertical: 2, paddingHorizontal: 8, borderRadius: 3 },
  sectionTitle: { fontFamily: Fonts.mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' },
  sectionContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 8 },
  group: { alignItems: 'center', gap: 6 },
  groupLabel: { fontFamily: Fonts.mono, fontSize: 9, letterSpacing: 2, color: ArviaPalette.muted, textTransform: 'uppercase' },
  groupRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  block: { borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center', minWidth: 90 },
  blockTitle: { fontFamily: Fonts.mono, fontSize: 11, fontWeight: '600', marginBottom: 4 },
  blockSub: { fontSize: 10, color: ArviaPalette.muted, textAlign: 'center', lineHeight: 14 },
  arrow: { color: ArviaPalette.muted, fontSize: 14, paddingHorizontal: 4, alignSelf: 'center' },
  bigArrow: { textAlign: 'center', color: ArviaPalette.muted, fontSize: 22, paddingVertical: 4 },
  legend: { flexDirection: 'row', gap: 20, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 11, color: ArviaPalette.muted },
});
