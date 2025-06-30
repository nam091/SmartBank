import UserModel, { IUser, IAccount } from '../models/User';
import bcrypt from 'bcrypt';

// Get all users
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    return await UserModel.find();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user by fabricId
export const getUserByFabricId = async (fabricId: string): Promise<IUser | null> => {
  try {
    return await UserModel.findOne({ fabricId });
  } catch (error) {
    console.error(`Error fetching user with fabricId ${fabricId}:`, error);
    throw error;
  }
};

// Get user by legacyUserId (for backward compatibility)
export const getUserByLegacyUserId = async (legacyUserId: string): Promise<IUser | null> => {
  try {
    return await UserModel.findOne({ legacyUserId });
  } catch (error) {
    console.error(`Error fetching user with legacyUserId ${legacyUserId}:`, error);
    throw error;
  }
};

// Get user by accountId
export const getUserByAccountId = async (accountId: string): Promise<IUser | null> => {
  try {
    return await UserModel.findOne({ 'accounts.accountId': accountId });
  } catch (error) {
    console.error(`Error fetching user with accountId ${accountId}:`, error);
    throw error;
  }
};

// Get account by accountId
export const getAccountByAccountId = async (accountId: string): Promise<IAccount | null> => {
  try {
    const user = await UserModel.findOne({ 'accounts.accountId': accountId });
    if (!user) return null;
    
    return user.accounts.find(account => account.accountId === accountId) || null;
  } catch (error) {
    console.error(`Error fetching account with accountId ${accountId}:`, error);
    throw error;
  }
};

// Hash PIN
export const hashPin = async (pin: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(pin, saltRounds);
};

// Verify PIN
export const verifyPin = async (pin: string, hashedPin: string): Promise<boolean> => {
  return await bcrypt.compare(pin, hashedPin);
};

// Create a new user
export const createUser = async (userData: {
  fabricId: string;
  legacyUserId: string;
  name: string;
  email: string;
  pin: string;
  accounts: IAccount[];
}): Promise<IUser> => {
  try {
    const hashedPin = await hashPin(userData.pin);
    
    const user = new UserModel({
      fabricId: userData.fabricId,
      legacyUserId: userData.legacyUserId,
      name: userData.name,
      email: userData.email,
      hashedPin,
      accounts: userData.accounts
    });
    return await user.save();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update account balance
export const updateAccountBalance = async (
  fabricId: string, 
  accountId: string, 
  amount: number
): Promise<IUser | null> => {
  try {
    return await UserModel.findOneAndUpdate(
      { fabricId, 'accounts.accountId': accountId },
      { $inc: { 'accounts.$.balance': amount } },
      { new: true }
    );
  } catch (error) {
    console.error(`Error updating balance for user ${fabricId}, account ${accountId}:`, error);
    throw error;
  }
};

// Add account to user
export const addAccount = async (
  fabricId: string,
  account: IAccount
): Promise<IUser | null> => {
  try {
    return await UserModel.findOneAndUpdate(
      { fabricId },
      { $push: { accounts: account } },
      { new: true }
    );
  } catch (error) {
    console.error(`Error adding account for user ${fabricId}:`, error);
    throw error;
  }
};

// Update PIN
export const updatePin = async (
  fabricId: string,
  newPin: string
): Promise<IUser | null> => {
  try {
    const hashedPin = await hashPin(newPin);
    
    return await UserModel.findOneAndUpdate(
      { fabricId },
      { hashedPin },
      { new: true }
    );
  } catch (error) {
    console.error(`Error updating PIN for user ${fabricId}:`, error);
    throw error;
  }
}; 