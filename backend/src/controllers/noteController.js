import mongoose from 'mongoose';
import Note from '../models/Note.js';
import { parsePagination, buildPage } from '../utils/pagination.js';

const badId = (id) => !mongoose.isValidObjectId(id);

const readFields = (body) => {
  const { title, content } = body;
  if (title !== undefined && typeof title !== 'string') return null;
  if (content !== undefined && typeof content !== 'string') return null;
  return { title, content };
};

export const createNote = async (req, res) => {
  try {
    const fields = readFields(req.body);
    if (!fields) return res.status(400).json({ message: 'Invalid input' });

    // owner comes from the token, never from the body
    const note = await Note.create({ ...fields, owner: req.user.id });
    res.status(201).json(note);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listMyNotes = async (req, res) => {
  try {
    const { limit, cursor, error } = parsePagination(req.query);
    if (error) return res.status(400).json({ message: error });

    const filter = { owner: req.user.id };
    if (cursor) filter._id = { $lt: cursor };

    const docs = await Note.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    res.json(buildPage(docs, limit));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNote = async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(404).json({ message: 'Note not found' });

    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user.id };

    const note = await Note.findOne(filter).lean();
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateNote = async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(404).json({ message: 'Note not found' });

    const fields = readFields(req.body);
    if (!fields) return res.status(400).json({ message: 'Invalid input' });

    const update = {};
    if (fields.title !== undefined) update.title = fields.title;
    if (fields.content !== undefined) update.content = fields.content;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      update,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteNote = async (req, res) => {
  try {
    if (badId(req.params.id)) return res.status(404).json({ message: 'Note not found' });

    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listAllNotes = async (req, res) => {
  try {
    const { limit, cursor, error } = parsePagination(req.query);
    if (error) return res.status(400).json({ message: error });

    const filter = {};
    if (req.query.owner !== undefined) {
      if (typeof req.query.owner !== 'string' || badId(req.query.owner)) {
        return res.status(400).json({ message: 'Invalid owner' });
      }
      filter.owner = req.query.owner;
    }
    if (cursor) filter._id = { $lt: cursor };

    const docs = await Note.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    res.json(buildPage(docs, limit));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};