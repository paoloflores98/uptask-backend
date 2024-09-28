import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

// Instalar la dependencia express-validator: npm i express-validator

// Comprobar si las validaciones no pasan
export const handleInputErrors = (request: Request, response: Response, next: NextFunction) => {
  
  // Obtener todas las validaciones del router
  let errors = validationResult(request);

  // Si los errores no están vacíos
  if(!errors.isEmpty()) {
    return response.status(400).json({errors: errors.array()}); // Retornar la respuesta en JSON con estado 400
  }

  next(); // Ir a la siguiente función
}