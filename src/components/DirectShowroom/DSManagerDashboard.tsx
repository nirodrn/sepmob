import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardCards, getDashboardCards } from '../Dashboard/DashboardCards';
import { DSCustomerInvoice } from './DSCustomerInvoice';
import { DSStockManagement } from './DSStockManagement';
import { useAuth } from '../../context/AuthContext';
import { FileText, Package, Users, Eye, FileCheck, Search } from 'lucide-react';

export function DSManagerDashboard() {
  const { userData } = useAuth();
  const [showCustomerInvoice, setShowCustomerInvoice] = useState(false);

  if (!userData) return null;

  const cards = getDashboardCards(userData.role);

  const handleCustomerInvoiceSuccess = () => {
    console.log('Customer invoice created successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {userData.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Manage showroom operations and customer sales
        </p>
      </div>

      <DashboardCards cards={cards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Showroom Stock</h3>
            <DSStockManagement />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Manager Actions</h3>
          
          <div className="space-y-3">
            <Link
              to="/direct-showroom/requests"
              className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors block"
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Product Requests</p>
                  <p className="text-sm text-blue-700">Create and view requests</p>
                </div>
              </div>
            </Link>

            <Link
              to="/track-requests"
              className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors block"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-indigo-900">Track All Requests</p>
                  <p className="text-sm text-indigo-700">Search and view status</p>
                </div>
              </div>
            </Link>
            
            <button
              onClick={() => setShowCustomerInvoice(true)}
              className="w-full text-left p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Customer Sale</p>
                  <p className="text-sm text-green-700">Generate customer invoice</p>
                </div>
              </div>
            </button>
            
            <Link 
              to="/inventory"
              className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors block">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">View Full Inventory</p>
                  <p className="text-sm text-amber-700">Check all warehouse stock</p>
                </div>
              </div>
            </Link>

            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Staff Management</p>
                  <p className="text-sm text-purple-700">Manage showroom staff</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <DSCustomerInvoice
        isOpen={showCustomerInvoice}
        onClose={() => setShowCustomerInvoice(false)}
        onSuccess={handleCustomerInvoiceSuccess}
      />
    </div>
  );
}
