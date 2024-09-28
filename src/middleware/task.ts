import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

// Ampliar la interfaz Request para incluir la propiedad task de tipo ITask
declare global {
  namespace Express {
    interface Request {
      task: ITask
    }
  }
}

// Comprobar si una tarea existe
export async function taskExists(request: Request, response: Response, next: NextFunction) {
  try {
    // params: Es un objeto que contiene los parámetros de la URL
    const { taskId } = request.params;

    // Consultar al modelo por el ID
    const task = await Task.findById(taskId);

    if(!task) {
      const error = new Error('Tarea no encontrada');
      return response.status(404).json({error: error.message}); // Retornar la respuesta en JSON con estado 404
    }

    request.task = task;
    next(); // Ir a la siguiente función
  }catch(error) {
    response.status(500).json({error: 'Hubo un error'}); // Retornar la respuesta en JSON con estado 500
  }
}

// Comprobar si la tarea se encuentra en el proyecto
export function taskBelongToProject(request: Request, response: Response, next: NextFunction) {
  if(request.task.project.toString() !== request.project.id.toString()) {
    const error = new Error('Acción no válida');
    return response.status(400).json({error: error.message}); // Retornar la respuesta en JSON con estado 400
  }

  next(); // Ir a la siguiente función
}

// Comprobar si el usuario tiene autorización
export function hasAuthorization(request: Request, response: Response, next: NextFunction) {
  if(request.user.id.toString() !== request.project.manager.toString()) {
    const error = new Error('Acción no válida');
    return response.status(400).json({error: error.message}); // Retornar la respuesta en JSON con estado 400
  }

  next(); // Ir a la siguiente función
}