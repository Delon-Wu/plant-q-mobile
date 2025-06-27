import { useThemeColor } from '@/hooks/useTheme';
import { Stack } from 'expo-router';
import * as React from 'react';

const TaskLayout = () => {
  const colors = useThemeColor();
  return (
    <Stack>
      <Stack.Screen
        name="createTask"
        options={{ headerTintColor: colors.text, headerTitle: '创建任务', headerStyle: { backgroundColor: colors.background }}}
      />
    </Stack>
  );
};

export default TaskLayout;
