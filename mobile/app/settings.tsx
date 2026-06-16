import { View, Text, TouchableOpacity, Switch, Alert, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as ImagePicker from "expo-image-picker";
import { UserAvatar } from "@/components/UserAvatar";
import { useThemeStore } from "@/store/themeStore";
import { api } from "@/services/api";
import { userService } from "@/services/user";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { isDark, toggleTheme } = useThemeStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [privacy, setPrivacy] = useState({
    readReceipts: true,
    showOnlineStatus: true,
    showLastSeen: true,
    showTypingIndicators: true,
  });

  useEffect(() => {
    checkNotificationPermission();
    userService.getPrivacySettings().then(setPrivacy).catch(() => {});
  }, []);

  const checkNotificationPermission = async () => {
    if (!Device.isDevice) return;
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === "granted");
  };

  const toggleNotifications = async () => {
    if (!Device.isDevice) {
      Alert.alert("Notifications", "Push notifications require a physical device");
      return;
    }

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      setNotificationsEnabled(true);
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        await api.post("/api/auth/push/register", {
          token: token.data,
          platform: "expo",
        });
      } catch {
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const updatePrivacy = async (key: keyof typeof privacy, value: boolean) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    try {
      await userService.updatePrivacySettings({ [key]: value });
    } catch {}
  };

  const handleAvatarUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const formData = new FormData();
        formData.append("avatar", {
          uri: result.assets[0].uri,
          name: "avatar.jpg",
          type: "image/jpeg",
        } as any);
        await api.post("/upload/avatar", formData);
        Alert.alert("Success", "Avatar updated");
      } catch {
        Alert.alert("Error", "Failed to upload avatar");
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete("/api/auth/delete-account");
              await signOut();
              router.replace("/(auth)");
            } catch {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
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
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4">
        <Animated.View
          entering={FadeInDown.duration(500)}
          className="items-center mb-8"
        >
          <TouchableOpacity onPress={handleAvatarUpload}>
            <UserAvatar source={user?.imageUrl} size="lg" />
            <View className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
              <Text className="text-white text-xs">📷</Text>
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 dark:text-white mt-4">
            {user?.fullName || "User"}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            className="mt-2 px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
          >
            <Text className="text-xs text-gray-600 dark:text-gray-400">Edit Profile</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase">
            Preferences
          </Text>

          <View className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-base text-gray-900 dark:text-white">Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#D1D5DB", true: "#D92243" }}
              thumbColor={isDark ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-base text-gray-900 dark:text-white">Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: "#D1D5DB", true: "#D92243" }}
              thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mt-6">
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase">
            Privacy
          </Text>

          {[
            { key: "readReceipts" as const, label: "Read receipts", desc: "Let others see when you read messages" },
            { key: "showOnlineStatus" as const, label: "Online status", desc: "Show when you are online" },
            { key: "showLastSeen" as const, label: "Last seen", desc: "Show when you were last active" },
            { key: "showTypingIndicators" as const, label: "Typing indicators", desc: "Show when you are typing" },
          ].map(({ key, label, desc }) => (
            <View key={key} className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
              <View className="flex-1 mr-4">
                <Text className="text-base text-gray-900 dark:text-white">{label}</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</Text>
              </View>
              <Switch
                value={privacy[key]}
                onValueChange={(val) => updatePrivacy(key, val)}
                trackColor={{ false: "#D1D5DB", true: "#D92243" }}
                thumbColor={privacy[key] ? "#fff" : "#f4f3f4"}
              />
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} className="mt-6">
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase">
            Account
          </Text>

          <View className="py-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-sm text-gray-500 dark:text-gray-400">Email</Text>
            <Text className="text-base text-gray-900 dark:text-white mt-1">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>

          <View className="py-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-sm text-gray-500 dark:text-gray-400">Username</Text>
            <Text className="text-base text-gray-900 dark:text-white mt-1">
              @{(user?.publicMetadata?.username as string) || "not set"}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          className="mt-auto mb-8 pt-4"
        >
          <TouchableOpacity
            onPress={handleLogout}
            className="border border-red-500 py-4 rounded-2 items-center mb-3"
          >
            <Text className="text-red-500 text-base font-semibold">Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="py-4 rounded-2 items-center"
          >
            <Text className="text-red-600 text-sm font-semibold">Delete Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
