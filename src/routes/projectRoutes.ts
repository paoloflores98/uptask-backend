import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import { hasAuthorization, taskBelongToProject, taskExists } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

// Instalar la dependencia express-validator: npm i express-validator

const router = Router();

router.use(authenticate); // Autenticar

/* Routes for Projects */
router.post('/',
  body('projectName')
    .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
  body('clientName')
    .notEmpty().withMessage('El nombre del cliente es obligatorio'),
  body('description')
    .notEmpty().withMessage('La descripción del proyecto es obligatoria'),
    handleInputErrors, // Middleware
  ProjectController.createProject
);

router.get('/', ProjectController.getAllProjects);

router.get('/:projectId',
  param('projectId') // Acceder al parámetro de la URL
    .isMongoId().withMessage('El ID no es válido'),
  handleInputErrors, // Middleware
  ProjectController.getProjectById
);

/* Routes for Tasks */
router.param('projectId', projectExists); // Middleware

// Autorización
router.put('/:projectId',
  param('projectId') // Acceder al parámetro de la URL
    .isMongoId().withMessage('El ID no es válido'),
  body('projectName')
    .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
  body('clientName')
    .notEmpty().withMessage('El nombre del cliente es obligatorio'),
  body('description')
    .notEmpty().withMessage('La descripción del proyecto es obligatoria'),
  handleInputErrors, // Middleware
  hasAuthorization, // Middleware
  ProjectController.updateProject
);

// Autorización
router.delete('/:projectId',
  param('projectId') // Acceder al parámetro de la URL
    .isMongoId().withMessage('El ID no es válido'),
  handleInputErrors, // Middleware
  hasAuthorization, // Middleware
  ProjectController.deleteProject
);

// Autorización
router.post('/:projectId/tasks',
  hasAuthorization, // Middleware
  body('name')
    .notEmpty().withMessage('El nombre de la tarea es obligatoria'),
  body('description')
    .notEmpty().withMessage('La descripción de la tarea es obligatoria'),
  TaskController.createTask
)

router.get('/:projectId/tasks',
  TaskController.getProjectTasks
)

router.param('taskId', taskExists) // Middleware
router.param('taskId', taskBelongToProject) // Middleware

router.get('/:projectId/tasks/:taskId',
  param('taskId') // Acceder al parámetro de la URL
    .isMongoId().withMessage('El ID no es válido'),
  handleInputErrors, // Middleware
  TaskController.getTaskById
)

// Autorización
router.put('/:projectId/tasks/:taskId',
  hasAuthorization, // Middleware
  param('taskId') // Acceder al parámetro de la URL
    .isMongoId().withMessage('El ID no es válido'),
  body('name')
    .notEmpty().withMessage('El nombre de la tarea es obligatoria'),
  body('description')
    .notEmpty().withMessage('La descripción de la tarea es obligatoria'),
  handleInputErrors, // Middleware
  TaskController.updateTask
)

// Autorización
router.delete('/:projectId/tasks/:taskId',
  hasAuthorization, // Middleware
  param('taskId') // Acceder al parámetro de la URL
    .isMongoId().withMessage('El ID no es válido'),
  handleInputErrors, // Middleware
  TaskController.deleteTask
)
  
router.post('/:projectId/tasks/:taskId/status',
  param('taskId') // Acceder al parámetro de la URL
    .isMongoId().withMessage('El ID no es válido'),
  body('status')
    .notEmpty().withMessage('El estado es obligatorio'),
  handleInputErrors, // Middleware
  TaskController.updateStatus
)

/* Routes for Teams */
router.post('/:projectId/team/find',
  body('email')
    .isEmail().toLowerCase().withMessage('Correo electrónico no válido'),
  handleInputErrors,
  TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
  TeamMemberController.getProjectTeam
)

router.post('/:projectId/team/',
  body('id')
    .isMongoId().withMessage('ID no válido'),
  handleInputErrors,
  TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
  param('userId')
    .isMongoId().withMessage('ID no válido'),
  handleInputErrors,
  TeamMemberController.removeMemberById
)

/* Routes for Notes */
router.post('/:projectId/tasks/:taskId/notes',
  body('content')
    .notEmpty().withMessage('El contenido de la nota es obligatoria'),
  handleInputErrors,
  NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
  NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
  param('noteId').isMongoId().withMessage('ID de la nota no válida'),
  NoteController.deleteNote
)

export default router;