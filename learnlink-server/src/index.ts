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
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import {upload, resizeAndUpload, handleImagePreview, resizeAndUploadStudyGroup} from './uploadConfig';
import multer from "multer";
import { welcomeEmailTemplate, passwordResetEmailTemplate } from "./emailTemplates";
import { warn } from "console";



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
const REACT_APP_EMAIL_URL = process.env.REACT_APP_EMAIL_URL || 'learnlink.site';
const MAX_USERS_IN_A_GROUP = 6;
const SYSTEM_USER_ID = -1;

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
app.use(express.json({ limit: "20mb" })); // Increase body payload size
app.use(express.urlencoded({ limit: "20mb", extended: true })); // Increase URL-encoded payload size

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

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  profilePic: string | null;
  bio: string | null;
  grade: string | null;
  major: string | null;
  relevant_courses: string[]; 
  study_method: string | null;
  gender: string | null;
  age: number | null;
  college: string | null;
  studyHabitTags: string[]; 
  ideal_match_factor: string | null;
  similarityScore?: number; // Used for sorting
}


interface StudyGroup {
  id: number;
  name: string;
  subject: string | null;
  description: string | null;
  created_by: number;
  created_at: Date;
  creator: User;
  users: User[];
  matches: any[];
  swipesGiven: any[];
  chatID: number | null;
  chat: any;
  ideal_match_factor: string | null;
  profilePic: string | null;
}

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
      console.log('Email already exists');
      return res.status(400).json({ error: "EmailAlreadyExists" });
    }

    const domainParts = email.split("@")[1]?.split(".");
    const lastExtension = domainParts ? domainParts.pop() : "";

    if (lastExtension !== "edu") {
      console.log('Not an edu email');
      return res.status(400).json({ error: "NotEdu" });
    }

    // Check if username already exists
    const usernameExists = await prisma.user.findUnique({
      where: { username: username }
    });

    if (usernameExists) {
      console.log('Username already exists');
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

    // FOR XTREME TESTING MODEEEE
    // const isPasswordValid = password === user.password;

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
    res.status(200).json({ token, userId: user.id });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
    process.exit(1); // Explicitly exit with a non-zero status
    // will restart docker container
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
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update study group schedule
app.put('/api/study-groups/:groupId/schedule', authenticate, async (req, res): Promise<any> => {
  const { groupId } = req.params;
  const { scheduleDays, scheduleStartTime, scheduleEndTime } = req.body;
  console.log(req.body)

  if (!scheduleDays || !scheduleStartTime || !scheduleEndTime) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate the format of scheduleDays
  if (!Array.isArray(scheduleDays) || scheduleDays.some(day => !["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"].includes(day))) {
    return res.status(400).json({ message: 'Invalid scheduleDays format' });
  }

  // Validate times are in correct format (HH:MM AM/PM)
  const timeFormat = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
  if (!timeFormat.test(scheduleStartTime) || !timeFormat.test(scheduleEndTime)) {
    return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
  }

  try {
    // Check if the study group exists
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: Number(groupId) },
      include: { availability: true }, // Fetch related availability data
    });

    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }

    // Convert the start and end time to Date objects
    const newStartTime = new Date(`1970-01-01T${scheduleStartTime}:00`);
    const newEndTime = new Date(`1970-01-01T${scheduleEndTime}:00`);

    // Iterate over each user's availability and update or delete invalid entries
    // await Promise.all(
    //   studyGroup.availability.map(async (availability) => {
    //     let userAvailability = {};
    //     if (typeof availability.availability === 'string') {
    //       try {
    //         userAvailability = JSON.parse(availability.availability);
    //       } catch (e) {
    //         console.error('Error parsing availability:', e);
    //         return; // Skip this user if the JSON is invalid
    //       }
    //     }

        // // Filter out invalid availability slots for each user
        // const filteredAvailability = Object.entries(userAvailability).reduce((acc, [day, times]) => {
        //   if (scheduleDays.includes(day)) {
        //     const validTimes = (times as string[]).filter((time: string) => {
        //       const timeObj = new Date(`1970-01-01T${time}:00`);
        //       return timeObj >= newStartTime && timeObj <= newEndTime;
        //     });

        //     if (validTimes.length > 0) acc[day] = validTimes;
        //   }
        //   return acc;
        // }, {} as Record<string, string[]>);

        // If no valid availability remains, delete the record
        // if (Object.keys(filteredAvailability).length === 0) {
        //   await prisma.availability.delete({
        //     where: { id: availability.id },
        //   });
        // } else {
        //   // Otherwise, update the availability with the filtered times
        //   await prisma.availability.update({
        //     where: { id: availability.id },
        //     data: { availability: JSON.stringify(filteredAvailability) },
        //   });
        // }
    //   })
    // );

    // Update the study group's schedule
    const updatedGroup = await prisma.studyGroup.update({
      where: { id: Number(groupId) },
      data: {
        scheduleDays,
        scheduleStartTime,
        scheduleEndTime,
      },
    });

    res.json({
      message: 'Study group schedule updated successfully',
      studyGroup: updatedGroup,
    });
  } catch (error) {
    console.error('Error updating study group schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get study group schedule and availability
app.get('/api/study-groups/:groupId/schedule', authenticate, async (req: Request, res: Response): Promise<any> => {
  const { groupId } = req.params;

  try {
    // Fetch the study group with the associated schedule and availability
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: Number(groupId) },
      include: {
        availability: true, // Include availability data for the study group        
      },
    });

    // If the study group is not found
    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }

    // Format the study group response data
    const groupDetails = {
      id: studyGroup.id,
      name: studyGroup.name,
      scheduleDays: studyGroup.scheduleDays,
      scheduleStartTime: studyGroup.scheduleStartTime,
      scheduleEndTime: studyGroup.scheduleEndTime,
      availability: studyGroup.availability.map((availability) => {
        let userAvailability = {};
        try {
          let userAvailability = {};
          if (typeof availability.availability === 'string') {
            try {
              userAvailability = JSON.parse(availability.availability);
            } catch (e) {
              console.error('Error parsing availability:', e);
              return; // Skip this user if the JSON is invalid
            }
          }        
        } catch (e) {
          console.error('Error parsing availability:', e);
          return { userId: availability.userId, availability: {} }; // If invalid JSON, return empty
        }
        return {
          userId: availability.userId,
          availability: userAvailability,
        };
      }),
    };

    // Respond with the study group details and availability
    res.json(groupDetails);
  } catch (error) {
    console.error('Error fetching study group schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch user profile data
app.get('/api/users/profile/:userId', authenticate, async (req, res):Promise<any> => {
  const userId = parseInt(req.params.userId);
  const placeholderImage = "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_bust-in-silhouette.png";


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
      id: user.id,
    });


  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/users/update', async (req, res): Promise<any> => {
  const { first_name, last_name, username, age, college, major, grade, relevant_courses, study_method, gender, bio, studyHabitTags, ideal_match_factor, profilePic } = req.body;
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
        relevant_courses: Array.isArray(relevant_courses) ? relevant_courses : (relevant_courses ? [relevant_courses] : undefined),
        study_method: study_method || undefined,
        gender: gender || undefined,
        bio: bio || undefined,
        studyHabitTags: studyHabitTags || undefined,
        ideal_match_factor: ideal_match_factor || undefined,
        profilePic:  profilePic || undefined,
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
      return res.status(450).json({ error: 'User not found' });
    }

    // Check if the old email matches the current email
    if (user.email !== oldEmail) {
      return res.status(451).json({ error: 'Old email does not match current email' });
    }

    if (newEmail == oldEmail) {
      return res.status(452).json({ error: 'New email matches current email ' });
    }


        // Check if username or email already exists
      // Check if email already exists
      const emailExists = await prisma.user.findUnique({
        where: { email: newEmail }
      });
  
      if (emailExists) {
        return res.status(453).json({ error: "There is already an account attached to this email." });
      }
  
      const domainParts = newEmail.split("@")[1]?.split(".");
      const lastExtension = domainParts ? domainParts.pop() : "";
  
      if (lastExtension !== "edu") {
        return res.status(454).json({ error: "Please use a valid .edu email." });
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

    const isPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isPasswordSame) {
      return res.status(401).json({ warning: 'New password matches current password' });
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

  console.log('Received swipe:', req.body);
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
    console.log("is study group???", isStudyGroup)

    // If the swipe was 'Yes', check if it's a match
    // if (direction === 'Yes') {
    //   if (isStudyGroup) {
    //     console.log("targetid:, ", targetId)
        
    //     // Check for a mutual swipe with the study group
    //     await createMatchForStudyGroup(userId, targetId);
    //   } else {
    //     // Check for a mutual swipe with another user
    //     await createMatchForUsers(userId, targetId);
    //   }
    // }

    // moving this part to join req logic for now

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

app.get('/api/swipe/sentRequests/:currentUser', async (req, res): Promise<any> => {
  let { currentUser } = req.params;
  console.log('Fetching requests for user:', currentUser);

  const userId = parseInt(currentUser, 10);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const sentRequests = await prisma.swipe.findMany({
      where: {
        userId: userId,
      },
      select: { 
        id: true,
        userId: true,
        user: true,
        targetUserId: true,
        targetGroupId: true,
        direction: true,
        message: true,
        status: true,
        updatedAt: true
      },
    });

    res.status(200).json(sentRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Fetches request staus between a user and another user
app.get('/api/swipe/user/pendingRequestCheck/:targetUser', authenticate, async (req, res): Promise<any> => {
  const { targetUser } = req.params;
  const currentUser = res.locals.userId

  const currentUserId = parseInt(currentUser, 10);
  const targetUserId  = parseInt(targetUser, 10);

  if (currentUserId == targetUserId) {
    return null
  }

  console.log('Fetching requests between user: ', currentUserId, ' and', targetUserId);


  if (isNaN(currentUserId) || isNaN(targetUserId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {

    const match = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUserId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: currentUserId }
        ]
      }
    });

    console.log('match', match)
    
    if (match.length > 0) {
      return res.status(200).json("Accepted");
    }
    
    const sentRequests = await prisma.swipe.findMany({
      where: {
        AND: {
          userId: currentUserId,
          targetUserId: targetUserId
        }
      },
      select: { 
        id: true,
        userId: true,
        user: true,
        targetUserId: true,
        targetGroupId: true,
        direction: true,
        message: true,
        status: true,
        updatedAt: true
      },
    });

    console.log(sentRequests)

    const mostRecentRequest = sentRequests.sort((a, b) => {
      // Compare updatedAt values (latest date first)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })[0];

    console.log(mostRecentRequest); // This will be the most recent sentRequest

    if(!mostRecentRequest) {
      return res.status(200).json(null);
    }

    if (mostRecentRequest.status == "Accepted") {
      // Check if match exists
      if (mostRecentRequest.targetUserId) {
        const matchData = await prisma.match.findMany({
          where: {
            OR: [
              { user1Id: mostRecentRequest.userId, user2Id: mostRecentRequest.targetUserId },
              { user1Id: mostRecentRequest.targetUserId, user2Id: mostRecentRequest.userId },
            ]
          }
        });
        if (matchData) { return res.status(200).json(mostRecentRequest.status); }

      }

      return res.status(200).json(null);
    }

    return res.status(200).json(mostRecentRequest.status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
// Fetches request staus between a user and another user
app.get('/api/swipe/user/pendingRequestCheck/Group/:targetGroup', authenticate, async (req, res): Promise<any> => {
  const { targetGroup } = req.params;
  const currentUser = res.locals.userId

  const currentUserId = parseInt(currentUser, 10);
  const targetGroupId  = parseInt(targetGroup, 10);

  // if (currentUserId == targetUserId) {
  //   return null
  // }

  console.log('Fetching requests between user: ', currentUserId, ' and group: ', targetGroupId);


  if (isNaN(currentUserId) || isNaN(targetGroupId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {

    const match = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUserId, studyGroupId: targetGroupId },
          { user2Id: currentUserId, studyGroupId: targetGroupId }
        ]
      }
    });

    console.log('match', match)
    
    if (match.length > 0) {
      return res.status(200).json("Accepted");
    }
    
    const sentRequests = await prisma.swipe.findMany({
      where: {
        AND: {
          userId: currentUserId,
          targetGroupId: targetGroupId
        }
      },
      select: { 
        id: true,
        userId: true,
        user: true,
        targetUserId: true,
        targetGroupId: true,
        direction: true,
        message: true,
        status: true,
        updatedAt: true
      },
    });

    console.log(sentRequests)

    const mostRecentRequest = sentRequests.sort((a, b) => {
      // Compare updatedAt values (latest date first)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })[0];

    console.log(mostRecentRequest); // This will be the most recent sentRequest

    if(!mostRecentRequest) {
      return res.status(200).json(null);
    }

    if (mostRecentRequest.status == "Accepted") {
      // Check if match exists
      if (mostRecentRequest.targetGroupId) {
        const matchData = await prisma.match.findMany({
          where: {
            OR: [
              { user1Id: mostRecentRequest.userId, studyGroupId: mostRecentRequest.targetGroupId },
              { studyGroupId: mostRecentRequest.targetGroupId, user2Id: mostRecentRequest.userId },
            ]
          }
        });
        if (matchData) { return res.status(200).json(mostRecentRequest.status); }

      }

      return res.status(200).json(null);
    }

    return res.status(200).json(mostRecentRequest.status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

//for deleting a request in the reject button in requests panel
app.delete('/api/swipe/:requestId', async(req, res): Promise<any> =>{
  let {requestId} = req.params;
  console.log('Deleting request with ID:', requestId);

  try{

    if (!requestId || isNaN(parseInt(requestId))) {
      return res.status(400).json({ error: "Invalid swipe ID." });
    }

    const swipe = await prisma.swipe.findUnique({
      where: { id: parseInt(requestId) }
    });

    if (!swipe) {
      return res.status(404).json({ error: 'request not found' });
    }

    await prisma.swipe.delete({
      where: { id: parseInt(requestId) },
    });
  

    res.status(200).json({ message: 'request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Internal server error' });
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

app.delete('/api/match/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const currUserId = res.locals.userId;
    const matchUserId = parseInt(req.params.id, 10);

    console.log('Deleting match between current user ID', currUserId, 'and matched user ID', matchUserId);

    if (isNaN(matchUserId) || !currUserId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if match exists
    const match = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currUserId, user2Id: matchUserId },
          { user1Id: matchUserId, user2Id: currUserId }
        ]
      }
    });

    console.log("Matches found:", match);

    if (match.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    } // Step 1: Find shared study groups
    const sharedStudyGroups = await prisma.studyGroup.findMany({
      where: {
        users: {
          some: { id: currUserId }
        },
        AND: {
          users: { some: { id: matchUserId } }
        }
      },
      include: { users: true }
    });

    // Step 2: Determine which groups should be deleted
    const studyGroupsToDelete = sharedStudyGroups.filter(group => group.users.length === 2);
    const studyGroupIdsToDelete = studyGroupsToDelete.map(group => group.id);

    if (studyGroupIdsToDelete.length > 0) {
      console.log(`Deleting ${studyGroupIdsToDelete.length} study group(s)...`);

      // Delete associated chats for these study groups
      await prisma.chat.deleteMany({
        where: {
          studyGroupId: { in: studyGroupIdsToDelete }
        }
      });

      // Delete the study groups
      await prisma.studyGroup.deleteMany({
        where: {
          id: { in: studyGroupIdsToDelete }
        }
      });
    }

    // Step 3: Find direct one-on-one chats (not study group chats)
    const oneOnOneChats = await prisma.chat.findMany({
      where: {
        studyGroupId: null, // Not linked to any study group
        users: {
          every: { id: { in: [currUserId, matchUserId] } } // Only these two users
        }
      }
    });

    if (oneOnOneChats.length > 0) {
      console.log("Deleting direct one-on-one chats...");

      await prisma.message.deleteMany({
        where: {
          chatId: { in: oneOnOneChats.map(chat => chat.id) }
        }
      });

      await prisma.chat.deleteMany({
        where: {
          id: { in: oneOnOneChats.map(chat => chat.id) }
        }
      });
    }

    // Step 5: Delete any previous swipes between the users
    await prisma.swipe.deleteMany({
      where: {
        OR: [
          { userId: currUserId, targetUserId: matchUserId },
          { userId: matchUserId, targetUserId: currUserId }
        ]
      }
    });

    // Step 6: Create a new swipe with status 'Rejected' to prevent re-matching
    await prisma.swipe.create({
      data: {
        userId: currUserId,
        targetUserId: matchUserId,
        direction: 'No',  // Assuming LEFT means reject
        status: 'Denied'
      }
    });

    // await prisma.swipe.create({
    //   data: {
    //     userId: matchUserId,
    //     targetUserId: currUserId,
    //     direction: 'No',  // Both users should reject each other
    //     status: 'Denied'
    //   }
    // });

    // Step 4: Delete the match
    await prisma.match.deleteMany({
      where: {
        OR: [
          { user1Id: currUserId, user2Id: matchUserId },
          { user1Id: matchUserId, user2Id: currUserId }
        ]
      }
    });

    console.log("Successfully deleted match and associated chat/study group data if applicable.");
    return res.status(200).json({ message: 'Match and associated chats/study groups deleted successfully' });

  } catch (error) {
    console.error("Error deleting match or chat:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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

    res.status(200).json({
      userId, // Pass currentUserId in the response
      matches
    }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/api/profiles/:userId', async (req, res): Promise<any> => {
  const userId = parseInt(req.params.userId);
  type UserWithScore = User & { similarityScore: number; type: 'user' };
  type StudyGroupWithScore = StudyGroup & { similarityScore: number; type: 'studyGroup' };

  try {

    const placeholderImage = "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_bust-in-silhouette.png";
    const sgPlaceholderImage = 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png'
    // Fetch the current user's data to use for matching
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ideal_match_factor: true,
        major: true,
        relevant_courses: true,
        study_method: true,
        studyHabitTags: true,
        grade: true,
        age: true,
        college: true,
      },
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch users and study groups that the current user has not swiped on yet
    let usersToSwipeOn = await prisma.user.findMany({
      where: {
        NOT: [
          {
            id: userId,  // Exclude the current user from the profiles
          },
          {
            swipesReceived: { some: { userId: userId } },  // Exclude users where the current user has already swiped
          },
          {
            OR: [
              { matchesAsUser1: { some: { user2Id: userId } } }, // Exclude users the current user has matched with
              { matchesAsUser2: { some: { user1Id: userId } } }, // Exclude users who have matched with the current user
            ],
          },
        ],
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
        ideal_match_factor: true,
        swipesReceived: true,
      },
    });

    // const usersWithPlaceholder = usersToSwipeOn.map(user => ({
    //   ...user,
    //   profilePic: user.profilePic || placeholderImage,
    // }));

    let studyGroupsToSwipeOn = await prisma.studyGroup.findMany({
      where: {
        NOT: [
          {
            users: {
              some: {
                id: userId, // Exclude study groups where the user is already a member
              },
            },
          },
          {
            swipesGiven: {
              some: {
                userId: userId, // Exclude study groups where the user has already swiped
              },
            },
          },
          
        ],
      },
      select: {
        id: true,
        _count: {
          select: { users: true }, // Get the number of users in each study group
        },
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
        ideal_match_factor: true,
        profilePic: true,
      },
    });

    studyGroupsToSwipeOn = studyGroupsToSwipeOn.filter((group) => group._count.users < 6); // filter groups with 6+ members

    // Calculate similarity score
    const calculateSimilarityUser = (user: User, forStudyGroup: boolean) => {
      let score = 0;
      if (!forStudyGroup) {
      if (user.ideal_match_factor === currentUser.ideal_match_factor) score += 15;
      }
      if (user.major === currentUser.major) score += 2;
      if (user.study_method === currentUser.study_method) score += 3;
      if (user.relevant_courses.some((course: string) => currentUser.relevant_courses.includes(course))) score += 5;
      if (user.studyHabitTags.some((tag: string) => currentUser.studyHabitTags.includes(tag as StudyTags))) score += 2;
      if (user.grade === currentUser.grade) score += 2;
      // if user age is within 2 years of current user age, add 2 points
      if(user.age && currentUser.age) {if (Math.abs(user.age - currentUser.age) <= 2) score += 2};

      return score;
    };

    // Calculate similarity score for study groups (average similarity of members)
    const calculateSimilarityStudyGroup = (studyGroup: StudyGroup): number => {
      if (!studyGroup.users || studyGroup.users.length === 0) return 0; // Avoid division by 0

      // Sum the similarity scores of all users in the study group
      let totalScore = 0;
      for (let user of studyGroup.users) {
        totalScore += calculateSimilarityUser(user, true); // Calculate the similarity score for each user
      }
      totalScore / studyGroup.users.length;

      if (studyGroup.ideal_match_factor === currentUser.ideal_match_factor) totalScore += 15

      // Divide by the number of users to get the average similarity score
      return totalScore;
    };

    const usersWithScore: UserWithScore[] = usersToSwipeOn
      .map(user => ({
        ...user,
        profilePic: user.profilePic || placeholderImage,
        similarityScore: calculateSimilarityUser(user, false),
        type: 'user' as 'user',
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore); // Sort by highest similarity

      const studyGroupsWithScore: StudyGroupWithScore[] = studyGroupsToSwipeOn
      .map(studyGroup => ({
        ...studyGroup,
        profilePic: studyGroup.profilePic || sgPlaceholderImage,
        similarityScore: calculateSimilarityStudyGroup(studyGroup),
        type: 'studyGroup' as 'studyGroup',
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore); // Sort by highest similarity


      const combinedProfiles = [
        ...studyGroupsWithScore,
        ...usersWithScore,
      ].sort((a, b) => b.similarityScore - a.similarityScore); // Sort by similarity score
  
      
      // console.log('Combined profiles:', combinedProfiles);
    res.status(200).json({
      profiles: combinedProfiles, // Sorted profiles with similarityScore and type
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
    // only if there is exactly one other user in the chat
    await prisma.chat.deleteMany({
      where: {
        users: {
          some: { id: userId },
        },
        AND: [
          {
            users: {
              // Ensure there is exactly one other user in the chat
              some: { id: { not: userId } },
            },
          },
          {
            users: {
              // Ensure there are only two users in the chat (the user being deleted + one other user)
              every: { id: { not: userId } },
            },
          },
          {
            studyGroupId: null, // Ensure there is no study group ID associated with the chat
          },
        ],
      },
    });

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

app.get('/api/study-groups', authenticate, async (req, res) : Promise<any> => {
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // Fetch the study groups the user is a member of
    const userGroups = await prisma.studyGroup.findMany({
      where: {
        users: {
          some: { id: userId }, // Check if user is in the group
        },
      },
      include: {
        creator: true, // Include creator details
        users: true,   // Include all users in the group
        chat: {        // Include chat details
          select: { id: true },
        }
      },
    });

    if (!userGroups || userGroups.length === 0) {
      return res.status(404).json({ message: 'No study groups found' });
    }

    // Transform the response to match Group interface
    const response = userGroups.map(group => ({
      id: group.id,
      name: group.name,
      subject: group.subject,
      description: group.description,
      created_by: group.created_by,
      created_at: group.created_at,
      users: group.users,
      chatID: group.chat?.id || null,
      ideal_factor: group.ideal_match_factor || null,
      profile_pic: group.profilePic || null,
    }));


    res.json(response);
  } catch (error) {
    console.error('Error retrieving groups for user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.get('/api/study-groups/:id', async (req, res): Promise<any> => {
  const studyGroupId = parseInt(req.params.id);  // Extract study group ID from the request parameters

  console.log('Received request to fetch study group with ID:', studyGroupId);

  try {
    // Validate the input data (check if ID is valid)
    if (!studyGroupId) {
      return res.status(400).json({ error: 'Study group ID is required' });
    }

    // Fetch the study group by ID from the database
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyGroupId },
      include: {
        users: true,  // Optionally include users in the response
        creator: true,  // Optionally include the creator information
      },
    });

    if (!studyGroup) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    // Send back the found study group as a response
    return res.status(200).json({ studyGroup });
  } catch (error) {
    console.error('Error fetching study group:', error);
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
        ideal_match_factor: studyGroup.ideal_match_factor,
        profilePic: studyGroup.profilePic,
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
  const { name, description, subject, ideal_match_factor, profile_pic } = req.body; // Extract new study group data from the request body

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
        ideal_match_factor: ideal_match_factor.value,
        profilePic: profile_pic,
      },
    });

    // Return the updated study group
    res.json(updatedStudyGroup);
  } catch (error) {
    console.error('Error updating study group:', error);
    res.status(500).json({ error: 'Failed to update the study group' });
  }
});



app.get("/api/study-groups/:studyGroupId/chat", async (req, res): Promise<any> => {
  const { studyGroupId } = req.params;
  console.log('Fetching chat ID for study group:', studyGroupId);

  try {
    // Find the chat that is linked to the provided study group ID
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: parseInt(studyGroupId) }, // Use studyGroupId to find the corresponding study group
      select: { chatID: true } // Only retrieve the chatID field
    });

    // If a study group is found, return its chat ID; otherwise, return null
    if (studyGroup && studyGroup.chatID) {
      console.log('Chat ID found for study group:', studyGroup.chatID);
      return res.json({ chatId: studyGroup.chatID });
    } else {
      return res.json({ chatId: null }); // No chat ID found for this study group
    }
  } catch (error) {
    console.error("Error fetching chat ID for study group:", error);
    return res.status(500).json({ error: "Server error" });
  }
});


// Adds user to the study group and its corresponding chat
app.post('/api/add-to-study-group', async (req, res): Promise<any> => {
  const userId = res.locals.userId; // User making the request (authenticated user)
  const { studyGroupId, requestUserId } = req.body; // Payload

  console.log('Received request to add user to study group:', req.body);

  try {
    if (!studyGroupId || !requestUserId) {
      return res.status(400).json({ error: 'Study group ID and request user ID are required' });
    }

    // Find the study group to which the user will be added
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyGroupId },
      include: { users: true, chat: true }, // Include the users and chat in the study group
    });

    if (!studyGroup) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    // Check if the study group has reached the maximum user limit
    if (studyGroup.users.length >= MAX_USERS_IN_A_GROUP) {
      return res.status(405).json({ error: `Study group has reached the maximum of ${MAX_USERS_IN_A_GROUP} users` });
    }

    // Check if the user is already in the study group
    const isUserInGroup = studyGroup.users.some(user => user.id === requestUserId);

    if (isUserInGroup) {
      return res.status(400).json({ error: 'User is already in this study group' });
    }

    // Add the user to the study group
    await prisma.studyGroup.update({
      where: { id: studyGroupId },
      data: {
        users: {
          connect: { id: requestUserId },
        },
      },
    });

    // Ensure the user is also added to the chat
    if (studyGroup.chat) {
      // If the chat exists, add the user to it
      await prisma.chat.update({
        where: { id: studyGroup.chat.id },
        data: {
          users: {
            connect: { id: requestUserId },
          },
        },
      });
    } else {
      // If no chat exists, create a new one and add the user
      const newChat = await prisma.chat.create({
        data: {
          name: `Study Group ${studyGroupId}`,
          users: { connect: [{ id: requestUserId }] },
        },
      });

      // Link the chat to the study group
      await prisma.studyGroup.update({
        where: { id: studyGroupId },
        data: { chat: { connect: { id: newChat.id } } },
      });
    }

    return res.status(200).json({ message: 'User added to study group and chat successfully' });
  } catch (error) {
    console.error('Error adding user to study group and chat:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Sync chat members with study group members
app.post('/api/sync-study-group-chat', async (req, res): Promise<any> => {
  const { studyGroupId } = req.body; // Get study group ID from request

  try {
    if (!studyGroupId) {
      return res.status(400).json({ error: 'Study group ID is required' });
    }

    // Fetch study group with users and chat info
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: studyGroupId },
      include: { users: true, chat: true },
    });

    if (!studyGroup) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    if (!studyGroup.chat) {
      return res.status(404).json({ error: 'Chat for study group not found' });
    }

    // Get list of all user IDs in the study group
    const studyGroupUserIds = studyGroup.users.map(user => ({ id: user.id }));

    // Ensure chat contains the same users as the study group
    await prisma.chat.update({
      where: { id: studyGroup.chat.id },
      data: {
        users: {
          set: studyGroupUserIds, // Ensures only study group members are in the chat
        },
      },
    });

    return res.status(200).json({ message: 'Chat users synced with study group successfully' });
  } catch (error) {
    console.error('Error syncing chat with study group:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Deletes a user by userId from a study group
app.delete('/api/study-groups/:groupId/users/:userId', async (req, res): Promise<any> => {
  const { groupId, userId } = req.params;

  try {
    // Check if the study group exists
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: parseInt(groupId, 10) },
      include: { users: true, chat: true }, // Include users and chat
    });

    if (!studyGroup) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    // Check if the user is in the study group
    const userInGroup = studyGroup.users.some(user => user.id === parseInt(userId, 10));
    if (!userInGroup) {
      return res.status(404).json({ error: 'User is not in this study group' });
    }

    // If only two users remain, delete the study group and associated chat
    if (studyGroup.users.length === 2) {
      if (studyGroup.chat) {
        await prisma.chat.delete({ where: { id: studyGroup.chat.id } });
      }
      await prisma.studyGroup.delete({ where: { id: parseInt(groupId, 10) } });
      return res.status(200).json({ message: 'Study group and associated chat deleted as only one user would remain' });
    }

    // Remove the user from the study group
    await prisma.studyGroup.update({
      where: { id: parseInt(groupId, 10) },
      data: {
        users: {
          disconnect: { id: parseInt(userId, 10) },
        },
      },
    });

    // Remove the user from the chat (if the chat exists)
    if (studyGroup.chat) {
      await prisma.chat.update({
        where: { id: studyGroup.chat.id },
        data: {
          users: {
            disconnect: { id: parseInt(userId, 10) },
          },
        },
      });
    }

    await prisma.match.deleteMany({
      where: {
        OR: [      
          { user1Id: parseInt(userId,10), studyGroupId: parseInt(groupId,10) },
          { user2Id: parseInt(userId,10), studyGroupId: parseInt(groupId,10) },
        ]
      }
    });

    await prisma.swipe.updateMany({
      where: {
          userId: parseInt(userId,10),
          targetGroupId: parseInt(groupId,10)
      },
      data: {
        status: "Denied"
      }
  });

    return res.status(200).json({ message: 'User removed successfully from study group and chat' });
  } catch (error) {
    console.error('Error deleting user from study group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




//for the request panel 

//gets a study a group name
app.get('/api/study-groups/:groupId', async (req, res):Promise<any> => {
  const { groupId } = req.params;

  try {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: parseInt(groupId, 10) },
      select: { name: true },
    });

    if (!studyGroup) {
      return res.status(404).json({ error: 'Study group not found' });
    }

    res.status(200).json({ name: studyGroup.name });
  } catch (error) {
    console.error('Error fetching study group name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


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
  console.log('Received search query:', req.query);
  const placeholderImage = "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_bust-in-silhouette.png";

  // if (!query) {
  //   return res.status(400).json({ error: 'Query parameter is required' });
  // }

  try {
    const filters: any = []; // Create an array to store valid filters

    if (query) {
    // Add search filters for username, firstName, and lastName
    filters.push({
      OR: [
        { username: { contains: query as string, mode: 'insensitive' } },
        { firstName: { contains: query as string, mode: 'insensitive' } },
        { lastName: { contains: query as string, mode: 'insensitive' } },
      ],
    });
  }

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
      const courseArray = course.split(',').map((item) => item.trim().toUpperCase())
      console.log('courseArray:', courseArray);
      filters.push({
        relevant_courses: {
          hasSome: courseArray // Split and trim course names
        }
      });
      console.log('course:', course); // Log for debugging
    }

    console.log('Age range:', ageRange);

    if (typeof ageRange === 'string' && ageRange.length >= 2) {
      const [minAge, maxAge] = (ageRange as string).split(',').map(Number);
      filters.push({
        age: { gte: minAge, lte: maxAge },
      });
    }

    console.log('Filters:', JSON.stringify(filters, null, 2));

    // // If no valid filters, return a 400 error
    // if (filters.length === 0) {
    //   return res.status(400).json({ error: 'At least one filter must be provided' });
    // }

    const users = await prisma.user.findMany({
      where: {
        AND: filters,
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePic: true || placeholderImage,
      },
    });
    console.log('Prisma Query:', users); // Logs the query results for debugging
    const updatedUsers = users.map(user => ({
  ...user,
  profilePic: user.profilePic || placeholderImage,  // Fallback to placeholderImage if profilePic is missing
}));
    return res.json({ users: updatedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/ages', async (req, res): Promise<any> => {
  try {
    // Get the min and max age from all users
    const ageStats = await prisma.user.aggregate({
      _min: {
        age: true, // Get the minimum age
      },
      _max: {
        age: true, // Get the maximum age
      },
    });

    return res.json({
      minAge: ageStats._min.age,
      maxAge: ageStats._max.age,
    });
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
        profilePic: true,
        username: true,
        bio: true,
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

app.get('/api/chats/lastOpened/:userId', async (req, res): Promise<any> => {
  const { userId } = req.params; // Get userId from the URL parameter

  if (!userId) {
    return res.status(400).json({ error: "Missing required userId parameter" });
  }

  try {
    // Fetch all lastOpened timestamps for the given user
    const lastOpenedEntries = await prisma.lastOpened.findMany({
      where: {
        userId: parseInt(userId as string),
      },
    });

    if (lastOpenedEntries.length === 0) {
      return res.status(404).json({ error: "No last opened timestamps found for this user" });
    }

    res.json({ success: true, data: lastOpenedEntries });
  } catch (error) {
    console.error("Error fetching lastOpened:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




app.post('/api/chats/updateLastOpened', async (req, res) : Promise<any>=> {
  const { chatId, userId, lastOpened } = req.body;

  if (!chatId || !userId || !lastOpened) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Update the last opened timestamp in the database
    const updatedEntry = await prisma.lastOpened.upsert({
      where: {
        chatId_userId: {
          chatId,
          userId
        }
      },
      update: {
        timestamp: lastOpened
      },
      create: {
        chatId,
        userId,
        timestamp: lastOpened
      }
    });

    res.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error("Error updating lastOpened timestamp:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
          include: {
            buttonData: true, // Ensure button messages retain their data
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

app.get('/api/chats/check', async (req, res): Promise<any> => {
  const { userId1, userId2 } = req.query;

  if (!userId1 || !userId2) {
    return res.status(400).json({ message: 'Missing userId1 or userId2' });
  }

  try {
    // Check if a chat exists between the two users
    const existingChats = await prisma.chat.findMany({
      where: {
        users: {
          every: { id: { in: [Number(userId1), Number(userId2)] } }, // Ensure both users are in the chat
        },
      },
    });

    console.log(existingChats)

    if (existingChats.length > 0) {
      const nonStudyGroupChats = existingChats.filter(chat => chat.studyGroupId === null);

      // If there's at least one non-study-group chat, prevent new chat creation
      console.log("non study group chats: ", nonStudyGroupChats);
      if (nonStudyGroupChats.length>0) {
        return res.json({ exists: true, chatId: nonStudyGroupChats[0].id });
      }

      if (nonStudyGroupChats.length === 0){
        return res.json({exists: false })
      }
     
        return res.json({ exists: true, chatId: existingChats[0].id });
      
    }

    res.json({ exists: false });
  } catch (error) {
    console.error('Error checking for existing chat:', error);
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
          include: {
            buttonData: true, // Ensure button messages retain their data
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
app.delete('/api/chats/:chatId', async (req, res): Promise<any> => {
  const { chatId } = req.params;
  const userId = res.locals.userId;

  try {
    console.log(`Received request to delete chat: ${chatId} by user: ${userId}`);

    if (!chatId || isNaN(parseInt(chatId))) {
      console.error('Invalid chat ID:', chatId);
      return res.status(400).json({ error: "Invalid chat ID." });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: parseInt(chatId) },
      include: { users: true },
    });

    console.log('Chat found:', chat);

    if (!chat) {
      console.error('Chat not found:', chatId);
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check if the chat has a linked study group
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { chatID: parseInt(chatId) },
    });

    console.log('Study group found:', studyGroup);

    if (studyGroup) {
      await prisma.studyGroup.delete({
        where: { chatID: parseInt(chatId) },
      });
      console.log(`Study group with chatID ${chatId} deleted.`);
    }
    else{
      await prisma.chat.delete({
        where: { id: parseInt(chatId) },
      });
    }

  

    console.log(`Chat ${chatId} deleted successfully.`);
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

    res.status(201).json('new message' + newMessage);
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
app.post('/api/chats', async (req, res) : Promise<any> => {
  const { userId1, userId2 } = req.body; // Expecting both user IDs

  if (!userId1 || !userId2) {
    return res.status(400).json({ error: "Both user IDs are required." });
  }

  try {
    /*
    // Check if a chat between these users already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        users: {
          every: {
            id: { in: [userId1, userId2] },
          },
        },
      },
    });

    if (existingChat) {
      return res.status(200).json(existingChat); // Return existing chat if found
    }*/
    
    // Retrieve recipient's name
    const recipient = await prisma.user.findUnique({
      where: { id: userId1 },
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const currentTime = new Date().toISOString();
    // Create a new chat linking both users
    const newChat = await prisma.chat.create({
      data: {
        name: recipient.firstName + " " + recipient.lastName,
        users: {
          connect: [
            { id: userId1 },
            { id: userId2 },
          ],
        },
       
      },
    });

     // Create the LastOpened records for both users
     await prisma.lastOpened.createMany({
      data: [
        { chatId: newChat.id, userId: userId2, timestamp: new Date() },
      ],
    });
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put("/api/study-groups/chats/:chatId", async (req, res):Promise<any> => {
  try {
    const { chatId } = req.params;
    const chatIdInt = parseInt(chatId);

    // Check if the chat exists
    const existingChat = await prisma.chat.findUnique({
      where: { id: chatIdInt },
    });

    if (!existingChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Proceed with the update
    const updatedChat = await prisma.chat.update({
      where: { id: chatIdInt },
      data: { updatedAt: new Date(), lastUpdatedById: null },
    });

    res.status(200).json({ message: "Chat updated successfully", chat: updatedChat });
  } catch (error) {
    console.error("Error updating chat timestamp:", error);
    res.status(500).json({ message: "Internal server error" });
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
const userChats = new Map();
io.on("connection", (socket) => {
  
  console.log("User connected");
  console.log("[Server] New socket connected:", socket.id);
  userChats.set(socket.id, new Set());

  socket.on("joinUserRoom", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`[Server] Socket ${socket.id} joined room user_${userId}`);
  });

  socket.on('message', async (data, callback) => {
    try {
      // Validate the incoming data
      if (!data.content || !data.chatId || (data.system && data.userId !== undefined)) {
        throw new Error('Missing required fields: content, chatId, or invalid userId for system message');
      }

      let newMessage;
      console.log(data.system);
      if (data.system) {
        // SYSTEM MESSAGE (No userId, no buttonData)
        newMessage = await prisma.message.create({
          data: {
            content: data.content,
            createdAt: new Date(),
            chatId: data.chatId,
            system: true,
          },
          include: { chat: { include: { users: true } } },
        });
      } else if (data.isButton) {
        console.log("BUTT:::", data.buttonData);
        // Create message linked to the button entry
        newMessage = await prisma.message.create({
          data: {
            content: data.content,
            createdAt: new Date(),
            user: { connect: { id: data.userId } },
            chat: { connect: { id: data.chatId } },
            isButton: true,
            buttonData:
            {
              create: {
                action: data.buttonData.action,
                studyGroupId: data.buttonData.studyGroupId,
                label: data.buttonData.label,
              }
            }
          },
          include: { user: true, chat: { include: { users: true } }, buttonData: true },
        });

        console.log("NEW:::", newMessage);
      
      } else {
        // REGULAR USER MESSAGE
        newMessage = await prisma.message.create({
          data: {
            content: data.content,
            createdAt: new Date(),
            user: { connect: { id: data.userId } },
            chat: { connect: { id: data.chatId } },
            isButton: false,
          },
          include: { user: true, chat: { include: { users: true } } },
        });
      }
      

      // After saving the message, update the chat's `updatedAt` timestamp
      const updatedChat = await prisma.chat.update({
        where: { id: data.chatId },
        data: { updatedAt: new Date(), lastUpdatedById: data.userId},
        include: { users: true },
      });

      // Get all user IDs in the chat
      const chatUsers = newMessage.chat.users.map(user => user.id);
      /*chatUsers.forEach(userId => {
        io.to(`user_${userId}`).emit('newMessage', newMessage);
      });*/
      console.log('[Server] Created message in DB:', newMessage);

      console.log('[Server] Chat users in this chat:', chatUsers);
      chatUsers.forEach(userId => {
        console.log(`[Server] Emitting to room user_${userId}`);
        io.to(`user_${userId}`).emit('newMessage', newMessage);
      });
    

     

      console.log('Broadcasting message to chat users:', chatUsers);

      // Send success callback to the sender
      callback({ success: true, message: 'Message sent from server successfully!' });
      callback({ success: true, message: newMessage, updatedChat });

      callback({ success: true, message: newMessage, updatedChat });
      console.log('[Server] Sent message to client via callback');


    } catch (error) {
      console.error('Error handling message:', error);
      callback({ success: false, error });
    }
  });
  
    socket.on('joinChat', async (chatId, userId) => {
      try {
        if (!chatId || !userId) {
          throw new Error('Missing chatId or userId');
        }

        // Leave previous chats
        userChats.forEach(chat => {
          socket.leave(`chat_${chat}`);
        });
        userChats.clear();

        // Join new chat
        const chats = userChats.get(socket.id) || new Set();
        chats.add(chatId);
        userChats.set(socket.id, chats);
        socket.join(`chat_${chatId}`);

        // Update last opened timestamp
        await prisma.lastOpened.upsert({
          where: {
            chatId_userId: {  // Using the composite unique key
              chatId: chatId,
              userId: userId
            }
          },
          create: {
            chatId: chatId,
            userId: userId,
            timestamp: new Date()
          },
          update: {
            timestamp: new Date()
          }
        });

        // Notify others in chat
        socket.to(`chat_${chatId}`).emit('userJoined', { userId, chatId });

      } catch (error) {
        console.error('Error joining chat:', error);
      }
    });

    socket.on('leaveChat', (chatId, userId) => {
      socket.leave(`chat_${chatId}`);
      userChats.delete(chatId);
      console.log(`User ${userId} left chat ${chatId}`);
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

app.post("/api/sign-up-email", async (req: Request, res: Response): Promise<any>  => {
  try {
    const { to } = req.body; // Get data from frontend
    const user = await prisma.user.findUnique({ where: { email:to } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const username = user.username;

    const emailHtml = welcomeEmailTemplate(username);

    console.log('Sending email to:', to);

    const response = await resend.emails.send({
      from: `no-reply@${REACT_APP_EMAIL_URL}`,
      to,
      subject: "Welcome to LearnLink",
      html: emailHtml,
    });

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
      from: `no-reply@${REACT_APP_EMAIL_URL}`,
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

  const username = user.username;

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

  const emailHtml = passwordResetEmailTemplate(username, resetLink);
  // Send email via Resend
  try {
    const resendResponse =await resend.emails.send({
      from: `no-reply@${REACT_APP_EMAIL_URL}`,
      to: email,
      subject: "Password Reset Request",
      html: emailHtml,
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

app.post(
  "/api/users/upload-pfp",
  authenticate,
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Image file too large. Maximum size is 5MB." });
        }
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next(); // Proceed to the next middleware if no errors
    });
  },
  async (req, res, next): Promise<any> => {
    try {
      await resizeAndUpload(req, res, next); // Image processing
    } catch (err) {
      console.error("Image processing error:", err);
      return res.status(500).json({ error: "Failed to process image" }); // Return here to prevent further responses
    }
  },
  async (req, res): Promise<any> => {
    const userId = res.locals.userId; // Authenticated user ID

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profilePic: req.body.profilePicUrl }, // Save S3 URL
      });

      return res.status(200).json({ message: "Profile picture updated", profilePic: updatedUser.profilePic });
    } catch (error) {
      console.error("Database update error:", error);
      return res.status(500).json({ error: "Failed to update profile picture" });
    }
  }
);

app.post('/api/study-group/upload-pfp',
  authenticate,
  (req, res, next) => {
    console.log("Upload middleware started");
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Image file too large. Maximum size is 5MB." });
        }
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      console.log("Upload successful");
      next(); // Proceed to the next middleware if no errors
    });
  },
  async (req, res, next): Promise<any> => {
    try {
      console.log("Processing image");
      await resizeAndUploadStudyGroup(req, res, next); // Image processing
    } catch (err) {
      console.error("Image processing error:", err);
      return res.status(500).json({ error: "Failed to process image" }); // Return here to prevent further responses
    }
  },
  async (req, res): Promise<any> => {
    console.log("Final handler reached");
    const chatID = parseInt(req.body.chatID);
    const profilePic = req.body.profilePicUrl;
    console.log("IN UPLOAD")
    console.log('Received chatID:', chatID);
    console.log('Received profilePic:', profilePic);
    try {
      const updatedStudyGroup = await prisma.studyGroup.update({
        where: { chatID },
        data: { profilePic }, // Save S3 URL
      });

      res.status(200).json({ message: "Profile picture updated", profilePic: updatedStudyGroup.profilePic });
    } catch (error) {
      console.error("Database update error:", error);
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  });

const upload_preview = multer({ storage: multer.memoryStorage() });  // Store file in memory

app.post("/api/upload-preview", upload_preview.single("profilePic"), (req, res, next) => {
  console.log("Received file:", req.file);  // Log the file info to ensure it's being uploaded
  handleImagePreview(req, res).catch(next);
});



// NOTIFICATIONS
app.get('/api/notifications', authenticate, async (req: Request, res: Response) => {
  const userId = res.locals.userId;
  try {
    // Disable caching to always get fresh data
    res.setHeader('Cache-Control', 'no-store'); // Prevent caching

    const notifications = await prisma.notification.findMany({
      where: { user_id: userId, read: false },
      orderBy: { created_at: 'desc' },
    });

    if (notifications.length === 0) {
      res.status(200).json([]);
    } else {
      res.json(notifications);
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});


app.post('/notifications/send', async (req, res): Promise<any> => {
  try {
    const { userId, other_id, message, type, chatID, studyGroupID} = req.body;

    if (!userId || !message || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['Match', 'Message', 'StudyGroup'].includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        user_id: userId,
        other_id: other_id,
        message,
        read: false,
        type,
        chatID,
        studyGroupID,
      },
    });

    // Send via WebSocket
    io.to(userId.toString()).emit('notification', notification);

    // Return the notification in the response
    return res.status(201).json(notification);
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/notifications/delete/:id', async (req, res): Promise<any> => {
  const notificationId = parseInt(req.params.id);

  if (!notificationId) {
    return res.status(400).json({ error: 'Invalid notification ID' });
  }

  try {
    const deletedNotification = await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    if (deletedNotification) {
      return res.status(200).json({ message: 'Notification deleted successfully' });
    } else {
      return res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/notifications/deleteAll', authenticate, async (req, res) => {
  console.log("deleting all notifications...");
  const userId = res.locals.userId;

  try {
    await prisma.notification.deleteMany({
      where: { user_id: userId },
    });

    res.status(200).json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





import { SwipeStatus } from '@prisma/client'; // Import enum

app.put('/api/swipe-requests/:id', async (req, res): Promise<any> => {
  const { id } = req.params;
  const { status }: { status: SwipeStatus } = req.body; // Expect status to be of enum type
  console.log('Received request to update swipe status', id);
  console.log('Received status:', status);

  if (!Object.values(SwipeStatus).includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
  }

  try {
      // Find the swipe request
      const swipe = await prisma.swipe.findUnique({
          where: { id: Number(id) },
      });

      if (!swipe) {
          return res.status(404).json({ error: "Swipe request not found" });
      }

      if (swipe.targetUserId) {
          // Delete any other requests between the two users
          await prisma.swipe.deleteMany({
            where: {
                userId: swipe.userId,
                targetUserId: swipe.targetUserId,
                NOT: { id: Number(id) } // Exclude the current request
            }
        });
  
        await prisma.swipe.deleteMany({
            where: {
                userId: swipe.targetUserId,
                targetUserId: swipe.userId,
                NOT: { id: Number(id) } // Exclude the current request
            }
        });
      }

      if (swipe.targetGroupId) {
           // Delete any other requests between the user and studygroup
           await prisma.swipe.deleteMany({
            where: {
                userId: swipe.userId,
                targetGroupId: swipe.targetGroupId,
                NOT: { id: Number(id) } // Exclude the current request
            }
        });
      }

      // Update swipe request status
      const updatedRequest = await prisma.swipe.update({
          where: { id: Number(id) },
          data: { status },
      });

      // If the request is accepted, create a match
      if (status === "Accepted" && swipe.targetUserId) {
          await prisma.match.create({
              data: {
                  user1Id: swipe.userId,       // Requesting user
                  user2Id: swipe.targetUserId, // Target user who accepted
              },
          });
      }

      if (status === "Accepted" && swipe.targetGroupId) {
        // Step 1: Get all members of the target study group
        const members = await prisma.studyGroup.findUnique({
          where: { id: swipe.targetGroupId },
          select: {
            users: {
              select: {
                id: true,
              },
            },
          },
        });
      
        // Step 2: Create the match for each member in the study group
        if (members?.users && members.users.length > 0) {
          for (const member of members.users) {
            // Avoid matching the user with themselves
            if (member.id !== swipe.userId) {
                // Delete any other requests between the two users
                await prisma.swipe.deleteMany({
                  where: {
                      userId: swipe.userId,
                      targetUserId: member.id,
                      NOT: { id: Number(id) } // Exclude the current request
                  }
              });
        
              await prisma.swipe.deleteMany({
                  where: {
                      userId: member.id,
                      targetUserId: swipe.userId,
                      NOT: { id: Number(id) } // Exclude the current request
                  }
              });
            
              await prisma.swipe.create({
                data: {
                  userId: swipe.userId,
                  targetUserId: member.id,
                  direction: 'Yes',
                  status: 'Accepted'
                }
              })

              await prisma.match.create({
                data: {
                  user1Id: swipe.userId,
                  user2Id: member.id, // Create a match with the member
                  studyGroupId: null,
                  isStudyGroupMatch: false,
                },
              });

            }
          }
        }
      
        // Step 3: Create the initial match with the study group
        await prisma.match.create({
          data: {
            user1Id: swipe.userId,
            studyGroupId: swipe.targetGroupId,
            isStudyGroupMatch: true,
          },
        });
      }

      res.json(updatedRequest);
  } catch (error) {
      console.error("Error updating swipe status:", error);
      res.status(500).json({ error: "Failed to update request status" });
  }
});

// app.get('/api/pending-requests', authenticate, async (req, res): Promise<any> => {
//   const userId = res.locals.userId;
//   const pendingRequests = await prisma..findMany({
// });

app.get("/api/studyGroup/:studyGroupId/availability", authenticate,  async (req, res) => {
  const { studyGroupId } = req.params;

  try {
    const availability = await prisma.availability.findMany({
      where: {
        studyGroupId: Number(studyGroupId),
      },
      include: {
        user: true, // Optionally, include user details if needed
      },
    });

    res.json(availability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
});
const days = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"] as const;

type Day = typeof days[number];

app.post("/api/studyGroup/:studyGroupId/availability", async (req, res) => {
  const { studyGroupId } = req.params;
  const { userId, availability } = req.body; // `availability` should be a JSON object

  try {
    // Delete any existing availability for the user in this study group
    await prisma.availability.deleteMany({
      where: {
        userId: Number(userId),
        studyGroupId: Number(studyGroupId),
      },
    });

    // Save the new availability as a JSON object
    await prisma.availability.create({
      data: {
        userId: Number(userId),
        studyGroupId: Number(studyGroupId),
        availability: availability, // Store the entire availability JSON object
      },
    });

    res.status(200).json({ message: "Availability saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save availability" });
  }
});





// DO NOT EDIT BELOW THIS LINE

export { app }; // Export the app for testing

if (require.main === module) {
  /********* LISTEN FUNCT */
  const HOST: string = NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'; // Explicitly typed as string

  server.listen(SERVER_PORT, HOST, () => {
    console.log(`${NODE_ENV === 'production' ? 'HTTPS' : 'HTTP'} Server running on ${HOST}:${SERVER_PORT}`);
  });
}