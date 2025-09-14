import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSurahs, Surah } from "../database/db";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function SurahList() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState("");
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [surahsWithBookmarks, setSurahsWithBookmarks] = useState<number[]>([]);

  const navigation = useNavigation<any>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Surah List",
      headerStyle: { backgroundColor: "#1E1E1E" },
      headerTintColor: "#FFD700",
      headerTitleStyle: { fontFamily: "Amiri-Regular", fontSize: 20 },
    });
  }, [navigation]);

  useEffect(() => {
    getSurahs((data) => {
      setSurahs(data);
      setFilteredSurahs(data);
    });
  }, []);

  useEffect(() => {
    if (search.trim() === "") setFilteredSurahs(surahs);
    else {
      const filtered = surahs.filter(
        (s) =>
          s.name.includes(search) ||
          s.transliteration.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredSurahs(filtered);
    }
  }, [search, surahs]);

  const loadBookmarksForAllSurahs = async () => {
    try {
      const bookmarkedSurahs: number[] = [];
      for (const s of surahs) {
        const saved = await AsyncStorage.getItem(`bookmarks_${s.id}`);
        if (saved) {
          const arr = JSON.parse(saved) as { surahId: number; ayahIndex: number }[];
          if (arr.length > 0) bookmarkedSurahs.push(s.id);
        }
      }
      setSurahsWithBookmarks(bookmarkedSurahs);
    } catch (e) {
      console.error("Error loading bookmarks for surahs:", e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (surahs.length > 0) loadBookmarksForAllSurahs();
    }, [surahs])
  );

  const renderItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={async () => {
        // Get first bookmarked ayah
        const saved = await AsyncStorage.getItem(`bookmarks_${item.id}`);
        const bookmarks = saved ? JSON.parse(saved) : [];
        const firstBookmarkIndex =
          bookmarks.length > 0 ? bookmarks[0].ayahIndex : undefined;

        navigation.navigate("SurahDetail", {
          id: item.id,
          name: item.name,
          scrollToAyah: firstBookmarkIndex,
        });
      }}
    >
      <Text style={styles.surahName}>{item.name}</Text>
      <Text style={styles.transliteration}>{item.transliteration}</Text>
      <Text style={styles.favoriteText}>
        {surahsWithBookmarks.includes(item.id) ? "⭐" : "☆"}
      </Text>
    </TouchableOpacity>
  );

  const SupportSection = () => (
    <View style={styles.supportContainer}>
      <Text style={styles.supportText}>
        Support Us: GooglePay/PhonePe +91 97455 25150
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SupportSection />
      <TextInput
        style={styles.searchInput}
        placeholder="Search Surah..."
        placeholderTextColor="#555"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 16 },
  searchInput: {
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#000",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  card: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    alignItems: "center",
  },
  surahName: { fontFamily: "Amiri-Regular", fontSize: 22, textAlign: "center", color: "#ffffff" },
  transliteration: { fontSize: 16, textAlign: "center", color: "#E63946", marginTop: 6, fontStyle: "italic" },
  favoriteText: { fontSize: 30, color: "#FFD700", position: "absolute", top: 12, right: 12 },
  supportContainer: { paddingBottom: 6, marginBottom: 6, alignItems: "center" },
  supportText: { fontSize: 12, color: "#aaa" },
});
