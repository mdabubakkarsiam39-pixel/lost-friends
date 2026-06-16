import { useState, useCallback } from "react";
import { View, FlatList, RefreshControl, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChats } from "@/hooks/useChats";
import { ChatListItem } from "@/components/ChatListItem";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { chatService } from "@/services/chat";
import type { Chat } from "@/types";

export default function ChatsScreen() {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const queryClient = useQueryClient();
  const { data: chats, isLoading, refetch } = useChats();

  const { data: archivedChats } = useQuery({
    queryKey: ["archivedChats"],
    queryFn: () => chatService.getArchivedChats(),
    enabled: showArchived,
  });

  const displayChats = showArchived ? (archivedChats || []) : (chats || []);
  const filteredChats = displayChats.filter((chat: Chat) =>
    chat.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = useCallback(({ item }: { item: Chat }) => (
    <ChatListItem
      chat={item}
      onPress={() => router.push(`/chat/${item.id}`)}
    />
  ), []);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          {showArchived ? "Archived" : "Chats"}
        </Text>
        <TouchableOpacity
          onPress={() => setShowArchived(!showArchived)}
        >
          <Text className="text-sm text-primary">
            {showArchived ? "Back to Chats" : "Archived"}
          </Text>
        </TouchableOpacity>
      </View>
      <View className="px-4 pb-2">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search chats..."
        />
      </View>
      <FlatList
        data={filteredChats}
        renderItem={renderItem}
        keyExtractor={(item: Chat) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={showArchived ? "📁" : "💬"}
            title={showArchived ? "No archived chats" : "No chats yet"}
            message={showArchived ? "Archived chats will appear here" : "Start a conversation with a friend"}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}
