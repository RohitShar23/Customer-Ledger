'use client';

import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  openingBalance: number;
  notes: string;
  balance: number;
  lastTransaction: string;
}

interface Transaction {
  id: string;
  customerId: string;
  type: 'debit' | 'credit';
  amount: number;
  date: string;
  description: string;
  balance: number;
}

export default function CustomerLedger() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    const savedTransactions = localStorage.getItem('transactions');
    
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleCustomerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: formData.get('customerName') as string,
      phone: formData.get('customerPhone') as string,
      email: formData.get('customerEmail') as string,
      address: formData.get('customerAddress') as string,
      openingBalance: parseFloat(formData.get('openingBalance') as string) || 0,
      notes: formData.get('customerNotes') as string,
      balance: parseFloat(formData.get('openingBalance') as string) || 0,
      lastTransaction: new Date().toLocaleDateString(),
    };

    setCustomers(prev => [...prev, newCustomer]);
    (e.target as HTMLFormElement).reset();
    showNotification('Customer added successfully!', 'success');
  };

  const handleTransactionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const customerId = formData.get('transactionCustomer') as string;
    const type = formData.get('transactionType') as 'debit' | 'credit';
    const amount = parseFloat(formData.get('transactionAmount') as string);
    const date = formData.get('transactionDate') as string || new Date().toISOString().split('T')[0];
    const description = formData.get('transactionDescription') as string;

    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const newBalance = type === 'debit' 
      ? customer.balance + amount 
      : customer.balance - amount;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      customerId,
      type,
      amount,
      date,
      description,
      balance: newBalance,
    };

    setTransactions(prev => [...prev, newTransaction]);
    
    // Update customer balance
    setCustomers(prev => prev.map(c => 
      c.id === customerId 
        ? { ...c, balance: newBalance, lastTransaction: new Date().toLocaleDateString() }
        : c
    ));

    (e.target as HTMLFormElement).reset();
    showNotification('Transaction recorded successfully!', 'success');
  };

  const showTransactionHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    setTransactions(prev => prev.filter(t => t.customerId !== customerId));
    showNotification('Customer deleted successfully!', 'success');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customerTransactions = selectedCustomer 
    ? transactions.filter(t => t.customerId === selectedCustomer.id)
    : [];

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-8 right-8 p-4 rounded-md text-white font-semibold z-50 ${
      type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const exportData = () => {
    const data = {
      customers,
      transactions,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shop-ledger-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!', 'success');
  };

  const debugData = () => {
    console.log('Customers:', customers);
    console.log('Transactions:', transactions);
    showNotification('Data logged to console!', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Modern Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 py-6 text-center shadow-sm sticky top-0 z-50">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-3">
          <i className="fas fa-store text-3xl text-indigo-600"></i>
          Shop Customer Ledger
        </h1>
        <p className="text-lg text-gray-600 font-medium">Modern retail management for your business</p>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8 grid gap-8">
        {/* Customer Form Section */}
        <section className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <i className="fas fa-user-plus text-indigo-600 text-xl"></i>
            Add New Customer
          </h2>
          <form onSubmit={handleCustomerSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="customerName" className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  required
                  placeholder="Enter customer full name"
                  className="p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg focus:-translate-y-1 bg-white text-gray-800 font-medium"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="customerPhone" className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  placeholder="Enter phone number"
                  className="p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg focus:-translate-y-1 bg-white text-gray-800 font-medium"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="customerEmail" className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  placeholder="Enter email address"
                  className="p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg focus:-translate-y-1 bg-white text-gray-800 font-medium"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="customerAddress" className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  Address
                </label>
                <input
                  type="text"
                  id="customerAddress"
                  name="customerAddress"
                  placeholder="Enter customer address"
                  className="p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg focus:-translate-y-1 bg-white text-gray-800 font-medium"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="openingBalance" className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  Opening Balance (Credit/Debit)
                </label>
                <input
                  type="number"
                  id="openingBalance"
                  name="openingBalance"
                  step="0.01"
                  defaultValue="0"
                  placeholder="0.00"
                  className="p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg focus:-translate-y-1 bg-white text-gray-800 font-medium"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="customerNotes" className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  Customer Notes
                </label>
                <input
                  type="text"
                  id="customerNotes"
                  name="customerNotes"
                  placeholder="Preferred items, regular purchases..."
                  className="p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg focus:-translate-y-1 bg-white text-gray-800 font-medium"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-7 py-4 rounded-md text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-2"
            >
              <i className="fas fa-save"></i>
              Add Customer
            </button>
          </form>
        </section>

        {/* Transaction Form Section */}
        <section className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <i className="fas fa-shopping-cart text-green-600 text-xl"></i>
            Record Sale/Payment
          </h2>
          <form onSubmit={handleTransactionSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="transactionCustomer" className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  Select Customer *
                </label>
                <select
                  id="transactionCustomer"
                  name="transactionCustomer"
                  required
                  className="p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg focus:-translate-y-1 bg-white text-gray-800 font-medium"
                >
                  <option value="">Choose a customer...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="transactionType" className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  Transaction Type *
                </label>
                <select
                  id="transactionType"
                  name="transactionType"
                  required
                  className="p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg focus:-translate-y-1 bg-white text-gray-800 font-medium"
                >
                  <option value="">Select type...</option>
                  <option value="debit">Sale (Customer owes money)</option>
                  <option value="credit">Payment (Customer paid)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="transactionAmount" className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  Amount *
                </label>
                <input
                  type="number"
                  id="transactionAmount"
                  name="transactionAmount"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg focus:-translate-y-1 bg-white text-gray-800 font-medium"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="transactionDate" className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  Date
                </label>
                <input
                  type="date"
                  id="transactionDate"
                  name="transactionDate"
                  className="p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg focus:-translate-y-1 bg-white text-gray-800 font-medium"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="transactionDescription" className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                Description
              </label>
              <input
                type="text"
                id="transactionDescription"
                name="transactionDescription"
                placeholder="Items sold, payment method, etc."
                className="p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg focus:-translate-y-1 bg-white text-gray-800 font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-7 py-4 rounded-md text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Record Transaction
            </button>
          </form>
        </section>

        {/* Customer List Section */}
        <section className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <i className="fas fa-users text-indigo-600 text-xl"></i>
            Customer Records
          </h2>
          <div className="flex gap-4 mb-8 items-center flex-wrap">
            <input
              type="text"
              id="searchCustomers"
              placeholder="Search customers by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-80 p-4 border-2 border-gray-200 rounded-md text-base transition-all duration-300 focus:border-indigo-500 focus:shadow-lg bg-white"
            />
            <button
              onClick={exportData}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 rounded-md text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-2"
            >
              <i className="fas fa-download"></i>
              Export Shop Report
            </button>
            <button
              onClick={debugData}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-4 rounded-md text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-2"
            >
              <i className="fas fa-bug"></i>
              Debug Data
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full bg-white rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <th className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold p-5 text-left text-sm uppercase tracking-wide">
                    Customer Name
                  </th>
                  <th className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold p-5 text-left text-sm uppercase tracking-wide">
                    Phone
                  </th>
                  <th className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold p-5 text-left text-sm uppercase tracking-wide">
                    Email
                  </th>
                  <th className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold p-5 text-center text-sm uppercase tracking-wide">
                    Balance
                  </th>
                  <th className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold p-5 text-left text-sm uppercase tracking-wide">
                    Last Transaction
                  </th>
                  <th className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold p-5 text-left text-sm uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 hover:scale-105">
                    <td className="p-5 font-medium">{customer.name}</td>
                    <td className="p-5">{customer.phone}</td>
                    <td className="p-5">{customer.email}</td>
                    <td className="p-5 text-center">
                      <span className={`inline-block min-w-20 text-center font-bold px-3 py-1 rounded-md ${
                        customer.balance > 0 
                          ? 'text-green-600 bg-gradient-to-r from-green-100 to-green-200' 
                          : customer.balance < 0 
                          ? 'text-red-600 bg-gradient-to-r from-red-100 to-red-200' 
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        ${customer.balance.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-5">{customer.lastTransaction}</td>
                    <td className="p-5">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => showTransactionHistory(customer)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-semibold transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center gap-1"
                        >
                          <i className="fas fa-history"></i>
                          History
                        </button>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-semibold transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center gap-1"
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transaction History Modal */}
        {showModal && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="bg-white rounded-2xl p-8 w-11/12 max-w-4xl max-h-4/5 overflow-y-auto relative shadow-2xl border border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-6 top-6 text-2xl font-bold text-gray-400 hover:text-red-500 transition-all duration-300 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                &times;
              </button>
              <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedCustomer.name} - Transaction History
                </h3>
                <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-2">
                  <i className="fas fa-file-pdf"></i>
                  Export Customer Report
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="w-full bg-white rounded-lg overflow-hidden">
                  <thead>
                    <tr>
                      <th className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold p-4 text-left text-sm uppercase tracking-wide">
                        Date
                      </th>
                      <th className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold p-4 text-left text-sm uppercase tracking-wide">
                        Type
                      </th>
                      <th className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold p-4 text-left text-sm uppercase tracking-wide">
                        Amount
                      </th>
                      <th className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold p-4 text-left text-sm uppercase tracking-wide">
                        Description
                      </th>
                      <th className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold p-4 text-left text-sm uppercase tracking-wide">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerTransactions.map(transaction => (
                      <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300">
                        <td className="p-4">{transaction.date}</td>
                        <td className="p-4">
                          <span className={`inline-block px-3 py-1 rounded-md text-sm font-semibold ${
                            transaction.type === 'debit' 
                              ? 'text-red-600 bg-red-100' 
                              : 'text-green-600 bg-green-100'
                          }`}>
                            {transaction.type === 'debit' ? 'Sale' : 'Payment'}
                          </span>
                        </td>
                        <td className="p-4 font-medium">${transaction.amount.toFixed(2)}</td>
                        <td className="p-4">{transaction.description}</td>
                        <td className="p-4 font-bold">${transaction.balance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-white/95 backdrop-blur-md text-gray-600 text-center py-6 mt-12 border-t border-gray-100 font-medium">
        <p>&copy; 2025 Shop Customer Ledger System. Built with modern web technologies.</p>
      </footer>
    </div>
  );
}
