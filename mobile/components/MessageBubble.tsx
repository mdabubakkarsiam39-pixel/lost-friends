import { View, Text, Image, TouchableOpacity, Pressable, Alert } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Video, ResizeMode, Audio } from "expo-av";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  onEdit?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onForward?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (messageId: string) => void;
  allMessages?: Message[];
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export function MessageBubble({ message, onEdit, onReact, onForward, onPin, onReply, onDelete, onBlock, onReport, allMessages }: MessageBubbleProps) {
  const { user } = useUser();
  const isOwn = message.senderId === user?.id;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const replyToMessage = message.replyTo && allMessages
    ? allMessages.find((m) => m.id === message.replyTo)
    : null;

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const togglePlayback = async () => {
    if (!message.voiceUrl) return;

    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: message.voiceUrl },
        { shouldPlay: true }
      );
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      setSound(newSound);
      setIsPlaying(true);
    }
  };

  const handleLongPress = () => {
    const options: any[] = [
      { text: "Cancel", style: "cancel" as const },
    ];

    options.unshift({ text: "Reply", onPress: () => onReply?.(message) });
    options.unshift({ text: "React", onPress: () => setShowReactions(!showReactions) });
    options.unshift({ text: "Forward", onPress: () => onForward?.(message.id) });
    options.unshift({ text: "Pin", onPress: () => onPin?.(message.id) });

    if (isOwn) {
      options.unshift({ text: "Edit", onPress: () => onEdit?.(message.id) });
      options.unshift({
        text: "Delete",
        style: "destructive" as const,
        onPress: () => {
          Alert.alert("Delete Message", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => onDelete?.(message.id),
            },
          ]);
        },
      });
    } else {
      options.unshift({
        text: "Report",
        style: "destructive" as const,
        onPress: () => onReport?.(message.id),
      });
      options.unshift({
        text: "Block User",
        style: "destructive" as const,
        onPress: () => {
          Alert.alert("Block User", "Are you sure you want to block this user?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Block",
              style: "destructive",
              onPress: () => onBlock?.(message.senderId),
            },
          ]);
        },
      });
    }

    Alert.alert("Message", "", options);
  };

  const reactions = message.reactions || {};
  const reactionEntries = Object.entries(reactions).filter(([, users]) => users.length > 0);

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className={`mb-2 ${isOwn ? "items-end" : "items-start"}`}
    >
      <Pressable onLongPress={handleLongPress}>
        {message.forwardedFrom && (
          <Text className="text-xs text-gray-400 dark:text-gray-500 mb-1 italic px-2">
            Forwarded
          </Text>
        )}
        {replyToMessage && (
          <View className={`mb-1 px-3 py-1.5 rounded-lg border-l-2 mx-2 ${
            isOwn
              ? "bg-primary/10 border-primary"
              : "bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-500"
          }`}>
            <Text className={`text-xs font-medium ${
              isOwn ? "text-primary" : "text-gray-500 dark:text-gray-400"
            }`} numberOfLines={1}>
              {(replyToMessage as any).sender?.username || "User"}
            </Text>
            <Text className={`text-xs opacity-75 ${
              isOwn ? "text-primary" : "text-gray-500 dark:text-gray-400"
            }`} numberOfLines={1}>
              {replyToMessage.content}
            </Text>
          </View>
        )}
        <View
          className={`max-w-[80%] rounded-2 px-4 py-3 ${
            isOwn
              ? "bg-primary rounded-tr-sm"
              : "bg-gray-100 dark:bg-gray-800 rounded-tl-sm"
          }`}
        >
          {message.imageUrl && (
            <Image
              source={{ uri: message.imageUrl }}
              className="w-48 h-48 rounded-2 mb-2"
              resizeMode="cover"
            />
          )}
          {message.videoUrl && (
            <Video
              source={{ uri: message.videoUrl }}
              style={{ width: 200, height: 150, borderRadius: 8, marginBottom: 8 }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
            />
          )}
          {message.fileUrl && (
            <TouchableOpacity
              onPress={() => {
                const { Linking } = require("react-native");
                Linking.openURL(message.fileUrl!);
              }}
              className="flex-row items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-3 mb-2"
            >
              <Text className="text-lg mr-2">📄</Text>
              <Text
                className="text-sm text-gray-900 dark:text-white flex-1"
                numberOfLines={1}
              >
                {message.fileName || "File"}
              </Text>
            </TouchableOpacity>
          )}
          {message.voiceUrl && (
            <TouchableOpacity
              onPress={togglePlayback}
              className="flex-row items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-3 mb-2"
            >
              <Text className="text-lg mr-2">{isPlaying ? "⏸️" : "▶️"}</Text>
              <Text className="text-sm text-gray-900 dark:text-white">Voice message</Text>
            </TouchableOpacity>
          )}
          {message.content ? (
            <Text
              className={`text-base ${
                isOwn ? "text-white" : "text-gray-900 dark:text-white"
              }`}
            >
              {message.content}
            </Text>
          ) : null}
          <View className="flex-row items-center justify-end mt-1">
            {message.edited && (
              <Text className={`text-xs italic ${isOwn ? "text-white/50" : "text-gray-400 dark:text-gray-500"}`}>
                edited
              </Text>
            )}
            <Text
              className={`text-xs ${
                isOwn ? "text-white/70" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {isOwn && (
              <Text className="text-xs ml-1">
                {message.status === "sending" && (
                  <Text className="text-white/70">○</Text>
                )}
                {message.status === "sent" && (
                  <Text className="text-white/70">✓</Text>
                )}
                {message.status === "delivered" && (
                  <Text className="text-white/70">✓✓</Text>
                )}
                {message.status === "read" && (
                  <Text className="text-blue-300">✓✓</Text>
                )}
              </Text>
            )}
          </View>
        </View>

        {reactionEntries.length > 0 && (
          <View className={`flex-row flex-wrap gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            {reactionEntries.map(([emoji, users]) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => onReact?.(message.id, emoji)}
                className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5 border border-gray-200 dark:border-gray-700"
              >
                <Text className="text-xs">{emoji}</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">{users.length}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showReactions && (
          <View className={`flex-row gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            {QUICK_REACTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => {
                  onReact?.(message.id, emoji);
                  setShowReactions(false);
                }}
                className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 items-center justify-center"
              >
                <Text className="text-sm">{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
