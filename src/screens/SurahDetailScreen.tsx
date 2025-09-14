// src/screens/SurahDetailScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  InteractionManager,
} from "react-native";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import { getAyahsBySurah, Ayah } from "../database/db";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  route: { params: { id: number; name: string; scrollToAyah?: number } };
}

interface Bookmark {
  surahId: number;
  ayahIndex: number;
}

const SurahDetailScreen: React.FC<Props> = ({ route }) => {
  const { id, name, scrollToAyah } = route.params;
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [ayahPositions, setAyahPositions] = useState<number[]>([]);
  const [allMeasured, setAllMeasured] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  useEffect(() => {
    getAyahsBySurah(id, setAyahs);
    loadBookmarks();
  }, [id]);

  const loadBookmarks = async () => {
    try {
      const saved = await AsyncStorage.getItem(`bookmarks_${id}`);
      if (saved) setBookmarks(JSON.parse(saved));
    } catch (e) {
      console.error("Error loading bookmarks:", e);
    }
  };

  const toggleBookmarkForIndex = async (index: number) => {
    try {
      let updated = [...bookmarks];
      const exists = updated.find((b) => b.ayahIndex === index);
      if (exists) updated = updated.filter((b) => b.ayahIndex !== index);
      else updated.push({ surahId: id, ayahIndex: index });
      setBookmarks(updated);
      await AsyncStorage.setItem(`bookmarks_${id}`, JSON.stringify(updated));
    } catch (e) {
      console.error("Error updating bookmarks:", e);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: name,
      headerStyle: { backgroundColor: "#1E1E1E", shadowColor: "transparent" },
      headerTintColor: "#FFD700",
      headerTitleStyle: {
        fontFamily: "Amiri-Regular",
        fontSize: 22,
        color: "#FFD700",
        letterSpacing: 1,
      },
      headerTitleAlign: "center",
    });
  }, [navigation, name]);

  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], {
    useNativeDriver: true,
  });

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    }
  };

  const toArabicNumber = (num: number) => {
    const arabicDigits = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
    return `﴿${num.toString().split("").map(d => arabicDigits[parseInt(d)]).join("")}﴾`;
  };

  // Scroll after all ayahs are measured
  useEffect(() => {
    if (allMeasured && (scrollToAyah !== undefined || bookmarks.length > 0)) {
      const indexToScroll = scrollToAyah ?? bookmarks[0].ayahIndex;
      const yPos = ayahPositions[indexToScroll] || 0;

      InteractionManager.runAfterInteractions(() => {
        scrollRef.current?.scrollTo({ y: yPos, animated: true });
      });
    }
  }, [allMeasured, ayahPositions, bookmarks, scrollToAyah]);

  const renderAyahRow = (index: number, text: string) => (
    <View
      key={index}
      style={styles.ayahRow}
      onLayout={(event) => {
        const layout = event.nativeEvent.layout;
        setAyahPositions((prev) => {
          const newPositions = [...prev];
          newPositions[index] = layout.y;

          // Check if all ayahs are measured
          if (newPositions.filter((v) => v !== undefined).length === ayahs.length) {
            setAllMeasured(true);
          }
          return newPositions;
        });
      }}
    >
      <Text style={styles.ayahText}>
        {text} {toArabicNumber(index + 1)}
      </Text>
      <TouchableOpacity onPress={() => toggleBookmarkForIndex(index)}>
        <Text
          style={[
            styles.bookmarkIcon,
            bookmarks.find((b) => b.ayahIndex === index) && styles.activeBookmark,
          ]}
        >
          {bookmarks.find((b) => b.ayahIndex === index) ? "★" : "☆"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderParagraph = () =>
    ayahs.map((item, index) => {
      let text = item.text;
      if (index === 0 && id !== 9 && item.text.startsWith("بسم الله")) {
        const bismillah = "بسم الله الرحمن الرحيم";
        text = item.text.replace(bismillah, "").trim();
        return (
          <View key={item.id} style={{ marginBottom: 24 }}>
            <Text style={styles.bismillah}>{bismillah}</Text>
            {text.length > 0 && renderAyahRow(index, text)}
          </View>
        );
      }
      return renderAyahRow(index, text);
    });

  return (
    <View style={styles.container}>
      <Text style={styles.surahTitle}>{name}</Text>
      <PinchGestureHandler
        onGestureEvent={onPinchEvent}
        onHandlerStateChange={onPinchStateChange}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContainer}
          >
            {renderParagraph()}
          </ScrollView>
        </Animated.View>
      </PinchGestureHandler>
    </View>
  );
};

export default SurahDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16, backgroundColor: "#121212" },
  scrollContainer: { paddingBottom: 40, paddingHorizontal: 16 },
  surahTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    fontFamily: "Amiri-Regular",
    color: "#FFD700",
    letterSpacing: 2,
  },
  bismillah: {
    fontSize: 32,
    textAlign: "center",
    fontFamily: "Amiri-Regular",
    marginBottom: 20,
    color: "#E0E0E0",
    lineHeight: 50,
  },
  ayahText: {
    fontSize: 28,
    lineHeight: 50,
    textAlign: "center",
    fontFamily: "Amiri-Regular",
    color: "#FFFFFF",
    marginRight: 10,
  },
  ayahRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  bookmarkIcon: {
    fontSize: 26,
    marginLeft: 10,
    color: "#FFD700",
  },
  activeBookmark: {
    color: "#FFD700",
    fontSize: 28,
  },
});
