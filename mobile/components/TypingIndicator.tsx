import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { useSocketStore } from "@/store/socketStore";

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 600, easing: Easing.ease }),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={style}
      className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 mx-0.5"
    />
  );
}

interface TypingIndicatorProps {
  chatId?: string;
}

export function TypingIndicator({ chatId }: TypingIndicatorProps) {
  const typingUserId = useSocketStore((s) => s.typingUserId);
  const typingUsername = useSocketStore((s) => s.typingUsername);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typingUserId) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        useSocketStore.setState({ typingUserId: null, typingUsername: null });
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [typingUserId]);

  if (!visible || !typingUserId) return null;

  return (
    <View className="flex-row items-center px-4 py-2">
      <View className="bg-gray-100 dark:bg-gray-800 rounded-2 px-4 py-3 flex-row items-center">
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </View>
      <Text className="text-xs text-gray-400 dark:text-gray-500 ml-2">
        {typingUsername ? `${typingUsername} is typing...` : "typing..."}
      </Text>
    </View>
  );
}
