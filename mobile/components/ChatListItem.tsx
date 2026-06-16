import { View, Text, TouchableOpacity } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { UserAvatar } from "./UserAvatar";
import { useSocketStore } from "@/store/socketStore";
import type { Chat } from "@/types";

interface ChatListItemProps {
  chat: Chat;
  onPress: () => void;
}

export function ChatListItem({ chat, onPress }: ChatListItemProps) {
  const lastMessage = chat.lastMessage;
  const displayName = chat.name || chat.participants[0]?.name || "Unknown";
  const avatarUrl = chat.participants[0]?.avatarUrl;
  const otherUserId = chat.participants[0]?.id;
  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const isOnline = otherUserId ? onlineUsers.includes(otherUserId) : false;

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-800"
      >
        <View className="relative">
          <UserAvatar source={avatarUrl} online={isOnline} size="md" />
          {chat.unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-primary h-5 min-w-5 rounded-full items-center justify-center px-1">
              <Text className="text-white text-xs font-bold">
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1">
              {displayName}
            </Text>
            {lastMessage && (
              <Text className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </View>
          {lastMessage && (
            <Text
              className="text-sm text-gray-500 dark:text-gray-400 mt-0.5"
              numberOfLines={1}
            >
              {lastMessage.content}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
