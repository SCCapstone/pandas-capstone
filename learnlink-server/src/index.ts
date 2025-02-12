import express from "express";
import cors from "cors";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
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
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';
import { Resend } from 'resend';


interface CustomJwtPayload extends JwtPayload {
  userId: number; // Make userId an integer
}
const envFile = process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development';
dotenv.config({ path: envFile });
console.log('Loaded environment variables:', process.env);

// Load environment variables
const NODE_ENV = process.env.NODE_ENV || 'development'; // default to 'development'
const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH || './certs/privkey.pem'; // Local default
const HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH || './certs/fullchain.pem'; // Local default
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'; // Local React app URL
const SERVER_PORT = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : (NODE_ENV === 'production' ? 2020 : 2020);
const JWT_SECRET = env.JWT_SECRET || 'your_default_jwt_secret';
const resend = new Resend(process.env.RESEND);

// Read certificates conditionally based on the environment
const privateKey = NODE_ENV === 'production'
  ? fs.readFileSync(HTTPS_KEY_PATH, 'utf8')
  : null; // For development, you might not need HTTPS
const certificate = NODE_ENV === 'production'
  ? fs.readFileSync(HTTPS_CERT_PATH, 'utf8')
  : null;

const credentials = NODE_ENV === 'production' && privateKey && certificate
  ? { key: privateKey, cert: certificate }
  : undefined;


const app = express();
const prisma = new PrismaClient();
let server: https.Server | http.Server;

// Use HTTPS in production and HTTP in development
if (NODE_ENV === 'production' && credentials) {
  server = https.createServer(credentials, app);
} else {
  console.log('Running in development mode with HTTP');
  server = http.createServer(app);
}

// Redirect HTTP to HTTPS in production
if (NODE_ENV === 'production') {
  const httpApp = express();
  httpApp.use((req, res) => {
    const host = req.headers.host?.replace(/:80$/, ''); // Handle cases where ":80" might be appended
    res.redirect(`https://${host}${req.url}`);
  });

  http.createServer(httpApp).listen(80, () => {
    console.log('Redirecting HTTP traffic to HTTPS...');
  });
}

