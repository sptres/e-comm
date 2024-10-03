const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Type1', 'Type2', 'Type3'],
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

module.exports = mongoose.model('Product', productSchema);
