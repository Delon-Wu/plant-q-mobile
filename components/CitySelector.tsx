// components/CitySelector.tsx
import ThemedScrollView from "@/components/ThemedScrollView";
import { pcTextArr } from "element-china-area-data";
import React, { useState } from "react";
import { Text } from "react-native";
import { Searchbar } from "react-native-paper";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
} from "./ui/actionsheet";

type CitySelectorProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (data: { province: string; city: string }) => void;
};

const getProvinces = () => {
  return pcTextArr.map((prov) => prov.value);
};

const getCitiesByProvince = (province: string) => {
  const prov = pcTextArr.find((p) => p.value === province);
  return prov?.children?.map((city) => city.value) || [];
};

const CitySelector: React.FC<CitySelectorProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // 省份筛选
  const provinces = getProvinces().filter((prov) => prov.includes(search));
  // 城市筛选
  const cities = selectedProvince
    ? getCitiesByProvince(selectedProvince).filter((city) =>
        city.includes(search)
      )
    : [];

  return (
    <Actionsheet
      isOpen={visible}
      onClose={() => {
        setSelectedProvince(null);
        setSearch("");
        onClose();
      }}
    >
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <Searchbar
          placeholder={
            selectedProvince ? `搜索${selectedProvince}的城市` : "搜索省份"
          }
          value={search}
          onChangeText={setSearch}
          style={{ marginBottom: 8 }}
        />
        {selectedProvince && (
          <ActionsheetItem
            onPress={() => {
              setSelectedProvince(null);
              setSearch("");
            }}
            style={{ backgroundColor: "#f5f5f5" }}
          >
            <Text style={{ fontWeight: "bold" }}>← 返回省份列表</Text>
          </ActionsheetItem>
        )}
        <ThemedScrollView style={{ maxHeight: 400, width: '100%' }}>
          {!selectedProvince
            ? provinces.map((item, idx) => (
                <ActionsheetItem
                  key={item}
                  onPress={() => {
                    setSelectedProvince(item);
                    setSearch("");
                  }}
                >
                  <ActionsheetItemText>{item}</ActionsheetItemText>
                </ActionsheetItem>
              ))
            : cities.map((item, idx) => (
                <ActionsheetItem
                  key={item}
                  onPress={() => {
                    onSelect({ province: selectedProvince, city: item });
                    setSelectedProvince(null);
                    setSearch("");
                    onClose();
                  }}
                >
                  <ActionsheetItemText>{item}</ActionsheetItemText>
                </ActionsheetItem>
              ))}
        </ThemedScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default CitySelector;
