import {
  usersController,
  postsController,
} from '@controllers/index.js';

export const resolverFunctions = {
  Query: {
    posts: postsController.index,
    post: (_, { id }) => postsController.getById(id),
    myPosts: (_, args, ctx) => postsController.findByAuthorId(ctx.authenticatedUser._id),

    // Users
    users: usersController.index,
    user: (_, { id }) => usersController.getById(id),
  },

  Post: {
    author: (post) => usersController.getById(post.authorId),
  },
  User: {
    posts: (user) => postsController.getByAuthorId(user._id),
  },

  Mutation: {
    createPost: (_, { input }, ctx) => {
    if (!ctx.authenticatedUser) throw new Error('Bạn cần đăng nhập');
    return postsController.create({ ...input, authorId: ctx.authenticatedUser._id });
    },

    removePost: (_, { id }) => postsController.remove(id),

    createUser: (_, { input }) => usersController.create(input),
    updateUser: (_, { id, input }) => usersController.update(id, input),
    removeUser: (_, { id }) => usersController.remove(id),
  }
};