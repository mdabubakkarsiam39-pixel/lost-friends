import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { tokenCache } from "@/lib/tokenCache";
import { setClerkAuth } from "@/lib/clerk";
import { useHydrateTheme } from "@/store/themeStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function ThemeHydrator() {
  useHydrateTheme();
  return null;
}

function InitialLayout() {
  const auth = useAuth();
  const { isLoaded, isSignedIn } = auth;

  useEffect(() => {
    if (isLoaded) {
      setClerkAuth(auth);
    }
  }, [isLoaded, isSignedIn, auth]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <ThemeHydrator />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" redirect={isSignedIn} />
        <Stack.Screen name="(tabs)" redirect={!isSignedIn} />
        <Stack.Screen name="chat/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="group/create" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="group/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
      </Stack>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <QueryClientProvider client={queryClient}>
            <InitialLayout />
          </QueryClientProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default RootLayoutNav;
