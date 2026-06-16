import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification";
import { EmptyState } from "@/components/EmptyState";
import type { Notification } from "@/types";

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getNotifications(),
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {}
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => !item.read && handleMarkAsRead(item.id)}
      activeOpacity={0.7}
    >
      <Animated.View
        entering={FadeIn.duration(300)}
        className={`flex-row px-4 py-3 border-b border-gray-100 dark:border-gray-800 ${
          !item.read ? "bg-primary/5" : ""
        }`}
      >
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {item.title}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {item.body}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
        {!item.read && (
          <View className="bg-primary h-2 w-2 rounded-full mt-2" />
        )}
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between px-4 pt-4 mb-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </Text>
        {notifications && notifications.some((n: Notification) => !n.read) && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text className="text-sm text-primary">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications || []}
        renderItem={renderItem}
        keyExtractor={(item: Notification) => item.id}
        ListHeaderComponent={
          isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#D92243" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="🔔"
              title="No notifications"
              message="You're all caught up!"
            />
          )
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}
