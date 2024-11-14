import express from "express";
import cors from "cors";
import bcrypt from 'bcrypt';
import { PrismaClient } from "@prisma/client";


const app = express();
const prisma = new PrismaClient();
const PORT = 2020;

app.use(express.json());
app.use(cors());

app.post("/api/users", async (req, res) => {
  const { firstName, lastName, email, password, profile_preferences } = req.body;

  try {
    // Hash the password before storing it in the database -> for security
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
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

app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});
