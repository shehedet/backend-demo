import express from 'express';
import 'dotenv/config';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import noteRoutes from './src/routes/noteRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT || 5000;

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../frontend')));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);

connectDB()
    .then(() => {
        app.listen(PORT);
        console.log("Server is running on PORT", PORT);
    })
    .catch((error) => {
        console.error("Error connecting to the server", error);
        process.exit(1);
    });