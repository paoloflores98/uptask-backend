import express from "express";
import cors from "cors";
import morgan from "morgan";
import { corsConfig } from "./config/cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import projectRoutes from "./routes/projectRoutes";

connectDB();

// Instancia de Express
const server = express();

// Permitir conexiones
server.use(cors(corsConfig));

// Mostrar los detalles de las peticiones en consola: dev, combined, common o tiny
server.use(morgan('dev'))

// Habilitar la lectura JSON
server.use(express.json())

// Routes
server.use('/api/auth', authRoutes);
server.use('/api/projects', projectRoutes);

export default server;