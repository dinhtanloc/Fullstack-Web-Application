

import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import gFunctions from '@google-cloud/functions-framework';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {
  resolvers,
  schemas,
  contextHandler
} from '@graphql/index.js';
import connectDB from './db/index.js';

// Configure dotenv to load .env from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Connect to MongoDB
await connectDB();

const app = express();
const httpServer = http.createServer(app);

const apolloServer = new ApolloServer({
  typeDefs: schemas,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  context: contextHandler,

  introspection: true,
});

await apolloServer.start();

app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(
    apolloServer,
    { context: contextHandler },
  ),
);

gFunctions.http('graphql', app);

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'production') {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  });
} else {
  console.log('🚀 Running server on /graphql');
}