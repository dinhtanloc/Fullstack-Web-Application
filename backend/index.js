
import 'module-alias/register';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from '@config/db.js';
import typeDefs from '@graphql/schema.js';
import resolvers from '@graphql/resolvers.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();
server.applyMiddleware({ app });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
});
