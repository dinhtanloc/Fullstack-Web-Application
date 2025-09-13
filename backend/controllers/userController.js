import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@db/models/User.js';
import { generateAccessToken, generateRefreshToken } from '@middleware/authMiddleware.js';

/**
 * Fetch all the users from database
 * @returns {User[]} List of all users
 */
export const index = () => User.find();

/**
 * Get the user associated with the given user id
 * @param {string} id ID of the user to fetch
 * @returns {User|null} User or null if not found
 */
export const getById = (id) => User.findById(id);

/**
 * Determine if a user with the given id exists
 * @param {string} id ID of the user to determine if exists
 * @returns {boolean} true if the user exists, false otherwise
 */
export const exists = async (id) => {
  const count = await User.countDocuments({ _id: id });
  return count > 0;
};

/**
 * Create a user
 * @param {object} input Data of the user to be created
 * @returns {User} Created user
 */
export const create = async (input) => {
  const user = new User(input);
  return await user.save();
};

/**
 * Update a user
 * @param {string} id ID of the user to be updated
 * @param {object} input Data of the user to be updated
 * @returns {User} Updated user
 */
export const update = async (id, input) => {
  return await User.findByIdAndUpdate(id, input, { new: true });
};

/**
 * Remove a user associated with the given id
 * @param {string} id ID of the user to be removed
 * @returns {boolean} true if the user was removed, otherwise false
 */
export const remove = async (id) => {
  const result = await User.deleteOne({ _id: id });
  return result.deletedCount > 0;
};


export const register = async (req, res) => {
  const { email, username, password, ...rest } = req.body;
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.status(400).json({ error: 'Email hoặc username đã tồn tại' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, username, password: hashedPassword, ...rest });
  await user.save();
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: 'Email không tồn tại' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: 'Sai mật khẩu' });
  }
  
  // Update last login time
  user.lastLogin = new Date();
  await user.save();
  
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.json({ user, accessToken, refreshToken });
};


export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

  // Tìm user có refreshToken này
  const user = await User.findOne({ refreshToken });
  if (!user) return res.status(403).json({ error: 'Invalid refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req, res) => {
  // Xóa refreshToken khỏi DB
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }
  res.json({ message: 'Đăng xuất thành công' });
};