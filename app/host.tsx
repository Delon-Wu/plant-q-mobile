import ThemedText from "@/components/ThemedText";
import ThemedView from "@/components/ThemedView";
import { useState } from "react";
import { Button, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../src/store";
import { setHost } from "../src/store/settingsSlice";

export default function Host() {
  const dispatch = useDispatch();
  const host = useSelector((state: RootState) => state.settings.host);
  const [input, setInput] = useState(host);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch(setHost(input));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <ThemedView style={{ padding: 20 }}>
      <ThemedText>更换服务器地址</ThemedText>
      <TextInput
        label="服务器地址"
        value={input}
        onChangeText={setInput}
        style={{ marginVertical: 16 }}
        mode="outlined"
        placeholder="例如：http://0.0.0.0:8000"
      />
      <Button mode="contained" onPress={handleSave} style={{ marginBottom: 8 }}>
        保存
      </Button>
      {saved && <ThemedText style={{ color: 'green' }}>已保存！</ThemedText>}
    </ThemedView>
  );
}