import mongoose from 'mongoose';
import Post from '../models/Post.js';
import { parsePagination, buildPage } from '../utils/pagination.js';

const badId = (id) => !mongoose.isValidObjectId(id);

const readFields = (body) => {
  const { title, content } = body;
  if (title !== undefined && typeof title !== 'string') return null;
  if (content !== undefined && typeof content !== 'string') return null;
  return { title, content };
};

const handleError = (err, res) => {
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  console.error(err);
  return res.status(500).json({ message: 'Server error' });
};

export const createPost = async (req, res) => {
  try {
    const fields = readFields(req.body);
    if (!fields) return res.status(400).json({ message: 'Invalid input' });

    // author comes from the token, never from the body
    const post = await Post.create({ ...fields, author: req.user.id });
    res.status(201).json(post);
  } catch (err) {
    handleError(err, res);
  }
};

export const listPosts = async (req, res) => {
  try {
    const { limit, cursor, error } = parsePagination(req.query);
    if (error) return res.status(400).json({ message: error });

    const filter = cursor ? { _id: { $lt: cursor } } : {};
    const docs = await Post.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    res.json(buildPage(docs, limit));
  } catch (err) {
    handleError(err, res);
  }
};

export const getPost = async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(404).json({ message: 'Post not found' });
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    handleError(err, res);
  }
};

export const updatePost = async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(404).json({ message: 'Post not found' });

    const fields = readFields(req.body);
    if (!fields) return res.status(400).json({ message: 'Invalid input' });

    const update = {};
    if (fields.title !== undefined) update.title = fields.title;
    if (fields.content !== undefined) update.content = fields.content;

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id },
      update,
      { new: true, runValidators: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    handleError(err, res);
  }
};

export const deletePost = async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(404).json({ message: 'Post not found' });

    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    handleError(err, res);
  }
};