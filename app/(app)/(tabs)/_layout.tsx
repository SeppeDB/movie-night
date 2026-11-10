import { StyleSheet } from 'react-native';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { TabButton } from '../../../src/components/TabButton';
import { colors } from '../../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.slot} />
      <TabList style={styles.tabBar}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton icon="people-outline" activeIcon="people" label="Groups" />
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <TabButton icon="person-outline" activeIcon="person" label="Profile" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabs: { flex: 1 },
  slot: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
