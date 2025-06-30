import { Schema, model, Document } from 'mongoose';

// Interface for Account
export interface IAccount {
  accountId: string; // Vẫn giữ kiểu string nhưng sẽ validate là 12 chữ số
  balance: number;
  currency: string;
  type: string;
}

// Define the User interface extending Document
export interface IUser extends Document {
  fabricId: string;      // Định danh trên Fabric (ví dụ: User1@smartbanka.com)
  legacyUserId: string;  // Giữ lại userId cũ để đối chiếu
  name: string;
  email: string;
  hashedPin: string;     // PIN đã được hash để xác thực
  accounts: IAccount[];
}

// Define the Account schema with validation for 12-digit account number
const accountSchema = new Schema<IAccount>({
  accountId: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{12}$/.test(v); // Validate 12 chữ số
      },
      message: props => `${props.value} không phải là số tài khoản hợp lệ! Số tài khoản phải có đúng 12 chữ số.`
    }
  },
  balance: { type: Number, required: true, default: 0 },
  currency: { type: String, required: true, default: 'VND' },
  type: { type: String, required: true }
}, { _id: false });

// Define the User schema
const userSchema = new Schema<IUser>({
  fabricId: { type: String, required: true, unique: true },
  legacyUserId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hashedPin: { type: String, required: true },
  accounts: [accountSchema]
}, { timestamps: true });

// Create indexes for faster queries
userSchema.index({ 'accounts.accountId': 1 });
userSchema.index({ fabricId: 1 });
userSchema.index({ legacyUserId: 1 });

// Create and export the User model
const UserModel = model<IUser>('User', userSchema);

export default UserModel;
export { UserModel }; 