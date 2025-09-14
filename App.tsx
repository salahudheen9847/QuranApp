// App.tsx
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import SurahList from "./src/screens/SurahList";
import SurahDetailScreen from "./src/screens/SurahDetailScreen";
import BookmarksScreen from "./src/screens/BookmarksScreen";

import { clearDB, initDB, seedQuran } from "./src/database/db";

export type RootStackParamList = {
  Home: undefined;
  SurahDetail: { id: number; name: string; ayahIndex?: number };
  Bookmarks: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const setupDB = async () => {
      clearDB();
      initDB();
      seedQuran();
      setDbReady(true);
    };
    setupDB();
  }, []);

  if (!dbReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={SurahList}
              options={{ title: "Qur'an Surahs" }}
            />
            <Stack.Screen
              name="SurahDetail"
              component={SurahDetailScreen}
              options={({ route }) => ({ title: route.params.name })}
            />
            <Stack.Screen
              name="Bookmarks"
              component={BookmarksScreen}
              options={{ title: "Bookmarks" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
