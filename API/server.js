require('dotenv').config({ path: './e1.env' });
const app = require('./app');
const connectDB = require('./config/dbConnection');

const PORT = process.env.PORT || 5000;

// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Not loaded');

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
