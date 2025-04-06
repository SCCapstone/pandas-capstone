// src/utils/messageUtils.ts

import io from "socket.io-client";
import axios from 'axios';
import { Dispatch, SetStateAction } from "react";

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
            ? {
                ...prevSelectedChat,
                messages: [...(prevSelectedChat.messages || []), messageData],
              }
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

export const handleSendButtonMessage = (
  buttonData: { label: string; action: string; studyGroupId?: number },
  selectedChatid: any,
  userId: any,
  setSelectedChat?: Function,
  setChats?: Function,
  setUpdateMessage?: Function
) => {
  console.log('eep')

  const token = localStorage.getItem("token");
  if (selectedChatid && buttonData.label.trim()) {
    try {
      const messageData = {
        id: Date.now(),
        content: buttonData.label, // Display label as message content
        createdAt: new Date().toISOString(),
        userId,
        chatId: selectedChatid,
        liked: false,
        system: false, // Consider button messages as system messages
        isButton: true,
        buttonData: { ...buttonData }, // Attach button data
      };

      socket.emit(
        "message",
        {
          chatId: selectedChatid,
          content: buttonData.label,
          userId,
          system: false,
          isButton: true,
          buttonData,
          token,
        },
        (response: { success: boolean; message?: string; error?: string }) => {
          if (response.success) {
            console.log("Button message sent successfully:", response.message);
          } else {
            console.log("Button message send failed:", response.error);
          }
        }
      );

      if (setSelectedChat) {
        setSelectedChat((prevSelectedChat: any) =>
          prevSelectedChat
            ? {
                ...prevSelectedChat,
                messages: [...(prevSelectedChat.messages || []), messageData],
              }
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
      console.error("Error sending button message:", error);
    }
  }
};



export const updateChatTimestamp = async (chatId: any) => {
    try {
      await axios.put(`${REACT_APP_API_URL}/api/study-groups/chats/${chatId}`);
      console.log(`Chat ${chatId} updated time successfully`);
    } catch (error) {
      console.error("Failed to update chat timestamp:", error);
    }
  };



  // Function to open a Calendar Event creation for a study group
  export const createCalendarEvent = (eventDetails: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
  }) => {
    // Convert date and time strings into Date objects
    const startDate = new Date(`${eventDetails.date}T${eventDetails.startTime}:00`);
    const endDate = new Date(`${eventDetails.date}T${eventDetails.endTime}:00`);
  
    // Format dates for Google & Outlook URLs
    const formattedStart = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const formattedEnd = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
    // Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}&dates=${formattedStart}/${formattedEnd}`;
  
  //   // Outlook Calendar URL
  //   const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventDetails.title)}&body=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}`;
  
  //   // Create .ics file for Apple Calendar and other local apps
  //   const icsContent = `BEGIN:VCALENDAR
  // VERSION:2.0
  // BEGIN:VEVENT
  // SUMMARY:${eventDetails.title}
  // LOCATION:${eventDetails.location}
  // DESCRIPTION:${eventDetails.description}
  // DTSTART:${formattedStart}
  // DTEND:${formattedEnd}
  // END:VEVENT
  // END:VCALENDAR`;
  
  //   const blob = new Blob([icsContent], { type: "text/calendar" });
  //   const icsUrl = URL.createObjectURL(blob);
  
  //   // Detect platform
  //   const isMac = navigator.platform.toUpperCase().includes("MAC");
  //   const isWindows = navigator.userAgent.includes("Windows NT");
  
  //   if (isMac) {
  //     // Offer .ics file for Apple Calendar
  //     const link = document.createElement("a");
  //     link.href = icsUrl;
  //     link.download = "event.ics";
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } else if (isWindows) {
  //     window.open(outlookCalendarUrl, "_blank");
  //   } else {
  //     window.open(googleCalendarUrl, "_blank");
  //   }

  return googleCalendarUrl
  };

  export const openCalendarEvent = (googleCalendarUrl: string) => {
    window.open(googleCalendarUrl, "_blank");

  }



  
  