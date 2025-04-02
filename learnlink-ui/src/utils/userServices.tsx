import { PrismaClient, } from '@prisma/client';
import { useState, useEffect, useMemo, useCallback } from "react";
import { getLoggedInUserId } from './auth';
import axios from "axios";


type SwipeStatus = 'Pending' | 'Accepted' | 'Denied';
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


// const prisma = new PrismaClient();

// export const deleteUserById = async (userId: number) => {
//   try {
//     // Delete related records in explicit join tables
//     await prisma.chatUser.deleteMany({ where: { userId } });

//     // Delete swipes
//     await prisma.swipe.deleteMany({ where: { OR: [{ userId }, { targetUserId: userId }] } });

//     // Delete matches
//     await prisma.match.deleteMany({ where: { OR: [{ user1Id: userId }, { user2Id: userId }] } });

//     // Delete notifications
//     await prisma.notification.deleteMany({ where: { user_id: userId } });

//     // Delete messages
//     await prisma.message.deleteMany({ where: { userId } });

//     // Finally, delete the user
//     await prisma.user.delete({ where: { id: userId } });

//     console.log(`User ${userId} and related data deleted successfully.`);
//   } catch (error) {
//     console.error(`Error deleting user ${userId}:`, error);
//     if (error instanceof Error) {
//       throw new Error(`Failed to delete user: ${error.message}`);
//     } else {
//       throw new Error('Failed to delete user: Unknown error');
//     }
//   }
// };

export const updateSwipeStatus = async (id: number, status: SwipeStatus) => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/api/swipe-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update swipe status');
    }

    const updatedRequest = await response.json();
    console.log('Swipe request updated:', updatedRequest);
    return updatedRequest;
  } catch (error) {
    console.error('Error updating swipe request:', error);
  }
};


export const useMatchButtonStatus = (targetUserId: number) => {
  const [status, setStatus] = useState({
    buttonText: "Match",
    isButtonDisabled: false,
    matchButtonError: null as string | null,
  });

  // A counter to force re-fetching
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Function to refresh the status
  const refreshStatus = useCallback(() => {
    setRefreshCounter((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const checkMatchStatus = async () => {

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, user might not be logged in.");
          return;
        }

        const currUserId = getLoggedInUserId();
        if (currUserId== targetUserId) {
          return setStatus({ buttonText: "Match", isButtonDisabled: true, matchButtonError: null });

        }

        const requestResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/swipe/user/pendingRequestCheck/${targetUserId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!requestResponse.ok) {
          throw new Error("Failed to fetch match availability");
        }

        const statusString = await requestResponse.json();

        console.log("Match button id:", targetUserId, statusString);

        // Update status based on response
        switch (statusString) {
          case null:
          case "Denied":
            setStatus({ buttonText: "Match", isButtonDisabled: false, matchButtonError: null });
            break;
          case "Accepted":
            setStatus({ buttonText: "Connected", isButtonDisabled: true, matchButtonError: null });
            break;
          case "Pending":
            setStatus({ buttonText: "Pending", isButtonDisabled: true, matchButtonError: null });
            break;
          default:
            setStatus({ buttonText: "Match", isButtonDisabled: true, matchButtonError: "Unknown status" });
        }
      } catch (error: any) {
        console.error("Error fetching match button status:", error);
        setStatus({ buttonText: "Match", isButtonDisabled: true, matchButtonError: error.message || "Error" });
      }
    };

    checkMatchStatus();
  }, [targetUserId, refreshCounter]); // Dependencies

  return { ...status, refreshStatus };
};


/**
 * Sends a match request notification to users or a study group.
 * @param {any} currentProfile - The profile of the recipient (individual or group).
 */
export const sendMatchRequestNotification = async (currentProfile: any) => {
  const token = localStorage.getItem("token");
  let requesterName = "unknown";

  if (token) {
    try {
      const response = await axios.get(`${REACT_APP_API_URL}/api/currentUser`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      requesterName = `${response.data.firstName} ${response.data.lastName}`;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return;
    }
  }

  const isStudyGroup = Array.isArray(currentProfile.users) && currentProfile.users.length > 0;
  let notificationRecipients: number[] = [];
  let notificationMessage = `You have a new pending request from ${requesterName}`;

  if (isStudyGroup) {
    notificationRecipients = currentProfile.users.map((user: any) => user.id);
    notificationMessage = `You have a new pending request from ${requesterName} in ${currentProfile.name} group`;
  } else {
    notificationRecipients = [currentProfile.id];
  }

  try {
    await Promise.all(
      notificationRecipients.map(async (recipientId) => {
        await fetch(`${REACT_APP_API_URL}/notifications/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: recipientId,
            message: notificationMessage,
            type: "Match",
          }),
        });
      })
    );

    console.log("Notification(s) sent successfully!");
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};