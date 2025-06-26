import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';


const CreateProject = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>createProject</ThemedText>
    </ThemedView>
  );
};

export default CreateProject;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
