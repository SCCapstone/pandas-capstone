import express from "express";
import cors from "cors";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Grade, Gender, StudyTags } from "@prisma/client";
import { env } from "process";
import { Request, Response } from 'express';
import http from "http";
import { Server } from "socket.io";
import path, { parse } from 'path';
import { JwtPayload } from "jsonwebtoken";
import nodemailer from "nodemailer";
import { profile } from "console";

interface CustomJwtPayload extends JwtPayload {
  userId: number; // Make userId an integer
}

const app = express();
const prisma = new PrismaClient();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});




const PORT = env.SERVER_PORT || 2020;
const JWT_SECRET = env.JWT_SECRET || 'your_default_jwt_secret';


app.use(express.json());
app.use(cors());

// access images for website in public folder
app.use('/public', express.static(path.join(__dirname, '..', 'learnlink-ui', 'public')));

// Middleware for authentication
const authenticate = (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    res.locals.userId = decoded.userId;
    return next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Signup endpoint
app.post("/api/users", async (req, res): Promise<any> => {
  const { firstName, lastName, email, username, password, ideal_match_factor } = req.body;

  try {
      // Check if username or email already exists
      // Check if email already exists
    const emailExists = await prisma.user.findUnique({
      where: { email: email }
    });

    if (emailExists) {
      return res.status(400).json({ error: "EmailAlreadyExists" });
    }

    // Check if username already exists
    const usernameExists = await prisma.user.findUnique({
      where: { username: username }
    });

    if (usernameExists) {
      return res.status(400).json({ error: "UsernameAlreadyExists" });
    }
    // Hash the password before storing it in the database -> for security
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword, // Store hashed ver in prod
        ideal_match_factor: ideal_match_factor || null, // Preferences can be null for now? might change later
      },
    });

    // Create a JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Send back the token
    return res.status(201).json({ token, user: { id: newUser.id, username: newUser.username } });
  
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Login endpoint
app.post('/api/login', async (req, res): Promise<any> => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // If user doesn't exist or password is incorrect, return an error
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Compare the entered password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send back the token
    res.status(200).json({ token });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to retrieve enum values
app.get('/api/enums', async (req, res) => {
  try {
    // Manually define enum values by accessing them from the generated Prisma types
    const gradeEnum = Object.values(Grade); // Fetches ['UNDERGRAD', 'GRAD']
    const genderEnum = Object.values(Gender); // Fetches ['MALE', 'FEMALE', 'OTHER']
    const studyHabitTags = Object.values(StudyTags); 
    res.status(200).json({ grade: gradeEnum, gender: genderEnum, studyHabitTags });
  } catch (error) {
    console.error('Error fetching enum values:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch user profile data
app.get('/api/users/profile', authenticate, async (req, res):Promise<any> => {
  const userId = res.locals.userId;  // Use res.locals to get the userId set by the authenticate middleware

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // Fetch the user from the database by userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the profile data
    res.json({
      first_name: user.firstName,
      last_name: user.lastName,
      username: user.username,
      age: user.age,
      college: user.college,
      major: user.major,
      grade: user.grade,
      relevant_courses: user.relevant_courses,
      study_method: user.study_method,
      gender: user.gender,
      bio: user.bio,
      email:user.email,
      ideal_match_factor: user.ideal_match_factor,
      studyHabitTags: user.studyHabitTags,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch user profile data
app.get('/api/users/profile/:userId', authenticate, async (req, res):Promise<any> => {
  const userId = parseInt(req.params.userId);
  const placeholderImage = "https://learnlink-public.s3.us-east-2.amazonaws.com/AvatarPlaceholder.svg";


  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // Fetch the user from the database by userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the profile data
    res.json({
      first_name: user.firstName,
      last_name: user.lastName,
      username: user.username,
      age: user.age,
      college: user.college,
      major: user.major,
      grade: user.grade,
      relevant_courses: user.relevant_courses,
      study_method: user.study_method,
      gender: user.gender,
      bio: user.bio,
      email:user.email,
      ideal_match_factor: user.ideal_match_factor,
      studyHabitTags: user.studyHabitTags,
      profilePic: user.profilePic || placeholderImage,
    });


  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/users/update', async (req, res): Promise<any> => {
  const { first_name, last_name, username, age, college, major, grade, relevant_courses, study_method, gender, bio, studyHabitTags, ideal_match_factor } = req.body;
  console.log('Received data:', req.body); // Log incoming data for debugging


  // Get the token from the request headers
  const token = req.headers.authorization?.split(' ')[1]; // Expecting the token to be in the format "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify the token and get the user data
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId; // Get userId from the token payload
    console.log('userId:', userId);

    // Update the user's profile information in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: first_name || undefined, // Use undefined to keep the existing value if not provided
        lastName: last_name || undefined,
        username: username || undefined,
        age: age || undefined, // Use undefined to keep the existing value if not provided
        college: college || undefined,
        major: major || undefined,
        grade: grade || undefined,
        relevant_courses: relevant_courses || undefined,
        study_method: study_method || undefined,
        gender: gender || undefined,
        bio: bio || undefined,
        studyHabitTags: studyHabitTags || undefined,
        ideal_match_factor: ideal_match_factor || undefined
      },
    });

    // Send back the updated user information
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update email route
app.post('/api/update-email', authenticate, async (req, res):Promise<any> => {
  const { oldEmail, newEmail } = req.body;
  const userId = res.locals.userId; 

  try {
    // Fetch current user's email from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the old email matches the current email
    if (user.email !== oldEmail) {
      return res.status(400).json({ error: 'Old email does not match current email' });
    }

    // Update the email
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    return res.status(200).json({ message: 'Email updated successfully', updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/update-password', authenticate, async (req, res):Promise<any> => {
  const { oldPassword, newPassword } = req.body;
  const userId = res.locals.userId; 

  try {
    // Fetch current user's email from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the old email matches the current email
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Old password does not match current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);


    // Update the email
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: 'Password updated successfully', updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// MATCHING LOGIC

// Endpoint to handle swipe action and create a match if applicable
app.post('/api/swipe', async (req, res) => {
  const { userId, targetId, direction, isStudyGroup } = req.body;

  try {
    // Store the swipe in the database
    const swipe = await prisma.swipe.create({
      data: {
        userId,
        direction,
        targetUserId: isStudyGroup ? null : targetId,  // If study group, nullify targetUserId
        targetGroupId: isStudyGroup ? targetId : null,  // If user, nullify targetGroupId
      },
    });

    // If the swipe was 'Yes', check if it's a match
    if (direction === 'Yes') {
      if (isStudyGroup) {
        // Check for a mutual swipe with the study group
        await createMatchForStudyGroup(userId, targetId);
      } else {
        // Check for a mutual swipe with another user
        await createMatchForUsers(userId, targetId);
      }
    }

    res.status(200).json({ message: 'Swipe recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Helper function to create user-to-user matches
const createMatchForUsers = async (userId: number, targetUserId: number) => {
  const targetUserSwipe = await prisma.swipe.findFirst({
    where: {
      userId: targetUserId,
      targetUserId: userId,  // Check if the target user has swiped on the user
      direction: 'Yes',
    },
  });

  if (targetUserSwipe) {
    await prisma.match.create({
      data: {
        user1Id: userId,
        user2Id: targetUserId,
        isStudyGroupMatch: false,
      },
    });
  }
};

// Helper function to create user-to-study-group matches
const createMatchForStudyGroup = async (userId: number, targetGroupId: number) => {
  const studyGroupSwipe = await prisma.swipe.findFirst({
    where: {
      userId: targetGroupId,
      targetUserId: userId,  // Check if the group has swiped on the user
      direction: 'Yes',
    },
  });

  if (studyGroupSwipe) {
    await prisma.match.create({
      data: {
        user1Id: userId,
        studyGroupId: targetGroupId,
        isStudyGroupMatch: true,
      },
    });
  }
};

// Endpoint to retrieve matches for a user
app.get('/api/profiles', authenticate, async (req: Request, res: Response) => {
  const userId = res.locals.userId; // Retrieved from the token  const userId = parseInt(req.params.userId);

  try {

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: true,
        user2: true,
        studyGroup: true,
      },
    });

    res.status(200).json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/api/profiles/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {

    const placeholderImage = "https://learnlink-public.s3.us-east-2.amazonaws.com/AvatarPlaceholder.svg";

    // Fetch users and study groups that the current user has not swiped on yet
    const usersToSwipeOn = await prisma.user.findMany({
      where: {
        NOT: {
          id: userId,  // Exclude the current user from the profiles
        },
        // You can add additional filters here like matching preferences, etc.
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        profilePic: true,
        bio: true,
        grade: true,
        major: true,
        relevant_courses: true,
        study_method: true,
        gender: true,
        age: true,
        college: true,
        studyHabitTags: true,
      },
    });

    const usersWithPlaceholder = usersToSwipeOn.map(user => ({
      ...user,
      profilePic: user.profilePic || placeholderImage,
    }));

    const studyGroupsToSwipeOn = await prisma.studyGroup.findMany({
      where: {
        // Add any conditions to exclude study groups the user has already swiped on
      },
      select: {
        id: true,
        name: true,
        subject: true,
        description: true,
        creator: true,
        users: true,
      },
    });

    res.status(200).json({
      users: usersWithPlaceholder,
      studyGroups: studyGroupsToSwipeOn,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Tried putting this in snother file and no dice :(
export const deleteUserById = async (userId: number) => {
  try {
    // Delete related records in explicit join tables
    await prisma.chat.deleteMany({ where: { users: { some: { id: userId } } } });

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


app.delete('/api/users/:id', authenticate, async (req, res): Promise<any> => {
  const userId = parseInt(req.params.id);
  console.log('Deleting user with ID:', userId);

  if (!userId) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  // // Ensure the authenticated user has permission to delete
  // if (req.user.role !== 'admin' && req.user.id !== userId) {
  //   return res.status(403).json({ error: 'Forbidden: Not authorized to delete this user' });
  // }

  try {
    await deleteUserById(userId);
    res.status(200).json({ message: `User with ID ${userId} deleted successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
  
/********* STUDY GROUPS */
app.post('/api/study-groups', authenticate, async (req, res): Promise<any> => {
  const userId = res.locals.userId;
  const { name, subject, description, users } = req.body;

  try {
    // Validate the input data (optional but recommended)
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Create the new study group
    const newStudyGroup = await prisma.studyGroup.create({
      data: {
        name,
        subject,
        description,
        users,
        creator: { connect: { id: userId } },
      },
    });

    // Send back the created study group as a response
    return res.status(201).json({ message: 'Study group created successfully', studyGroup: newStudyGroup });
  } catch (error) {
    console.error('Error creating study group:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// SEARCH FEATURE
app.get('/api/users/search', authenticate, async (req, res): Promise<any> => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query as string, mode: 'insensitive' } },
          { firstName: { contains: query as string, mode: 'insensitive' } },
          { lastName: { contains: query as string, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });

    return res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});





/*************** MESSAGING END POINTS API */


// Route to get the current user's details
app.get('/api/currentUser', authenticate, async (req, res): Promise<any> => {
  try {
    const userId = res.locals.userId; // Retrieved from the token payload

  
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with the user's basic details
    res.json({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// WORKS
app.get('/api/users', async (req, res) => {
  try {
    // Fetch users from the database using Prisma
    const users = await prisma.user.findMany();
    
    // Respond with the users in JSON format
    res.status(200).json(users);
  } catch (error) {
    // Log the error and send a response with a 500 status code in case of error
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all chats for a user
// WORKS
// pulls up the chats with the users authentication code
// Pulls up the chats with the user's authentication code
app.get('/api/chats', authenticate, async (req, res): Promise<any> => {
  const userId = res.locals.userId; // Use res.locals to get the userId set by the authenticate middleware

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // Fetch the user's chats and their messages
    const userChats = await prisma.chat.findMany({
      where: {
        users: {
          some: { id: userId }, // Filter chats by userId
        },
      },
      include: {
        users: true, // Include chat participants
        messages: {  // Include messages for each chat
          orderBy: {
            createdAt: 'asc', // Sort messages by creation time (optional)
          },
        },
      },
    });

    if (!userChats || userChats.length === 0) {
      return res.status(404).json({ message: 'No chats found' });
    }

    // Return the chats with their messages
    res.json(userChats);
  } catch (error) {
    console.error('Error retrieving chats and messages for user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




//WORKS
// Delete a chat
app.delete('/api/chats/:chatId', async (req, res):Promise<any> => {
  const { chatId } = req.params;
  const userId = res.locals.userId;

  try {
    // Ensure the user is part of the chat

    if (!chatId || isNaN(parseInt(chatId))) {
      return res.status(400).json({ error: "Invalid chat ID." });
    }
    
    const chat = await prisma.chat.findUnique({
      where: { id: parseInt(chatId) },
      include: { users: true },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    //const isUserInChat = chat.users.some((user) => user.id === userId);

    // Delete the chat
    await prisma.chat.delete({
      where: { id: parseInt(chatId) },
    });

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// WORKS
// Add a message to a chat
app.post('/api/chats/:chatId/messages', authenticate, async (req, res): Promise<any> => {
  const { chatId } = req.params;
  const { content } = req.body;
  const userId = res.locals.userId;

  if (!content.trim()) {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }

  try {
    // Save the new message to the database
    const newMessage = await prisma.message.create({
      data: {
        content,
        userId, // Associate the message with the sender
        chatId: parseInt(chatId),
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Create a new chat
// WORKS
// Technically should not be called
app.post('/api/chats', async (req, res) => {
  const { name, userId } = req.body; // Assuming the user is the creator of the chat

  try {
    const newChat = await prisma.chat.create({
      data: {
        name,
        users: {
          connect: { id: userId }, // Assuming a user creates the chat
        },
      },
    });
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


//WORKS
app.post('/api/chats/:userId', authenticate, async (req: Request, res: Response): Promise<any> => {
  const { recipientUserId, chatName } = req.body;
  const userId = res.locals.userId;

  // Log the userId extracted from middleware
  console.log('Authenticated User ID (from middleware):', userId);

  if (!userId) {
    console.error('User not authenticated');
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!recipientUserId) {
    return res.status(400).json({ error: 'Recipient user ID is required' });
  }
  try {

    const recipient = await prisma.user.findUnique({
      where: { id: recipientUserId },
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const name = chatName || `${userId} and ${recipientUserId}`;

    const newChat = await prisma.chat.create({
      data: {
        name,
        users: {
          connect: [
            { id: userId },
            { id: recipientUserId },
          ],
        },
      },
    });

    io.emit('new-chat', {
      chatId: newChat.id,
      chatName: newChat.name,
      users: [userId, recipientUserId],
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Internal server error', message: error });
  }
});



/*************** WEBSOCKETS */

//app.use('/public', express.static(path.join(__dirname, '..', 'learnlink-ui', 'public')));
//TODO there is a get console error happening in socket.io seen below 
// GET http://localhost:2020/socket.io/?EIO=4&transport=polling&t=877a3it0 404 (Not Found)

app.get('/socket-test', (req, res) => {
  res.send('Socket Test');
});

// Set up a basic route
app.get('/socket-io', (req, res) => {
  res.send('Socket.IO server is running');
});
/*
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('message', 'Hello from server'); // Test message to the client

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

*/

// Real-time WebSocket chat functionality
io.on("connection", (socket) => {
  console.log("User connected");
  /*
  socket.on("joinChat", async ({ chatId, token }) => {
    if (!chatId || !token) {
      return socket.emit("error", { message: "Invalid chatId or token" });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
      const userId = decoded.userId; // Now `userId` is inferred as a number

  
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: { users: true },
      });
  
      if (!chat || !chat.users.some((user) => user.id === userId)) {
        return socket.emit("error", { message: "Access denied to chat" });
      }
  
      socket.join(`chat_${chatId}`);
      console.log(`User ${userId} joined chat ${chatId}`);
    } catch (error) {
      console.error("Error in joinChat:", error);
      socket.emit("error", { message: "Invalid token or chat access error" });
    }
  });
  */

  socket.on('message', async (data, callback) => {
    try {
      // Validate the incoming data
      if (!data.content || !data.chatId || !data.userId) {
        throw new Error('Missing required fields: content, chatId, or userId');
      }
  
      // Create a new message in the database using Prisma
      const newMessage = await prisma.message.create({
        data: {
          content: data.content,
          createdAt: new Date(),
          user: {
            connect: { id: data.userId }, // Connect the User by its ID
          },
          chat: {
            connect: { id: data.chatId }, // Connect the Chat by its ID
          },
        },
      });
      
      const savedMessage = await prisma.message.findUnique({
        where: { id: newMessage.id },
      });
      console.log('Saved message in database:', savedMessage);
      
  
      //console.log('Message saved to database:', newMessage);
  
      // Emit the new message to all clients (broadcasting to all connected clients)
      io.emit('newMessage', newMessage);
      //socket.broadcast.emit('newMessage', newMessage);
      //ocket.broadcast.emit('newMessage', newMessage);
      console.log('Broadcasting message:', newMessage);



      // Send success callback to the sender
      callback({ success: true, message: 'Message sent from server successfully!' });
    } catch (error) {
      console.error('Error handling message:', error);
      callback({ success: false, error: error });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});







/****** Code for forget password */

const sendEmail = async (to: string, subject: string, text: string, html: string): Promise<void> => {
  const transport = nodemailer.createTransport(
    {
      service: "icloud",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_Password,
      },
    }
  );
  const mailOptions = {
    from: `"LearnLink" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  };

  try {
    await transport.sendMail(mailOptions);
  } catch (error) {
    console.error("Error in sending the email" , error);
    throw new Error("Failed to send email");
  }
  
};



/******API endpoint for the forgot password */

app.post ('/api/forgotpassword', async (req, res):Promise<any> => {
  const {email} = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send the email
    await sendEmail(
      email,
      "Password Reset Request",
      `Click the link to reset your password: ${resetLink}`,
      `<p>Click the link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    );

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});








/********* LISTEN FUNCT */

// Start the server on port 2020
server.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});
