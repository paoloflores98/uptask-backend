import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  // static: No requiere ser instanciado
  static createProject = async (request: Request, response: Response) => {
    // Crear una instancia del modelo Project con los datos del body de la solicitud (JSON)
    const project = new Project(request.body);

    // Asignar a un manager
    project.manager = request.user.id;

    try {
      await project.save(); // Guardar en la DB
      response.send('Proyecto creado correctamente...');
    }catch(error) {
      console.log(error);
    }
  }
  
  static getAllProjects = async (request: Request, response: Response) => {
    try {
      const projects = await Project.find({ 
        $or: [
          {manager: {$in: request.user}}, // El campo manager es igual al ID del usuario que creó los proyectos
          {team: {$in: request.user.id}} // El campo team es igual al ID del usuario
        ]
      });
      response.json(projects); // Retornar la respuesta en JSON
    }catch(error) {
      console.log(error);
    }
  }
  
  static getProjectById = async (request: Request, response: Response) => {
    // params: Es un objeto que contiene los parámetros de la URL
    const { projectId } = request.params;
    
    try {
      // Buscar el ID del proyecto y obtener sus tareas asociadas usando populate
      const project = await Project.findById(projectId).populate('tasks'); // tasks: Proiedad del esquema

      if(!project) {
        const error = new Error('Proyecto no encontrado');
        return response.status(404).json({error: error.message}); // Retornar la respuesta en JSON con estado 404
      }
      
      // Validar si el usuario autenticado no es el manager y si no es miembro del proyecto
      if(request.user.id.toString() !== project.manager.toString() && !project.team.includes(request.user.id)) {
        const error = new Error('Acción no válida');
        return response.status(404).json({error: error.message}); // Retornar la respuesta en JSON con estado 404
      }

      response.json(project); // Retornar la respuesta en JSON
    }catch(error) {
      console.log(error);
    }
  }
  
  static updateProject = async (request: Request, response: Response) => {    
    try {      
      // Actualizar los campos con los valores enviados en el body
      request.project.projectName = request.body.projectName;
      request.project.clientName = request.body.clientName;
      request.project.description = request.body.description;

      await request.project.save(); // Guardar en la DB
      response.send('Proyecto actualizado...');
    }catch(error) {
      console.log(error);
    }
  }
  
  static deleteProject = async (request: Request, response: Response) => {
    try {
      await request.project.deleteOne(); // Eliminar de la DB
      response.send('Proyecto eliminado...');
    }catch(error) {
      console.log(error);
    }
  }
}