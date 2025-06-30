import React, { useState } from 'react';
import { ChevronDown, Home, Shield, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import { User } from '../types';
import { formatAccountNumber, maskAccountNumber } from '../utils/formatters';

interface IdentitySelectionProps {
  users: User[];
  onSelectUser: (user: User) => void;
  isLoading?: boolean;
}

export const IdentitySelection: React.FC<IdentitySelectionProps> = ({ users, onSelectUser, isLoading = false }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleAccessAccount = async () => {
    if (!selectedUserId) return;
    
    setIsAuthLoading(true);
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      onSelectUser(user);
    }
    setIsAuthLoading(false);
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%227%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-2xl">
                <Home className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to SmartBank A
            </h1>
            <p className="text-gray-600 text-sm">
              Secure Digital Banking Platform
            </p>
          </div>

          {/* Identity Selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select your account:
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-left focus:outline-none focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-between">
                    {isLoading ? (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading accounts...</span>
                      </div>
                    ) : selectedUser ? (
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {selectedUser.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {selectedUser.bank} • {maskAccountNumber(selectedUser.accountNumber)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Choose an account...</span>
                    )}
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isDropdownOpen && !isLoading && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <CreditCard className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.bank} • {maskAccountNumber(user.accountNumber)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-gray-500">
                        No accounts found. Please contact support.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAccessAccount}
              disabled={!selectedUserId || isAuthLoading || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {isAuthLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <span>Access Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Secure Authentication</p>
                <p>Your identity is protected using Hyperledger Fabric blockchain technology with OpenSSL encryption.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};