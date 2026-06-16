import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat";
import { userService } from "@/services/user";
import { UserAvatar } from "@/components/UserAvatar";
import { EmptyState } from "@/components/EmptyState";
import type { User, Chat } from "@/types";

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const queryClient = useQueryClient();

  const { data: chat } = useQuery({
    queryKey: ["chat", id],
    queryFn: () => chatService.getChat(id!),
    enabled: !!id,
  });

  const { data: searchResults } = useQuery({
    queryKey: ["userSearch", searchQuery],
    queryFn: () => userService.searchUsers(searchQuery),
    enabled: searchQuery.length > 0 && showAddMember,
  });

  const archiveMutation = useMutation({
    mutationFn: () => chatService.archiveChat(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat", id] }),
  });

  const muteMutation = useMutation({
    mutationFn: () => chatService.muteChat(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat", id] }),
  });

  const pinMutation = useMutation({
    mutationFn: () => chatService.pinChat(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat", id] }),
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => chatService.addMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", id] });
      setShowAddMember(false);
      setSearchQuery("");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => chatService.removeMember(id!, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat", id] }),
  });

  const handleRemoveMember = (user: User) => {
    Alert.alert("Remove Member", `Remove ${user.fullName || user.name} from the group?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeMemberMutation.mutate(user.id),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
          {chat?.name || "Group"}
        </Text>
      </View>

      <View className="px-4 pt-4">
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase">
          Settings
        </Text>

        <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-base text-gray-900 dark:text-white">Archived</Text>
          <Switch
            value={chat?.isArchived || false}
            onValueChange={() => archiveMutation.mutate()}
            trackColor={{ false: "#D1D5DB", true: "#D92243" }}
            thumbColor={chat?.isArchived ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-base text-gray-900 dark:text-white">Muted</Text>
          <Switch
            value={chat?.isMuted || false}
            onValueChange={() => muteMutation.mutate()}
            trackColor={{ false: "#D1D5DB", true: "#D92243" }}
            thumbColor={chat?.isMuted ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-base text-gray-900 dark:text-white">Pinned</Text>
          <Switch
            value={chat?.isPinned || false}
            onValueChange={() => pinMutation.mutate()}
            trackColor={{ false: "#D1D5DB", true: "#D92243" }}
            thumbColor={chat?.isPinned ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      <View className="px-4 pt-4 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
          Members ({chat?.participants.length || 0})
        </Text>
        <TouchableOpacity
          onPress={() => setShowAddMember(!showAddMember)}
          className="bg-primary px-3 py-1.5 rounded-lg"
        >
          <Text className="text-white text-sm font-semibold">Add</Text>
        </TouchableOpacity>
      </View>

      {showAddMember && (
        <View className="px-4 py-2">
          <TextInput
            className="bg-gray-100 dark:bg-gray-800 rounded-2 px-4 py-3 text-base text-gray-900 dark:text-white"
            placeholder="Search users..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      )}

      {showAddMember && searchResults && (
        <FlatList
          data={searchResults}
          keyExtractor={(item: User) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => addMemberMutation.mutate(item.id)}
              className="flex-row items-center px-4 py-3"
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
              <Text className="text-primary text-lg">+</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState icon="🔍" title="No users found" message="Try a different search" />
          }
        />
      )}

      {!showAddMember && (
        <FlatList
          data={chat?.participants || []}
          keyExtractor={(item: User) => item.id}
          renderItem={({ item }) => (
            <Animated.View entering={FadeIn.duration(300)}>
              <View className="flex-row items-center px-4 py-3">
                <UserAvatar source={item.avatarUrl} online={item.online} size="md" />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {item.fullName || item.name}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    @{item.username}
                  </Text>
                </View>
                {item.id !== chat?.creatorId && (
                  <TouchableOpacity onPress={() => handleRemoveMember(item)}>
                    <Text className="text-red-500 text-sm">Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}
          ListEmptyComponent={
            <EmptyState icon="👥" title="No members" message="This group has no members" />
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </SafeAreaView>
  );
}
