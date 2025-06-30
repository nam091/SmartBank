import * as React from 'react';
import { IdentitySelection } from './components/IdentitySelection';
import { AccountDashboard } from './components/AccountDashboard';
import { User, Transaction } from './types';
import { mockUsers as fallbackUsers, mockTransactions as fallbackTransactions } from './data/mockData';
import { StagewiseToolbar } from '@stagewise/toolbar-react';
import { ReactPlugin } from '@stagewise-plugins/react';

// Tách biệt React Toolbar config để tránh lỗi hooks
const toolbarConfig = {
  plugins: [ReactPlugin],
};

// API URL
const API_URL = 'http://localhost:3000/api';

function App() {
  // State cho người dùng hiện tại
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  // State cho danh sách người dùng
  const [users, setUsers] = React.useState<User[]>([]);
  // State cho giao dịch
  const [allTransactions, setAllTransactions] = React.useState<Record<string, Transaction[]>>({});
  // State cho trạng thái kết nối database
  const [isDbConnected, setIsDbConnected] = React.useState<boolean>(false);
  // State cho trạng thái loading
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Khởi tạo kết nối với API server
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // Gọi API để lấy danh sách người dùng
        const response = await fetch(`${API_URL}/users`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const result = await response.json();
        
        if (result.data && Array.isArray(result.data)) {
          // Chuyển đổi dữ liệu từ API sang định dạng User
          const mappedUsers = result.data.map((user: any) => ({
            id: user.userId,
            name: user.name,
            bank: 'SmartBank A',
            accountNumber: user.accounts && user.accounts[0] ? user.accounts[0].accountId : '',
            balance: user.accounts && user.accounts[0] ? user.accounts[0].balance : 0,
            email: user.email
          }));
          
          setUsers(mappedUsers);
          setIsDbConnected(true);
          console.log('Fetched users from API:', mappedUsers);
        } else {
          console.warn('Invalid user data format from API, using fallback data');
          setUsers(fallbackUsers);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        console.log('Using fallback data');
        setUsers(fallbackUsers);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch transactions for a user
  const fetchTransactions = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/transactions?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        // Chuyển đổi dữ liệu từ API sang định dạng Transaction
        const mappedTransactions = result.data.map((tx: any) => ({
          id: tx.transactionId,
          timestamp: new Date(tx.timestamp),
          type: tx.type === 'transfer' ? (tx.senderId === userId ? 'send' : 'receive') : tx.type,
          details: tx.description,
          amount: tx.type === 'transfer' && tx.senderId === userId ? -tx.amount : tx.amount,
          status: tx.status,
          senderName: tx.senderId,
          senderAccount: tx.senderAccount,
          recipientName: tx.recipientId,
          recipientAccount: tx.recipientAccount,
          referenceId: tx.referenceId,
          notes: tx.notes || ''
        }));
        
        setAllTransactions(prev => ({
          ...prev,
          [userId]: mappedTransactions
        }));
        
        return mappedTransactions;
      }
      
      return [];
    } catch (error) {
      console.error(`Failed to fetch transactions for user ${userId}:`, error);
      return fallbackTransactions[userId] || [];
    }
  };

  // Handler cho việc chọn người dùng
  const handleSelectUser = async (user: User) => {
    // Tìm người dùng hiện tại từ state
    const currentUserData = users.find(u => u.id === user.id);
    if (currentUserData) {
      setCurrentUser(currentUserData);
      
      // Lấy giao dịch của người dùng từ API
      if (isDbConnected) {
        await fetchTransactions(user.id);
      } else {
        setAllTransactions(fallbackTransactions);
      }
    }
  };

  // Handler cho việc đăng xuất
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Handler cho việc chuyển tiền
  const handleTransfer = async (fromUserId: string, toAccountNumber: string, amount: number): Promise<boolean> => {
    // Tìm người nhận bằng số tài khoản
    const recipientUser = users.find(u => u.accountNumber === toAccountNumber);
    
    if (!recipientUser) return false;

    if (isDbConnected) {
      try {
        // Gọi API để thực hiện chuyển tiền
        const response = await fetch(`${API_URL}/transactions/transfer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fromUserId,
            fromAccountId: users.find(u => u.id === fromUserId)?.accountNumber,
            toAccountId: toAccountNumber,
            amount,
            description: `Transfer to ${recipientUser.name}`,
            notes: `Transfer to ${recipientUser.name}`
          })
        });
        
        if (!response.ok) {
          throw new Error('Transfer failed');
        }
        
        // Cập nhật lại giao dịch và số dư
        await fetchTransactions(fromUserId);
        if (fromUserId !== recipientUser.id) {
          await fetchTransactions(recipientUser.id);
        }
        
        // Cập nhật lại thông tin người dùng
        const updatedUserResponse = await fetch(`${API_URL}/users/${fromUserId}`);
        if (updatedUserResponse.ok) {
          const result = await updatedUserResponse.json();
          if (result.data) {
            const updatedUser = {
              id: result.data.userId,
              name: result.data.name,
              bank: 'SmartBank A',
              accountNumber: result.data.accounts && result.data.accounts[0] ? result.data.accounts[0].accountId : '',
              balance: result.data.accounts && result.data.accounts[0] ? result.data.accounts[0].balance : 0,
              email: result.data.email
            };
            
            // Cập nhật người dùng trong state
            setUsers(prevUsers => 
              prevUsers.map(user => user.id === fromUserId ? updatedUser : user)
            );
            
            // Cập nhật người dùng hiện tại nếu họ là người gửi
            if (currentUser?.id === fromUserId) {
              setCurrentUser(updatedUser);
            }
          }
        }
        
        return true;
      } catch (error) {
        console.error('Transfer failed:', error);
        return false;
      }
    } else {
      // Fallback khi không có kết nối API
      // Cập nhật số dư
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === fromUserId) {
            return { ...user, balance: user.balance - amount };
          }
          if (user.id === recipientUser.id) {
            return { ...user, balance: user.balance + amount };
          }
          return user;
        })
      );

      // Tạo giao dịch cho cả người gửi và người nhận
      const timestamp = new Date();
      const transactionId = Date.now().toString();
      const senderUser = users.find(u => u.id === fromUserId);
      const referenceId = `TRX${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

      const senderTransaction: Transaction = {
        id: transactionId + '_send',
        timestamp,
        type: 'send',
        details: `To ${recipientUser.name} (${recipientUser.accountNumber})`,
        amount: -amount,
        status: 'completed',
        senderName: senderUser?.name,
        senderAccount: senderUser?.accountNumber,
        recipientName: recipientUser.name,
        recipientAccount: recipientUser.accountNumber,
        referenceId: referenceId,
        notes: `Transfer to ${recipientUser.name}`
      };

      const receiverTransaction: Transaction = {
        id: transactionId + '_receive',
        timestamp,
        type: 'receive',
        details: `From ${senderUser?.name} (${senderUser?.accountNumber})`,
        amount: amount,
        status: 'completed',
        senderName: senderUser?.name,
        senderAccount: senderUser?.accountNumber,
        recipientName: recipientUser.name,
        recipientAccount: recipientUser.accountNumber,
        referenceId: referenceId,
        notes: `Transfer from ${senderUser?.name}`
      };

      // Cập nhật giao dịch cho cả hai người dùng
      setAllTransactions(prevTransactions => ({
        ...prevTransactions,
        [fromUserId]: [senderTransaction, ...(prevTransactions[fromUserId] || [])],
        [recipientUser.id]: [receiverTransaction, ...(prevTransactions[recipientUser.id] || [])]
      }));

      // Cập nhật người dùng hiện tại nếu họ là người gửi
      if (currentUser?.id === fromUserId) {
        setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - amount } : null);
      }

      return true;
    }
  };

  // Render component
  return (
    <div className="font-inter">
      {/* Chỉ bao gồm toolbar trong chế độ development */}
      {import.meta.env.DEV && <StagewiseToolbar key="stagewise-toolbar" config={toolbarConfig} />}
      {currentUser ? (
        <AccountDashboard 
          user={currentUser} 
          users={users}
          transactions={allTransactions[currentUser.id] || []}
          onLogout={handleLogout}
          onTransfer={handleTransfer}
        />
      ) : (
        <IdentitySelection 
          users={users}
          onSelectUser={handleSelectUser}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default App;