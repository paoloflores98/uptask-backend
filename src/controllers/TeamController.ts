import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamMemberController {
  static findMemberByEmail = async (request: Request, response: Response) => {
    const { email } = request.body;
    const user = await User.findOne({email}).select('_id email name');

    // Buscar si el usuario existe
    if(!user) {
      const error = new Error('Usuario no encontrado');
      return response.status(404).json({error: error.message});
    }
    
    response.json(user);
  }

  static getProjectTeam = async (request: Request, response: Response) => {
    // Buscar el ID del proyecto y obtener sus usuarios asociados con ciertos campos usando populate
    const project = await Project.findById(request.project.id).populate({
      path: 'team', // Propiedad del esquema
      select: '_id email name'
    });

    response.json(project.team);
  }

  static addMemberById = async (request: Request, response: Response) => {
    const { id } = request.body;
    const user = await User.findById(id).select('_id');

    // Buscar si el usuario existe
    if(!user) {
      const error = new Error('Usuario no encontrado');
      return response.status(404).json({error: error.message});
    }
    
    // Validar si el usuario ya está en el proyecto
    if(request.project.team.some(team => team.toString() === user.id.toString())) {
      const error = new Error('El usuario ya existe en el proyecto');
      return response.status(409).json({error: error.message});
    }
    
    // request.project: Viene de la ampliación del Request
    request.project.team.push(user.id);
    await request.project.save();

    response.send('Usuario agregado correctamente');
  }

  static removeMemberById = async (request: Request, response: Response) => {
    const { userId } = request.params;
    
    // Validar si el usuario no existe en el proyecto
    if(!request.project.team.some(team => team.toString() === userId.toString())) {
      const error = new Error('El usuario no existe en el proyecto');
      return response.status(409).json({error: error.message});
    }

    request.project.team = request.project.team.filter(teamMember => teamMember.toString() !== userId)

    await request.project.save();
    response.send('Usuario eliminado correctamente');
  }
}