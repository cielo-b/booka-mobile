import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import * as SplashScreen from "expo-splash-screen";
import '../global.css'

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Hook to get current user from Redux state
const useCurrentUser = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const status = useSelector((state: RootState) => state.auth.status);
  return { user, isLoading: status === "loading" };
};

export default function Index() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, isLoading } = useCurrentUser();
  const [isRouterReady, setIsRouterReady] = useState(false);

  // Check if navigation is ready
  useEffect(() => {
    const unsubscribe = navigation.addListener("state", () => {
      setIsRouterReady(true);
    });
    return unsubscribe;
  }, [navigation]);

  // Handle navigation logic
  useEffect(() => {
    async function handleNavigation() {
      if (isRouterReady && !isLoading) {
        try {
          if (user) {
            router.replace("/(tabs)/book-list/book-list");
          } else {
            router.replace("/login");
          }
        } finally {
          // Hide splash screen after navigation
          await SplashScreen.hideAsync();
        }
      }
    }
    handleNavigation();
  }, [user, isLoading, isRouterReady, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Booka</Text>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
});
