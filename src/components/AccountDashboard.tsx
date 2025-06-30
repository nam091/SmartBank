import React, { useState } from 'react';
import { 
  Building2, 
  LogOut, 
  Eye, 
  EyeOff, 
  Send, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Shield,
  X,
  CreditCard,
  ChevronDown,
  ChevronUp,
  FileText,
  Hash
} from 'lucide-react';
import { User, Transaction, TransferRequest } from '../types';
import { formatCurrency, formatDate, formatAccountNumber, validateAccountNumber, maskAccountNumber } from '../utils/formatters';

interface AccountDashboardProps {
  user: User;
  users: User[];
  transactions: Transaction[];
  onLogout: () => void;
  onTransfer: (fromUserId: string, toAccountNumber: string, amount: number) => Promise<boolean>;
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({ 
  user, 
  users, 
  transactions, 
  onLogout, 
  onTransfer 
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [transferData, setTransferData] = useState<TransferRequest>({ recipient: '', amount: 0 });
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'send' | 'receive'>('all');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [accountNumberInput, setAccountNumberInput] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

  const handleTransferRequest = () => {
    if (!accountNumberInput || transferData.amount <= 0) return;
    
    // Validate account number format
    if (!validateAccountNumber(accountNumberInput)) {
      setAccountNumberError('Số tài khoản phải có đúng 12 chữ số');
      return;
    }

    // Check if account number exists
    const recipientUser = users.find(u => u.accountNumber === accountNumberInput);
    if (!recipientUser) {
      setAccountNumberError('Số tài khoản không tồn tại trong hệ thống');
      return;
    }

    // Check if trying to transfer to own account
    if (recipientUser.id === user.id) {
      setAccountNumberError('Không thể chuyển tiền vào chính tài khoản của bạn');
      return;
    }

    if (transferData.amount > user.balance) {
      alert('Số dư không đủ để thực hiện giao dịch');
      return;
    }

    setTransferData(prev => ({ ...prev, recipient: recipientUser.name }));
    setShowPinModal(true);
    setPin('');
    setPinError('');
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 6) {
      setPinError('Mã PIN phải có đúng 6 số');
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setPinError('Mã PIN chỉ được chứa số');
      return;
    }

    // Simulate PIN verification (in real app, this would be sent to backend)
    if (pin !== '123456') {
      setPinError('Mã PIN không chính xác');
      return;
    }

    setIsTransferring(true);
    setShowPinModal(false);
    
    // Simulate transfer delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Execute the transfer
    const success = await onTransfer(user.id, accountNumberInput, transferData.amount);
    
    if (success) {
      setTransferData({ recipient: '', amount: 0 });
      setAccountNumberInput('');
      setAccountNumberError('');
    } else {
      alert('Không thể thực hiện giao dịch. Vui lòng kiểm tra thông tin người nhận.');
    }
    
    setIsTransferring(false);
    setPin('');
  };

  const handlePinChange = (value: string) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setPin(value);
      setPinError('');
    }
  };

  const handleAccountNumberChange = (value: string) => {
    // Only allow digits and limit to 12 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 12);
    setAccountNumberInput(cleanValue);
    setAccountNumberError('');
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setPin('');
    setPinError('');
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedFilter === 'all') return true;
    return transaction.type === selectedFilter;
  });

  const recipientUser = users.find(u => u.accountNumber === accountNumberInput);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SmartBank A</h1>
                <p className="text-xs text-gray-500">Digital Banking Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome, {user.name}</p>
                <p className="text-xs text-gray-500">Bank: {user.bank}</p>
                <p className="text-xs text-gray-400">STK: {maskAccountNumber(user.accountNumber)}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Balance and Transfer */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Info Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Account Information</h2>
                <CreditCard className="h-6 w-6 text-blue-200" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-blue-200 text-sm">Account Number</p>
                  <p className="text-xl font-mono font-bold">
                    {formatAccountNumber(user.accountNumber)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Available Balance</p>
                    <p className="text-2xl font-bold">
                      {showBalance ? formatCurrency(user.balance) : '••••••••'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  >
                    {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-blue-100 mt-4">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Account Status: Active</span>
              </div>
            </div>

            {/* Transfer Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Perform a Transaction</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumberInput}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                    placeholder="Enter 12-digit account number..."
                    maxLength={12}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-blue-500 transition-colors duration-200"
                  />
                  {accountNumberError && (
                    <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                      <X className="h-4 w-4" />
                      <span>{accountNumberError}</span>
                    </p>
                  )}
                  {recipientUser && !accountNumberError && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700">
                        <strong>Recipient:</strong> {recipientUser.name} - {recipientUser.bank}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Transfer
                  </label>
                  <input
                    type="number"
                    value={transferData.amount || ''}
                    onChange={(e) => setTransferData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    placeholder="Enter amount..."
                    max={user.balance}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available balance: {formatCurrency(user.balance)}
                  </p>
                </div>
                
                <button
                  onClick={handleTransferRequest}
                  disabled={!accountNumberInput || transferData.amount <= 0 || transferData.amount > user.balance || isTransferring || !!accountNumberError}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isTransferring ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Confirm Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transaction History</h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'send' | 'receive')}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Transactions</option>
                    <option value="send">Sent</option>
                    <option value="receive">Received</option>
                  </select>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => {
                    const isThisExpanded = expandedTransactionId === transaction.id;
                    return (
                      <div
                        key={transaction.id}
                        className="border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors duration-200 overflow-hidden"
                      >
                        {/* Main transaction info - always visible */}
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer"
                          onClick={() => setExpandedTransactionId(isThisExpanded ? null : transaction.id)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              transaction.type === 'send' 
                                ? 'bg-red-100 text-red-600' 
                                : 'bg-green-100 text-green-600'
                            }`}>
                              {transaction.type === 'send' ? (
                                <ArrowUpRight className="h-5 w-5" />
                              ) : (
                                <ArrowDownLeft className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {transaction.details}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(transaction.timestamp)}</span>
                                <CheckCircle className="h-3 w-3 text-green-500 ml-2" />
                                <span className="text-green-600 capitalize">{transaction.status}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className={`font-semibold ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                              </p>
                            </div>
                            {isThisExpanded ? 
                              <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            }
                          </div>
                        </div>
                        
                        {/* Expanded transaction details */}
                        {isThisExpanded && (
                          <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <div className="flex items-start">
                                  <Send className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                                  <div>
                                    <p className="text-xs text-gray-500">From</p>
                                    <p className="text-sm font-medium">
                                      {transaction.senderName || "N/A"} ({transaction.senderAccount || "N/A"})
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-start">
                                  <ArrowDownLeft className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                                  <div>
                                    <p className="text-xs text-gray-500">To</p>
                                    <p className="text-sm font-medium">
                                      {transaction.recipientName || "N/A"} ({transaction.recipientAccount || "N/A"})
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-start">
                                  <Hash className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                                  <div>
                                    <p className="text-xs text-gray-500">Reference</p>
                                    <p className="text-sm font-medium">{transaction.referenceId || transaction.id}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-start">
                                  <FileText className="h-4 w-4 text-gray-500 mt-0.5 mr-2" />
                                  <div>
                                    <p className="text-xs text-gray-500">Notes</p>
                                    <p className="text-sm font-medium">{transaction.notes || "No additional notes"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PIN Authentication Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Xác thực giao dịch</h3>
              </div>
              <button
                onClick={closePinModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Chi tiết giao dịch:</p>
                <p className="font-medium text-gray-900">Người nhận: {transferData.recipient}</p>
                <p className="font-medium text-gray-900">STK: {formatAccountNumber(accountNumberInput)}</p>
                <p className="font-medium text-gray-900">Số tiền: {formatCurrency(transferData.amount)}</p>
                <p className="text-sm text-gray-600 mt-2">Số dư sau giao dịch: {formatCurrency(user.balance - transferData.amount)}</p>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-3">
                Nhập mã PIN 6 số để xác thực:
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="••••••"
                maxLength={6}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500 transition-colors duration-200"
                autoFocus
              />
              {pinError && (
                <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                  <X className="h-4 w-4" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closePinModal}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handlePinSubmit}
                disabled={pin.length !== 6}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Xác nhận
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-700">
                <strong>Demo:</strong> Sử dụng mã PIN "123456" để thử nghiệm
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};