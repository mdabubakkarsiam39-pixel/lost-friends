import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          className="items-center"
        >
          <View className="h-24 w-24 rounded-2 bg-primary items-center justify-center mb-6">
            <Text className="text-4xl text-white font-bold">LF</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lost Friends
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
            Reconnect with the people who matter most
          </Text>
        </Animated.View>
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          className="w-full"
        >
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            className="bg-primary py-4 rounded-2 items-center mb-4"
          >
            <Text className="text-white text-base font-semibold">
              Get Started
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
