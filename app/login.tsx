import React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login } from "@/redux/auth.slice";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter both email and password");
      return;
    }

    try {
      await dispatch(login(email, password));
      router.replace("/(tabs)/book-list/book-list");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid credentials";
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-center px-6">
            {/* Logo/Header Section */}
            <View className="items-center mb-10">
              <Text className="text-4xl font-bold text-blue-600 mb-2">
                Booka
              </Text>
              <Text className="text-gray-500">Your personal library</Text>
            </View>

            {/* Form Section */}
            <View className="bg-white p-6 rounded-xl shadow-sm">
              <Text className="text-xl font-semibold mb-6 text-gray-800">
                Sign In
              </Text>

              <TextInput
                className="h-12 px-4 mb-4 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-400"
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />

              <TextInput
                className="h-12 px-4 mb-6 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-400"
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Pressable
                className={`h-12 rounded-lg justify-center items-center mb-4 ${
                  status === "loading" ? "bg-blue-400" : "bg-blue-600"
                }`}
                onPress={handleLogin}
                disabled={status === "loading"}
              >
                <Text className="text-white font-medium text-lg">
                  {status === "loading" ? "Please wait..." : "Sign In"}
                </Text>
              </Pressable>

              <Link href="/forgot-password" asChild>
                <Pressable className="items-end mb-6">
                  <Text className="text-blue-500 text-sm">
                    Forgot password?
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Footer/Sign Up Section */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-500">Don't have an account? </Text>
              <Link href="/register/register" asChild>
                <Pressable>
                  <Text className="text-blue-600 font-medium">Sign up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
