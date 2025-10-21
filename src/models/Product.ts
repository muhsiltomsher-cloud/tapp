import mongoose, { Schema, Model } from 'mongoose';
import { IProduct } from '@/types';

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    imageUrl: {
      type: String,
    },
    category: {
      type: String,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ category: 1 });
ProductSchema.index({ createdBy: 1 });
ProductSchema.index({ inStock: 1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
