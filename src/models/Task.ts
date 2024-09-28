import mongoose, { Schema, Document, Types } from "mongoose";
import Note from "./Note";

const taskStatus = {
  PENDING: 'pending',
  ON_HOLD: 'onHold',
  IN_PROGRESS: 'inProgress',
  UNDER_REVIEW: 'underReview',
  COMPLETED: 'completed'
} as const

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]; // Obtener las claves de taskStatus

// Hereda todas las funciones y el tipado de Document y permite definir la forma que se desea en el type
export interface ITask extends Document {
  name: string
  description: string
  project: Types.ObjectId
  status: TaskStatus
  completedBy: {
    user: Types.ObjectId,
    status: TaskStatus
  }[] // Un objeto de arrays
  notes: Types.ObjectId[]
}

// Para Mongoose
const TaskSchema: Schema = new Schema({
  name: {
    type: String,
    trim: true, // Elimina los espacios en blanco de los costados
    required: true
  },
  description: {
    type: String,
    trim: true, // Elimina los espacios en blanco de los costados
    required: true
  },
  project: {
    type: Types.ObjectId,
    ref: 'Project' // Nombre del modelo
  },
  status: {
    type: String,
    enum: Object.values(taskStatus), // Obtener los valores en un arreglo
    default: taskStatus.PENDING
  },
  completedBy: [
    {
      user: {
        type: Types.ObjectId,
        ref: 'User',
        default: null
      },
      status: {
        type: String,
        enum: Object.values(taskStatus), // Obtener los valores en un arreglo
        default: taskStatus.PENDING
      }
    }
  ],
  notes: [
    {
      type: Types.ObjectId,
      ref: 'Note'
    }
  ]
}, {timestamps: true}) // Registrar la creación y actualización

// Middleware
TaskSchema.pre('deleteOne', {document: true}, async function() {
  const taskId = this._id;
  if(!taskId) return;
    await Note.deleteMany({task: taskId});
});

const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;