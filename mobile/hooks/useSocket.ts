import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { socket } from "@/lib/socket";
import { useSocketStore } from "@/store/socketStore";
import { useQueryClient } from "@tanstack/react-query";

export function useSocket(chatId?: string) {
  const { getToken } = useAuth();
  const { isConnected } = useSocketStore();
  const queryClient = useQueryClient();
  const chatIdRef = useRef(chatId);

  chatIdRef.current = chatId;

  useEffect(() => {
    const connectSocket = async () => {
      const token = await getToken();
      if (!token) return;

      socket.auth = { token };
      socket.connect();
    };

    connectSocket();

    return () => {
      socket.disconnect();
    };
  }, [getToken]);

  useEffect(() => {
    if (!isConnected) return;

    const handleConnect = () => {
      useSocketStore.setState({ isConnected: true });
    };
    const handleDisconnect = () => {
      useSocketStore.setState({ isConnected: false });
    };
    const handleUserOnline = (data: { userId: string }) => {
      useSocketStore.getState().addOnlineUser(data.userId);
    };
    const handleUserOffline = (data: { userId: string }) => {
      useSocketStore.getState().removeOnlineUser(data.userId);
    };
    const handlePresenceUpdate = (data: { onlineUsers: string[] }) => {
      useSocketStore.setState({ onlineUsers: data.onlineUsers });
    };
    const handleMessageDelivered = (data: { messageId: string; chatId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", data.chatId] });
    };
    const handleMessageRead = (data: { messageId: string; chatId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", data.chatId] });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);
    socket.on("presence:update", handlePresenceUpdate);
    socket.on("message:delivered", handleMessageDelivered);
    socket.on("message:read", handleMessageRead);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("message:delivered", handleMessageDelivered);
      socket.off("message:read", handleMessageRead);
    };
  }, [isConnected, queryClient]);

  useEffect(() => {
    if (!isConnected || !chatId) return;

    socket.emit("join:chat", chatId);

    return () => {
      socket.emit("leave:chat", chatId);
    };
  }, [isConnected, chatId]);

  useEffect(() => {
    if (!isConnected) return;

    const handleNewMessage = (message: any) => {
      queryClient.invalidateQueries({ queryKey: ["messages", chatIdRef.current] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    };

    const handleMessageEdited = (data: { messageId: string; chatId: string; content: string }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", data.chatId] });
    };

    const handleMessageReaction = (data: { messageId: string; chatId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", data.chatId] });
    };

    const handleMessagePinned = (data: { messageId: string; chatId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", data.chatId] });
    };

    const handleTyping = (data: { userId: string; chatId: string; username: string; isTyping: boolean }) => {
      if (data.chatId === chatIdRef.current) {
        if (data.isTyping) {
          useSocketStore.setState({ typingUserId: data.userId, typingUsername: data.username });
        } else {
          useSocketStore.setState({ typingUserId: null, typingUsername: null });
        }
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:edited", handleMessageEdited);
    socket.on("message:reaction", handleMessageReaction);
    socket.on("message:pinned", handleMessagePinned);
    socket.on("message:unpinned", handleMessagePinned);
    socket.on("typing:update", handleTyping);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:edited", handleMessageEdited);
      socket.off("message:reaction", handleMessageReaction);
      socket.off("message:pinned", handleMessagePinned);
      socket.off("message:unpinned", handleMessagePinned);
      socket.off("typing:update", handleTyping);
    };
  }, [isConnected, queryClient]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!chatId || !isConnected) return;
      socket.emit("message:send", { chatId, content });
    },
    [chatId, isConnected]
  );

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!chatId || !isConnected) return;
      if (isTyping) {
        socket.emit("typing:start", { chatId });
      } else {
        socket.emit("typing:stop", { chatId });
      }
    },
    [chatId, isConnected]
  );

  const emitRead = useCallback(
    (messageId: string) => {
      if (!chatId || !isConnected) return;
      socket.emit("message:read", { chatId, messageId });
    },
    [chatId, isConnected]
  );

  const joinChat = useCallback(
    (targetChatId: string) => {
      if (!isConnected) return;
      socket.emit("join:chat", targetChatId);
    },
    [isConnected]
  );

  const leaveChat = useCallback(
    (targetChatId: string) => {
      if (!isConnected) return;
      socket.emit("leave:chat", targetChatId);
    },
    [isConnected]
  );

  const emitReply = useCallback(
    (content: string, replyTo: string) => {
      if (!chatId || !isConnected) return;
      socket.emit("message:reply", { chatId, content, replyTo });
    },
    [chatId, isConnected]
  );

  return { sendMessage, emitTyping, emitRead, joinChat, leaveChat, emitReply, isConnected };
}
