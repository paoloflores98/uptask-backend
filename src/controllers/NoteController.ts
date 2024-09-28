import type { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

// Request<{}, {}, {}, {}>: El primero va los types de params. El tercero va el type modelo

type NoteParams = {
  noteId: Types.ObjectId
}

export class NoteController {
  static createNote = async (request: Request<{}, {}, INote>, response: Response) => { // Forma de agregar los types a los Request
    const { content } = request.body;
    const note = new Note();
    note.content = content;
    note.createdBy = request.user.id;
    note.task = request.task.id;

    // Agregar la nota a la tarea
    request.task.notes.push(note.id);

    try {
      await Promise.allSettled([request.task.save(), note.save()]);
      response.send('Nota creada correctamente');
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'});
    }
  }

  static getTaskNotes = async (request: Request, response: Response) => { // Forma de agregar los types a los Request
    try {
      const notes = await Note.find({task: request.task.id});
      response.json(notes);
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'});
    }    
  }

  static deleteNote = async (request: Request<NoteParams>, response: Response) => { // Forma de agregar los types a los Request
    const { noteId } = request.params;
    const note = await Note.findById(noteId);

    // Verificar si la nota no existe
    if(!note) {
      const error = new Error('Nota no encontrada');
      return response.status(404).json({error: error.message});
    }

    // Verficar si el usuario no es quien creó la nota
    if(note.createdBy.toString() !== request.user.id.toString()) {
      const error = new Error('Acción no válida');
      return response.status(401).json({error: error.message});
    }

    // Filtrar la nota a eliminar
    request.task.notes = request.task.notes.filter(note => note.toString() !== noteId.toString());

    try {
      await Promise.allSettled([request.task.save(), note.deleteOne()]); // Guardar en la DB
      response.json('Nota eliminada correctamente');
    }catch(error) {
      response.status(500).json({error: 'Hubo un error'});
    }    
  }
}