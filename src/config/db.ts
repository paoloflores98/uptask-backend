import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import { exit } from 'node:process';

// Instalar la dependencia Colors: npm i colors

dotenv.config();

export const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.DATABASE_URL);
    const url = `${connection.host}:${connection.port}`;
    console.log(colors.magenta.bold(`MongoDB conectado en ${url}`));
  }catch(error) {
    console.log(colors.red.bold('Error al conectar a MongoDB'));
    exit(1); // Cerrar la app con un error cuando falla la conexión
  }
}