import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import FileController from './app/controllers/FileController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import NotificationController from './app/controllers/NotificationController';
import ScheduleController from './app/controllers/ScheduleController';
import DeliveryController from './app/controllers/DeliveryController';
import ProblemController from './app/controllers/ProblemController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';
import checkUserAdmin from './app/middlewares/checkAdmin';

const routes = new Router();
const upload = multer(multerConfig);

// Getting sessions for registred users
routes.post('/sessions', SessionController.store);

// Middleware to verify session with valid JWT token
routes.use(authMiddleware);

routes.post('/files', upload.single('file'), FileController.store);

// Routes for delivery men
routes.put('/deliverymen', DeliverymanController.update);
routes.get('/deliverymen/deliveries', ScheduleController.index); // 'delivered' query parameter with value 'true' to list delivered orders
routes.put('/deliverymen/deliveries/:id', ScheduleController.update); // Make product withdrawal and finalize delivery with query params
routes.post('/deliveries/:id/problems', ProblemController.store);
routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

// Exclusive resources for admin users
routes.use(checkUserAdmin);

// Managing recipients
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.delete('/recipients/:id', RecipientController.destroy);

// Managing delivery men
routes.post('/deliverymen', UserController.store);
routes.put('/deliverymen/:id', UserController.update);
routes.get('/deliverymen', DeliverymanController.index);
routes.get('/deliverymen/:id', DeliverymanController.show);
routes.delete('/deliverymen/:id', DeliverymanController.destroy);

// Managing deliveries
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.get('/deliveries', DeliveryController.index);
routes.get('/deliveries/:id', DeliveryController.show);
routes.delete('/deliveries/:id', DeliveryController.destroy);
routes.get('/problems', ProblemController.index);
routes.get('/deliveries/:id/problems', ProblemController.show);
routes.delete('/problems/:id', ProblemController.delete);

export default routes;
