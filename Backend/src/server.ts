import Fastify from 'fastify';
import cors from '@fastify/cors';
import userRoutes from './routes/userRoutes';

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors);

// Register the modular routes
fastify.register(userRoutes);

// Start the Server
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Modular Backend server running at ${address}`);
});