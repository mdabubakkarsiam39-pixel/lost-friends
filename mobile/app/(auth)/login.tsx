import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)/chats");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "lostfriends://oauth-native-callback",
        redirectUrlComplete: "lostfriends://oauth-native-callback",
      });
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Google sign in failed");
    }
  };

  const handleAppleSignIn = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_apple",
        redirectUrl: "lostfriends://oauth-native-callback",
        redirectUrlComplete: "lostfriends://oauth-native-callback",
      });
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Apple sign in failed");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 px-6 pt-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-primary text-base">Back</Text>
        </TouchableOpacity>
        <Animated.View entering={FadeInUp.duration(500)}>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Welcome back
          </Text>
          <View className="mb-4">
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-2 px-4 py-4 text-base text-gray-900 dark:text-white"
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <View className="mb-6">
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-2 px-4 py-4 text-base text-gray-900 dark:text-white"
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            onPress={handleEmailLogin}
            disabled={loading}
            className="bg-primary py-4 rounded-2 items-center mb-6"
          >
            <Text className="text-white text-base font-semibold">
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
            <Text className="mx-4 text-gray-500 dark:text-gray-400">or</Text>
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          </View>
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            className="border border-gray-300 dark:border-gray-700 py-4 rounded-2 items-center mb-3"
          >
            <Text className="text-gray-900 dark:text-white text-base font-semibold">
              Continue with Google
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAppleSignIn}
            className="border border-gray-300 dark:border-gray-700 py-4 rounded-2 items-center"
          >
            <Text className="text-gray-900 dark:text-white text-base font-semibold">
              Continue with Apple
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <View className="flex-row justify-center mt-auto mb-6">
          <Text className="text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-primary font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
