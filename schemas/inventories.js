const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    // One inventory document per product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
      unique: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'stock must be >= 0'],
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'reserved must be >= 0'],
    },
    soldCount: {
      type: Number,
      default: 0,
      min: [0, 'soldCount must be >= 0'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('inventory', inventorySchema);

