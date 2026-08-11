/**
 * @format
 */

import { ChartLine } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

function AnalysisScreen() {
  return (
    <View style={styles.container}>
      <ChartLine color="#6b7280" size={40} />
      <Text style={styles.title}>Nothing to analyze yet</Text>
      <Text style={styles.subtitle}>
        Analysis of the collected logs will show up here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AnalysisScreen;
