import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import userRoutes from './src/routes/userRoutes.js';
import mainCatgeory from "./src/routes/mainCategoryRoutes.js"
import subCategory from "./src/routes/subCategoryRoutes.js"
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import product from './src/routes/productRoutes.js'
import path from 'path';


import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();


app.use(helmet()); // Adds secure HTTP headers
app.use(cors()); // Enables CORS
app.use(express.json()); // Parses JSON bodies



// 💣 Rate Limiting
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//     message: 'Too many requests, please try again later.'
// });
// app.use(limiter);


// Use routes
app.use('/users', userRoutes);

app.use('/mainCategory', mainCatgeory)

app.use('/subCategory', subCategory)

app.use('/product', product)




app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
    setHeaders: (res, path) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));






app.get('/', (req, res) => {
    res.send('✅ Express connected with MongoDB Atlas using import/export!');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
