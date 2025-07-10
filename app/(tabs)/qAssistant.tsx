import ThemedText from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import * as React from 'react';
import { StyleSheet } from 'react-native';

const QAssistant = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>QAssistant</ThemedText>
    </ThemedView>
  );
};

export default QAssistant;

const styles = StyleSheet.create({
  container: {}
});
