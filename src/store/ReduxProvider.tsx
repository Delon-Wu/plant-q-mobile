import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from ".";

interface Props {
  children: React.ReactNode;
}

const LoadingComponent = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

export default function ReduxProvider({ children }: Props) {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={<LoadingComponent />} 
        persistor={persistor}
        onBeforeLift={() => {
          // 在持久化状态恢复前的处理
          console.log('Redux persist: About to restore state');
        }}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
