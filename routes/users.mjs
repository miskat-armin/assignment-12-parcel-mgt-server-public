import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import VerifyToken from "../middlewares/jwt_verify.mjs";
import VerifyAdmin from "../middlewares/verifyAdmin.mjs";

const Users = express.Router();

const usersCollection = db.collection("users");

Users.post("/create-user", async (req, res) => {
  try {
    const { email, username, type } = req.body;

    const existingUser = await usersCollection.findOne({ email: email });

    const newUser = {
      email,
      username,
      type,
    };
    if (existingUser) {
      return res.send({ message: "user already exits", insertedId: null });
    }
    const result = await usersCollection.insertOne(newUser);

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

Users.get("/admin/:email", VerifyToken, async (req, res) => {
  const email = req.params.email;

  console.log("user" + email);
  console.log(req.decoded?.email)
  if (email !== req.decoded?.email) {
    return res.status(403).send({ message: "forbidden access" });
  }

  const query = { email: email };
  const user = await usersCollection.findOne(query);


  let admin = false;
  if (user) {
    admin = user?.type === "admin";
  }

  console.log(admin);
  res.send({ admin });
});

export default Users;
