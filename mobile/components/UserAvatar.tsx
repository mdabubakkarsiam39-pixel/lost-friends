import { View, Image } from "react-native";

interface UserAvatarProps {
  source?: string;
  online?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 80,
};

const dotSizeMap = {
  sm: 8,
  md: 10,
  lg: 14,
};

export function UserAvatar({ source, online = false, size = "md" }: UserAvatarProps) {
  const avatarSize = sizeMap[size];
  const dotSize = dotSizeMap[size];

  return (
    <View className="relative">
      <Image
        source={
          source
            ? { uri: source }
            : require("@/assets/default-avatar.png")
        }
        style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
        className="bg-gray-200 dark:bg-gray-700"
      />
      {online && (
        <View
          className="absolute bottom-0 right-0 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"
          style={{ width: dotSize, height: dotSize }}
        />
      )}
    </View>
  );
}
