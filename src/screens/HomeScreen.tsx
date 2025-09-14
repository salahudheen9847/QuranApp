// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getSurahs, Surah } from "../database/db";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: { navigation: HomeScreenNavigationProp }) {
  const [surahs, setSurahs] = useState<Surah[]>([]);

  useEffect(() => {
    getSurahs(setSurahs);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={surahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("SurahDetail", { id: item.id, name: item.name })}
            style={styles.surahItem}
          >
            <Text style={styles.surahName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  surahItem: { paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#ccc" },
  surahName: { fontSize: 20, fontFamily: "Amiri-Regular", textAlign: "center" },
});
