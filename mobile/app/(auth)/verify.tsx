import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signUp, setActive } = useSignUp();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!signUp) return;
    if (code.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)/chats");
      } else {
        Alert.alert("Error", "Invalid code. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Verification failed");
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
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Verify your email
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            We sent a 6-digit code to{"\n"}
            <Text className="font-semibold text-gray-900 dark:text-white">
              {email || "your email"}
            </Text>
          </Text>
          <View className="mb-6">
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-2 px-4 py-4 text-base text-gray-900 dark:text-white text-center tracking-widest"
              placeholder="000000"
              placeholderTextColor="#9CA3AF"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading || code.length !== 6}
            className="bg-primary py-4 rounded-2 items-center mb-6"
          >
            <Text className="text-white text-base font-semibold">
              {loading ? "Verifying..." : "Verify"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              signUp?.prepareEmailAddressVerification();
              Alert.alert("Code sent", "Check your email for a new code.");
            }}
            className="items-center"
          >
            <Text className="text-primary text-sm">Resend code</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
