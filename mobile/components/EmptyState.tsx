import { View, Text } from "react-native";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
        {title}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {message}
      </Text>
    </View>
  );
}
