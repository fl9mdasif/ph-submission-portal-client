import { Server } from 'http';
import config from './config';
import app from './app';
import prisma from './shared/prisma';
import seedMentor from './db/seedMentor';

let server: Server;

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    await seedMentor();

    server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection, shutting down...', reason);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception, shutting down...', err);
  process.exit(1);
});
