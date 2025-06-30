import { connectToDatabase, closeDatabaseConnection } from '../config/db';
import { UserModel } from '../models/User';
import { TransactionModel } from '../models/Transaction';
import bcrypt from 'bcrypt';

// Đảm bảo script này chạy trong môi trường Node.js
if (typeof window !== 'undefined') {
  console.error('This script is intended to be run in a Node.js environment only.');
  throw new Error('Cannot run in browser environment');
}

// Hàm để hash PIN
async function hashPin(pin: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(pin, saltRounds);
}

/**
 * Initialize the database with sample data
 */
async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Clear existing collections
    console.log('Clearing existing collections...');
    await UserModel.deleteMany({});
    await TransactionModel.deleteMany({});
    
    // Hash default PIN (1234) cho tất cả người dùng mẫu
    const defaultHashedPin = await hashPin('1234');
    
    // Create sample users with 12-digit account numbers
    console.log('Creating sample users...');
    const user1 = await UserModel.create({
      fabricId: 'User1@smartbanka.com',
      legacyUserId: 'user001',
      name: 'Nguyen Van A',
      email: 'nguyenvana@smartbanka.com',
      hashedPin: defaultHashedPin,
      accounts: [
        {
          accountId: '100000000001', // 12 chữ số
          balance: 50000000,
          currency: 'VND',
          type: 'Savings'
        }
      ]
    });
    
    const user2 = await UserModel.create({
      fabricId: 'User2@smartbanka.com',
      legacyUserId: 'user002',
      name: 'Tran Thi B',
      email: 'tranthib@smartbanka.com',
      hashedPin: defaultHashedPin,
      accounts: [
        {
          accountId: '100000000002', // 12 chữ số
          balance: 75000000,
          currency: 'VND',
          type: 'Current'
        }
      ]
    });

    const user3 = await UserModel.create({
      fabricId: 'User3@smartbanka.com',
      legacyUserId: 'user003',
      name: 'Le Van C',
      email: 'levanc@smartbanka.com',
      hashedPin: defaultHashedPin,
      accounts: [
        {
          accountId: '100000000003', // 12 chữ số
          balance: 120000000,
          currency: 'VND',
          type: 'Savings'
        }
      ]
    });

    const user4 = await UserModel.create({
      fabricId: 'User4@smartbanka.com',
      legacyUserId: 'user004',
      name: 'Pham Thi D',
      email: 'phamthid@smartbanka.com',
      hashedPin: defaultHashedPin,
      accounts: [
        {
          accountId: '100000000004', // 12 chữ số
          balance: 85000000,
          currency: 'VND',
          type: 'Current'
        }
      ]
    });
    
    // Create sample transactions
    console.log('Creating sample transactions...');
    await TransactionModel.create({
      legacyTransactionId: 'TX001',
      fabricTxId: null, // Sẽ được cập nhật sau khi xác nhận trên Fabric
      senderFabricId: user1.fabricId,
      senderAccount: user1.accounts[0].accountId,
      recipientFabricId: user2.fabricId,
      recipientAccount: user2.accounts[0].accountId,
      amount: 5000000,
      currency: 'VND',
      status: 'completed',
      type: 'transfer',
      timestamp: new Date('2023-10-15T10:30:00'),
      description: 'Chuyển tiền học phí',
      referenceId: 'REF001',
      notes: 'Thanh toán học phí kỳ I năm 2023'
    });
    
    await TransactionModel.create({
      legacyTransactionId: 'TX002',
      fabricTxId: null,
      senderFabricId: user2.fabricId,
      senderAccount: user2.accounts[0].accountId,
      recipientFabricId: user1.fabricId,
      recipientAccount: user1.accounts[0].accountId,
      amount: 2000000,
      currency: 'VND',
      status: 'completed',
      type: 'transfer',
      timestamp: new Date('2023-10-17T14:45:00'),
      description: 'Hoàn trả tiền',
      referenceId: 'REF002',
      notes: 'Hoàn trả tiền mượn ngày 10/10/2023'
    });

    await TransactionModel.create({
      legacyTransactionId: 'TX003',
      fabricTxId: null,
      senderFabricId: user3.fabricId,
      senderAccount: user3.accounts[0].accountId,
      recipientFabricId: user4.fabricId,
      recipientAccount: user4.accounts[0].accountId,
      amount: 10000000,
      currency: 'VND',
      status: 'completed',
      type: 'transfer',
      timestamp: new Date('2023-10-20T09:15:00'),
      description: 'Chuyển tiền đầu tư',
      referenceId: 'REF003',
      notes: 'Chuyển tiền đầu tư dự án XYZ'
    });
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the database connection
    await closeDatabaseConnection();
  }
}

// Run the initialization function
initializeDatabase(); 