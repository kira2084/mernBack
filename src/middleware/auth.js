import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  //console.log("Authorization header:", req.headers.authorization);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ msg: "Unauthorized. Please add valid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    // console.log("decoded", req.user.id);
    if (!req.user) return res.status(404).json({ message: "User not found" });
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ msg: "Unauthorized. Please add valid token" });
  }
};

export default authenticationMiddleware;