const io = new Server(server, {
  cors: {
    origin: '*', // Dynamically set the frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const corsOptions = {
  origin: FRONTEND_URL, // Your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Methods you want to allow
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers you want to allow
};

app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors());  // Preflight request

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

    const domainParts = email.split("@")[1]?.split(".");
    const lastExtension = domainParts ? domainParts.pop() : "";

    if (lastExtension !== "edu") {
      return res.status(400).json({ error: "NotEdu" });
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

        // Check if username or email already exists
      // Check if email already exists
      const emailExists = await prisma.user.findUnique({
        where: { email: newEmail }
      });
  
      if (emailExists) {
        return res.status(400).json({ error: "There is already an account attached to this email." });
      }
  
      const domainParts = newEmail.split("@")[1]?.split(".");
      const lastExtension = domainParts ? domainParts.pop() : "";
  
      if (lastExtension !== "edu") {
        return res.status(400).json({ error: "Please use a valid .edu email." });
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
  const { userId, targetId, direction, isStudyGroup, message, targetGroup, user } = req.body;

  try {
    // Store the swipe in the database
    const swipe = await prisma.swipe.create({
      data: {
        userId,
        direction,
        targetUserId: isStudyGroup ? null : targetId,  // If study group, nullify targetUserId
        targetGroupId: isStudyGroup ? targetId : null,  // If user, nullify targetGroupId
        message
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


//endpoint for retrieving requests from the swipe table for matching logic
app.get('/api/swipe/:currentUser', async (req, res): Promise<any> => {
  let { currentUser } = req.params;
  console.log('Fetching requests for user:', currentUser);

  const userId = parseInt(currentUser, 10);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    // Fetch all study group IDs where the current user is a member
    const userGroups = await prisma.studyGroup.findMany({
      where: { users: { some: { id: userId } } },  // Check if user is in any study group
      select: { id: true},
    });

    const userGroupIds = userGroups.map(g => g.id); // Extract group IDs

    // Find swipes where the user is directly targeted OR their group is targeted
    const swipes = await prisma.swipe.findMany({
      where: {
        OR: [
          { targetUserId: userId },  // Direct match
          { targetGroupId: { in: userGroupIds } } // User's study group is a target
        ],
      },
    });

    res.status(200).json(swipes);
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
        NOT: {
          users: {
            some: {
              id: userId, // Exclude study groups where the user is already a member
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        subject: true,
        description: true,
        created_by: true,
        created_at: true,
        creator: true,
        users: true,
        matches: true,
        swipesGiven: true,
        chatID: true,
        chat: true,
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
  const { name, subject, description, users, chatID } = req.body;
  console.log('Received request:', req.body);


  try {
    // Validate the input data (optional but recommended)
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const existingStudyGroup = await prisma.studyGroup.findFirst({
      where: {
        users: {
          every: { id: { in: users } }, // Check if all users in the provided list are in the study group
        },
      },
    });

    if (existingStudyGroup) {
      return res.json({ message: 'Study group already exists for these users.', studyGroupId: existingStudyGroup.id });
    }

    console.log('Creating study group with:', { name, subject, description, users });


    // Create the new study group
    const newStudyGroup = await prisma.studyGroup.create({
      data: {
        name,
        subject,
        description,
        users: { connect: users.map((id: number) => ({ id })) },
        creator: { connect: { id: userId } },
        chatID: chatID,
      },
    });

    // Send back the created study group as a response
    return res.status(201).json({ message: 'Study group created successfully', studyGroup: newStudyGroup });
  } catch (error) {
    console.error('Error creating study group:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/study-groups/chat/:chatId", async (req, res): Promise<any> => {
  const { chatId } = req.params;
  console.log('Fetching study group for chat:', chatId);

  try {
    // Find the study group that is linked to the provided chat ID
    const studyGroup = await prisma.studyGroup.findFirst({
      where: { chatID: parseInt(chatId) }, // Use chatId to find the corresponding study group
    });

    // If a study group is found, return its ID; otherwise, return null
    if (studyGroup) {
      console.log('Study group found:', studyGroup);
      return res.json({ 
        studyGroupID: studyGroup.id,
        name: studyGroup.name,
        subject: studyGroup.subject,
        description: studyGroup.description,
      });
    } else {
      return res.json({ studyGroupID: null }); // No study group found
    }
  } catch (error) {
    console.error("Error fetching study group:", error);
    return res.status(500).json({ error: "Server error" });
  }
});


app.put('/api/study-groups/chat/:chatID', async (req, res) : Promise<any> =>  {
  const { chatID } = req.params; // Extract chatID from the URL
  const { name, description, subject } = req.body; // Extract new study group data from the request body

  // Validate the input
  if (!name) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  try {
    // Update the study group in the database using Prisma
    const updatedStudyGroup = await prisma.studyGroup.update({
      where: { chatID: parseInt(chatID) }, // Match the study group by its chatID
      data: {
        name,
        description,
        subject,
      },
    });

    // Return the updated study group
    res.json(updatedStudyGroup);
  } catch (error) {
    console.error('Error updating study group:', error);
    res.status(500).json({ error: 'Failed to update the study group' });
  }
});


//for the request panel 

// Endpoint to get a study group by ID
app.get('/api/study-groups/:groupId', async (req, res): Promise<any> => {
  const { groupId } = req.params;
  const studyGroupId = parseInt(groupId, 10);

  if (isNaN(studyGroupId)) {
    return res.status(400).json({ error: 'Invalid Study Group ID' });
  }

  try {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyGroupId },
      include: {
        creator: true, // Fetch creator details
        users: true,   // Fetch all users in the study group
        matches: true, // Fetch associated matches
        chat: true,    // Fetch linked chat if exists
      },
    });

    if (!studyGroup) {
      return res.status(404).json({ error: 'Study Group not found' });
    }

    res.status(200).json(studyGroup);
  } catch (error) {
    console.error('Error fetching study group:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});



app.get('/api/users/search', authenticate, async (req, res): Promise<any> => {
  const { query, gender, college, ageRange, course } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const filters: any = []; // Create an array to store valid filters

    // Add search filters for username, firstName, and lastName
    filters.push({
      OR: [
        { username: { contains: query as string, mode: 'insensitive' } },
        { firstName: { contains: query as string, mode: 'insensitive' } },
        { lastName: { contains: query as string, mode: 'insensitive' } },
      ],
    });

    // Add gender filter if provided
    if (typeof gender === 'string' && gender.length > 0) {
      filters.push({ gender: { in: gender.split(',') } });
    }

    // Add college filter if provided
    if (typeof college === 'string' && college.length > 0) {
      filters.push({ college: { in: college.split(',') } });
      console.log('College:', college);
    }

    // Add course filter if provided
    if (typeof course === 'string' && course.length > 0) {
      filters.push({ course: { in: course.split(',') } });
    }

    // Add age range filter if provided
    if (ageRange && ageRange.length === 2) {
      const [minAge, maxAge] = (ageRange as string).split(',').map(Number);
      filters.push({
        age: { gte: minAge, lte: maxAge },
      });
    }

    // If no valid filters, return a 400 error
    if (filters.length === 0) {
      return res.status(400).json({ error: 'At least one filter must be provided' });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: filters,
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
//used for getting request list in messaging page
app.get('/api/users/:id', async (req, res) : Promise<any> => {
  try {
    const userId = parseInt(req.params.id);

    // Fetch a single user from the database using Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    // If user not found, return a 404 error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with the user in JSON format
    res.status(200).json(user);
  } catch (error) {
    // Log the error and send a response with a 500 status code in case of error
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get all chats for a user
// WORKS
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

app.get('/api/chats/:chatId', authenticate, async (req, res): Promise<any> => {
  const userId = res.locals.userId; // Use res.locals to get the userId set by the authenticate middleware
  const { chatId } = req.params;  // Get the chatId from the URL parameters

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!chatId) {
    return res.status(400).json({ message: 'Chat ID is required' });
  }

  try {
    // Fetch the chat by its ID and include users and messages
    const chat = await prisma.chat.findUnique({
      where: {
        id: parseInt(chatId),  // Find the chat by chatId
      },
      include: {
        users: true,  // Include participants (users) in the chat
        messages: {   // Include messages for the chat
          orderBy: {
            createdAt: 'asc',  // Order messages by their creation date
          },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Ensure that the user is part of the chat before returning the data
    const isUserInChat = chat.users.some((user) => user.id === userId);
    if (!isUserInChat) {
      return res.status(403).json({ message: 'You are not authorized to view this chat' });
    }

    // Return the chat information
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Internal server error', error});
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

    // Delete study Group too
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { chatID: parseInt(chatId) },
    });

    if (studyGroup) {
      await prisma.studyGroup.delete({
        where: { chatID: parseInt(chatId) },
      });
    }    

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
        liked: false,
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// adds a like to a message 
app.patch('/api/messages/:messageId/like', authenticate, async (req, res): Promise<any>  => {
  const { messageId } = req.params;
  
  try {
    // Fetch the current message
    const message = await prisma.message.findUnique({
      where: { id: parseInt(messageId) },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Toggle the liked state
    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(messageId) },
      data: { liked: !message.liked },
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message like status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
/*
//also for adding a like 
app.patch('/api/messages/:id/like', authenticate, async (req, res):Promise<any>  => {
  const { id } = req.params;

  try {
    // Find the message and toggle the 'liked' status
    const message = await prisma.message.findUnique({
      where: { id: parseInt(id) },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(id) },
      data: { liked: !message.liked },
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating like status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
*/





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

app.put('/api/chats/:chatId', authenticate, async (req: Request, res: Response): Promise<any> => {
  const { chatId } = req.params;
  const { chatName, studyGroupId } = req.body; // Expect studyGroupId here
  const userId = res.locals.userId;

  console.log('Authenticated User ID (from middleware):', userId);

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    // Fetch existing chat
    const existingChat = await prisma.chat.findUnique({
      where: { id: parseInt(chatId) },
      include: { users: true },
    });

    if (!existingChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Ensure the user is part of the chat before allowing updates
    if (!existingChat.users.some(user => user.id === userId)) {
      return res.status(403).json({ error: 'You are not a participant of this chat' });
    }

    let newStudyGroupId = existingChat.studyGroupId;

    if (studyGroupId) {
      const group = await prisma.studyGroup.findUnique({
        where: { id: studyGroupId },
      });

      if (!group) {
        return res.status(404).json({ error: 'Study group not found' });
      }

      newStudyGroupId = group.id;
      console.log('Study group ID from server:', newStudyGroupId);
    }

    // Update chat
    const updatedChat = await prisma.chat.update({
      where: { id: Number(chatId) },
      data: {
        name: chatName || existingChat.name,
        studyGroupId: newStudyGroupId, // Use the corrected ID
      },
      include: { users: true },
    });

    io.emit('chat-updated', {
      chatName: updatedChat.name,
      studyGroupId: updatedChat.studyGroupId,
      users: updatedChat.users.map(user => user.id),
    });

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Internal server error', message: error });
  }
});

/*************** WEBSOCKETS */

//app.use('/public', express.static(path.join(__dirname, '..', 'learnlink-ui', 'public')));

app.get('/socket-test', (req, res) => {
  res.send('Socket Test');
});

// Set up a basic route
app.get('/socket-io', (req, res) => {
  res.send('Socket.IO server is running');
});

// Real-time WebSocket chat functionality
io.on("connection", (socket) => {
  console.log("User connected");

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
      //console.log('Saved message in database:', savedMessage);
      
  
      //console.log('Message saved to database:', newMessage);
  
      // Emit the new message to all clients (broadcasting to all connected clients)
      io.emit('newMessage', newMessage);
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







// /****** Code for forget password */

// const sendEmail = async (to: string, subject: string, text: string, html: string): Promise<void> => {
//   const transport = nodemailer.createTransport(
//     {
//       service: "icloud",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_Password,
//       },
//     }
//   );
//   const mailOptions = {
//     from: `"LearnLink" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     text,
//     html
//   };

//   try {
//     await transport.sendMail(mailOptions);
//   } catch (error) {
//     console.error("Error in sending the email" , error);
//     throw new Error("Failed to send email");
//   }
  
// };

app.post("/api/sign-up-email", async (req, res) => {
  try {
    const { to } = req.body; // Get data from frontend
    console.log('Sending email to:', to);

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject: "Welcome to LearnLink",
      html: `
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
          
          body {
            font-family: 'Inter', Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .email-container {
            text-align: center;
            padding: 20px;
          }
          h1 {
            color: #00668c;
          }
          p {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <img src="../../learnlink-ui/src/components/LearnLink.svg" alt="LearnLink Logo" width="100" />
          <h1>Welcome to LearnLink!</h1>
          <p>Thank you for signing up with LearnLink. We're excited to have you on board!</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br />The LearnLink Team</p>
        </div>
      </body>
    </html>
    `
    ,
    });

    // const response = resend.emails.send({
    //   from: 'onboarding@resend.dev',
    //   to: 'jonessara141@gmail.com',
    //   subject: 'Hello World',
    //   html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    // });

    res.json({ to, success: true, response, message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

/******API endpoint for the forgot password */
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, html } = req.body; // Get data from frontend

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });

    // const response = resend.emails.send({
    //   from: 'onboarding@resend.dev',
    //   to: 'jonessara141@gmail.com',
    //   subject: 'Hello World',
    //   html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    // });

    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});

app.post("/api/forgot-password/email", async (req, res):Promise<any> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "User not found" });

  // Generate a secure reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = await bcrypt.hash(resetToken, 10);

  const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1-hour expiration

  // Save token in database
  await prisma.user.update({
    where: { email },
    data: { resetToken: hashedResetToken, resetTokenExpiry: tokenExpiry },
  });

  // Construct password reset link
  const resetLink = `${FRONTEND_URL}/resetpassword/${resetToken}`;

  // Send email via Resend
  try {
    const resendResponse =await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });

    res.json({ success: true, resendResponse });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error });
  }
});

app.post("/api/reset-password/email", async (req, res): Promise<any> => {
  const { token, password } = req.body;

  // Find user based on resetTokenExpiry (token itself is hashed, so we can't search by it directly)
  const user = await prisma.user.findFirst({
    where: { resetTokenExpiry: { gt: new Date() } }, // Ensuring token is not expired
  });

  if (!user || !user.resetToken) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  // Compare provided token with the hashed token in the database
  const isValid = await bcrypt.compare(token, user.resetToken);
  if (!isValid) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user's password and remove token
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
  });

  res.json({ message: "Password reset successful" });
});

export { app }; // Export the app for testing

if (require.main === module) {
  /********* LISTEN FUNCT */
  const HOST: string = NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'; // Explicitly typed as string

  server.listen(SERVER_PORT, HOST, () => {
    console.log(`${NODE_ENV === 'production' ? 'HTTPS' : 'HTTP'} Server running on ${HOST}:${SERVER_PORT}`);
  });
}