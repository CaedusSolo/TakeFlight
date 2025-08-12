import mongoose from 'mongoose'
import 'dotenv/config'

export async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI missing in .env');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); 
  }
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
});

export async function ping() {
  try {
    await mongoose.connection.db.admin().ping();
    return { status: 'healthy', timestamp: new Date() };
  } catch (err) {
    return { status: 'unhealthy', error: err.message };
  }
}
