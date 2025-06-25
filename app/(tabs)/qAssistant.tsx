import { ThemedView } from '@/components/ThemedView';
import * as React from 'react';
import { StyleSheet, Text } from 'react-native';

const QAssistant = () => {
  return (
    <ThemedView style={styles.container}>
      <Text>QAssistant</Text>
    </ThemedView>
  );
};

export default QAssistant;

const styles = StyleSheet.create({
  container: {}
});
