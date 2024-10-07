const Product = require('../models/Product');
const Brand = require('../models/Brand');
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

exports.getProducts = async (req, res) => {
  try {
    const { page = 1, brand, type } = req.query;
    const limit = 9;
    const skip = (page - 1) * limit;

    const filter = {};

    // Validate brand filters
    if (brand) {
      const brandNames = brand.split(';');
      const brands = await Brand.find({ name: { $in: brandNames } });
      if (brands.length !== brandNames.length) {
        return res.status(422).json({ error: 'Invalid brand filters.' });
      }
      filter.brand = { $in: brands.map((b) => b._id) };
    }

    // Validate type filters
    if (type) {
      const types = type.split(';');
      const validTypes = ['Type1', 'Type2', 'Type3'];
      for (const t of types) {
        if (!validTypes.includes(t)) {
          return res.status(422).json({ error: 'Invalid type filters.' });
        }
      }
      filter.type = { $in: types };
    }
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Fetch products
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('brand');

    if (products.length === 0) {
      return res.status(404).json({ error: 'No products found.' });
    }

    res.status(200).json({ products, totalPages });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(422).json({ error: 'Invalid product ID.' });
    }

    const product = await Product.findById(productId).populate('brand');
    if (!product) {
      return res.status(404).json({ error: 'Product does not exist.' });
    }

    // Fetch products from the same brand
    const relatedProducts = await Product.find({
      brand: product.brand._id,
      _id: { $ne: product._id },
    }).limit(4);

    res.status(200).json({ product, relatedProducts });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.favoriteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get the user ID from the JWT token
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(422).json({ error: 'Invalid product ID.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const user = await User.findById(userId);
    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
      res.status(200).json({ message: 'Product added to favorites.' });
    } else {
      res.status(200).json({ message: 'Product already in favorites.' });
    }
  } catch (error) {
    console.error('Error favoriting product:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.unfavoriteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get the user ID from the JWT token
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(422).json({ error: 'Invalid product ID.' });
    }

    const user = await User.findById(userId);
    const index = user.favorites.indexOf(productId);
    if (index > -1) {
      user.favorites.splice(index, 1);
      await user.save();
      res.status(200).json({ message: 'Product removed from favorites.' });
    } else {
      res.status(404).json({ error: 'Product not found in favorites.' });
    }
  } catch (error) {
    console.error('Error unfavoriting product:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}, 'name');
    res.status(200).json({ brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};
