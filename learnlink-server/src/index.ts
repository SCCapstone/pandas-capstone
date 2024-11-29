import express from "express";
import cors from "cors";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Grade, Gender } from "@prisma/client";
import { env } from "process";
import { Request, Response } from 'express';
import http from "http";
import { Server } from "socket.io";

const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);
const io = new Server(server);

const PORT = env.SERVER_PORT || 2020;
const JWT_SECRET = env.JWT_SECRET || 'your_default_jwt_secret';

app.use(express.json());
app.use(cors());

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
  const { firstName, lastName, email, username, password, profile_preferences } = req.body;

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
        profile_preferences: profile_preferences || null, // Preferences can be null for now? might change later
      },
    });

    res.status(201).json(newUser); // create in json format
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

    res.status(200).json({ grade: gradeEnum, gender: genderEnum });
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
      age: user.age,
      college: user.college,
      major: user.major,
      grade: user.grade,
      relevant_courses: user.relevant_courses,
      study_method: user.study_method,
      gender: user.gender,
      bio: user.bio,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/users/update', async (req, res): Promise<any> => {
  const { age, college, major, grade, relevant_courses, study_method, gender, bio } = req.body;
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
        age: age || undefined, // Use undefined to keep the existing value if not provided
        college: college || undefined,
        major: major || undefined,
        grade: grade || undefined,
        relevant_courses: relevant_courses || undefined,
        study_method: study_method || undefined,
        gender: gender || undefined,
        bio: bio || undefined,
      },
    });

    // Send back the updated user information
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




/*************** MESSAGING END POINTS */


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

// Get all chats

// WORKS
// should eventually not be used, but for rn it works for just getting all chats on the system
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      include: {
        messages: {
          include: {
            user: true, // Include user info for each message (optional)
          },
        },
        users: true, // Include users in the chat (optional)
      },
      orderBy: {
        createdAt: 'desc', // Order by chat creation time
      },
    });
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



//TODO
// Get all chats that are associated with the user whether it be the person who started it

app.get('/api/chats/:userId', authenticate, async (req, res): Promise<any> => {
  
});


//WORKS
// Delete a chat
app.delete('/api/chats/:chatId', async (req, res):Promise<any> => {
  const { chatId } = req.params;
  const userId = res.locals.userId;

  try {
    // Ensure the user is part of the chat
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


// TODO
// DOES NOT WORK YET
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

//TODO there is a get console error happening in socket.io seen below 
// GET http://localhost:2020/socket.io/?EIO=4&transport=polling&t=877a3it0 404 (Not Found)


// Real-time WebSocket chat functionality
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("joinChat", async ({ chatId, token }) => {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
  
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
  
  socket.on("message", async ({ chatId, content, token }) => {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
  
      // Ensure the user is part of the chat
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: { users: true },
      });
  
      if (!chat || !chat.users.some((user) => user.id === userId)) {
        return socket.emit("error", { message: "Access denied to chat" });
      }
  
      // Create a new message in the database
      const newMessage = await prisma.message.create({
        data: {
          content,
          userId, // Associate the message with the sender
          chatId: parseInt(chatId),
        },
      });
  
      // Emit the new message to other clients in the chat
      io.to(`chat_${chatId}`).emit("newMessage", {
        message: newMessage,
        userId, // Optionally send user info
      });
  
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Message sending error" });
    }
  });
  
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});






/********* LISTEN FUNCT */


app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});
