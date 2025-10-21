import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { useTheme } from "react-native-paper";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export default function RollScreen() {
  const theme = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const diceAnim = new Animated.Value(0);

  const rollDice = async () => {
    setRolling(true);
    setEvents([]);

    Animated.timing(diceAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/roll?lat=34.0522&lon=-118.2437`
        );
        const data = await res.json();
        setEvents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setRolling(false);
        diceAnim.setValue(0);
      }
    });
  };

  const diceRotation = diceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.rollButton, { backgroundColor: theme.colors.primary }]}
        onPress={rollDice}
      >
        <Text style={styles.rollText}>🎲 Roll</Text>
      </TouchableOpacity>

      {rolling && (
        <Animated.Text
          style={[
            styles.diceAnimation,
            { transform: [{ rotate: diceRotation }] },
          ]}
        >
          🎲
        </Animated.Text>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 30 }} />}

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>{item.venue}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
  },
  rollButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 40,
  },
  rollText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  diceAnimation: {
    fontSize: 80,
    marginTop: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginVertical: 10,
    padding: 12,
    alignItems: "center",
    width: 300,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  subtitle: {
    color: "#777",
  },
});
