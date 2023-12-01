import express from "express";
import db from "../db/conn.mjs";

const Users = express.Router();

Users.post("/create-user", async (req, res) => {
  try {
    const { email, username } = req.body;

    const collection = db.collection("users");

    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      // User already exists
      res.status(400).json({ error: "User with this email already exists" });
    } else {
      // Create a new user document
      const newUser = {
        email,
        username,
      };

      await collection.insertOne(newUser);

      res.status(201).json({ message: "User created successfully" });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default Users;
