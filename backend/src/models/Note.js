import mongoose from 'mongoose';

const note = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true, maxlength: 150 },
        content: { type: String, default: '', maxlength: 10000 },
    },
    { timestamps: true }
);

note.index({ owner: 1, _id: -1 });

export default mongoose.model('Note', note);