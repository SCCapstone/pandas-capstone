import express from "express";
import cors from "cors";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from "@prisma/client";
import { env } from "process";


const app = express();
const prisma = new PrismaClient();
const PORT = env.SERVER_PORT || 2020;
const JWT_SECRET = env.JWT_SECRET || 'your_default_jwt_secret';

app.use(express.json());
app.use(cors());

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



//chat endpoints
// Get all chats
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await prisma.Chat.findMany({
      include: { messages: true }, // Include messages associated with the chat
      orderBy: { sent_at: 'desc' },
    });
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get messages for a specific chat
app.get('/api/chats/:chatId/messages', async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { id: parseInt(chatId) },
      orderBy: { sent_at: 'asc' },
    });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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



app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});
