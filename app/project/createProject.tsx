import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, Text } from 'react-native';

interface createProjectProps {}

const createProject = (props: createProjectProps) => {
  return (
    <ThemedView style={styles.container}>
      <Text>createProject</Text>
    </ThemedView>
  );
};

export default createProject;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
