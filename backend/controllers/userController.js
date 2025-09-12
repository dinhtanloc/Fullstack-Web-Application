import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { ObjectId } from 'mongodb';
import { Users } from '@db/models/index.js';
import { generateAccessToken, generateRefreshToken } from '@middleware/authMiddleware.js';
/**
 * Fetch all the users from database
 * @returns {User[]} List of all users
 */
export const index = () => Users.find().toArray();

/**
 * Get the user associated with the given user id
 * @param {string} id ID of the user to fetch
 * @returns {User|null} User or null if not found
 */
export const getById = (id) => Users.findOne({ _id: new ObjectId(id) });

/**
 * Determine if a user with the given id exists
 * @param {string} id ID of the user to determine if exists
 * @returns {boolean} true if the user exists, false otherwise
 */
export const exists = async (id) => (await Users.countDocuments({ _id: new ObjectId(id) }, { limit: 1 })) > 0;

/**
 * Create a user
 * @param {object} input Data of the user to be created
 * @returns {User} Created user
 */
export const create = async (input) => {
  const userId = (await Users.insertOne(input)).insertedId;

  return getById(userId);
};

/**
 * Update a user
 * @param {string} id ID of the user to be updated
 * @param {object} input Data of the user to be updated
 * @returns {User} Updated user
 */
export const update = async (id, input) =>
  (await Users.findOneAndUpdate(
    {
      _id: new ObjectId(id),
    },
    { $set: input },
    { returnDocument: 'after' }
  ));

/**
 * Remove a user associated with the given id
 * @param {string} id ID of the user to be removed
 * @returns {boolean} true if the user was removed, otherwise false
 */
export const remove = async (id) =>
  (await Users.deleteOne({ _id: new ObjectId(id) })).deletedCount > 0;


export const register = async (req, res) => {
  const { email, username, password, ...rest } = req.body;
  const existingUser = await Users.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.status(400).json({ error: 'Email hoặc username đã tồn tại' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = (await Users.insertOne({ email, username, password: hashedPassword, ...rest })).insertedId;
  const user = await getById(userId);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: 'Email không tồn tại' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: 'Sai mật khẩu' });
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await Users.updateOne({ _id: user._id }, { $set: { refreshToken } });

  res.json({ user, accessToken, refreshToken });
};


export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

  // Tìm user có refreshToken này
  const user = await Users.findOne({ refreshToken });
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
  await Users.updateOne({ _id: req.user._id }, { $unset: { refreshToken: "" } });
  res.json({ message: 'Đăng xuất thành công' });
};