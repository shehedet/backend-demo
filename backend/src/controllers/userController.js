import mongoose from 'mongoose';
import User from '../models/User.js';
import Note from '../models/Note.js';
import Post from '../models/Post.js';
import { parsePagination, buildPage } from '../utils/pagination.js';

const badId = (id) => !mongoose.isValidObjectId(id);
const isStr = (v) => typeof v === 'string';
const isStrArray = (v) => Array.isArray(v) && v.every(isStr);

const readUserFields = (body) => {
  const { name, email, password, role, interests } = body;
  if (name !== undefined && !isStr(name)) return null;
  if (email !== undefined && !isStr(email)) return null;
  if (password !== undefined && !isStr(password)) return null;
  if (role !== undefined && !isStr(role)) return null;
  if (interests !== undefined && !isStrArray(interests)) return null;
  return { name, email, password, role, interests };
};

const handleError = (err, res) => {
  if (err.code === 11000) return res.status(409).json({ message: 'Email already in use' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  console.error(err);
  return res.status(500).json({ message: 'Server error' });
};

export const listUsers = async (req, res) => {
  try {
    const { limit, cursor, error } = parsePagination(req.query);
    if (error) return res.status(400).json({ message: error });

    const filter = cursor ? { _id: { $lt: cursor } } : {};
    const docs = await User.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    res.json(buildPage(docs, limit));
  } catch (err) {
    handleError(err, res);
  }
};

export const getUser = async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(404).json({ message: 'User not found' });
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    handleError(err, res);
  }
};

export const createUser = async (req, res) => {
  try {
    const f = readUserFields(req.body);
    if (!f) return res.status(400).json({ message: 'Invalid input' });

    const user = await User.create(f);
    const { password, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (err) {
    handleError(err, res);
  }
};

export const updateUser = async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(404).json({ message: 'User not found' });

    const f = readUserFields(req.body);
    if (!f) return res.status(400).json({ message: 'Invalid input' });

    if (req.params.id === req.user.id && f.role !== undefined) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    for (const key of ['name', 'email', 'password', 'role', 'interests']) {
      if (f[key] !== undefined) user[key] = f[key];
    }
    await user.save();

    const { password, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    handleError(err, res);
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(404).json({ message: 'User not found' });

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const exists = await User.exists({ _id: req.params.id });
    if (!exists) return res.status(404).json({ message: 'User not found' });
    
    await Note.deleteMany({ owner: req.params.id }); // uses { owner: 1, _id: -1 }
    await Post.deleteMany({ author: req.params.id }); // uses { author: 1, _id: -1 }
    await User.deleteOne({ _id: req.params.id });

    res.json({ message: 'User and their data deleted' });
  } catch (err) {
    handleError(err, res);
  }
};