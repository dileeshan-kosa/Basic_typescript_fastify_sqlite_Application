import { FastifyInstance } from 'fastify';
import { createUser, getUsers } from '../controllers/userController';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/api/users', createUser);
  fastify.get('/api/users', getUsers);
}