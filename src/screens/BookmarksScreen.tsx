import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

interface Bookmark {
  surahId: number;
  surahName: string;
  ayahIndex: number;
}

type BookmarksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Bookmarks">;

const BookmarksScreen: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const navigation = useNavigation<BookmarksScreenNavigationProp>();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem("bookmarks");
      if (stored) setBookmarks(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load bookmarks:", e);
    }
  };

  const goToBookmark = (bm: Bookmark) => {
    navigation.navigate("SurahDetail", {
      id: bm.surahId,
      name: bm.surahName,
      ayahIndex: bm.ayahIndex,
    });
  };

  const renderItem = ({ item }: { item: Bookmark }) => (
    <TouchableOpacity style={styles.card} onPress={() => goToBookmark(item)}>
      <Text style={styles.surahName}>{item.surahName}</Text>
      <Text style={styles.ayahIndex}>Ayah: {item.ayahIndex + 1}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {bookmarks.length === 0 ? (
        <Text style={styles.emptyText}>No bookmarks yet.</Text>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default BookmarksScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#121212" },
  card: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  surahName: { fontFamily: "Amiri-Regular", fontSize: 20, color: "#f5c518", textAlign: "center" },
  ayahIndex: { fontSize: 16, color: "#f5f5f5", textAlign: "center", marginTop: 4 },
  emptyText: { fontSize: 18, color: "#888", textAlign: "center", marginTop: 20 },
});
