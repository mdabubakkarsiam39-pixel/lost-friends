import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMessages } from "@/hooks/useMessages";
import { useSocket } from "@/hooks/useSocket";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { api } from "@/services/api";
import { chatService } from "@/services/chat";
import { friendService } from "@/services/friend";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/types";

export default function ChatRoomScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const [input, setInput] = useState("");
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { data: messages, isLoading, fetchNextPage } = useMessages(chatId!);
  const { sendMessage, emitTyping, emitRead, joinChat, leaveChat, emitReply } = useSocket(chatId!);
  const queryClient = useQueryClient();

  const allMessages = messages?.pages.flatMap((page) => page.data || page) || [];

  useEffect(() => {
    if (chatId) {
      AsyncStorage.getItem(`draft-${chatId}`).then((saved) => {
        if (saved) setInput(saved);
      });
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      if (input) {
        AsyncStorage.setItem(`draft-${chatId}`, input);
      } else {
        AsyncStorage.removeItem(`draft-${chatId}`);
      }
    }
  }, [chatId, input]);

  useEffect(() => {
    if (chatId) {
      joinChat(chatId);
      return () => leaveChat(chatId);
    }
  }, [chatId, joinChat, leaveChat]);

  useEffect(() => {
    if (allMessages.length > 0) {
      const lastMsg = allMessages[0];
      if (lastMsg.senderId !== "") {
        emitRead(lastMsg.id);
      }
    }
  }, [allMessages, emitRead]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    if (editingMessage) {
      const msgId = editingMessage.id;
      const content = input.trim();
      setEditingMessage(null);
      setInput("");
      emitTyping(false);
      chatService.editMessage(msgId, content).catch(() => {
        Alert.alert("Error", "Failed to edit message");
      });
    } else if (replyingTo) {
      const content = input.trim();
      const replyId = replyingTo.id;
      setReplyingTo(null);
      setInput("");
      emitTyping(false);
      emitReply(content, replyId);
    } else {
      sendMessage(input.trim());
      setInput("");
      emitTyping(false);
    }
  }, [input, sendMessage, emitTyping, editingMessage, replyingTo, emitReply]);

  const handleInputChange = useCallback(
    (text: string) => {
      setInput(text);
      emitTyping(text.length > 0);
    },
    [emitTyping]
  );

  const handleEdit = (messageId: string) => {
    const msg = allMessages.find((m) => m.id === messageId);
    if (msg) {
      setEditingMessage(msg);
      setReplyingTo(null);
      setInput(msg.content);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setEditingMessage(null);
  };

  const handleBlock = (userId: string) => {
    Alert.alert("Block User", "Are you sure you want to block this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Block",
        style: "destructive",
        onPress: () => {
          friendService.blockUser(userId).then(() => {
            Alert.alert("Blocked", "User has been blocked");
          }).catch(() => {});
        },
      },
    ]);
  };

  const handleReport = (messageId: string) => {
    Alert.alert("Report", "Why are you reporting this message?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Spam",
        onPress: () => submitReport(messageId, "Spam"),
      },
      {
        text: "Harassment",
        onPress: () => submitReport(messageId, "Harassment"),
      },
      {
        text: "Inappropriate",
        onPress: () => submitReport(messageId, "Inappropriate content"),
      },
      {
        text: "Other",
        onPress: () => submitReport(messageId, "Other"),
      },
    ]);
  };

  const submitReport = (messageId: string, reason: string) => {
    api.post("/reports", {
      targetId: messageId,
      targetType: "message",
      reason,
    }).then(() => {
      Alert.alert("Reported", "Thank you for your report");
    }).catch(() => {});
  };

  const handleReact = (messageId: string, emoji: string) => {
    chatService.addReaction(messageId, emoji).catch(() => {});
  };

  const handleDelete = (messageId: string) => {
    chatService.deleteMessage(messageId).then(() => {
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
    }).catch(() => {});
  };

  const handleForward = (messageId: string) => {
    chatService.getChats().then((chats) => {
      const chatOptions = (chats || [])
        .filter((c: any) => c.id !== chatId)
        .slice(0, 5)
        .map((c: any) => ({
          text: c.name || "Chat",
          onPress: () => {
            chatService.forwardMessage(messageId, c.id).then(() => {
              Alert.alert("Sent", "Message forwarded");
            }).catch(() => {
              Alert.alert("Error", "Failed to forward message");
            });
          },
        }));
      Alert.alert("Select Chat", "Choose a chat to forward to", [
        ...chatOptions,
        { text: "Cancel", style: "cancel" as const },
      ]);
    }).catch(() => {
      Alert.alert("Error", "Failed to load chats");
    });
  };

  const handlePin = (messageId: string) => {
    chatService.pinMessage(messageId).catch(() => {});
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadFile(result.assets[0].uri, "image");
    }
  };

  const handlePickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadFile(result.assets[0].uri, "video");
    }
  };

  const handlePickDocument = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadFile(result.assets[0].uri, "file");
    }
  };

  const uploadFile = async (uri: string, type: string) => {
    try {
      const formData = new FormData();
      const filename = uri.split("/").pop() || "file";
      const ext = filename.split(".").pop()?.toLowerCase() || "";
      const mimeType =
        type === "video"
          ? `video/${ext}`
          : type === "image"
          ? `image/${ext}`
          : "application/octet-stream";

      formData.append("file", {
        uri,
        name: filename,
        type: mimeType,
      } as any);
      formData.append("chatId", chatId!);
      formData.append("type", type);

      const response = await fetch(`${api.getBaseUrl()}/upload/media`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { socket } = await import("@/lib/socket");
        socket.emit("message:send", {
          chatId,
          content: type === "image" ? "Image" : type === "video" ? "Video" : "File",
          type,
          mediaUrl: data.url,
          fileName: filename,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload file");
    }
  };

  const handleShowAttachMenu = () => {
    Alert.alert("Attach", "Choose a type", [
      { text: "Photo", onPress: handlePickImage },
      { text: "Video", onPress: handlePickVideo },
      { text: "Document", onPress: handlePickDocument },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        onEdit={handleEdit}
        onReact={handleReact}
        onForward={handleForward}
        onPin={handlePin}
        onReply={handleReply}
        onDelete={handleDelete}
        onBlock={handleBlock}
        onReport={handleReport}
        allMessages={allMessages}
      />
    ),
    [allMessages]
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-primary text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
          {editingMessage
            ? "Editing message..."
            : replyingTo
            ? "Replying..."
            : "Chat"}
        </Text>
        {(editingMessage || replyingTo) && (
          <TouchableOpacity
            onPress={() => {
              setEditingMessage(null);
              setReplyingTo(null);
              setInput("");
            }}
          >
            <Text className="text-sm text-gray-500">Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={allMessages}
          renderItem={renderItem}
          keyExtractor={(item: Message) => item.id}
          inverted
          onEndReached={() => fetchNextPage()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          ListHeaderComponent={
            isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#D92243" />
              </View>
            ) : allMessages.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-sm text-gray-400 dark:text-gray-500">
                  No messages yet. Say hello!
                </Text>
              </View>
            ) : null
          }
        />

        <TypingIndicator />

        <Animated.View
          entering={FadeIn.duration(300)}
          className="flex-row items-center px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
        >
          <TouchableOpacity
            onPress={handleShowAttachMenu}
            className="mr-2 h-10 w-10 rounded-full items-center justify-center bg-gray-100 dark:bg-gray-800"
          >
            <Text className="text-lg">+</Text>
          </TouchableOpacity>
          <TextInput
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2 px-4 py-3 text-base text-gray-900 dark:text-white mr-2"
            placeholder={
              replyingTo
                ? "Type a reply..."
                : "Type a message..."
            }
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={handleInputChange}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim()}
            className="bg-primary h-12 w-12 rounded-full items-center justify-center"
          >
            <Text className="text-white text-lg">↑</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
