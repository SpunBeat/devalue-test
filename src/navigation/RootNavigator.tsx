/**
 * @format
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { ChartLine, ScrollText } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import AnalysisScreen from '../screens/AnalysisScreen';
import LogListScreen from '../screens/LogListScreen';
import { colors, radii, spacing, typography } from '../theme';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

type TabIconProps = { color: string; focused: boolean };

/** Icon sits in a small rounded square that fills with indigo-50 when active. */
function TabIcon({
  Icon,
  color,
  focused,
}: TabIconProps & { Icon: LucideIcon }) {
  return (
    <View style={[styles.iconTile, focused && styles.iconTileActive]}>
      <Icon color={color} size={18} />
    </View>
  );
}

function LogTabIcon(props: TabIconProps) {
  return <TabIcon {...props} Icon={ScrollText} />;
}

function AnalysisTabIcon(props: TabIconProps) {
  return <TabIcon {...props} Icon={ChartLine} />;
}

function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Log"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
        }}>
        <Tab.Screen
          name="Log"
          component={LogListScreen}
          options={{ title: 'Log', tabBarIcon: LogTabIcon }}
        />
        <Tab.Screen
          name="Analysis"
          component={AnalysisScreen}
          options={{ title: 'Analysis', tabBarIcon: AnalysisTabIcon }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
  tabItem: {
    paddingVertical: spacing.xs,
  },
  tabLabel: typography.label,
  iconTile: {
    alignItems: 'center',
    borderRadius: radii.sm,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  iconTileActive: {
    backgroundColor: colors.primaryLight,
  },
});

export default RootNavigator;
