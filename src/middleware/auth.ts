import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

export const authenticate = async (request: Request, response: Response, next: NextFunction) => {
  const bearer = request.headers.authorization;
  if(!bearer) {
    const error = new Error('No autorizado');
    return response.status(401).json({error: error.message});
  }

  // Extraer el JWT de la cadena "Beaer <token>"
  const [, token] = bearer.split(' ');

  // Verificar el JWT con la clave secreta definida
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar si el usuario existe
    if(typeof decoded === 'object' && decoded.id) {
      const user = await User.findById(decoded.id).select('_id name email'); // Seleccionar algunos campos
      if(user) {
        // request.user: Propiedad inyectada en la interfaz Request
        request.user = user;
        next();
      }else {
        response.status(500).json({error: 'Token no válido'});
      }
    }
  } catch (error) {
    response.status(500).json({error: 'Token no válido'});
  }
}