import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const user = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        password: { type: String, required: true, minlength: 8, select: false },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        interests: { type: [String], default: [] },
    },
    { timestamps: true }
);

user.index({ email: 1 }, { unique: true });
user.index({ interests: 1 });

user.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

user.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

export default mongoose.model('User', user);