import { Schema, model, Document } from 'mongoose';

// Define the Transaction interface extending Document
export interface ITransaction extends Document {
  legacyTransactionId: string;  // Giữ lại transactionId cũ để đối chiếu
  fabricTxId: string;           // Mã giao dịch do Fabric trả về
  senderFabricId: string;       // Định danh người gửi trên Fabric
  senderAccount: string;
  recipientFabricId: string;    // Định danh người nhận trên Fabric
  recipientAccount: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'transfer' | 'deposit' | 'withdrawal';
  timestamp: Date;
  description: string;
  referenceId?: string;
  notes?: string;
}

// Define the Transaction schema
const transactionSchema = new Schema<ITransaction>({
  legacyTransactionId: { type: String, required: true, unique: true },
  fabricTxId: { type: String, required: false, unique: true, sparse: true }, // Có thể null khi mới tạo
  senderFabricId: { type: String, required: true, ref: 'User' },
  senderAccount: { type: String, required: true },
  recipientFabricId: { type: String, required: true, ref: 'User' },
  recipientAccount: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'VND' },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'pending', required: true },
  type: { type: String, enum: ['transfer', 'deposit', 'withdrawal'], required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true },
  referenceId: { type: String },
  notes: { type: String }
}, { timestamps: true });

// Create indexes for faster queries
transactionSchema.index({ senderFabricId: 1, timestamp: -1 });
transactionSchema.index({ recipientFabricId: 1, timestamp: -1 });
transactionSchema.index({ senderAccount: 1 });
transactionSchema.index({ recipientAccount: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ fabricTxId: 1 });

// Create and export the Transaction model
const TransactionModel = model<ITransaction>('Transaction', transactionSchema);

export default TransactionModel;
export { TransactionModel }; 