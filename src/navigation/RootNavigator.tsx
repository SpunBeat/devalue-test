/**
 * @format
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { ChartLine, ScrollText } from 'lucide-react-native';

import AnalysisScreen from '../screens/AnalysisScreen';
import LogListScreen from '../screens/LogListScreen';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

type TabIconProps = { color: string; size: number };

function LogTabIcon({ color, size }: TabIconProps) {
  return <ScrollText color={color} size={size} />;
}

function AnalysisTabIcon({ color, size }: TabIconProps) {
  return <ChartLine color={color} size={size} />;
}

function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Log"
        screenOptions={{
          tabBarActiveTintColor: '#1f6feb',
          tabBarInactiveTintColor: '#6b7280',
        }}>
        <Tab.Screen
          name="Log"
          component={LogListScreen}
          options={{
            title: 'Log',
            tabBarIcon: LogTabIcon,
          }}
        />
        <Tab.Screen
          name="Analysis"
          component={AnalysisScreen}
          options={{
            title: 'Analysis',
            tabBarIcon: AnalysisTabIcon,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
