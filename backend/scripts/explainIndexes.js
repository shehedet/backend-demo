import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Note from '../src/models/Note.js';
import Post from '../src/models/Post.js';

await mongoose.connect(process.env.MONGODB_URI);
await Promise.all([User.init(), Note.init(), Post.init()]); 

const summarize = (label, explain) => {
  const text = JSON.stringify(explain);
  const pick = (re) => [...new Set([...text.matchAll(re)].map((m) => m[1]))];
  console.log(`\n${label}`);
  console.log('  stages :', pick(/"stage":"([A-Z_]+)"/g).join(', ') || '-');
  console.log('  indexes:', pick(/"indexName":"([^"]+)"/g).join(', ') || '-');
  const lookup = text.match(/"indexesUsed":\[([^\]]*)\]/);
  if (lookup) console.log('  $lookup indexesUsed:', lookup[1] || '(none)');
};

const user = await User.findOne().lean();
const note = await Note.findOne().lean();
const interest = user.interests[0] || 'chess';

const run = (q) => q.explain('executionStats');

summarize('Login: find user by email',
  await run(User.find({ email: user.email }).limit(1)));
summarize('Get user by _id',
  await run(User.find({ _id: user._id }).limit(1)));
summarize('Get note by _id',
  await run(Note.find({ _id: note._id }).limit(1)));
summarize('User lists own notes',
  await run(Note.find({ owner: note.owner }).sort({ _id: -1 }).limit(11)));
summarize('Admin lists all notes',
  await run(Note.find({}).sort({ _id: -1 }).limit(11)));
summarize('Admin lists all users',
  await run(User.find({}).sort({ _id: -1 }).limit(11)));
summarize('Public list of posts',
  await run(Post.find({}).sort({ _id: -1 }).limit(11)));
summarize('Scenario 1 filtered (?interest=...)',
  await User.aggregate([
    { $match: { interests: interest } },
    { $unwind: '$interests' },
    { $match: { interests: interest } },
    { $group: { _id: '$interests', count: { $sum: 1 } } },
  ]).explain('executionStats'));
summarize('Scenario 1 unfiltered (COLLSCAN is expected)',
  await User.aggregate([
    { $unwind: '$interests' },
    { $group: { _id: '$interests', count: { $sum: 1 } } },
  ]).explain('executionStats'));
summarize('Scenario 2: user posts ($lookup)',
  await User.aggregate([
    { $match: { _id: user._id } },
    { $lookup: {
        from: 'posts',
        let: { uid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$author', '$$uid'] } } },
          { $sort: { _id: -1 } },
          { $limit: 11 },
        ],
        as: 'posts',
    } },
  ]).explain('executionStats'));

await mongoose.disconnect();