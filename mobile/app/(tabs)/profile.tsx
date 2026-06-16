import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { UserAvatar } from "@/components/UserAvatar";
import { useThemeStore } from "@/store/themeStore";
import { userService } from "@/services/user";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { isDark, toggleTheme } = useThemeStore();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState((user?.publicMetadata?.username as string) || "");
  const [bio, setBio] = useState((user?.publicMetadata?.bio as string) || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username is required");
      return;
    }
    setSaving(true);
    try {
      await userService.updateProfile({ username: username.trim(), bio: bio.trim() });
      setEditing(false);
      Alert.alert("Success", "Profile updated");
    } catch {
      Alert.alert("Error", "Failed to update profile");
    }
    setSaving(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-6 pt-8">
        <Animated.View
          entering={FadeInDown.duration(500)}
          className="items-center mb-8"
        >
          <UserAvatar
            source={user?.imageUrl}
            online
            size="lg"
          />
          <Text className="text-xl font-bold text-gray-900 dark:text-white mt-4">
            {user?.fullName || "User"}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </Animated.View>

        {editing ? (
          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
            <View className="mb-4">
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Username</Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
            <View className="mb-4">
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bio</Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-white"
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setEditing(false);
                  setUsername((user?.publicMetadata?.username as string) || "");
                  setBio((user?.publicMetadata?.bio as string) || "");
                }}
                className="flex-1 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 items-center"
              >
                <Text className="text-gray-600 dark:text-gray-400 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-lg bg-primary items-center"
              >
                <Text className="text-white font-medium">
                  {saving ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          <>
            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              className="bg-gray-100 dark:bg-gray-800 rounded-2 p-4 mb-4"
            >
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Username</Text>
              <Text className="text-base text-gray-900 dark:text-white">
                @{(user?.publicMetadata?.username as string) || "not set"}
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(250).duration(500)}
              className="bg-gray-100 dark:bg-gray-800 rounded-2 p-4 mb-4"
            >
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bio</Text>
              <Text className="text-base text-gray-900 dark:text-white">
                {user?.publicMetadata?.bio as string || "No bio yet"}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <TouchableOpacity
                onPress={() => setEditing(true)}
                className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800"
              >
                <Text className="text-base text-primary font-medium">Edit Profile</Text>
                <Text className="text-gray-400 dark:text-gray-500">→</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/settings")}
                className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800"
              >
                <Text className="text-base text-gray-900 dark:text-white">Settings</Text>
                <Text className="text-gray-400 dark:text-gray-500">→</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleTheme}
                className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800"
              >
                <Text className="text-base text-gray-900 dark:text-white">Dark Mode</Text>
                <Text className="text-gray-400 dark:text-gray-500">{isDark ? "ON" : "OFF"}</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          className="mt-auto mb-8 pt-4"
        >
          <TouchableOpacity
            onPress={handleLogout}
            className="border border-red-500 py-4 rounded-2 items-center"
          >
            <Text className="text-red-500 text-base font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
