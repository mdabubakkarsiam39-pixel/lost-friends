import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function SignupScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)/chats");
      } else if (result.status === "missing_requirements") {
        await signUp.prepareEmailAddressVerification();
        router.push({ pathname: "/(auth)/verify", params: { email } });
      } else {
        Alert.alert("Error", "Please try again");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Sign up failed");
    } finally {
      setLoading(false);
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
            Create account
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
          <View className="mb-4">
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-2 px-4 py-4 text-base text-gray-900 dark:text-white"
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View className="mb-6">
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-2 px-4 py-4 text-base text-gray-900 dark:text-white"
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            className="bg-primary py-4 rounded-2 items-center mb-6"
          >
            <Text className="text-white text-base font-semibold">
              {loading ? "Creating account..." : "Create Account"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <View className="flex-row justify-center mt-auto mb-6">
          <Text className="text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="text-primary font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
