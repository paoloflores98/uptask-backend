import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Project";

// Ampliar la interfaz Request para incluir la propiedad project de tipo IProject
declare global {
  namespace Express {
    interface Request {
      project: IProject
    }
  }
}

// Comprobar si una tarea existe
export async function projectExists(request: Request, response: Response, next: NextFunction) {
  try {
    // params: Es un objeto que contiene los parámetros de la URL
    const { projectId } = request.params;

    // Consultar al modelo por el ID
    const project = await Project.findById(projectId);

    if(!project) {
      const error = new Error('Proyecto no encontrado');
      return response.status(404).json({error: error.message}); // Retornar la respuesta en JSON con estado 404
    }

    request.project = project;
    next(); // Ir a la siguiente función
  }catch(error) {
    response.status(500).json({error: 'Hubo un error'}); // Retornar la respuesta en JSON con estado 500
  }
}