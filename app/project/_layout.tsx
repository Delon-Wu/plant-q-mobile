import { Stack } from 'expo-router';
import * as React from 'react';

const projectLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="createProject"
        options={{ headerTitle: '创建目标' }}
      />
    </Stack>
  );
};

export default projectLayout;
