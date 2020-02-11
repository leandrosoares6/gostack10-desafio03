import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import FileController from './app/controllers/FileController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
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
routes.get('/deliverymen/deliveries'); // Listar encomendas com end_date e canceled_at NULOS
routes.get('/deliverymen/delivered'); // Listar encomendas com end_date !== null (order:[['end_date', 'DESC']])
routes.put('/deliverymen/deliveries/:id'); // Fazer retirada e finalizar entrega
routes.post('/deliveries/:id/problems');

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
routes.get('/deliverymen', UserController.index);
routes.get('/deliverymen/:id', UserController.show);
routes.delete('/deliverymen/:id', UserController.destroy);

// Managing deliveries
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.get('/deliveries', DeliveryController.index);
routes.get('/deliveries/:id', DeliveryController.show);
routes.delete('/deliveries/:id', DeliveryController.destroy);

export default routes;
