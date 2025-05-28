// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import { connectDB } from './db.js';  // adjust path if needed
// import Product from '../backend/src/model/productModel.js';  // your Product model path

// dotenv.config();

// async function seedProducts() {
//     try {
//         await connectDB();

//         const products = [];
//         const startYear = 1991;
//         const endYear = 2025;
//         const yearRange = endYear - startYear + 1;

//         for (let i = 0; i < 100; i++) {
//             const year = startYear + (i % yearRange);
//             products.push({
//                 mainHeading: `4testing_${i}`,
//                 name: `fdfdfdfdffdfdfdw_${i}`,
//                 price: 120000,
//                 discountPrice: 100,
//                 quantity: 12,
//                 description: 'fcsfdwfdf',
//                 howToInstallAndTips: 'fdfdfdf',
//                 images: [],
//                 year: year,
//                 subCategoryID: new mongoose.Types.ObjectId('682dac0b348bcd21adbec1fc'),
//                 mainCategory: new mongoose.Types.ObjectId('682dab85348bcd21adbec1a2'),
//             });


//         }

//         await Product.insertMany(products);
//         console.log('✅ Inserted 100 products successfully!');
//     } catch (error) {
//         console.error('❌ Error inserting products:', error);
//     } finally {
//         mongoose.disconnect();
//     }
// }

// seedProducts();
