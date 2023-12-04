
import cors from "cors";
import express from "express";
import "express-async-errors";
import jwt from "jsonwebtoken";
import "./loadEnvironment.mjs";
import Bookings from "./routes/bookings.mjs";
import Users from "./routes/users.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());


app.post("/api/jwt", async (req, res) => {
  const user = req.body;

  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res.send({ token });
});

app.use("/api/users", Users);
app.use("/api/bookings", Bookings);

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occured.");
});

app.use("/", (req, res) => {
  res.json("Server is running");
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
