import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (user) =>
    jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

export const register = async (req, res) => {
    try {
        const { name, email, password, interests } = req.body;
        const user = await User.create({ name, email, password, interests });

        res.status(201).json({ token: signToken(user), user: publicUser(user) });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: "Email already registered" });
        if (error.code === 'ValidationError') return res.status(400).json({ message: error.message });
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email != 'string' || typeof password != 'string') {
            return res.status(400).json({ message: 'Email and passowrd are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        const ok = user && (await user.comparePassword(password));

        if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
        res.json({ token: signToken(user), user: publicUser(user) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};