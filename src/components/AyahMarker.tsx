// src/components/AyahMarker.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  number: number;
}

const AyahMarker: React.FC<Props> = ({ number }) => {
  return (
    <View style={styles.circle}>
      <Text style={styles.text}>{number}</Text>
    </View>
  );
};

export default AyahMarker;

const styles = StyleSheet.create({
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffd700",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  text: {
    fontFamily: "Amiri-Regular",
    fontSize: 18,
    color: "#000",
    textAlign: "center",
  },
});
