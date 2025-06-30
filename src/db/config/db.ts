import mongoose from 'mongoose';
import { ConnectOptions } from 'mongoose';
import { config } from '../../config/envConfig';
import { serverConfig } from './serverConfig';

// Kiểm tra môi trường thực thi
const isServer = typeof window === 'undefined';

// MongoDB connection config - sử dụng cấu hình phù hợp với môi trường
const MONGODB_CONFIG = {
  HOST: isServer ? serverConfig.mongodb.host : config.mongodb.host,
  PORT: isServer ? serverConfig.mongodb.port : config.mongodb.port,
  USERNAME: isServer ? serverConfig.mongodb.username : config.mongodb.username,
  PASSWORD: isServer ? serverConfig.mongodb.password : config.mongodb.password,
  DATABASE: isServer ? serverConfig.mongodb.database : config.mongodb.database,
  OPTIONS: {
    retryWrites: true,
    w: 'majority'
  } as ConnectOptions
};

// Construct MongoDB URI
const constructMongoURI = (): string => {
  if (MONGODB_CONFIG.USERNAME && MONGODB_CONFIG.PASSWORD) {
    return `mongodb://${MONGODB_CONFIG.USERNAME}:${MONGODB_CONFIG.PASSWORD}@${MONGODB_CONFIG.HOST}:${MONGODB_CONFIG.PORT}/${MONGODB_CONFIG.DATABASE}`;
  }
  return `mongodb://${MONGODB_CONFIG.HOST}:${MONGODB_CONFIG.PORT}/${MONGODB_CONFIG.DATABASE}`;
};

// Connect to MongoDB
export const connectToDatabase = async (): Promise<void> => {
  try {
    const uri = constructMongoURI();
    await mongoose.connect(uri, MONGODB_CONFIG.OPTIONS);
    
    // Configure mongoose
    mongoose.set('strictQuery', true);
    
    console.log('Connected to MongoDB successfully');
    
    // Set up event listeners
    mongoose.connection.on('error', (err: Error) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    if (isServer) {
      process.on('SIGINT', async () => {
        await closeDatabaseConnection();
        process.exit(0);
      });
    }
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    if (isServer) {
      process.exit(1);
    }
  }
};

// Close the MongoDB connection
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed successfully');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    if (isServer) {
      process.exit(1);
    }
  }
}; 