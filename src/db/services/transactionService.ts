import { v4 as uuidv4 } from 'uuid';
import { TransactionModel, ITransaction } from '../models/Transaction';
import * as userService from './userService';
import { IAccount } from '../models/User';

// Get transactions by fabricId (as sender or recipient)
export const getTransactionsByFabricId = async (fabricId: string): Promise<ITransaction[]> => {
  try {
    return await TransactionModel.find({ 
      $or: [{ senderFabricId: fabricId }, { recipientFabricId: fabricId }] 
    }).sort({ timestamp: -1 });
  } catch (error) {
    console.error(`Error fetching transactions for user ${fabricId}:`, error);
    throw error;
  }
};

// Get transactions by legacy userId (for backward compatibility)
export const getTransactionsByLegacyUserId = async (legacyUserId: string): Promise<ITransaction[]> => {
  try {
    // Tìm fabricId từ legacyUserId
    const user = await userService.getUserByLegacyUserId(legacyUserId);
    if (!user) throw new Error(`User with legacyUserId ${legacyUserId} not found`);
    
    return await getTransactionsByFabricId(user.fabricId);
  } catch (error) {
    console.error(`Error fetching transactions for legacy user ${legacyUserId}:`, error);
    throw error;
  }
};

// Get transactions by accountId (as sender or recipient)
export const getTransactionsByAccountId = async (accountId: string): Promise<ITransaction[]> => {
  try {
    return await TransactionModel.find({
      $or: [{ senderAccount: accountId }, { recipientAccount: accountId }]
    }).sort({ timestamp: -1 });
  } catch (error) {
    console.error(`Error fetching transactions for account ${accountId}:`, error);
    throw error;
  }
};

// Create a new transaction
export const createTransaction = async (transactionData: {
  senderFabricId: string;
  senderAccount: string;
  recipientFabricId: string;
  recipientAccount: string;
  amount: number;
  currency: string;
  status?: 'completed' | 'pending' | 'failed';
  type: 'transfer' | 'deposit' | 'withdrawal';
  description: string;
  notes?: string;
  referenceId?: string;
  fabricTxId?: string;
}): Promise<ITransaction> => {
  try {
    const transaction = new TransactionModel({
      legacyTransactionId: `TX-${uuidv4().substring(0, 8)}`,
      fabricTxId: transactionData.fabricTxId || null,
      timestamp: new Date(),
      ...transactionData
    });
    return await transaction.save();
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Update transaction with Fabric transaction ID
export const updateFabricTxId = async (
  legacyTransactionId: string,
  fabricTxId: string
): Promise<ITransaction | null> => {
  try {
    return await TransactionModel.findOneAndUpdate(
      { legacyTransactionId },
      { fabricTxId, status: 'completed' },
      { new: true }
    );
  } catch (error) {
    console.error(`Error updating fabricTxId for transaction ${legacyTransactionId}:`, error);
    throw error;
  }
};

// Transfer money between accounts
export const transferMoney = async (
  senderFabricId: string,
  senderAccountId: string,
  recipientAccountId: string,
  amount: number,
  description: string,
  pin: string,
  notes: string = ''
): Promise<{ success: boolean; transaction?: ITransaction; error?: string }> => {
  try {
    // Get sender and recipient accounts
    const sender = await userService.getUserByFabricId(senderFabricId);
    const senderAccount = sender?.accounts.find((acc: IAccount) => acc.accountId === senderAccountId);
    
    if (!sender || !senderAccount) {
      return { success: false, error: 'Sender account not found' };
    }
    
    // Verify PIN
    const isPinValid = await userService.verifyPin(pin, sender.hashedPin);
    if (!isPinValid) {
      return { success: false, error: 'Invalid PIN' };
    }
    
    // Find recipient user
    const recipient = await userService.getUserByAccountId(recipientAccountId);
    const recipientAccount = recipient?.accounts.find((acc: IAccount) => acc.accountId === recipientAccountId);
    
    if (!recipient || !recipientAccount) {
      return { success: false, error: 'Recipient account not found' };
    }

    // Check if sender has enough balance
    if (senderAccount.balance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Generate reference ID
    const referenceId = `REF-${uuidv4().substring(0, 8)}`;

    // Create transaction (status is pending until confirmed by Fabric)
    const transaction = await createTransaction({
      senderFabricId: sender.fabricId,
      senderAccount: senderAccountId,
      recipientFabricId: recipient.fabricId,
      recipientAccount: recipientAccountId,
      amount,
      currency: senderAccount.currency,
      status: 'pending',
      type: 'transfer',
      description,
      notes,
      referenceId
    });

    // Update balances
    await userService.updateAccountBalance(sender.fabricId, senderAccountId, -amount);
    await userService.updateAccountBalance(recipient.fabricId, recipientAccountId, amount);

    return {
      success: true,
      transaction
    };
  } catch (error) {
    console.error('Error transferring money:', error);
    return { success: false, error: 'Transaction failed due to system error' };
  }
}; 