import User from '@models/User.js';
import Blog from '@models/Blog.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const resolvers = {
  Query: {
    users: async () => await User.find(),
    blogs: async () => await Blog.find().populate('author', 'username email')
  },
  Mutation: {
    register: async (_, { username, email, password }) => {
      const hashed = await bcrypt.hash(password, 10);
      return User.create({ username, email, password: hashed });
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new Error('Invalid credentials');
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    },
    createBlog: async (_, { title, content }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return Blog.create({ title, content, author: user.id });
    }
  }
};

export default resolvers;
