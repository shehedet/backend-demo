import mongoose from 'mongoose';
import User from '../models/User.js';
import { parsePagination, buildPage } from '../utils/pagination.js';

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { limit, cursor, error } = parsePagination(req.query);
    if (error) return res.status(400).json({ message: error });

    const postMatch = [{ $expr: { $eq: ['$author', '$$uid'] } }];
    if (cursor) postMatch.push({ _id: { $lt: new mongoose.Types.ObjectId(cursor) } });

    const result = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $project: { name: 1 } },
      {
        $lookup: {
          from: 'posts',
          let: { uid: '$_id' },
          pipeline: [
            { $match: { $and: postMatch } },
            { $sort: { _id: -1 } },
            { $limit: limit + 1 },
          ],
          as: 'posts',
        },
      },
    ]);

    if (result.length === 0) return res.status(404).json({ message: 'User not found' });

    const { posts, ...author } = result[0];
    res.json({ author, ...buildPage(posts, limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUsersByInterest = async (req, res) => {
  try {
    const { limit, cursor, error } = parsePagination(req.query);
    if (error) return res.status(400).json({ message: error });

    const { interest } = req.query;
    if (interest !== undefined && typeof interest !== 'string') {
      return res.status(400).json({ message: 'Invalid interest' });
    }

    const pipeline = [];

    if (interest) pipeline.push({ $match: { interests: interest } });

    pipeline.push({ $unwind: '$interests' });

    if (interest) pipeline.push({ $match: { interests: interest } });

    pipeline.push(
      {
        $group: {
          _id: '$interests',
          count: { $sum: 1 },
          users: { $push: { _id: '$_id', name: '$name', email: '$email' } },
        },
      },
      { $sort: { _id: 1 } }
    );

    if (cursor) pipeline.push({ $match: { _id: { $gt: cursor } } });
    pipeline.push({ $limit: limit + 1 });

    const groups = await User.aggregate(pipeline);

    const hasMore = groups.length > limit;
    const items = hasMore ? groups.slice(0, limit) : groups;
    res.json({ items, nextCursor: hasMore ? items[items.length - 1]._id : null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};