// Đây là file server-side, không được import vào client
import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import { config } from '../config/envConfig';
import * as userService from '../db/services/userService';
import * as transactionService from '../db/services/transactionService';
import mongoose from 'mongoose';

// Kiểm tra môi trường thực thi
if (typeof window !== 'undefined') {
  throw new Error('This file should only be imported in a Node.js environment');
}

// Khởi tạo Express app
const app = express();
const PORT = parseInt(config.app.port, 10) || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Kiểm tra xem có thể kết nối MongoDB không
let dbConnected = false;

async function connectToDatabase() {
  try {
    const { host, port, database, username, password } = config.mongodb;
    
    const connectionString = username && password
      ? `mongodb://${username}:${password}@${host}:${port}/${database}`
      : `mongodb://${host}:${port}/${database}`;
    
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB successfully');
    dbConnected = true;
    
    // Setup API routes with real database access
    setupApiWithDatabase();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.warn('Server starting without MongoDB connection. Some features will be unavailable.');
    
    // Setup mock API routes
    setupMockApi();
  }
}

// Setup API routes with real database access
function setupApiWithDatabase() {
  // Create routers
  const userRouter = express.Router();
  const transactionRouter = express.Router();
  
  // User endpoints
  // @ts-ignore: Express typing issue
  const getAllUsers: RequestHandler = async (req, res) => {
    try {
      const users = await userService.getAllUsers();
      res.json({ data: users });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };
  
  // @ts-ignore: Express typing issue
  const getUserById: RequestHandler = async (req, res) => {
    try {
      const user = await userService.getUserByUserId(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ data: user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  };

  // Transaction endpoints
  // @ts-ignore: Express typing issue
  const getTransactions: RequestHandler = async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
      }
      
      const transactions = await transactionService.getTransactionsByUserId(userId);
      res.json({ data: transactions });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  };

  // @ts-ignore: Express typing issue
  const transferMoney: RequestHandler = async (req, res) => {
    try {
      const { fromUserId, fromAccountId, toAccountId, amount, description, notes } = req.body;
      
      // Validate input
      if (!fromUserId || !fromAccountId || !toAccountId || !amount) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      const result = await transactionService.transferMoney(
        fromUserId,
        fromAccountId,
        toAccountId,
        amount,
        description || `Transfer to ${toAccountId}`,
        notes
      );
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      res.json({ success: true, transaction: result.transaction });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process transfer' });
    }
  };
  
  // Register routes
  // @ts-ignore: Express Router typing issue
  userRouter.get('/', getAllUsers);
  // @ts-ignore: Express Router typing issue
  userRouter.get('/:id', getUserById);
  // @ts-ignore: Express Router typing issue
  transactionRouter.get('/', getTransactions);
  // @ts-ignore: Express Router typing issue
  transactionRouter.post('/transfer', transferMoney);
  
  // Mount routers
  app.use('/api/users', userRouter);
  app.use('/api/transactions', transactionRouter);
}

// Setup mock API for when MongoDB is not available
function setupMockApi() {
  // Tạo các router
  const mockUserRouter = express.Router();
  const mockTransactionRouter = express.Router();
  
  // Mock user endpoints
  const getMockUsers: RequestHandler = (req, res) => {
    res.json({ 
      message: 'MongoDB not connected. This is mock data.',
      data: [
        { id: 'SBA001', name: 'User Test', email: 'user@smartbanka.com' }
      ]
    });
  };
  
  const getMockUserById: RequestHandler = (req, res) => {
    res.json({ 
      message: 'MongoDB not connected. This is mock data.',
      data: { id: req.params.id, name: 'User Test', email: 'user@smartbanka.com' }
    });
  };
  
  // Mock transaction endpoints
  const getMockTransactions: RequestHandler = (req, res) => {
    res.json({ 
      message: 'MongoDB not connected. This is mock data.',
      data: [
        { id: 'TX001', amount: 1000, type: 'deposit', userId: 'SBA001', timestamp: new Date() }
      ]
    });
  };
  
  // Register mock routes
  // @ts-ignore: Express Router typing issue
  mockUserRouter.get('/', getMockUsers);
  // @ts-ignore: Express Router typing issue
  mockUserRouter.get('/:id', getMockUserById);
  // @ts-ignore: Express Router typing issue
  mockTransactionRouter.get('/', getMockTransactions);
  
  // Mount mock routers
  app.use('/api/users', mockUserRouter);
  app.use('/api/transactions', mockTransactionRouter);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api/health`);
  
  // Try to connect to MongoDB
  connectToDatabase();
});

export default app; 