import cors from "cors";
import express from "express";
import "express-async-errors";
import "./loadEnvironment.mjs";
import Foods from "./routes/Foods.mjs";
import Users from "./routes/Users.mjs";
import Purchases from "./routes/purchases.mjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.post("/api/jwt", async (req, res) => {
  const body = req.body;

  const token = jwt.sign(body, process.env.SECRET, { expiresIn: "10h" });
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  );
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-METHODS",
    "GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH"
  );

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: false,
      expires: new Date(Date.now() + 7),
    })
    .send({ msg: "success", token });
});

app.use("/api/foods", Foods);
app.use("/api/users", Users);
app.use("/api/purchases", Purchases);

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
