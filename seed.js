const mongoose = require('mongoose');
const Product = require('./models/Product');
const Brand = require('./models/Brand');
require('dotenv').config();
const db = require('./config/db');

const seedDatabase = async () => {
  await db();

  try {
    // clear existing db
    await Product.deleteMany({});
    await Brand.deleteMany({});

    const brandNames = ['BrandA', 'BrandB', 'BrandC', 'BrandD', 'BrandE'];
    const brands = await Brand.insertMany(brandNames.map((name) => ({ name })));

    const productTypes = ['Type1', 'Type2', 'Type3'];

    // create 30 dummy products with for loop
    const products = [];
    for (let i = 0; i < 30; i++) {
      const product = new Product({
        name: `Product${i + 1}`,
        brand: brands[i % brands.length]._id,
        type: productTypes[i % productTypes.length],
        image: `product.webp`, // same image for all products
        description: `Description for Product${i + 1}`,
        price: ((i + 1) * 10).toFixed(2),
      });
      products.push(product);
    }

    await Product.insertMany(products);

    console.log('Dummy data created successfully');
  } catch (error) {
    console.error('Error seeding dummy data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();
