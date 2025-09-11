import React, { useState, useMemo } from 'react';
import { Plus, Search, Download, Eye, Calendar, Loader2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useFirebaseQuery } from '../hooks/useFirebaseQuery';
import { ErrorMessage } from '../components/Common/ErrorMessage';

interface FirebaseInvoice {
  id: string;
  date: string;
  customer: string;
  items: { p: string; q: number; u: number; t: number }[];
  total: number;
  pay: 'cash' | 'card' | 'credit';
  status: 'paid' | 'unpaid';
  createdAt: { seconds: number; nanoseconds: number; };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue'; // Mapping from 'paid'/'unpaid'
  paymentStatus: 'pending' | 'partial' | 'paid'; // Mapping from 'paid'/'unpaid'
  createdAt: number;
  dueDate: number;
}


export function Invoices() {
  const { data, loading, error } = useFirebaseQuery<FirebaseInvoice>('dsinvoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const invoices = useMemo(() => {
    if (!data) return [];
    return data.map((fbInvoice: FirebaseInvoice): Invoice => {
      const createdAt = fbInvoice.createdAt ? new Date(fbInvoice.createdAt.seconds * 1000).getTime() : new Date(fbInvoice.date).getTime();
      return {
        id: fbInvoice.id,
        invoiceNumber: fbInvoice.id,
        customerName: fbInvoice.customer,
        amount: fbInvoice.total,
        status: fbInvoice.status === 'paid' ? 'paid' : 'overdue',
        paymentStatus: fbInvoice.status === 'paid' ? 'paid' : 'pending',
        createdAt: createdAt,
        dueDate: createdAt + (7 * 24 * 60 * 60 * 1000), // Example: Due 7 days after creation
      };
    });
  }, [data]);

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'sent':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'overdue':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'partial':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const summary = useMemo(() => {
    const totalOutstanding = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((acc, inv) => acc + inv.amount, 0);

    const paidThisMonth = invoices
      .filter(inv => {
        const invoiceDate = new Date(inv.createdAt);
        const today = new Date();
        return inv.status === 'paid' && 
               invoiceDate.getMonth() === today.getMonth() && 
               invoiceDate.getFullYear() === today.getFullYear();
      })
      .reduce((acc, inv) => acc + inv.amount, 0);

    const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;
    const draftCount = invoices.filter(inv => inv.status === 'draft').length;

    return { totalOutstanding, paidThisMonth, overdueCount, draftCount };
  }, [invoices]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage customer invoices and payments</p>
        </div>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          New Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-600 mt-1">LKR {summary.totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Paid This Month</p>
          <p className="text-2xl font-bold text-green-600 mt-1">LKR {summary.paidThisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{summary.overdueCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{summary.draftCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <p className="ml-4 text-gray-500">Loading invoices...</p>
          </div>
        ) : error ? (
            <ErrorMessage message="Failed to load invoices. Please try again later." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Invoice</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(invoice.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">{invoice.customerName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">LKR {invoice.amount.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={getStatusBadge(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={getPaymentStatusBadge(invoice.paymentStatus)}>
                        {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInvoices.length === 0 && !loading && (
                <div className="p-8 text-center">
                    <p className="text-gray-500">No invoices found.</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}