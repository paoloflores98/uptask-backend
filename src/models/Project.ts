import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from "./Note";

// Hereda todas las funciones y el tipado de Document y permite definir la forma que se desea en el type
export interface IProject extends Document {
  projectName: string
  clientName: string
  description: string
  tasks: PopulatedDoc<ITask & Document>[]
  manager: PopulatedDoc<IUser & Document>
  team: PopulatedDoc<IUser & Document>[]
}

// Para Mongoose
const ProjectSchema: Schema = new Schema({
  projectName: {
    type: String,
    required: true,
    trim: true // Elimina los espacios en blanco de los costados
  },
  clientName: {
    type: String,
    required: true,
    trim: true // Elimina los espacios en blanco de los costados
    
  },
  description: {
    type: String,
    required: true,
    trim: true // Elimina los espacios en blanco de los costados
  },
  tasks: [
    {
      type: Types.ObjectId,
      ref: 'Task' // Nombre del modelo
    }
  ],
  manager: {
    type: Types.ObjectId,
    ref: 'User' // Nombre del modelo
  },
  team: [
    {
      type: Types.ObjectId,
      ref: 'User' // Nombre del modelo
    }
  ],
}, {timestamps: true}) // Registrar la creación y actualización

// Middleware
ProjectSchema.pre('deleteOne', {document: true}, async function() {
  const projectId = this._id;
  if(!projectId) return;

  const tasks = await Task.find({project: projectId});
  for (const task of tasks) {
    await Note.deleteMany({task: task.id});
  }

  await Task.deleteMany({project: projectId});
});

const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;