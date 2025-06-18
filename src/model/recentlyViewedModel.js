import mongoose from 'mongoose';

const recentlyViewedSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, },
    viewedAt: { type: Date, default: Date.now }
});

export default mongoose.model('RecentlyViewed', recentlyViewedSchema);
