import mongoose from 'mongoose';

const post = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true, maxlength: 150 },
        content: { type: String, default: '', maxlength: 10000 },
    },
    { timestamps: true }
);

post.index({ author: 1, _id: -1 });

export default mongoose.model('Post', post);