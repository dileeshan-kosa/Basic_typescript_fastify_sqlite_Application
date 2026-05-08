import { FastifyRequest, FastifyReply } from 'fastify';
import db from '../db/database';

export const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { name, email } = request.body as { name: string, email: string };
  
  const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
  const info = stmt.run(name, email);
  
  return { success: true, id: info.lastInsertRowid };
};

export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  const stmt = db.prepare('SELECT * FROM users');
  const users = stmt.all(); 
  
  return users;
};