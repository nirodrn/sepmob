import React, { useState } from 'react';
import { Plus, Search, Filter, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProductRequest {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  createdAt: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}

export function ProductRequests() {
  const [requests, setRequests] = useState<ProductRequest[]>([
    {
      id: '1',
      productName: 'M oil',
      quantity: 50,
      unit: 'units',
      status: 'pending',
      createdAt: Date.now() - 1800000,
      priority: 'normal',
      notes: 'Urgent requirement for customer order'
    },
    {
      id: '2',
      productName: 'B oil',
      quantity: 25,
      unit: 'units',
      status: 'approved',
      createdAt: Date.now() - 7200000,
      priority: 'high'
    },
    {
      id: '3',
      productName: 'M oil',
      quantity: 100,
      unit: 'units',
      status: 'fulfilled',
      createdAt: Date.now() - 86400000,
      priority: 'normal'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'fulfilled':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'fulfilled':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Requests</h1>
          <p className="text-gray-600 mt-1">Manage and track your product requests</p>
        </div>
        
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Requests</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredRequests.map((request) => (
            <div key={request.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{request.productName}</h3>
                    <p className="text-sm text-gray-500">
                      Quantity: {request.quantity} {request.unit}
                    </p>
                    {request.notes && (
                      <p className="text-sm text-gray-600 mt-1">{request.notes}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={getStatusBadge(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No requests found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}