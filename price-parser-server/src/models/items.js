import mongoose from 'mongoose';

// Схема для товаров
const itemSchema = new mongoose.Schema({
  store: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  price: { type: String, trim: true },
  link: { type: String, trim: true },
  query: { type: String, default: '' },
  category: { type: String, default: 'all' },
  parsedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

itemSchema.index({ title: 1, link: 1 }, { unique: true });

itemSchema.virtual('parsedDate').get(function() {
  return this.parsedAt?.toISOString().split('T')[0];
});

const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);
export default Item ;