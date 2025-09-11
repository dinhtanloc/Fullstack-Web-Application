import Blog from '../models/Blog.js';

export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'username email');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createBlog = async (req, res) => {
  const { title, content } = req.body;
  try {
    const blog = await Blog.create({ title, content, author: req.user.id });
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
