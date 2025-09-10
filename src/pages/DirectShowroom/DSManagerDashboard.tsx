import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardCards, getDashboardCards } from '../../components/Dashboard/DashboardCards';
import { NewProductRequest } from '../../components/DirectRepresentative/NewProductRequest';
import { DSCustomerInvoice } from '../../components/DirectShowroom/DSCustomerInvoice';
import { DSStockManagement } from '../../components/DirectShowroom/DSStockManagement';
import { useAuth } from '../../context/AuthContext';
import { Plus, FileText, Package, Users, Eye, FileCheck } from 'lucide-react';
import { DSRequestHistory } from '../../components/DirectShowroom/DSRequestHistory';

export function DSManagerDashboard() {
  const { userData } = useAuth();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showCustomerInvoice, setShowCustomerInvoice] = useState(false);
  const [showStockView, setShowStockView] = useState(false);

  if (!userData) return null;

  const cards = getDashboardCards(userData.role);

  const handleRequestSuccess = () => {
    console.log('Request created successfully');
  };

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
        <div className="lg:col-span-2">
          {showStockView ? (
            <DSStockManagement />
          ) : (
            <DSRequestHistory />
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Manager Actions</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowNewRequest(true)}
              className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Request Products</p>
                  <p className="text-sm text-blue-700">Request stock from HO</p>
                </div>
              </div>
            </button>

            <Link to="/direct-showroom/requests" className="w-full text-left p-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors block">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="font-medium text-cyan-900">Product Requests</p>
                  <p className="text-sm text-cyan-700">View and approve requests</p>
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
            
            <button 
              onClick={() => setShowStockView(!showStockView)}
              className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">{showStockView ? 'Hide' : 'View'} Stock</p>
                  <p className="text-sm text-amber-700">Check showroom inventory</p>
                </div>
              </div>
            </button>

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

      <NewProductRequest
        isOpen={showNewRequest}
        onClose={() => setShowNewRequest(false)}
        onSuccess={handleRequestSuccess}
        databaseTable="dsReqs" // Correctly set the database table
      />

      <DSCustomerInvoice
        isOpen={showCustomerInvoice}
        onClose={() => setShowCustomerInvoice(false)}
        onSuccess={handleCustomerInvoiceSuccess}
      />
    </div>
  );
}
