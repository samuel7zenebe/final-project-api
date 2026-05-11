import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (token: string) => {
  const decoded = jwt.verify(token, process.env["JWT_SECRET"] as string);
  return decoded;
};
