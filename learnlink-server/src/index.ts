import express from "express";
import cors from "cors";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Grade, Gender } from "@prisma/client";
import { env } from "process";
import { Request, Response } from 'express';
import { User } from '@prisma/client';


const app = express();
const prisma = new PrismaClient();
const PORT = env.SERVER_PORT || 2020;
const JWT_SECRET = env.JWT_SECRET || 'your_default_jwt_secret';

app.use(express.json());
app.use(cors());

// Middleware to authenticate the user
const authenticate = (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expecting the token to be in the format "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    res.locals.userId = decoded.userId; // Attach userId to request object -- maybe change this for security???
    return next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Signup endpoint
app.post("/api/users", async (req, res) => {
  const { firstName, lastName, email, username, password, profile_preferences } = req.body;

  try {
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



//chat endpoints
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

/*
// Get messages for a specific chat
app.get('/api/chats/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: parseInt(chatId) },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }, // Order messages by creation time in ascending order
          include: {
            user: true, // Include the user info for each message (optional)
          },
        },
        users: true, // Optionally include users in the chat
      },
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat.messages); // Return only the messages
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
/*
// Create a new chat
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

// Add a message to a chat
app.post('/api/chats/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;
  const { userId, content } = req.body; // Assuming the user sending the message

  try {
    const newMessage = await prisma.chat.create({
      data: {
        id: parseInt(chatId),
        content,
        user_id: userId, // Link message to user who sent it
      },
    });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

*/

app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});
