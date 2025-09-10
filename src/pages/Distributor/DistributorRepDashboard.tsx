import React, { useState } from 'react';
import { DashboardCards, getDashboardCards } from '../../components/Dashboard/DashboardCards';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';
import { NewProductRequest } from '../../components/DirectRepresentative/NewProductRequest';
import { useAuth } from '../../context/AuthContext';
import { Plus, FileText, TrendingUp, Package } from 'lucide-react';

export function DistributorRepDashboard() {
  const { userData } = useAuth();
  const [showNewRequest, setShowNewRequest] = useState(false);

  if (!userData) return null;

  const cards = getDashboardCards(userData.role);

  const handleRequestSuccess = () => {
    console.log('Request created successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {userData.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Submit requests to your distributor and track sales
        </p>
      </div>

      <DashboardCards cards={cards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={[]} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Representative Actions</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowNewRequest(true)}
              className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Request Products</p>
                  <p className="text-sm text-blue-700">Submit request to distributor</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Report Sales</p>
                  <p className="text-sm text-green-700">Submit sales report</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">My Orders</p>
                  <p className="text-sm text-amber-700">Track order status</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Performance</p>
                  <p className="text-sm text-purple-700">View sales metrics</p>
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
      />
    </div>
  );
}