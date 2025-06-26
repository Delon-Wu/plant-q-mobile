import { useThemeColor } from '@/hooks/useTheme';
import { Stack } from 'expo-router';
import * as React from 'react';

const ProjectLayout = () => {
  const colors = useThemeColor();
  return (
    <Stack>
      <Stack.Screen
        name="createProject"
        options={{ headerTintColor: colors.text, headerTitle: '创建目标', headerStyle: { backgroundColor: colors.background }}}
      />
    </Stack>
  );
};

export default ProjectLayout;
