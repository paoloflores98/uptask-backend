import jwt from "jsonwebtoken";
import { Types } from "mongoose";

type UserPayload = {
  id: Types.ObjectId
}

// Crear el JWT
export const generateJWT = (payload: UserPayload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '180d' // Tiempo de expiración
  });

  return token;
}