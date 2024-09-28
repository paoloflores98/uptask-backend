import type { Request, Response } from "express";
import Task from "../models/Task";

// request.project: Propiedad previamente inyectada en la interfaz Request mediante el middleware projectExists
// request.task: Propiedad previamente inyectada en la interfaz Task mediante el middleware taskExists

export class TaskController {
  static createTask = async (request: Request, response: Response) => {
    try {
      // Crear una instancia del modelo Task con los datos del body de la solicitud (JSON)
      const task = new Task(request.body);

      task.project = request.project.id // Agregar el ID del proyecto
      request.project.tasks.push(task.id); // Agregar el ID de la tarea al proyecto
      await Promise.allSettled([task.save(), request.project.save()]) // Mejorar el performance y guardar en la DB
      response.send('Tarea creada correctamente...');
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'}); // Retornar la respuesta en JSON con estado 500
    }
  }

  static getProjectTasks = async (request: Request, response: Response) => {
    try {
      // Obtener las tareas que pertenecen al ID del proyecto y su información completa usando populate
      const tasks = await Task.find({project: request.project.id}).populate('project'); // project: Proiedad del esquema
      response.json(tasks); // Retornar la respuesta en JSON
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'}); // Retornar la respuesta en JSON con estado 500
    }
  }

  static getTaskById = async (request: Request, response: Response) => {
    try {
      const task = await Task.findById(request.task.id)
        .populate({path: 'completedBy.user', select: '_id name email'})
        .populate({path: 'notes', populate: {path: 'createdBy', select: '_id name email'}})
      response.json(task); // Retornar la respuesta en JSON
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'}); // Retornar la respuesta en JSON con estado 500
    }
  }

  static updateTask = async (request: Request, response: Response) => {
    try {
      // Actualizar los campos con los valores enviados en el body
      request.task.name = request.body.name;
      request.task.description = request.body.description;

      await request.task.save(); // Guardar en la DB
      response.send('Tarea actualizada correctamente...');
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'}); // Retornar la respuesta en JSON con estado 500
    }
  }

  static deleteTask = async (request: Request, response: Response) => {
    try {
      // Filtrar el array de tareas eliminando la tarea cuyo ID coincide con request.task.id
      request.project.tasks = request.project.tasks.filter(task => task.toString() !== request.task.id.toString());

      await Promise.allSettled([request.task.deleteOne(), request.project.save()]); // Mejorar el performance y guardar en la DB
      response.send('Tarea eliminada correctamente...');
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'}); // Retornar la respuesta en JSON con estado 500
    }
  }
  
  static updateStatus = async (request: Request, response: Response) => {
    try {
      const { status } = request.body;

      // Actualizar el campo con el valor enviado en el body
      request.task.status = status;
      
      const data = {
        user: request.user.id,
        status
      }

      request.task.completedBy.push(data);
      await request.task.save(); // Guardar en la DB
      response.send('Estado de la tarea actualizada correctamente...');
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'}); // Retornar la respuesta en JSON con estado 500
    }
  }
}