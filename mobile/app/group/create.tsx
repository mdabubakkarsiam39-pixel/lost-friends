import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat";
import { userService } from "@/services/user";
import { UserAvatar } from "@/components/UserAvatar";
import { EmptyState } from "@/components/EmptyState";
import type { User } from "@/types";

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const queryClient = useQueryClient();

  const { data: searchResults } = useQuery({
    queryKey: ["userSearch", searchQuery],
    queryFn: () => userService.searchUsers(searchQuery),
    enabled: searchQuery.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      chatService.createGroupChat({
        name: groupName,
        participants: selectedUsers.map((u) => u.id),
      }),
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      router.replace(`/chat/${chat.id}`);
    },
    onError: () => {
      Alert.alert("Error", "Failed to create group");
    },
  });

  const toggleUser = (user: User) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev.filter((u) => u.id !== user.id);
      return [...prev, user];
    });
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Enter a group name");
      return;
    }
    if (selectedUsers.length === 0) {
      Alert.alert("Error", "Select at least one participant");
      return;
    }
    createMutation.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Create Group
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="px-4 pt-4">
          <TextInput
            className="bg-gray-100 dark:bg-gray-800 rounded-2 px-4 py-3 text-base text-gray-900 dark:text-white mb-4"
            placeholder="Group name"
            placeholderTextColor="#9CA3AF"
            value={groupName}
            onChangeText={setGroupName}
          />

          <TextInput
            className="bg-gray-100 dark:bg-gray-800 rounded-2 px-4 py-3 text-base text-gray-900 dark:text-white"
            placeholder="Search users to add..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>

        {selectedUsers.length > 0 && (
          <View className="px-4 pt-4">
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Selected ({selectedUsers.length})
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => toggleUser(user)}
                  className="bg-primary/10 flex-row items-center px-3 py-1.5 rounded-full"
                >
                  <Text className="text-primary text-sm font-medium mr-1">
                    {user.fullName || user.name}
                  </Text>
                  <Text className="text-primary text-sm">×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <FlatList
          data={searchResults || []}
          keyExtractor={(item: User) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedUsers.some((u) => u.id === item.id);
            return (
              <Animated.View entering={FadeIn.duration(300)}>
                <TouchableOpacity
                  onPress={() => toggleUser(item)}
                  className={`flex-row items-center px-4 py-3 ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <UserAvatar source={item.avatarUrl} online={item.online} size="md" />
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                      {item.fullName || item.name}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      @{item.username}
                    </Text>
                  </View>
                  {isSelected && (
                    <Text className="text-primary text-lg">✓</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            searchQuery.length > 0 ? (
              <EmptyState
                icon="🔍"
                title="No users found"
                message="Try a different search"
              />
            ) : null
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />

        <View className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
          <TouchableOpacity
            onPress={handleCreate}
            disabled={createMutation.isPending}
            className="bg-primary py-4 rounded-2 items-center"
          >
            <Text className="text-white text-base font-semibold">
              {createMutation.isPending ? "Creating..." : "Create Group"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
