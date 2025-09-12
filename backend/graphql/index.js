import jwt from 'jsonwebtoken';

import { resolverFunctions as resolvers } from './resolvers.js';
import { schemas } from './schemas.js';
import { usersController } from '@controllers/index.js';

const contextHandler = async ({ req }) => {
  const authHeader = req.headers.authorization || '';
  let authenticatedUser = null;
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      authenticatedUser = await usersController.getById(decoded.id);
    } catch (err) {
      console.error('Invalid token', err);}
  }
  return { authenticatedUser };
};

export {
 resolvers,
 schemas,
 contextHandler
};