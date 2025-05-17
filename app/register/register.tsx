import React, { useState } from "react";
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
import { useAppDispatch } from "@/redux/hooks";
import { register } from "@/redux/auth.slice";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(register(name, email, password));
      router.replace("/login");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setIsLoading(false);
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
            {/* Header Section */}
            <View className="items-center mb-10">
              <Text className="text-4xl font-bold text-blue-600 mb-2">
                Booka
              </Text>
              <Text className="text-gray-500">Create your account</Text>
            </View>

            {/* Form Section */}
            <View className="bg-white p-6 rounded-xl shadow-sm">
              <Text className="text-xl font-semibold mb-6 text-gray-800">
                Sign Up
              </Text>

              <TextInput
                className="h-12 px-4 mb-4 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-400"
                placeholder="Full name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

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
                className="h-12 px-4 mb-4 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-400"
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TextInput
                className="h-12 px-4 mb-6 bg-gray-50 rounded-lg border border-gray-200 focus:border-blue-400"
                placeholder="Confirm password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <Pressable
                className={`h-12 rounded-lg justify-center items-center mb-4 ${
                  isLoading ? "bg-blue-400" : "bg-blue-600"
                }`}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text className="text-white font-medium text-lg">
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Text>
              </Pressable>
            </View>

            {/* Footer/Sign In Section */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-500">Already have an account? </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text className="text-blue-600 font-medium">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
