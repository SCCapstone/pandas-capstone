// src/utils/messageUtils.ts

import io from "socket.io-client";

const REACT_APP_API_URL = process.env.REACT_APP_API_URL || "http://localhost:2000";

const socket = io(REACT_APP_API_URL, {
  transports: ["websocket"], // Ensure WebSocket is explicitly used
  reconnectionAttempts: 3, // Retry if connection fails
  timeout: 10000, // 10 seconds timeout
});

export const handleSendSystemMessage = (
  mss: string,
  selectedChatid: any,
  setSelectedChat?: Function,
  setChats?: Function,
  setUpdateMessage?: Function
) => {
  const token = localStorage.getItem("token");
  if (mss.trim() && selectedChatid) {
    try {
      const messageData = {
        id: Date.now(),
        content: mss.trim(),
        createdAt: new Date().toISOString(),
        userId: undefined,
        chatId: selectedChatid,
        liked: false,
        system: true,
      };

      socket.emit(
        "message",
        {
          chatId: selectedChatid,
          content: mss,
          userId: undefined,
          system: true,
          token,
        },
        (response: { success: boolean; message?: string; error?: string }) => {
          if (response.success) {
            console.log("Message sent successfully:", response.message);
          } else {
            console.log("Message send failed:", response.error);
          }
        }
      );

      if (setSelectedChat) {
        setSelectedChat((prevSelectedChat: any) =>
          prevSelectedChat
            ? { ...prevSelectedChat, messages: [...(prevSelectedChat.messages || []), messageData] }
            : null
        );
      }

      if (setChats) {
        setChats((prevChats: any) => {
          const updatedChats = prevChats.map((chat: any) =>
            chat.id === selectedChatid
              ? {
                  ...chat,
                  messages: [...(chat.messages || []), messageData],
                  updatedAt: new Date().toISOString(),
                }
              : chat
          );

          return updatedChats.sort(
            (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
      }

      if (setUpdateMessage) {
        setUpdateMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
};
