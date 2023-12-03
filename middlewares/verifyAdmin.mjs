import db from "../db/conn.mjs";

const VerifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;

  console.log("admin" + email);
  const user = await db.collection("users").findOne(query);

  const isAdmin = user?.type === "admin";
  if (!isAdmin) {
    return res.status(403).send({ message: "forbidden access" });
  }
  next();
};

export default VerifyAdmin;
