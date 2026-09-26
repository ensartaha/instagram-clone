import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import authRoutes from "./routes/authRoutes.js";
import postRoutes from './routes/postRoutes.js';
import mongoSanitize from 'express-mongo-sanitize';
import messageRoutes from './routes/messageRoutes.js';

const app = express();
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body);
    if (req.params) req.params = mongoSanitize.sanitize(req.params);
    next();
});
async function connect(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
    }catch(err){
        console.error("Sunucuya bağlanma esnasında hata . " , err);
    }
}
connect();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth' , authRoutes);
app.use('/api/posts' , postRoutes);
app.use('/api/messages' , messageRoutes);
// app.js veya server.js dosyasının en altında olmalı:
app.use((err, req, res, next) => {
    // Multer format veya boyut hatası buraya düşer!
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
});
app.listen(5000, ()=>{
    console.log('Sunucu başarı ile ayağa kalktı');
});