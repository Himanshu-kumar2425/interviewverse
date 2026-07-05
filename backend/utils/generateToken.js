import jwt from "jsonwebtoken";

/**
 * Signs and returns a JWT for the given userId.
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export default generateToken;
