import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { ArviaPalette, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Dashboard</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Detail</TabButton>
          </TabTrigger>
          <TabTrigger name="architecture" href="/architecture" asChild>
            <TabButton>Architecture</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.tabButtonView,
          isFocused ? styles.tabActive : styles.tabInactive,
        ]}
      >
        <Text
          style={[
            styles.tabText,
            { color: isFocused ? '#000' : ArviaPalette.muted },
            isFocused && styles.tabTextActive,
          ]}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>
        <Text style={styles.brandText}>ARVIA</Text>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    backgroundColor: ArviaPalette.bg2,
    borderWidth: 1,
    borderColor: ArviaPalette.border,
  },
  brandText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    color: ArviaPalette.gold,
    letterSpacing: 3,
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: ArviaPalette.gold,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
  },
  tabTextActive: {
    fontWeight: '700',
  },
});
