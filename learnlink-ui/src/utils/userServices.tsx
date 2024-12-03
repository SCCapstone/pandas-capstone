import { PrismaClient, } from '@prisma/client';

const prisma = new PrismaClient();

export const deleteUserById = async (userId: number) => {
  try {
    // Delete related records in explicit join tables
    await prisma.chatUser.deleteMany({ where: { userId } });

    // Delete swipes
    await prisma.swipe.deleteMany({ where: { OR: [{ userId }, { targetUserId: userId }] } });

    // Delete matches
    await prisma.match.deleteMany({ where: { OR: [{ user1Id: userId }, { user2Id: userId }] } });

    // Delete notifications
    await prisma.notification.deleteMany({ where: { user_id: userId } });

    // Delete messages
    await prisma.message.deleteMany({ where: { userId } });

    // Finally, delete the user
    await prisma.user.delete({ where: { id: userId } });

    console.log(`User ${userId} and related data deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    } else {
      throw new Error('Failed to delete user: Unknown error');
    }
  }
};
