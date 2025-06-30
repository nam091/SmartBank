export interface User {
  id: string;
  name: string;
  bank: string;
  accountNumber: string;
  balance: number;
}

export interface Transaction {
  id: string;
  timestamp: Date;
  type: 'send' | 'receive';
  details: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  senderName?: string;
  senderAccount?: string;
  recipientName?: string;
  recipientAccount?: string;
  notes?: string;
  referenceId?: string;
}

export interface TransferRequest {
  recipient: string;
  amount: number;
}