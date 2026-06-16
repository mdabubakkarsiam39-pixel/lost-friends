import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { friendService } from "@/services/friend";
import { chatService } from "@/services/chat";
import { userService } from "@/services/user";
import { EmptyState } from "@/components/EmptyState";
import { UserAvatar } from "@/components/UserAvatar";
import type { User } from "@/types";

type Tab = "friends" | "requests" | "search";

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: () => friendService.getFriends(),
    enabled: activeTab === "friends",
  });

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: () => friendService.getRequests(),
    enabled: activeTab === "requests",
  });

  const { data: searchResults } = useQuery({
    queryKey: ["userSearch", searchQuery],
    queryFn: () => userService.searchUsers(searchQuery),
    enabled: activeTab === "search" && searchQuery.length > 0,
  });

  const acceptMutation = useMutation({
    mutationFn: (friendId: string) => friendService.acceptRequest(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (friendId: string) => friendService.rejectRequest(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: (receiverId: string) => friendService.sendRequest(receiverId),
    onSuccess: () => {
      Alert.alert("Sent", "Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["userSearch"] });
    },
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "friends", label: "All Friends" },
    { key: "requests", label: "Requests" },
    { key: "search", label: "Search" },
  ];

  const renderFriendItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={async () => {
        try {
          const chat = await chatService.createChat(item.id);
          router.push(`/chat/${chat.id}`);
        } catch {
          Alert.alert("Error", "Failed to start chat");
        }
      }}
      activeOpacity={0.7}
    >
      <Animated.View
        entering={FadeIn.duration(300)}
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
        <Text className="text-gray-400 dark:text-gray-500">→</Text>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderRequestItem = ({ item }: { item: User }) => (
    <Animated.View
      entering={FadeIn.duration(300)}
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
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => rejectMutation.mutate(item.id)}
          className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg mr-2"
        >
          <Text className="text-gray-900 dark:text-white text-sm font-semibold">Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => acceptMutation.mutate(item.id)}
          className="bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white text-sm font-semibold">Accept</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderSearchItem = ({ item }: { item: User }) => (
    <Animated.View
      entering={FadeIn.duration(300)}
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
      <TouchableOpacity
        onPress={() => sendRequestMutation.mutate(item.id)}
        className="bg-primary px-4 py-2 rounded-lg"
      >
        <Text className="text-white text-sm font-semibold">Add Friend</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const data =
    activeTab === "friends"
      ? friends || []
      : activeTab === "requests"
      ? requests || []
      : searchResults || [];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-4 pt-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Friends
        </Text>
        <View className="flex-row mb-4 bg-gray-100 dark:bg-gray-800 rounded-2 p-1">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-2 items-center ${
                activeTab === tab.key
                  ? "bg-primary"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === tab.key
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === "search" && (
        <View className="px-4 mb-4">
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

      <FlatList
        data={data}
        renderItem={
          activeTab === "friends"
            ? renderFriendItem
            : activeTab === "requests"
            ? renderRequestItem
            : renderSearchItem
        }
        keyExtractor={(item: User) => item.id}
        ListHeaderComponent={
          ((activeTab === "friends" && friendsLoading) ||
            (activeTab === "requests" && requestsLoading)) ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#D92243" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          ((activeTab === "friends" && friendsLoading) ||
            (activeTab === "requests" && requestsLoading)) ? null : (
            <EmptyState
              icon="👥"
              title={
                activeTab === "friends"
                  ? "No friends yet"
                  : activeTab === "requests"
                  ? "No pending requests"
                  : "Search for users"
              }
              message={
                activeTab === "friends"
                  ? "Add friends to start chatting"
                  : activeTab === "requests"
                  ? "Friend requests will appear here"
                  : "Type a name to find people"
              }
            />
          )
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}
