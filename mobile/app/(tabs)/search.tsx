import { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { chatService } from "@/services/chat";
import { UserAvatar } from "@/components/UserAvatar";
import { EmptyState } from "@/components/EmptyState";
import type { User } from "@/types";

export default function GlobalSearchScreen() {
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["globalSearch", query],
    queryFn: () => userService.globalSearch(query),
    enabled: query.length >= 2,
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary text-lg">←</Text>
        </TouchableOpacity>
        <TextInput
          className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-base text-gray-900 dark:text-white"
          placeholder="Search users, messages, chats..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      {isLoading && query.length >= 2 && (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#D92243" />
        </View>
      )}

      {!isLoading && query.length >= 2 && data && (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <View>
              {data.users && data.users.length > 0 && (
                <View className="px-4 py-2">
                  <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Users
                  </Text>
                  {data.users.map((u: any) => (
                    <TouchableOpacity
                      key={u._id || u.id}
                      onPress={async () => {
                        try {
                          const chat = await chatService.createChat(u._id || u.id);
                          router.push(`/chat/${chat.id}`);
                        } catch {}
                      }}
                      className="flex-row items-center py-2"
                    >
                      <UserAvatar source={u.avatarUrl} size="sm" />
                      <View className="ml-3">
                        <Text className="text-sm font-medium text-gray-900 dark:text-white">
                          {u.username}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {data.chats && data.chats.length > 0 && (
                <View className="px-4 py-2">
                  <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Chats
                  </Text>
                  {data.chats.map((c: any) => (
                    <TouchableOpacity
                      key={c._id || c.id}
                      onPress={() => router.push(`/chat/${c._id || c.id}`)}
                      className="py-2"
                    >
                      <Text className="text-sm font-medium text-gray-900 dark:text-white">
                        {c.name || "Chat"}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        {c.lastMessage}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {data.messages && data.messages.length > 0 && (
                <View className="px-4 py-2">
                  <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Messages
                  </Text>
                  {data.messages.slice(0, 10).map((m: any) => (
                    <TouchableOpacity
                      key={m._id || m.id}
                      onPress={() => {
                        const chatId = typeof m.chatId === "object" ? m.chatId._id : m.chatId;
                        if (chatId) router.push(`/chat/${chatId}`);
                      }}
                      className="py-2"
                    >
                      <Text className="text-sm text-gray-900 dark:text-white" numberOfLines={1}>
                        {m.content}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {data.users?.length === 0 && data.chats?.length === 0 && data.messages?.length === 0 && (
                <EmptyState
                  icon="🔍"
                  title="No results"
                  message="Try a different search term"
                />
              )}
            </View>
          }
        />
      )}

      {query.length < 2 && (
        <EmptyState
          icon="🔍"
          title="Global Search"
          message="Search for users, messages, and chats"
        />
      )}
    </SafeAreaView>
  );
}
